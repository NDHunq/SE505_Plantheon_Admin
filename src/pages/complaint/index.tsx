import {
  Complaint,
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUSES,
  deleteComplaint,
  getComplaints,
} from "@/services/complaint";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import {
  PageContainer,
  ProDescriptions,
  ProTable,
} from "@ant-design/pro-components";
import { Badge, Button, Drawer, message, Popconfirm, Space, Tag } from "antd";
import React, { useRef, useState } from "react";
import UpdateComplaintStatusModal from "./components/UpdateComplaintStatusModal";
import ViewTargetContentModal from "./components/ViewTargetContentModal";

const ComplaintManagement: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<Complaint>();
  const [messageApi, contextHolder] = message.useMessage();

  const handleDelete = async (id: string) => {
    try {
      await deleteComplaint(id);
      messageApi.success("Xóa báo cáo thành công");
      actionRef.current?.reload();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.error ||
        error?.message ||
        "Không thể xóa báo cáo";
      messageApi.error(errorMsg);
    }
  };

  const getCategoryColor = (category: string) => {
    const cat = COMPLAINT_CATEGORIES.find((c) => c.value === category);
    return cat?.color || "default";
  };

  const getStatusBadge = (status: string) => {
    const stat = COMPLAINT_STATUSES.find((s) => s.value === status);
    return stat?.color || "default";
  };

  const columns: ProColumns<Complaint>[] = [
    {
      title: "Loại Đối Tượng",
      dataIndex: "target_type",
      valueType: "select",
      valueEnum: {
        POST: { text: "Bài viết" },
        COMMENT: { text: "Bình luận" },
      },
      render: (_, record) => (
        <Tag color={record.target_type === "POST" ? "blue" : "cyan"}>
          {record.target_type === "POST" ? "Bài viết" : "Bình luận"}
        </Tag>
      ),
      width: 120,
    },
    {
      title: "Danh Mục",
      dataIndex: "category",
      valueType: "select",
      valueEnum: COMPLAINT_CATEGORIES.reduce(
        (acc, cat) => ({
          ...acc,
          [cat.value]: { text: cat.label },
        }),
        {}
      ),
      render: (_, record) => (
        <Tag color={getCategoryColor(record.category)}>
          {COMPLAINT_CATEGORIES.find((c) => c.value === record.category)
            ?.label || record.category}
        </Tag>
      ),
      width: 180,
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      valueType: "select",
      valueEnum: {
        PENDING: { text: "Chờ xử lý" },
        REVIEWED: { text: "Đang xem xét" },
        RESOLVED: { text: "Đã giải quyết" },
        REJECTED: { text: "Từ chối" },
      },
      render: (_, record) => {
        const statusConfig = COMPLAINT_STATUSES.find(
          (s) => s.value === record.status
        );
        return (
          <Badge
            status={getStatusBadge(record.status) as any}
            text={statusConfig?.label || record.status}
          />
        );
      },
      width: 140,
    },
    {
      title: "Nội Dung",
      dataIndex: "content",
      hideInSearch: true,
      ellipsis: true,
      render: (_, record) => {
        if (!record.content) return "-";
        const content = record.content;
        return content.length > 50 ? `${content.substring(0, 50)}...` : content;
      },
    },
    {
      title: "Ngày Tạo",
      dataIndex: "created_at",
      valueType: "dateTime",
      hideInSearch: true,
      sorter: true,
      width: 180,
    },
    {
      title: "Hành Động",
      dataIndex: "option",
      valueType: "option",
      width: 180,
      render: (_, record) => [
        <Button
          key="view"
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            setCurrentRow(record);
            setShowDetail(true);
          }}
        />,
        <UpdateComplaintStatusModal
          key="edit"
          complaint={record}
          trigger={<Button type="text" size="small" icon={<EditOutlined />} />}
          onSuccess={() => actionRef.current?.reload()}
        />,
        <ViewTargetContentModal
          key="content"
          complaint={record}
          trigger={
            <Button type="text" size="small" icon={<FileTextOutlined />} />
          }
          onSuccess={() => actionRef.current?.reload()}
        />,
        <Popconfirm
          key="delete"
          title="Xóa Báo Cáo"
          description="Bạn có chắc chắn muốn xóa báo cáo này?"
          onConfirm={() => handleDelete(record.id)}
          okText="Có"
          cancelText="Không"
        >
          <Button type="text" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      {contextHolder}
      <ProTable<Complaint>
        headerTitle="Danh Sách Báo Cáo"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        request={async (params, sort) => {
          console.log(
            "🔄 [Complaint Page] Fetching complaints with params:",
            params
          );
          try {
            const response = await getComplaints({
              page: params.current || 1,
              limit: params.pageSize || 10,
              status: params.status,
              target_type: params.target_type,
            });

            console.log("✅ [Complaint Page] Got response:", response);
            return {
              data: response.data.complaints,
              success: true,
              total: response.data.total,
            };
          } catch (error: any) {
            console.error(
              "❌ [Complaint Page] Error fetching complaints:",
              error
            );
            console.error(
              "❌ [Complaint Page] Error response:",
              error?.response
            );
            console.error(
              "❌ [Complaint Page] Error status:",
              error?.response?.status
            );
            console.error(
              "❌ [Complaint Page] Error data:",
              error?.response?.data
            );
            messageApi.error(
              `Không thể tải danh sách báo cáo: ${
                error?.response?.status || "Lỗi không xác định"
              }`
            );
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        columns={columns}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
      />

      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={true}
        title="Chi Tiết Báo Cáo"
      >
        {currentRow && (
          <ProDescriptions<Complaint>
            column={1}
            dataSource={currentRow}
            columns={[
              {
                title: "Loại Đối Tượng",
                dataIndex: "target_type",
                render: (_, record) => (
                  <Tag color={record.target_type === "POST" ? "blue" : "cyan"}>
                    {record.target_type === "POST" ? "Bài viết" : "Bình luận"}
                  </Tag>
                ),
              },
              {
                title: "ID Đối Tượng",
                dataIndex: "target_id",
                copyable: true,
              },
              {
                title: "Danh Mục",
                dataIndex: "category",
                render: (_, record) => (
                  <Tag color={getCategoryColor(record.category)}>
                    {COMPLAINT_CATEGORIES.find(
                      (c) => c.value === record.category
                    )?.label || record.category}
                  </Tag>
                ),
              },
              {
                title: "Trạng Thái",
                dataIndex: "status",
                render: (_, record) => {
                  const statusConfig = COMPLAINT_STATUSES.find(
                    (s) => s.value === record.status
                  );
                  return (
                    <Badge
                      status={getStatusBadge(record.status) as any}
                      text={statusConfig?.label || record.status}
                    />
                  );
                },
              },
              {
                title: "Nội Dung Báo Cáo",
                dataIndex: "content",
                valueType: "text",
              },
              {
                title: "Ghi Chú Của Quản Trị Viên",
                dataIndex: "admin_notes",
                valueType: "text",
                render: (_, record) => record.admin_notes || "-",
              },
              {
                title: "ID Người Báo Cáo",
                dataIndex: "user_id",
                copyable: true,
              },
              {
                title: "Ngày Tạo",
                dataIndex: "created_at",
                valueType: "dateTime",
              },
              {
                title: "Ngày Cập Nhật",
                dataIndex: "updated_at",
                valueType: "dateTime",
              },
              {
                title: "Ngày Giải Quyết",
                dataIndex: "resolved_at",
                valueType: "dateTime",
                render: (_, record) => record.resolved_at || "-",
              },
              {
                title: "Người Giải Quyết",
                dataIndex: "resolved_by",
                copyable: true,
                render: (_, record) => record.resolved_by || "-",
              },
            ]}
          />
        )}

        {currentRow && (
          <Space style={{ marginTop: 16 }}>
            <UpdateComplaintStatusModal
              complaint={currentRow}
              trigger={
                <Button type="primary" icon={<EditOutlined />}>
                  Cập Nhật Trạng Thái
                </Button>
              }
              onSuccess={() => {
                actionRef.current?.reload();
                setShowDetail(false);
              }}
            />
            <ViewTargetContentModal
              complaint={currentRow}
              trigger={
                <Button icon={<FileTextOutlined />}>Xem Nội Dung Đối Tượng</Button>
              }
              onSuccess={() => actionRef.current?.reload()}
            />
          </Space>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default ComplaintManagement;
