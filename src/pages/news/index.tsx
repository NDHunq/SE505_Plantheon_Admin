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


const mdParser = new MarkdownIt();

const StatusLabels: Record<NewsStatus, string> = {
  draft: "Bản Nháp",
  published: "Đã Xuất Bản",
};

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
      { label: "Bản Nháp", value: "draft" },
      { label: "Đã Xuất Bản", value: "published" },
    ],
    []
  );

  const tagOptions = useMemo(
    () => tags.map((tag) => ({ label: tag.name, value: tag.id })),
    [tags]
  );


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


  useEffect(() => {
    loadTags();
  }, []);


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
        error?.response?.data?.message || error?.message || "Không thể tải chi tiết";
      message.error(errMsg);
    } finally {
      setViewingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNews(id);
      message.success("Xóa tin tức thành công");
      actionRef.current?.reload();
    } catch (error: any) {
      const errMsg =
        error?.response?.data?.message || error?.message || "Không thể xóa tin tức";
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
        error?.response?.data?.message || error?.message || "Không thể tải các giai đoạn hướng dẫn"
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
        error?.response?.data?.message || error?.message || "Không thể tải chi tiết giai đoạn"
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
      message.success("Tạo giai đoạn hướng dẫn thành công");
      loadGuideStages(selectedPlant.id);
      return true;
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || error?.message || "Không thể tạo giai đoạn"
      );
      return false;
    }
  };

  const handleUpdateStage = async (id: string, values: any) => {
    try {
      const payload = cleanGuidePayload(values);
      await updateGuideStage(id, payload);
      message.success("Cập nhật giai đoạn hướng dẫn thành công");
      if (selectedPlant) loadGuideStages(selectedPlant.id);
      return true;
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || error?.message || "Không thể cập nhật giai đoạn"
      );
      return false;
    }
  };

  const handleDeleteStage = async (id: string) => {
    try {
      await deleteGuideStage(id);
      message.success("Xóa giai đoạn hướng dẫn thành công");
      if (selectedPlant) loadGuideStages(selectedPlant.id);
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || error?.message || "Không thể xóa giai đoạn"
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
      message.success("Tạo giai đoạn phụ thành công");
      loadStageDetail(guideStageId);
      return true;
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || error?.message || "Không thể tạo giai đoạn phụ"
      );
      return false;
    }
  };

  const handleUpdateSubStage = async (id: string, guideStageId: string, values: any) => {
    try {
      const payload = cleanGuidePayload(values);
      await updateSubGuideStage(id, payload);
      message.success("Cập nhật giai đoạn phụ thành công");
      loadStageDetail(guideStageId);
      return true;
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || error?.message || "Không thể cập nhật giai đoạn phụ"
      );
      return false;
    }
  };

  const handleDeleteSubStage = async (id: string, guideStageId: string) => {
    try {
      await deleteSubGuideStage(id);
      message.success("Xóa giai đoạn phụ thành công");
      loadStageDetail(guideStageId);
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || error?.message || "Không thể xóa giai đoạn phụ"
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
        message.success("Cập nhật bài viết thành công");
      } else {
        await createNews(payload);
        message.success("Tạo bài viết thành công");
      }
      setBlogEditing(null);
      setBlogContent("");
      // refresh stage detail
      const stageId = stageIdBySub(subGuideStageId);
      if (stageId) loadStageDetail(stageId);
      return true;
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || error?.message || "Không thể lưu bài viết"
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
        error?.response?.data?.message || error?.message || "Không thể tải chi tiết bài viết"
      );
    }
  };

  const handleBlogDelete = async (blogId: string, subGuideStageId: string) => {
    try {
      await deleteNews(blogId);
      message.success("Xóa bài viết thành công");
      const stageId = stageIdBySub(subGuideStageId);
      if (stageId) loadStageDetail(stageId);
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || error?.message || "Không thể xóa bài viết"
      );
    }
  };

  // Tag management functions
  const handleTagUpsert = async (values: any, id?: string) => {
    try {
      setTagSaving(true);
      if (id) {
        await updateNewsTag(id, values);
        message.success("Cập nhật thẻ thành công");
      } else {
        await createNewsTag(values);
        message.success("Tạo thẻ thành công");
      }
      loadTags();
      return true;
    } catch (error: any) {
      const errMsg =
        error?.response?.data?.message || error?.message || "Không thể lưu thẻ";
      message.error(errMsg);
      return false;
    } finally {
      setTagSaving(false);
    }
  };

  const handleTagDelete = async (id: string) => {
    try {
      await deleteNewsTag(id);
      message.success("Xóa thẻ thành công");
      loadTags();
    } catch (error: any) {
      const errMsg =
        error?.response?.data?.message || error?.message || "Không thể xóa thẻ";
      message.error(errMsg);
    }
  };

  const columns: ProColumns<News>[] = [
    {
      title: "Tiêu Đề",
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
      title: "Thẻ",
      dataIndex: "blog_tag_name",
      hideInSearch: true,
      render: (_, record) => record.blog_tag_name || "-",
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      valueType: "select",
      valueEnum: {
        draft: { text: "Bản Nháp", status: "Default" },
        published: { text: "Đã Xuất Bản", status: "Success" },
      },
      render: (_, record) => (
        <Tag color={statusColors[record.status]}>{StatusLabels[record.status] || record.status}</Tag>
      ),
    },
    {
      title: "Tác Giả",
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
      title: "Ngày Xuất Bản",
      dataIndex: "published_at",
      valueType: "dateTime",
      hideInSearch: true,
    },
    {
      title: "Ngày Tạo",
      dataIndex: "created_at",
      valueType: "dateTime",
      hideInSearch: true,
    },
    {
      title: "Ngày Cập Nhật",
      dataIndex: "updated_at",
      valueType: "dateTime",
      hideInSearch: true,
    },
    {
      title: "Hành Động",
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
          title="Xóa tin tức"
          description="Bạn có chắc chắn muốn xóa tin tức này?"
          onConfirm={() => handleDelete(record.id)}
          okText="Có"
          cancelText="Không"
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
        message.success("Cập nhật tin tức thành công");
      } else {
        await createNews(payload as any);
        message.success("Tạo tin tức thành công");
      }
      // Reload news list
      actionRef.current?.reload();
      return true;
    } catch (error: any) {
      const errMsg =
        error?.response?.data?.message || error?.message || "Không thể lưu tin tức";
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
                Quản Lý Tin Tức
              </span>
            ),
            children: (
              <ProTable<News>
        headerTitle="Danh sách Tin Tức"
        actionRef={actionRef}
        rowKey="id"
        search={{ 
          labelWidth: 120,
          searchText: 'Tìm kiếm',
          resetText: 'Đặt lại',
          collapseRender: (collapsed) => (collapsed ? 'Mở rộng' : 'Thu gọn'),
        }}
        toolBarRender={() => [
          <ModalForm
            key="create"
            title="Tạo Tin Tức"
            trigger={
              <Button type="primary" icon={<CheckCircleOutlined />}>
                Mới
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
                message.error("Vui lòng nhập nội dung");
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
              label="Tiêu Đề"
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
            />
            <ProFormText name="description" label="Mô Tả" />
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
                Nội Dung <span style={{ color: "#ff4d4f" }}>*</span>
              </label>
              <MdEditor
                value={createContent}
                style={{ height: "300px" }}
                renderHTML={(text) => mdParser.render(text)}
                onChange={({ text }) => setCreateContent(text)}
                placeholder="Nhập nội dung markdown tại đây..."
              />
            </div>
            <ProFormText name="cover_image_url" label="URL Ảnh Bìa" />
            <ProFormSelect
              name="blog_tag_id"
              label="Thẻ"
              options={tagOptions}
              placeholder="Chọn một thẻ"
            />
            <ProFormSelect
              name="status"
              label="Trạng Thái"
              options={statusOptions}
              placeholder="bản nháp/đã xuất bản"
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
              "Không thể tải tin tức";
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
                Quản Lý Thẻ
              </span>
            ),
            children: (
              <Card>
                <div style={{ marginBottom: 16 }}>
                  <ModalForm
                    title="Tạo Thẻ"
                    trigger={
                      <Button type="primary" icon={<PlusOutlined />}>
                        Thẻ Mới
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
                      label="Tên Thẻ"
                      rules={[{ required: true, message: "Vui lòng nhập tên thẻ" }]}
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
                          title="Chỉnh Sửa Thẻ"
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
                            label="Tên Thẻ"
                            rules={[{ required: true, message: "Vui lòng nhập tên thẻ" }]}
                          />
                        </ModalForm>,
                        <Popconfirm
                          key="delete"
                          title="Xóa thẻ"
                          description="Bạn có chắc chắn muốn xóa thẻ này?"
                          onConfirm={() => handleTagDelete(tag.id)}
                          okText="Có"
                          cancelText="Không"
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
        ]}
      />

      <ModalForm
        title="Chỉnh Sửa Tin Tức"
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
            message.error("Vui lòng nhập nội dung");
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
          label="Tiêu Đề"
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
        />
            <ProFormText name="description" label="Mô Tả" />
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
                Nội Dung <span style={{ color: "#ff4d4f" }}>*</span>
              </label>
              <MdEditor
                value={editContent}
                style={{ height: "300px" }}
                renderHTML={(text) => mdParser.render(text)}
                onChange={({ text }) => setEditContent(text)}
                placeholder="Nhập nội dung markdown tại đây..."
              />
            </div>
        <ProFormText name="cover_image_url" label="URL Ảnh Bìa" />
        <ProFormSelect
          name="blog_tag_id"
          label="Thẻ"
          options={tagOptions}
          placeholder="Chọn một thẻ"
        />
        <ProFormSelect
          name="status"
          label="Trạng Thái"
          options={statusOptions}
          placeholder="bản nháp/đã xuất bản"
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
                title: "Tiêu Đề",
                dataIndex: "title",
              },
              {
                title: "Trạng Thái",
                dataIndex: "status",
                render: (_, record) => (
                  <Tag color={statusColors[record.status]}>{StatusLabels[record.status] || record.status}</Tag>
                ),
              },
              {
                title: "Thẻ",
                dataIndex: "blog_tag_name",
                render: (_, record) => record.blog_tag_name || "-",
              },
              {
                title: "Tác Giả",
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
              { title: "Ngày Xuất Bản", dataIndex: "published_at", valueType: "dateTime" },
              { title: "Ngày Tạo", dataIndex: "created_at", valueType: "dateTime" },
              { title: "Ngày Cập Nhật", dataIndex: "updated_at", valueType: "dateTime" },
              {
                title: "Mô Tả",
                dataIndex: "description",
                render: (_, record) => record.description || "-",
              },
              {
                title: "Nội Dung",
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
