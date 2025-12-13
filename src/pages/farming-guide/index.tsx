import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  ModalForm,
  PageContainer,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import {
  Avatar,
  Button,
  Input,
  Card,
  Collapse,
  Empty,
  Flex,
  List,
  Modal,
  message,
  Popconfirm,
  Space,
  Spin,
  Tag,
  Steps,
} from "antd";
import React, { useEffect, useMemo, useState } from "react";
import MdEditor from "react-markdown-editor-lite";
import MarkdownIt from "markdown-it";
import "react-markdown-editor-lite/lib/index.css";

import {
  createGuideStage,
  createSubGuideStage,
  deleteGuideStage,
  deleteSubGuideStage,
  getGuideStageDetail,
  getGuideStagesByPlant,
  GuideStage,
  GuideStageDetail,
  SubGuideStage,
  updateGuideStage,
  updateSubGuideStage,
} from "@/services/guide";
import {
  createNews,
  deleteNews,
  getNewsDetail,
  NewsStatus,
  updateNews,
} from "@/services/news";
import { getPlants, Plant } from "@/services/plant";
import { BlogTag, getNewsTags } from "@/services/newsTag";

const mdParser = new MarkdownIt();
const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
];

const FarmingGuide: React.FC = () => {
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [plantsLoading, setPlantsLoading] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [plantSearch, setPlantSearch] = useState<string>("");

  const [guideStages, setGuideStages] = useState<GuideStage[]>([]);
  const [stagesLoading, setStagesLoading] = useState(false);
  const [stageDetails, setStageDetails] = useState<Record<string, GuideStageDetail>>({});
  const [stageDetailLoading, setStageDetailLoading] = useState<string | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  const [blogEditing, setBlogEditing] = useState<any | null>(null);
  const [blogContent, setBlogContent] = useState<string>("");
  const [blogViewing, setBlogViewing] = useState<any | null>(null);
  const [blogViewingLoading, setBlogViewingLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);

  const tagOptions = useMemo(
    () => tags.map((tag) => ({ label: tag.name, value: tag.id })),
    [tags]
  );

  const getBlogId = (blog: any) => blog?.id || blog?.blog_id;

  const filteredPlants = useMemo(() => {
    if (!plantSearch.trim()) return plants;
    return plants.filter((p) =>
      p.name?.toLowerCase().includes(plantSearch.trim().toLowerCase())
    );
  }, [plants, plantSearch]);

  // Helper: clean payload & cast numeric offsets
  const cleanGuidePayload = (obj: Record<string, any>) => {
    const cleaned: Record<string, any> = {};
    Object.entries(obj).forEach(([k, v]) => {
      if (v === "" || v === undefined || v === null) return;
      if (["start_day_offset", "end_day_offset"].includes(k)) {
        const num = Number(v);
        if (!Number.isNaN(num)) cleaned[k] = num;
      } else {
        cleaned[k] = v;
      }
    });
    return cleaned;
  };

  useEffect(() => {
    loadTags();
    loadPlants();
  }, []);

  const selectedPlantId = selectedPlant?.id;

  const loadTags = async () => {
    try {
      const res = await getNewsTags();
      setTags(res.data.blog_tags || []);
    } catch (error) {
      console.error("Failed to load tags", error);
    }
  };

  const loadPlants = async () => {
    try {
      setPlantsLoading(true);
      const res = await getPlants();
      setPlants(res.data.plants || []);
    } catch (error: any) {
      message.error("Failed to load plants");
    } finally {
      setPlantsLoading(false);
    }
  };

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
      // pick first stage as selected
      if (Array.isArray(stages) && stages.length > 0) {
        const firstId = stages[0].id;
        setSelectedStageId(firstId);
        loadStageDetail(firstId);
      } else {
        setSelectedStageId(null);
      }
      setStageDetails({});
    } catch (error: any) {
      message.error("Failed to load guide stages");
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
      message.error("Failed to load stage detail");
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
      message.error(error?.response?.data?.message || error?.message || "Failed to create stage");
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
      message.error(error?.response?.data?.message || error?.message || "Failed to update stage");
      return false;
    }
  };

  const handleDeleteStage = async (id: string) => {
    try {
      await deleteGuideStage(id);
      message.success("Guide stage deleted");
      if (selectedPlant) loadGuideStages(selectedPlant.id);
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || "Failed to delete stage");
    }
  };

  const handleCreateSubStage = async (guideStageId: string, values: any) => {
    try {
      const payload = cleanGuidePayload({ ...values, guide_stages_id: guideStageId });
      await createSubGuideStage(payload);
      message.success("Sub guide stage created");
      loadStageDetail(guideStageId);
      return true;
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || "Failed to create sub stage");
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
      message.error(error?.response?.data?.message || error?.message || "Failed to update sub stage");
      return false;
    }
  };

  const handleDeleteSubStage = async (id: string, guideStageId: string) => {
    try {
      await deleteSubGuideStage(id);
      message.success("Sub guide stage deleted");
      loadStageDetail(guideStageId);
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || "Failed to delete sub stage");
    }
  };

  const stageIdBySub = (subId?: string | null) => {
    if (!subId) return null;
    const entries = Object.values(stageDetails);
    for (const st of entries) {
      const found = st.sub_guide_stages?.find((s) => s.id === subId);
      if (found) return st.id;
    }
    return null;
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
        status: "published" as NewsStatus,
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
      const stageId = stageIdBySub(subGuideStageId);
      if (stageId) loadStageDetail(stageId);
      return true;
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || "Failed to save blog");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleBlogEdit = async (blogId?: string, subGuideStageId?: string) => {
    if (!blogId) {
      message.error("Missing blog id");
      return;
    }
    try {
      const detail = await getNewsDetail(blogId);
      setBlogEditing({ ...detail.data, sub_guide_stages_id: subGuideStageId });
      setBlogContent(detail.data.content || "");
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || "Failed to load blog detail");
    }
  };

  const handleBlogDelete = async (blogId?: string, subGuideStageId?: string) => {
    if (!blogId) {
      message.error("Missing blog id");
      return;
    }
    try {
      await deleteNews(blogId);
      message.success("Blog deleted successfully");
      const stageId = stageIdBySub(subGuideStageId);
      if (stageId) loadStageDetail(stageId);
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || "Failed to delete blog");
    }
  };

  const handleBlogView = async (blogId?: string, subGuideStageId?: string) => {
    if (!blogId) {
      message.error("Missing blog id");
      return;
    }
    try {
      setBlogViewingLoading(true);
      const detail = await getNewsDetail(blogId);
      setBlogViewing({ ...detail.data, sub_guide_stages_id: subGuideStageId });
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || "Failed to load blog detail");
    } finally {
      setBlogViewingLoading(false);
    }
  };

  return (
    <PageContainer
      header={{
        title: "Farming Guide",
        subTitle: "Manage guide stages, sub stages, and blogs per plant",
        avatar: { icon: <SettingOutlined /> },
      }}
    >
      <Flex vertical gap={16}>
        {!selectedPlant ? (
          <Card
            title="Plants"
            extra={
              <Space>
                <Input.Search
                  allowClear
                  placeholder="Search plants"
                  onChange={(e) => setPlantSearch(e.target.value)}
                  style={{ width: 220 }}
                />
                <Button loading={plantsLoading} onClick={loadPlants}>
                  Reload
                </Button>
              </Space>
            }
            bodyStyle={{ padding: 12 }}
          >
            <List<Plant>
              grid={{ gutter: 24, column: 3 }}
              loading={plantsLoading}
              dataSource={filteredPlants}
              locale={{ emptyText: <Empty description="No plants" /> }}
              renderItem={(plant: Plant) => (
                <List.Item>
                  <Card
                    hoverable
                    onClick={() => {
                      setSelectedPlant(plant);
                      loadGuideStages(plant.id);
                    }}
                    actions={[
                      <span key="guide">
                        <CheckCircleOutlined /> Guide
                      </span>,
                    ]}
                    style={
                      selectedPlantId === plant.id
                        ? { borderColor: "#1677ff", boxShadow: "0 0 0 2px #1677ff33" }
                        : undefined
                    }
                  >
                    <Card.Meta
                      avatar={
                        plant.image_url ? (
                          <Avatar
                            shape="square"
                            src={plant.image_url}
                            size={64}
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <Avatar shape="square" size={64}>
                            {plant.name?.[0] || "P"}
                          </Avatar>
                        )
                      }
                      title={plant.name}
                      description={
                        <span style={{ color: "#666" }}>
                          {plant.description || "No description"}
                        </span>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        ) : (
          <Card
            title={`Farming Guide - ${selectedPlant.name}`}
            extra={
              <Space>
                <Button
                  onClick={() => {
                    setSelectedPlant(null);
                    setSelectedStageId(null);
                    setGuideStages([]);
                    setStageDetails({});
                    setBlogEditing(null);
                    setBlogViewing(null);
                    setBlogContent("");
                  }}
                >
                  Back to Plants
                </Button>
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
                  <ProFormDigit name="start_day_offset" label="Start Day Offset" />
                  <ProFormDigit name="end_day_offset" label="End Day Offset" />
                </ModalForm>
              </Space>
            }
            bodyStyle={{ padding: 16 }}
          >
            {stagesLoading ? (
              <Spin />
            ) : guideStages.length === 0 ? (
              <Empty description="No guide stages yet" />
            ) : (
              <Flex gap={16} vertical={false}>
                <Card style={{ width: 300 }} bodyStyle={{ padding: 12 }}>
                  <Steps
                    direction="vertical"
                    current={
                      guideStages.findIndex((s) => s.id === selectedStageId)
                    }
                    onChange={(idx) => {
                      const stage = guideStages[idx];
                      if (stage) {
                        setSelectedStageId(stage.id);
                        loadStageDetail(stage.id);
                      }
                    }}
                    items={guideStages.map((stage) => ({
                      title: stage.stage_title,
                      subTitle: `Day ${stage.start_day_offset ?? 0} - ${stage.end_day_offset ?? "?"}`,
                      description: stage.description,
                    }))}
                  />
                  <div style={{ marginTop: 12 }}>
                    <ModalForm
                      title="Create Stage"
                      trigger={
                        <Button block type="dashed" icon={<PlusOutlined />}>
                          Add Stage
                        </Button>
                      }
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
                      <ProFormDigit name="start_day_offset" label="Start Day Offset" />
                      <ProFormDigit name="end_day_offset" label="End Day Offset" />
                    </ModalForm>
                  </div>
                </Card>

                <Flex vertical style={{ flex: 1 }} gap={12}>
                  {selectedStageId ? (
                    (() => {
                      const stage = guideStages.find((s) => s.id === selectedStageId);
                      if (!stage) return <Empty description="Select a stage" />;
                      const detail = stageDetails[selectedStageId];
                      const subs = detail?.sub_guide_stages || [];
                      return (
                        <Card
                          title={
                            <Space>
                              {stage.image_url ? (
                                <Avatar shape="square" src={stage.image_url} size={80} />
                              ) : null}
                              <Space direction="vertical" size={2}>
                                <strong>{stage.stage_title || "Stage"}</strong>
                                {stage.description && (
                                  <span style={{ color: "#666" }}>{stage.description}</span>
                                )}
                                <span style={{ color: "#666" }}>
                                  Day {stage.start_day_offset ?? 0} - {stage.end_day_offset ?? "?"}
                                </span>
                              </Space>
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
                                <ProFormDigit name="start_day_offset" label="Start Day Offset" />
                                <ProFormDigit name="end_day_offset" label="End Day Offset" />
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
                          <Space direction="vertical" style={{ width: "100%" }} size={12}>
                            {stageDetailLoading === selectedStageId ? (
                              <Spin />
                            ) : subs.length === 0 ? (
                              <Empty description="No sub stages" />
                            ) : (
                              <List
                                grid={{ gutter: 16, column: 2 }}
                                dataSource={[...subs.sort((a, b) => (a.start_day_offset ?? 0) - (b.start_day_offset ?? 0)), { __add: true }]}
                                renderItem={(sub: any, idx: number) =>
                                  sub.__add ? (
                                    <List.Item key="add-sub-stage">
                                      <ModalForm
                                        title="Add Sub Stage"
                                        trigger={
                                          <Card
                                            hoverable
                                            style={{
                                              border: "1px dashed #d9d9d9",
                                              minHeight: 385,
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                            }}
                                          >
                                            <Space direction="vertical" align="center">
                                              <PlusOutlined />
                                              <span>Add Sub Stage</span>
                                            </Space>
                                          </Card>
                                        }
                                        submitter={{ submitButtonProps: { loading: stagesLoading } }}
                                        onFinish={(values) => handleCreateSubStage(stage.id, values)}
                                      >
                                        <ProFormText
                                          name="title"
                                          label="Title"
                                          rules={[{ required: true, message: "Please enter title" }]}
                                        />
                                        <ProFormDigit name="start_day_offset" label="Start Day Offset" />
                                        <ProFormDigit name="end_day_offset" label="End Day Offset" />
                                      </ModalForm>
                                    </List.Item>
                                  ) : (
                                    <List.Item key={sub.id}>
                                      <Card
                                        size="small"
                                        style={{ minHeight: 220, display: "flex", flexDirection: "column" }}
                                        title={
                                          <Space align="center">
                                            <Tag color="purple">#{idx + 1}</Tag>
                                            <strong>{sub.title}</strong>
                                            <Tag color="blue">
                                              Day {sub.start_day_offset ?? 0} - {sub.end_day_offset ?? "?"}
                                            </Tag>
                                            <Tag color="geekblue">
                                              {sub.blogs?.length || 0} Blogs
                                            </Tag>
                                          </Space>
                                        }
                                        extra={
                                          <Space>
                                            <ModalForm
                                              title="Edit Sub Stage"
                                              trigger={<Button type="text" size="small" icon={<EditOutlined />} />}
                                              initialValues={sub}
                                              submitter={{ submitButtonProps: { loading: stagesLoading } }}
                                              onFinish={(values) => handleUpdateSubStage(sub.id, stage.id, values)}
                                            >
                                              <ProFormText
                                                name="title"
                                                label="Title"
                                                rules={[{ required: true, message: "Please enter title" }]}
                                              />
                                              <ProFormDigit name="start_day_offset" label="Start Day Offset" />
                                              <ProFormDigit name="end_day_offset" label="End Day Offset" />
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
                                          grid={{ gutter: 12, column: 3 }}
                                          dataSource={sub.blogs || []}
                                          locale={{ emptyText: "No blogs" }}
                                          renderItem={(blog: any) => {
                                            const blogId = getBlogId(blog);
                                            return (
                                              <List.Item>
                                                <Card
                                                  size="small"
                                                  hoverable
                                                  style={{ minHeight: 180, display: "flex", flexDirection: "column" }}
                                                  onClick={() => handleBlogView(blogId, sub.id)}
                                                  cover={
                                                    blog.cover_image_url ? (
                                                      <img
                                                        alt={blog.title}
                                                        src={blog.cover_image_url}
                                                        style={{ height: 120, objectFit: "cover" }}
                                                      />
                                                    ) : undefined
                                                  }
                                                  actions={[
                                                    <Button
                                                      key="edit"
                                                      type="link"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleBlogEdit(blogId, sub.id);
                                                      }}
                                                      disabled={!blogId}
                                                    >
                                                      Edit
                                                    </Button>,
                                                    <Popconfirm
                                                      key="delete"
                                                      title="Delete blog"
                                                      onConfirm={(e) => {
                                                        e?.stopPropagation?.();
                                                        handleBlogDelete(blogId, sub.id);
                                                      }}
                                                      disabled={!blogId}
                                                    >
                                                      <Button
                                                        type="link"
                                                        danger
                                                        disabled={!blogId}
                                                        onClick={(e) => e.stopPropagation()}
                                                      >
                                                        Delete
                                                      </Button>
                                                    </Popconfirm>,
                                                  ]}
                                                >
                                                  <Card.Meta
                                                    title={blog.title}
                                                    description={
                                                      <div
                                                        style={{
                                                          whiteSpace: "nowrap",
                                                          overflow: "hidden",
                                                          textOverflow: "ellipsis",
                                                        }}
                                                      >
                                                        {blog.description || "-"}
                                                      </div>
                                                    }
                                                  />
                                                </Card>
                                              </List.Item>
                                            );
                                          }}
                                        />
                                      </Card>
                                    </List.Item>
                                  )
                                }
                              />
                            )}
                          </Space>
                        </Card>
                      );
                    })()
                  ) : (
                    <Empty description="Select a stage" />
                  )}
                </Flex>
              </Flex>
            )}
          </Card>
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
              { ...values, sub_guide_stages_id: blogEditing.sub_guide_stages_id },
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
          <ProFormText
            name="sub_guide_stages_id"
            label="Sub Guide Stage ID"
            disabled
            rules={[{ required: true, message: "Missing sub guide stage" }]}
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
        </ModalForm>

        <Modal
          open={!!blogViewing}
          title={blogViewing?.title || "Blog Detail"}
          onCancel={() => setBlogViewing(null)}
          footer={<Button onClick={() => setBlogViewing(null)}>Close</Button>}
          width={800}
          destroyOnClose
          confirmLoading={blogViewingLoading}
        >
          {blogViewing && (
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space align="center">
                {blogViewing.cover_image_url ? (
                  <Avatar shape="square" src={blogViewing.cover_image_url} size={64} />
                ) : null}
                <Space direction="vertical">
                  <span>{blogViewing.blog_tag_name || "-"}</span>
                  <Tag color={blogViewing.status === "published" ? "green" : "default"}>
                    {blogViewing.status}
                  </Tag>
                  <span>
                    Published:{" "}
                    {blogViewing.published_at
                      ? new Date(blogViewing.published_at).toLocaleString()
                      : "-"}
                  </span>
                </Space>
              </Space>
              <div style={{ border: "1px solid #f0f0f0", borderRadius: 8, padding: 12, maxHeight: 400, overflow: "auto" }}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: mdParser.render(blogViewing.content || ""),
                  }}
                />
              </div>
            </Space>
          )}
        </Modal>
      </Flex>
    </PageContainer>
  );
};

export default FarmingGuide;

