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
  Card,
  Drawer,
  List,
  message,
  Popconfirm,
  Space,
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

  // Load tags on component mount
  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const res = await getNewsTags();
      setTags(res.data.blog_tags || []);
    } catch (error: any) {
      console.error("Failed to load tags:", error);
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
      );
      if (id) {
        await updateNews(id, payload);
        message.success("News updated successfully");
      } else {
        await createNews(payload);
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
            let base = [];
            if (res.data?.news && Array.isArray(res.data.news)) {
              base = res.data.news;
            } else if (Array.isArray(res.data)) {
              base = res.data;
            }
            let items = base.slice(); // clone so we can filter/slice safely
            if (params.title) {
              items = items.filter((n) =>
                n.title.toLowerCase().includes(String(params.title).toLowerCase())
              );
            }
            if (params.status) {
              items = items.filter((n) => n.status === params.status);
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
