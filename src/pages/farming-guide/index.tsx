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
  { label: "Bản Nháp", value: "draft" },
  { label: "Đã Xuất Bản", value: "published" },
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
      message.error("Không thể tải danh sách cây trồng");
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
      message.error("Không thể tải các giai đoạn hướng dẫn");
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
      message.error("Không thể tải chi tiết giai đoạn");
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
      message.error(error?.response?.data?.message || error?.message || "Không thể tạo giai đoạn");
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
      message.error(error?.response?.data?.message || error?.message || "Không thể cập nhật giai đoạn");
      return false;
    }
  };

  const handleDeleteStage = async (id: string) => {
    try {
      await deleteGuideStage(id);
      message.success("Xóa giai đoạn hướng dẫn thành công");
      if (selectedPlant) loadGuideStages(selectedPlant.id);
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || "Không thể xóa giai đoạn");
    }
  };

  const handleCreateSubStage = async (guideStageId: string, values: any) => {
    try {
      const payload = cleanGuidePayload({ ...values, guide_stages_id: guideStageId });
      await createSubGuideStage(payload);
      message.success("Tạo giai đoạn phụ thành công");
      loadStageDetail(guideStageId);
      return true;
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || "Không thể tạo giai đoạn phụ");
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
      message.error(error?.response?.data?.message || error?.message || "Không thể cập nhật giai đoạn phụ");
      return false;
    }
  };

  const handleDeleteSubStage = async (id: string, guideStageId: string) => {
    try {
      await deleteSubGuideStage(id);
      message.success("Xóa giai đoạn phụ thành công");
      loadStageDetail(guideStageId);
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || "Không thể xóa giai đoạn phụ");
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
        message.success("Cập nhật bài viết thành công");
      } else {
        await createNews(payload);
        message.success("Tạo bài viết thành công");
      }
      setBlogEditing(null);
      setBlogContent("");
      const stageId = stageIdBySub(subGuideStageId);
      if (stageId) loadStageDetail(stageId);
      return true;
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || "Không thể lưu bài viết");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleBlogEdit = async (blogId?: string, subGuideStageId?: string) => {
    if (!blogId) {
      message.error("Thiếu ID bài viết");
      return;
    }
    try {
      const detail = await getNewsDetail(blogId);
      setBlogEditing({ ...detail.data, sub_guide_stages_id: subGuideStageId });
      setBlogContent(detail.data.content || "");
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || "Không thể tải chi tiết bài viết");
    }
  };

  const handleBlogDelete = async (blogId?: string, subGuideStageId?: string) => {
    if (!blogId) {
      message.error("Thiếu ID bài viết");
      return;
    }
    try {
      await deleteNews(blogId);
      message.success("Xóa bài viết thành công");
      const stageId = stageIdBySub(subGuideStageId);
      if (stageId) loadStageDetail(stageId);
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || "Không thể xóa bài viết");
    }
  };

  const handleBlogView = async (blogId?: string, subGuideStageId?: string) => {
    if (!blogId) {
      message.error("Thiếu ID bài viết");
      return;
    }
    try {
      setBlogViewingLoading(true);
      const detail = await getNewsDetail(blogId);
      setBlogViewing({ ...detail.data, sub_guide_stages_id: subGuideStageId });
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || "Không thể tải chi tiết bài viết");
    } finally {
      setBlogViewingLoading(false);
    }
  };

  return (
    <PageContainer
      header={{
        title: "Mẹo Canh Tác",
        subTitle: "Quản lý các giai đoạn hướng dẫn, giai đoạn phụ và bài viết cho từng cây trồng",
        avatar: { icon: <SettingOutlined /> },
      }}
    >
      <Flex vertical gap={16}>
        {!selectedPlant ? (
          <Card
            title="Cây Trồng"
            extra={
              <Space>
                <Input.Search
                  allowClear
                  placeholder="Tìm kiếm cây trồng"
                  onChange={(e) => setPlantSearch(e.target.value)}
                  style={{ width: 220 }}
                />
                <Button loading={plantsLoading} onClick={loadPlants}>
                  Tải Lại
                </Button>
              </Space>
            }
            bodyStyle={{ padding: 12 }}
          >
            <List<Plant>
              grid={{ gutter: 24, column: 3 }}
              loading={plantsLoading}
              dataSource={filteredPlants}
              locale={{ emptyText: <Empty description="Không có cây trồng" /> }}
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
                        <CheckCircleOutlined /> Hướng Dẫn
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
                          {plant.description || "Không có mô tả"}
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
            title={`Mẹo canh tác - ${selectedPlant.name}`}
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
                  Quay Lại Danh Sách Cây
                </Button>
                <ModalForm
                  title="Tạo Giai Đoạn"
                  trigger={<Button type="primary" icon={<PlusOutlined />}>Thêm Giai Đoạn</Button>}
                  submitter={{ submitButtonProps: { loading: stagesLoading } }}
                  onFinish={(values) => handleCreateStage(values)}
                >
                  <ProFormText
                    name="stage_title"
                    label="Tiêu Đề Giai Đoạn"
                    rules={[{ required: true, message: "Vui lòng nhập tiêu đề giai đoạn" }]}
                  />
                  <ProFormText name="description" label="Mô Tả" />
                  <ProFormText name="image_url" label="URL Hình Ảnh" />
                  <ProFormDigit name="start_day_offset" label="Ngày Bắt Đầu" />
                  <ProFormDigit name="end_day_offset" label="Ngày Kết Thúc" />
                </ModalForm>
              </Space>
            }
            bodyStyle={{ padding: 16 }}
          >
            {stagesLoading ? (
              <Spin />
            ) : guideStages.length === 0 ? (
              <Empty description="Chưa có giai đoạn hướng dẫn" />
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
                      subTitle: `Ngày ${stage.start_day_offset ?? 0} - ${stage.end_day_offset ?? "?"}`,
                      description: stage.description,
                    }))}
                  />
                  <div style={{ marginTop: 12 }}>
                    <ModalForm
                      title="Tạo Giai Đoạn"
                      trigger={
                        <Button block type="dashed" icon={<PlusOutlined />}>
                          Thêm Giai Đoạn
                        </Button>
                      }
                      submitter={{ submitButtonProps: { loading: stagesLoading } }}
                      onFinish={(values) => handleCreateStage(values)}
                    >
                      <ProFormText
                        name="stage_title"
                        label="Tiêu Đề Giai Đoạn"
                        rules={[{ required: true, message: "Vui lòng nhập tiêu đề giai đoạn" }]}
                      />
                      <ProFormText name="description" label="Mô Tả" />
                      <ProFormText name="image_url" label="URL Hình Ảnh" />
                      <ProFormDigit name="start_day_offset" label="Ngày Bắt Đầu" />
                      <ProFormDigit name="end_day_offset" label="Ngày Kết Thúc" />
                    </ModalForm>
                  </div>
                </Card>

                <Flex vertical style={{ flex: 1 }} gap={12}>
                  {selectedStageId ? (
                    (() => {
                      const stage = guideStages.find((s) => s.id === selectedStageId);
                      if (!stage) return <Empty description="Chọn một giai đoạn" />;
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
                                  Ngày {stage.start_day_offset ?? 0} - {stage.end_day_offset ?? "?"}
                                </span>
                              </Space>
                            </Space>
                          }
                          extra={
                            <Space>
                              <ModalForm
                                title="Chỉnh Sửa Giai Đoạn"
                                trigger={<Button type="text" size="small" icon={<EditOutlined />} />}
                                initialValues={stage}
                                submitter={{ submitButtonProps: { loading: stagesLoading } }}
                                onFinish={(values) => handleUpdateStage(stage.id, values)}
                              >
                                <ProFormText
                                  name="stage_title"
                                  label="Tiêu Đề Giai Đoạn"
                                  rules={[{ required: true, message: "Vui lòng nhập tiêu đề giai đoạn" }]}
                                />
                                <ProFormText name="description" label="Mô Tả" />
                                <ProFormText name="image_url" label="URL Hình Ảnh" />
                                <ProFormDigit name="start_day_offset" label="Ngày Bắt Đầu" />
                                <ProFormDigit name="end_day_offset" label="Ngày Kết Thúc" />
                              </ModalForm>
                              <Popconfirm
                                title="Xóa giai đoạn"
                                description="Bạn có chắc chắn muốn xóa giai đoạn này?"
                                onConfirm={() => handleDeleteStage(stage.id)}
                                okText="Có"
                                cancelText="Không"
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
                              <Empty description="Không có giai đoạn phụ" />
                            ) : (
                              <List
                                grid={{ gutter: 16, column: 2 }}
                                dataSource={[...subs.sort((a, b) => (a.start_day_offset ?? 0) - (b.start_day_offset ?? 0)), { __add: true }]}
                                renderItem={(sub: any, idx: number) =>
                                  sub.__add ? (
                                    <List.Item key="add-sub-stage">
                                      <ModalForm
                                        title="Thêm Giai Đoạn Phụ"
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
                                              <span>Thêm Giai Đoạn Phụ</span>
                                            </Space>
                                          </Card>
                                        }
                                        submitter={{ submitButtonProps: { loading: stagesLoading } }}
                                        onFinish={(values) => handleCreateSubStage(stage.id, values)}
                                      >
                                        <ProFormText
                                          name="title"
                                          label="Tiêu Đề"
                                          rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
                                        />
                                        <ProFormDigit name="start_day_offset" label="Ngày Bắt Đầu" />
                                        <ProFormDigit name="end_day_offset" label="Ngày Kết Thúc" />
                                      </ModalForm>
                                    </List.Item>
                                  ) : (
                                    <List.Item key={sub.id}>
                                      <Card
                                        size="small"
                                        style={{ minHeight: 220, display: "flex", flexDirection: "column" }}
                                        title={
                                          <Space direction="vertical" size={4} style={{ width: '100%', paddingTop: 6 }}>
                                            <Space align="center">
                                              <Tag color="purple">#{idx + 1}</Tag>
                                              <strong>{sub.title}</strong>
                                            </Space>
                                            <Space wrap style={{ paddingBottom: 6 }}>
                                              <Tag color="blue">
                                                Ngày {sub.start_day_offset ?? 0} - {sub.end_day_offset ?? "?"}
                                              </Tag>
                                              <Tag color="geekblue">
                                                {sub.blogs?.length || 0} Bài Viết
                                              </Tag>
                                            </Space>
                                          </Space>
                                        }
                                        extra={
                                          <Space>
                                            <ModalForm
                                              title="Chỉnh Sửa Giai Đoạn Phụ"
                                              trigger={<Button type="text" size="small" icon={<EditOutlined />} />}
                                              initialValues={sub}
                                              submitter={{ submitButtonProps: { loading: stagesLoading } }}
                                              onFinish={(values) => handleUpdateSubStage(sub.id, stage.id, values)}
                                            >
                                              <ProFormText
                                                name="title"
                                                label="Tiêu Đề"
                                                rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
                                              />
                                              <ProFormDigit name="start_day_offset" label="Ngày Bắt Đầu" />
                                              <ProFormDigit name="end_day_offset" label="Ngày Kết Thúc" />
                                            </ModalForm>
                                            <Popconfirm
                                              title="Xóa giai đoạn phụ"
                                              description="Bạn có chắc chắn muốn xóa giai đoạn phụ này?"
                                              onConfirm={() => handleDeleteSubStage(sub.id, stage.id)}
                                              okText="Có"
                                              cancelText="Không"
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
                                            Thêm Bài Viết
                                          </Button>,
                                        ]}
                                      >
                                        <List
                                          dataSource={sub.blogs || []}
                                          locale={{ emptyText: "Không có bài viết" }}
                                          renderItem={(blog: any) => {
                                            const blogId = getBlogId(blog);
                                            return (
                                              <List.Item
                                                actions={[
                                                  <Space key="actions" direction="vertical" size={4}>
                                                    <Button
                                                      type="text"
                                                      size="small"
                                                      icon={<EditOutlined />}
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleBlogEdit(blogId, sub.id);
                                                      }}
                                                      disabled={!blogId}
                                                    />
                                                    <Popconfirm
                                                      title="Xóa bài viết"
                                                      onConfirm={(e) => {
                                                        e?.stopPropagation?.();
                                                        handleBlogDelete(blogId, sub.id);
                                                      }}
                                                      disabled={!blogId}
                                                    >
                                                      <Button
                                                        type="text"
                                                        size="small"
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        disabled={!blogId}
                                                        onClick={(e) => e.stopPropagation()}
                                                      />
                                                    </Popconfirm>
                                                  </Space>,
                                                ]}
                                              >
                                                <List.Item.Meta
                                                  avatar={
                                                    blog.cover_image_url ? (
                                                      <img
                                                        alt={blog.title}
                                                        src={blog.cover_image_url}
                                                        style={{ 
                                                          width: 60, 
                                                          height: 60, 
                                                          objectFit: "cover",
                                                          borderRadius: 4
                                                        }}
                                                      />
                                                    ) : (
                                                      <div
                                                        style={{
                                                          width: 50,
                                                          height: 50,
                                                          backgroundColor: "#f0f0f0",
                                                          display: "flex",
                                                          alignItems: "center",
                                                          justifyContent: "center",
                                                          borderRadius: 4,
                                                          fontSize: 10,
                                                        }}
                                                      >
                                                        N/A
                                                      </div>
                                                    )
                                                  }
                                                  title={
                                                    <a onClick={() => handleBlogView(blogId, sub.id)}>
                                                      {blog.title}
                                                    </a>
                                                  }
                                                  description={blog.description || "-"}
                                                />
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
                    <Empty description="Chọn một giai đoạn" />
                  )}
                </Flex>
              </Flex>
            )}
          </Card>
        )}

        <ModalForm
          title={blogEditing?.id ? "Chỉnh Sửa Bài Viết" : "Tạo Bài Viết"}
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
              message.error("Thiếu giai đoạn phụ hướng dẫn");
              return false;
            }
            if (!blogContent.trim()) {
              message.error("Vui lòng nhập nội dung");
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
            label="Tiêu Đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          />
          <ProFormText
            name="sub_guide_stages_id"
            label="ID Giai Đoạn Phụ"
            disabled
            rules={[{ required: true, message: "Thiếu giai đoạn phụ hướng dẫn" }]}
          />
          <ProFormText name="description" label="Mô Tả" />
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
              Nội Dung <span style={{ color: "#ff4d4f" }}>*</span>
            </label>
            <MdEditor
              value={blogContent}
              style={{ height: "300px" }}
              renderHTML={(text) => mdParser.render(text)}
              onChange={({ text }) => setBlogContent(text)}
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
        </ModalForm>

        <Modal
          open={!!blogViewing}
          title={blogViewing?.title || "Chi Tiết Bài Viết"}
          onCancel={() => setBlogViewing(null)}
          footer={<Button onClick={() => setBlogViewing(null)}>Đóng</Button>}
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
                    Xuất Bản:{" "}
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

