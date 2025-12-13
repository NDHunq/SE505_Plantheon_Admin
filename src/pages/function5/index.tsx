import {
  CheckCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  SettingOutlined,
  TagOutlined,
} from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import {
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from "@ant-design/pro-components";
import {
  Avatar,
  Button,
  Col,
  Card,
  Drawer,
  Empty,
  Flex,
  List,
  message,
  Popconfirm,
  Row,
  Space,
  Collapse,
  Spin,
  Tag,
  Tabs,
} from "antd";
import React, { useEffect, useMemo, useRef, useState } from "react";
import MdEditor from "react-markdown-editor-lite";
import MarkdownIt from "markdown-it";
import "react-markdown-editor-lite/lib/index.css";
import {
  createNews,
  deleteNews,
  getNews,
  getNewsDetail,
  News,
  NewsDetail,
  NewsStatus,
  updateNews,
} from "@/services/news";
import {
  BlogTag,
  createNewsTag,
  deleteNewsTag,
  getNewsTags,
  updateNewsTag,
} from "@/services/newsTag";
import {
  createGuideStage,
  createSubGuideStage,
  deleteGuideStage,
  deleteSubGuideStage,
  getGuideStageDetail,
  getGuideStagesByPlant,
  getSubGuideStagesByStage,
  GuideStage,
  GuideStageDetail,
  SubGuideStage,
  updateGuideStage,
  updateSubGuideStage,
} from "@/services/guide";
import { getPlants, Plant } from "@/services/plant";

const statusColors: Record<NewsStatus, string> = {
  draft: "default",
  published: "green",
};

// Initialize markdown parser
const mdParser = new MarkdownIt();

const Function5: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [currentRow, setCurrentRow] = useState<NewsDetail>();
  const [showDetail, setShowDetail] = useState(false);
  const [editing, setEditing] = useState<News | null>(null);
  const [saving, setSaving] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [createContent, setCreateContent] = useState<string>("");
  const [editContent, setEditContent] = useState<string>("");
  
  // Tag management states
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [editingTag, setEditingTag] = useState<BlogTag | null>(null);
  const [tagSaving, setTagSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("news");

  // Farming guide states
  const [plants, setPlants] = useState<Plant[]>([]);
  const [plantsLoading, setPlantsLoading] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [guideStages, setGuideStages] = useState<GuideStage[]>([]);
  const [stagesLoading, setStagesLoading] = useState(false);
  const [stageDetails, setStageDetails] = useState<
    Record<string, GuideStageDetail>
  >({});
  const [stageDetailLoading, setStageDetailLoading] = useState<string | null>(
    null
  );
  const [subStageCreatingFor, setSubStageCreatingFor] = useState<string | null>(
    null
  );
  const [blogEditing, setBlogEditing] = useState<any | null>(null);
  const [blogContent, setBlogContent] = useState<string>("");

  const statusOptions = useMemo(
    () => [
      { label: "Draft", value: "draft" },
      { label: "Published", value: "published" },
    ],
    []
  );

  const tagOptions = useMemo(
    () => tags.map((tag) => ({ label: tag.name, value: tag.id })),
    [tags]
  );

  // Helper: clean payload & cast numeric offsets
  const cleanGuidePayload = (obj: Record<string, any>) => {
    const cleaned: Record<string, any> = {};
    Object.entries(obj).forEach(([k, v]) => {
      if (v === "" || v === undefined || v === null) return;
      if (["start_day_offset", "end_day_offset", "start_day", "end_day"].includes(k)) {
        const num = Number(v);
        if (!Number.isNaN(num)) cleaned[k] = num;
      } else {
        cleaned[k] = v;
      }
    });
    return cleaned;
  };

  // Load tags on component mount
  useEffect(() => {
    loadTags();
  }, []);

  // Load plants when guide tab active
  useEffect(() => {
    if (activeTab === "guide" && plants.length === 0) {
      loadPlants();
    }
  }, [activeTab]);

  const loadTags = async () => {
    try {
      const res = await getNewsTags();
      setTags(res.data.blog_tags || []);
    } catch (error: any) {
      console.error("Failed to load tags:", error);
    }
  };

  const loadPlants = async () => {
    try {
      setPlantsLoading(true);
      const res = await getPlants();
      setPlants(res.data.plants || []);
    } catch (error: any) {
      console.error("Failed to load plants", error);
    } finally {
      setPlantsLoading(false);
    }
  };

  const handleViewDetail = async (record: News) => {
    try {
      setViewingId(record.id);
      const res = await getNewsDetail(record.id);
      setCurrentRow(res.data);
      setShowDetail(true);
    } catch (error: any) {
      const errMsg =
        error?.response?.data?.message || error?.message || "Failed to load detail";
      message.error(errMsg);
    } finally {
      setViewingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNews(id);
      message.success("News deleted successfully");
      actionRef.current?.reload();
    } catch (error: any) {
      const errMsg =
        error?.response?.data?.message || error?.message || "Failed to delete news";
      message.error(errMsg);
    }
  };

  // Guide/Stage helpers
  const loadGuideStages = async (plantId: string) => {
    try {
      setStagesLoading(true);
      const res = await getGuideStagesByPlant(plantId);
      const payload = (res as any)?.data || res;
      const stages =
        payload?.guide_stages ||
        payload?.data?.guide_stages ||
        [];
      setGuideStages(Array.isArray(stages) ? stages : []);
      setStageDetails({});
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || error?.message || "Failed to load guide stages"
      );
    } finally {
      setStagesLoading(false);
    }
  };

  const loadStageDetail = async (stageId: string) => {
    try {
      setStageDetailLoading(stageId);
      const res = await getGuideStageDetail(stageId);
      const payload = (res as any)?.data || res;
      setStageDetails((prev) => ({ ...prev, [stageId]: payload }));
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || error?.message || "Failed to load stage detail"
      );
    } finally {
      setStageDetailLoading(null);
    }
  };

  const handleCreateStage = async (values: any) => {
    if (!selectedPlant) return false;
    try {
      const payload = cleanGuidePayload({ ...values, plant_id: selectedPlant.id });
      await createGuideStage(payload);
      message.success("Guide stage created");
      loadGuideStages(selectedPlant.id);
      return true;
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || error?.message || "Failed to create stage"
      );
      return false;
    }
  };

  const handleUpdateStage = async (id: string, values: any) => {
    try {
      const payload = cleanGuidePayload(values);
      await updateGuideStage(id, payload);
      message.success("Guide stage updated");
      if (selectedPlant) loadGuideStages(selectedPlant.id);
      return true;
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || error?.message || "Failed to update stage"
      );
      return false;
    }
  };

  const handleDeleteStage = async (id: string) => {
    try {
      await deleteGuideStage(id);
      message.success("Guide stage deleted");
      if (selectedPlant) loadGuideStages(selectedPlant.id);
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || error?.message || "Failed to delete stage"
      );
    }
  };

  const handleCreateSubStage = async (guideStageId: string, values: any) => {
    try {
      const payload = cleanGuidePayload({
        ...values,
        guide_stages_id: guideStageId,
      });
      await createSubGuideStage(payload);
      message.success("Sub guide stage created");
      loadStageDetail(guideStageId);
      return true;
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || error?.message || "Failed to create sub stage"
      );
      return false;
    }
  };

  const handleUpdateSubStage = async (id: string, guideStageId: string, values: any) => {
    try {
      const payload = cleanGuidePayload(values);
      await updateSubGuideStage(id, payload);
      message.success("Sub guide stage updated");
      loadStageDetail(guideStageId);
      return true;
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || error?.message || "Failed to update sub stage"
      );
      return false;
    }
  };

  const handleDeleteSubStage = async (id: string, guideStageId: string) => {
    try {
      await deleteSubGuideStage(id);
      message.success("Sub guide stage deleted");
      loadStageDetail(guideStageId);
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || error?.message || "Failed to delete sub stage"
      );
    }
  };

  // Blog (news) under sub stage
  const handleBlogCreateOrUpdate = async (
    values: any,
    subGuideStageId: string,
    blogId?: string
  ) => {
    try {
      setSaving(true);
      const payload = {
        ...values,
        content: blogContent,
        sub_guide_stages_id: subGuideStageId,
      };
      if (blogId) {
        await updateNews(blogId, payload);
        message.success("Blog updated successfully");
      } else {
        await createNews(payload);
        message.success("Blog created successfully");
      }
      setBlogEditing(null);
      setBlogContent("");
      // refresh stage detail
      const stageId = stageIdBySub(subGuideStageId);
      if (stageId) loadStageDetail(stageId);
      return true;
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || error?.message || "Failed to save blog"
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  const stageIdBySub = (subId: string) => {
    const entries = Object.values(stageDetails);
    for (const st of entries) {
      const found = st.sub_guide_stages?.find((s) => s.id === subId);
      if (found) return st.id;
    }
    return null;
  };

  const handleBlogEdit = async (blogId: string, subGuideStageId: string) => {
    try {
      const detail = await getNewsDetail(blogId);
      setBlogEditing({ ...detail.data, sub_guide_stages_id: subGuideStageId });
      setBlogContent(detail.data.content || "");
      setActiveTab("guide"); // ensure correct tab
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || error?.message || "Failed to load blog detail"
      );
    }
  };

  const handleBlogDelete = async (blogId: string, subGuideStageId: string) => {
    try {
      await deleteNews(blogId);
      message.success("Blog deleted successfully");
      const stageId = stageIdBySub(subGuideStageId);
      if (stageId) loadStageDetail(stageId);
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || error?.message || "Failed to delete blog"
      );
    }
  };

  // Tag management functions
  const handleTagUpsert = async (values: any, id?: string) => {
    try {
      setTagSaving(true);
      if (id) {
        await updateNewsTag(id, values);
        message.success("Tag updated successfully");
      } else {
        await createNewsTag(values);
        message.success("Tag created successfully");
      }
      loadTags();
      return true;
    } catch (error: any) {
      const errMsg =
        error?.response?.data?.message || error?.message || "Failed to save tag";
      message.error(errMsg);
      return false;
    } finally {
      setTagSaving(false);
    }
  };

  const handleTagDelete = async (id: string) => {
    try {
      await deleteNewsTag(id);
      message.success("Tag deleted successfully");
      loadTags();
    } catch (error: any) {
      const errMsg =
        error?.response?.data?.message || error?.message || "Failed to delete tag";
      message.error(errMsg);
    }
  };

  const columns: ProColumns<News>[] = [
    {
      title: "Title",
      dataIndex: "title",
      ellipsis: true,
      render: (dom, entity) => (
        <a
          onClick={() => {
            handleViewDetail(entity);
          }}
        >
          {dom}
        </a>
      ),
    },
    {
      title: "Tag",
      dataIndex: "blog_tag_name",
      hideInSearch: true,
      render: (_, record) => record.blog_tag_name || "-",
    },
    {
      title: "Status",
      dataIndex: "status",
      valueType: "select",
      valueEnum: {
        draft: { text: "Draft", status: "Default" },
        published: { text: "Published", status: "Success" },
      },
      render: (_, record) => (
        <Tag color={statusColors[record.status]}>{record.status}</Tag>
      ),
    },
    {
      title: "Author",
      dataIndex: "full_name",
      render: (_, record) => (
        <Space>
          <Avatar size="small" src={record.avatar || undefined}>
            {record.full_name?.[0] || "?"}
          </Avatar>
          <span>{record.full_name}</span>
        </Space>
      ),
    },
    {
      title: "Published At",
      dataIndex: "published_at",
      valueType: "dateTime",
      hideInSearch: true,
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      valueType: "dateTime",
      hideInSearch: true,
    },
    {
      title: "Updated At",
      dataIndex: "updated_at",
      valueType: "dateTime",
      hideInSearch: true,
    },
    {
      title: "Actions",
      valueType: "option",
      width: 200,
      render: (_, record) => [
        <Button
          key="view"
          type="text"
          size="small"
          icon={<EyeOutlined />}
          loading={viewingId === record.id}
          onClick={() => handleViewDetail(record)}
        />,
          <Button
            key="edit"
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={async () => {
              try {
                // Get full news detail to ensure we have content
                const detail = await getNewsDetail(record.id);
                setEditing(detail.data);
                setEditContent(detail.data.content || "");
              } catch (error) {
                // Fallback to record data if detail fetch fails
                setEditing(record);
                setEditContent(record.content || "");
              }
            }}
          />,
        <Popconfirm
          key="delete"
          title="Delete news"
          description="Are you sure you want to delete this news?"
          onConfirm={() => handleDelete(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="text" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>,
      ],
    },
  ];

  const handleUpsert = async (values: any, id?: string) => {
    try {
      setSaving(true);
      const payload = Object.fromEntries(
        Object.entries(values).filter(
          ([, v]) => v !== undefined && v !== null && v !== ""
        )
      ) as any;
      if (id) {
        await updateNews(id, payload as any);
        message.success("News updated successfully");
      } else {
        await createNews(payload as any);
        message.success("News created successfully");
      }
      // Reload news list
      actionRef.current?.reload();
      return true;
    } catch (error: any) {
      const errMsg =
        error?.response?.data?.message || error?.message || "Failed to save news";
      message.error(errMsg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "news",
            label: (
              <span>
                <EditOutlined />
                News Management
              </span>
            ),
            children: (
              <ProTable<News>
        headerTitle="News Management"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 120 }}
        toolBarRender={() => [
          <ModalForm
            key="create"
            title="Create News"
            trigger={
              <Button type="primary" icon={<CheckCircleOutlined />}>
                New
              </Button>
            }
            modalProps={{ 
              destroyOnClose: true,
              width: 800,
              styles: {
                body: { maxHeight: "70vh", overflow: "auto" }
              }
            }}
            submitter={{ submitButtonProps: { loading: saving } }}
            onFinish={async (values) => {
              if (!createContent.trim()) {
                message.error("Please enter content");
                return false;
              }
              const success = await handleUpsert({ ...values, content: createContent });
              if (success) {
                setCreateContent("");
              }
              return success;
            }}
            onOpenChange={(open) => {
              if (!open) setCreateContent("");
            }}
          >
            <ProFormText
              name="title"
              label="Title"
              rules={[{ required: true, message: "Please enter title" }]}
            />
            <ProFormText name="description" label="Description" />
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
                Content <span style={{ color: "#ff4d4f" }}>*</span>
              </label>
              <MdEditor
                value={createContent}
                style={{ height: "300px" }}
                renderHTML={(text) => mdParser.render(text)}
                onChange={({ text }) => setCreateContent(text)}
                placeholder="Enter markdown content here..."
              />
            </div>
            <ProFormText name="cover_image_url" label="Cover Image URL" />
            <ProFormSelect
              name="blog_tag_id"
              label="Tag"
              options={tagOptions}
              placeholder="Select a tag"
            />
            <ProFormSelect
              name="status"
              label="Status"
              options={statusOptions}
              placeholder="draft/published"
            />
          </ModalForm>,
        ]}
        request={async (params) => {
          try {
            const size =
              params.pageSize && params.current
                ? params.pageSize * params.current
                : params.pageSize;
            const res = await getNews(size);
            // Handle response structure: { data: { news: [...], total: number } }
            let base: any[] = [];
            if ((res as any).data?.news && Array.isArray((res as any).data.news)) {
              base = (res as any).data.news;
            } else if (Array.isArray((res as any).data)) {
              base = (res as any).data;
            }
            let items: any[] = base.slice(); // clone so we can filter/slice safely
            if (params.title) {
              items = items.filter((n: any) =>
                n.title.toLowerCase().includes(String(params.title).toLowerCase())
              );
            }
            if (params.status) {
              items = items.filter((n: any) => n.status === params.status);
            }
            const page = params.current || 1;
            const pageSize = params.pageSize || 10;
            const start = (page - 1) * pageSize;
            const data = items.slice(start, start + pageSize);
            return {
              data,
              success: true,
              total: items.length,
            };
          } catch (error: any) {
            const errMsg =
              error?.response?.data?.message ||
              error?.message ||
              "Failed to fetch news";
            message.error(errMsg);
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        columns={columns}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
      />
            ),
          },
          {
            key: "tags",
            label: (
              <span>
                <TagOutlined />
                Tag Management
              </span>
            ),
            children: (
              <Card>
                <div style={{ marginBottom: 16 }}>
                  <ModalForm
                    title="Create Tag"
                    trigger={
                      <Button type="primary" icon={<PlusOutlined />}>
                        New Tag
                      </Button>
                    }
                    modalProps={{ destroyOnClose: true }}
                    submitter={{ submitButtonProps: { loading: tagSaving } }}
                    onFinish={async (values) => {
                      const success = await handleTagUpsert(values);
                      return success;
                    }}
                  >
                    <ProFormText
                      name="name"
                      label="Tag Name"
                      rules={[{ required: true, message: "Please enter tag name" }]}
                    />
                  </ModalForm>
                </div>
                <List
                  dataSource={tags}
                  renderItem={(tag) => (
                    <List.Item
                      actions={[
                        <ModalForm
                          key="edit"
                          title="Edit Tag"
                          trigger={
                            <Button type="text" size="small" icon={<EditOutlined />} />
                          }
                          initialValues={tag}
                          modalProps={{ destroyOnClose: true }}
                          submitter={{ submitButtonProps: { loading: tagSaving } }}
                          onFinish={async (values) => {
                            const success = await handleTagUpsert(values, tag.id);
                            return success;
                          }}
                        >
                          <ProFormText
                            name="name"
                            label="Tag Name"
                            rules={[{ required: true, message: "Please enter tag name" }]}
                          />
                        </ModalForm>,
                        <Popconfirm
                          key="delete"
                          title="Delete tag"
                          description="Are you sure you want to delete this tag?"
                          onConfirm={() => handleTagDelete(tag.id)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Tag color="blue">{tag.name}</Tag>}
                        title={tag.name}
                        description={`Created: ${new Date(tag.created_at).toLocaleDateString()}`}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            ),
          },
          {
            key: "guide",
            label: (
              <span>
                <SettingOutlined />
                Farming Guide
              </span>
            ),
            children: (
              <Flex vertical gap={16}>
                <Card
                  title="Plants"
                  extra={
                    <Button loading={plantsLoading} onClick={loadPlants}>
                      Reload
                    </Button>
                  }
                >
                  <List
                    grid={{ gutter: 16, column: 3 }}
                    loading={plantsLoading}
                    dataSource={plants}
                    renderItem={(plant) => (
                      <List.Item>
                        <Card
                          hoverable
                          onClick={() => {
                            setSelectedPlant(plant);
                            loadGuideStages(plant.id);
                          }}
                          cover={
                            plant.image_url ? (
                              <img
                                alt={plant.name}
                                src={plant.image_url}
                                style={{ height: 160, objectFit: "cover" }}
                              />
                            ) : null
                          }
                          style={
                            selectedPlant?.id === plant.id
                              ? { borderColor: "#1677ff" }
                              : undefined
                          }
                        >
                          <Card.Meta title={plant.name} description={plant.description} />
                        </Card>
                      </List.Item>
                    )}
                  />
                </Card>

                {selectedPlant ? (
                  <Card
                    title={`Farming Guide - ${selectedPlant.name}`}
                    extra={
                      <ModalForm
                        title="Create Stage"
                        trigger={<Button type="primary" icon={<PlusOutlined />}>Add Stage</Button>}
                        submitter={{ submitButtonProps: { loading: stagesLoading } }}
                        onFinish={(values) => handleCreateStage(values)}
                      >
                        <ProFormText
                          name="stage_title"
                          label="Stage Title"
                          rules={[{ required: true, message: "Please enter stage title" }]}
                        />
                        <ProFormText name="description" label="Description" />
                        <ProFormText name="image_url" label="Image URL" />
                        <ProFormText
                          name="start_day_offset"
                          label="Start Day Offset"
                          fieldProps={{ type: "number" }}
                        />
                        <ProFormText
                          name="end_day_offset"
                          label="End Day Offset"
                          fieldProps={{ type: "number" }}
                        />
                      </ModalForm>
                    }
                  >
                    {stagesLoading ? (
                      <Spin />
                    ) : guideStages.length === 0 ? (
                      <Empty description="No guide stages yet" />
                    ) : (
                      <Collapse
                        accordion
                        onChange={(key) => {
                          if (typeof key === "string") {
                            loadStageDetail(key);
                          } else if (Array.isArray(key) && key[0]) {
                            loadStageDetail(key[0]);
                          }
                        }}
                      >
                        {guideStages.map((stage) => {
                          const detail = stageDetails[stage.id];
                          const subs = detail?.sub_guide_stages || [];
                          return (
                            <Collapse.Panel
                              key={stage.id}
                              header={
                                <Space direction="vertical" size={0}>
                                  <strong>{stage.stage_title}</strong>
                                  <span>
                                    Day {stage.start_day_offset ?? 0} - {stage.end_day_offset ?? "?"}
                                  </span>
                                </Space>
                              }
                              extra={
                                <Space>
                                  <ModalForm
                                    title="Edit Stage"
                                    trigger={<Button type="text" size="small" icon={<EditOutlined />} />}
                                    initialValues={stage}
                                    submitter={{ submitButtonProps: { loading: stagesLoading } }}
                                    onFinish={(values) => handleUpdateStage(stage.id, values)}
                                  >
                                    <ProFormText
                                      name="stage_title"
                                      label="Stage Title"
                                      rules={[{ required: true, message: "Please enter stage title" }]}
                                    />
                                    <ProFormText name="description" label="Description" />
                                    <ProFormText name="image_url" label="Image URL" />
                                    <ProFormText
                                      name="start_day_offset"
                                      label="Start Day Offset"
                                      fieldProps={{ type: "number" }}
                                    />
                                    <ProFormText
                                      name="end_day_offset"
                                      label="End Day Offset"
                                      fieldProps={{ type: "number" }}
                                    />
                                  </ModalForm>
                                  <Popconfirm
                                    title="Delete stage"
                                    description="Are you sure you want to delete this stage?"
                                    onConfirm={() => handleDeleteStage(stage.id)}
                                    okText="Yes"
                                    cancelText="No"
                                  >
                                    <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                                  </Popconfirm>
                                </Space>
                              }
                            >
                              {stageDetailLoading === stage.id && <Spin />}
                              <Space direction="vertical" style={{ width: "100%" }} size="large">
                                <div>{stage.description}</div>
                                <ModalForm
                                  title="Add Sub Stage"
                                  trigger={
                                    <Button type="dashed" icon={<PlusOutlined />}>
                                      Add Sub Stage
                                    </Button>
                                  }
                                  submitter={{ submitButtonProps: { loading: stagesLoading } }}
                                  onFinish={(values) => handleCreateSubStage(stage.id, values)}
                                >
                                  <ProFormText
                                    name="title"
                                    label="Title"
                                    rules={[{ required: true, message: "Please enter title" }]}
                                  />
                                  <ProFormText
                                    name="start_day_offset"
                                    label="Start Day Offset"
                                    fieldProps={{ type: "number" }}
                                  />
                                  <ProFormText
                                    name="end_day_offset"
                                    label="End Day Offset"
                                    fieldProps={{ type: "number" }}
                                  />
                                </ModalForm>

                                {subs.length === 0 ? (
                                  <Empty description="No sub stages" />
                                ) : (
                                  <Row gutter={[16, 16]}>
                                    {subs.map((sub) => (
                                      <Col span={12} key={sub.id}>
                                        <Card
                                          title={
                                            <Space direction="vertical" size={0}>
                                              <strong>{sub.title}</strong>
                                              <span>
                                                Day {sub.start_day_offset ?? 0} -{" "}
                                                {sub.end_day_offset ?? "?"}
                                              </span>
                                            </Space>
                                          }
                                          extra={
                                            <Space>
                                              <ModalForm
                                                title="Edit Sub Stage"
                                                trigger={
                                                  <Button
                                                    type="text"
                                                    size="small"
                                                    icon={<EditOutlined />}
                                                  />
                                                }
                                                initialValues={sub}
                                                submitter={{ submitButtonProps: { loading: stagesLoading } }}
                                                onFinish={(values) =>
                                                  handleUpdateSubStage(sub.id, stage.id, values)
                                                }
                                              >
                                                <ProFormText
                                                  name="title"
                                                  label="Title"
                                                  rules={[{ required: true, message: "Please enter title" }]}
                                                />
                                                <ProFormText
                                                  name="start_day_offset"
                                                  label="Start Day Offset"
                                                  fieldProps={{ type: "number" }}
                                                />
                                                <ProFormText
                                                  name="end_day_offset"
                                                  label="End Day Offset"
                                                  fieldProps={{ type: "number" }}
                                                />
                                              </ModalForm>
                                              <Popconfirm
                                                title="Delete sub stage"
                                                description="Are you sure you want to delete this sub stage?"
                                                onConfirm={() => handleDeleteSubStage(sub.id, stage.id)}
                                                okText="Yes"
                                                cancelText="No"
                                              >
                                                <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                                              </Popconfirm>
                                            </Space>
                                          }
                                          actions={[
                                            <Button
                                              key="add-blog"
                                              type="link"
                                              icon={<PlusOutlined />}
                                              onClick={() => {
                                                setBlogEditing({
                                                  sub_guide_stages_id: sub.id,
                                                  status: "draft",
                                                });
                                                setBlogContent("");
                                              }}
                                            >
                                              Add Blog
                                            </Button>,
                                          ]}
                                        >
                                          <List
                                            dataSource={sub.blogs || []}
                                            locale={{ emptyText: "No blogs" }}
                                            renderItem={(blog: any) => (
                                              <List.Item
                                                actions={[
                                                  <Button
                                                    key="edit"
                                                    type="link"
                                                    onClick={() => handleBlogEdit(blog.id, sub.id)}
                                                  >
                                                    Edit
                                                  </Button>,
                                                  <Popconfirm
                                                    key="delete"
                                                    title="Delete blog"
                                                    onConfirm={() => handleBlogDelete(blog.id, sub.id)}
                                                  >
                                                    <Button type="link" danger>
                                                      Delete
                                                    </Button>
                                                  </Popconfirm>,
                                                ]}
                                              >
                                                <List.Item.Meta
                                                  title={blog.title}
                                                  description={
                                                    <Space direction="vertical">
                                                      <span>{blog.blog_tag_name || "-"}</span>
                                                      <Tag color={blog.status === "published" ? "green" : "default"}>
                                                        {blog.status}
                                                      </Tag>
                                                    </Space>
                                                  }
                                                />
                                              </List.Item>
                                            )}
                                          />
                                        </Card>
                                      </Col>
                                    ))}
                                  </Row>
                                )}
                              </Space>
                            </Collapse.Panel>
                          );
                        })}
                      </Collapse>
                    )}
                  </Card>
                ) : (
                  <Empty description="Select a plant to manage guides" />
                )}

                <ModalForm
                  title={blogEditing?.id ? "Edit Blog" : "Create Blog"}
                  open={!!blogEditing}
                  onOpenChange={(open) => {
                    if (!open) {
                      setBlogEditing(null);
                      setBlogContent("");
                    }
                  }}
                  submitter={{ submitButtonProps: { loading: saving } }}
                  initialValues={blogEditing || undefined}
                  onFinish={async (values) => {
                    if (!blogEditing?.sub_guide_stages_id) {
                      message.error("Missing sub guide stage");
                      return false;
                    }
                    if (!blogContent.trim()) {
                      message.error("Please enter content");
                      return false;
                    }
                    return handleBlogCreateOrUpdate(
                      { ...values },
                      blogEditing.sub_guide_stages_id,
                      blogEditing.id
                    );
                  }}
                >
                  <ProFormText
                    name="title"
                    label="Title"
                    rules={[{ required: true, message: "Please enter title" }]}
                  />
                  <ProFormText name="description" label="Description" />
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
                      Content <span style={{ color: "#ff4d4f" }}>*</span>
                    </label>
                    <MdEditor
                      value={blogContent}
                      style={{ height: "300px" }}
                      renderHTML={(text) => mdParser.render(text)}
                      onChange={({ text }) => setBlogContent(text)}
                      placeholder="Enter markdown content here..."
                    />
                  </div>
                  <ProFormText name="cover_image_url" label="Cover Image URL" />
                  <ProFormSelect
                    name="blog_tag_id"
                    label="Tag"
                    options={tagOptions}
                    placeholder="Select a tag"
                  />
                  <ProFormSelect
                    name="status"
                    label="Status"
                    options={statusOptions}
                    placeholder="draft/published"
                    initialValue="draft"
                  />
                </ModalForm>
              </Flex>
            ),
          },
        ]}
      />

      <ModalForm
        title="Edit News"
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
            setEditContent("");
          }
        }}
        modalProps={{ 
          destroyOnClose: true,
          width: 800,
          styles: {
            body: { maxHeight: "70vh", overflow: "auto" }
          }
        }}
        submitter={{ submitButtonProps: { loading: saving } }}
        initialValues={{
          ...editing,
          // Ensure form fields are populated
          title: editing?.title || "",
          description: editing?.description || "",
          cover_image_url: editing?.cover_image_url || "",
          blog_tag_id: editing?.blog_tag_id || "",
          status: editing?.status || "draft",
        }}
        // Force form to update when editing changes
        key={editing?.id || "edit-form"}
        onFinish={async (values) => {
          if (!editContent.trim()) {
            message.error("Please enter content");
            return false;
          }
          const success = await handleUpsert({ ...values, content: editContent }, editing?.id);
          if (success) {
            setEditing(null);
            setEditContent("");
          }
          return success;
        }}
      >
        <ProFormText
          name="title"
          label="Title"
          rules={[{ required: true, message: "Please enter title" }]}
        />
            <ProFormText name="description" label="Description" />
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
                Content <span style={{ color: "#ff4d4f" }}>*</span>
              </label>
              <MdEditor
                value={editContent}
                style={{ height: "300px" }}
                renderHTML={(text) => mdParser.render(text)}
                onChange={({ text }) => setEditContent(text)}
                placeholder="Enter markdown content here..."
              />
            </div>
        <ProFormText name="cover_image_url" label="Cover Image URL" />
        <ProFormSelect
          name="blog_tag_id"
          label="Tag"
          options={tagOptions}
          placeholder="Select a tag"
        />
        <ProFormSelect
          name="status"
          label="Status"
          options={statusOptions}
          placeholder="draft/published"
        />
      </ModalForm>

      <Drawer
        width={720}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable
        title={currentRow?.title}
      >
        {currentRow ? (
          <ProDescriptions<NewsDetail>
            column={1}
            dataSource={currentRow}
            columns={[
              {
                title: "Title",
                dataIndex: "title",
              },
              {
                title: "Status",
                dataIndex: "status",
                render: (_, record) => (
                  <Tag color={statusColors[record.status]}>{record.status}</Tag>
                ),
              },
              {
                title: "Tag",
                dataIndex: "blog_tag_name",
                render: (_, record) => record.blog_tag_name || "-",
              },
              {
                title: "Author",
                dataIndex: "full_name",
                render: (_, record) => (
                  <Space>
                    <Avatar src={record.avatar || undefined}>
                      {record.full_name?.[0] || "?"}
                    </Avatar>
                    <span>{record.full_name}</span>
                  </Space>
                ),
              },
              { title: "Published At", dataIndex: "published_at", valueType: "dateTime" },
              { title: "Created At", dataIndex: "created_at", valueType: "dateTime" },
              { title: "Updated At", dataIndex: "updated_at", valueType: "dateTime" },
              {
                title: "Description",
                dataIndex: "description",
                render: (_, record) => record.description || "-",
              },
              {
                title: "Content",
                dataIndex: "content",
                render: (_, record) => (
                  <div 
                    style={{ 
                      maxHeight: "400px", 
                      overflow: "auto",
                      padding: "12px",
                      border: "1px solid #f0f0f0",
                      borderRadius: "6px",
                      backgroundColor: "#fafafa"
                    }}
                    dangerouslySetInnerHTML={{ 
                      __html: mdParser.render(record.content || "") 
                    }}
                  />
                ),
              },
            ]}
          />
        ) : null}
      </Drawer>
    </PageContainer>
  );
};

export default Function5;
