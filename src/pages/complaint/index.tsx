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
      messageApi.success("Xóa khiếu nại thành công");
      actionRef.current?.reload();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to delete complaint";
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
      title: "Target Type",
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
      title: "Category",
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
      title: "Status",
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
      title: "Content",
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
      title: "Created At",
      dataIndex: "created_at",
      valueType: "dateTime",
      hideInSearch: true,
      sorter: true,
      width: 180,
    },
    {
      title: "Actions",
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
          title="Delete Complaint"
          description="Are you sure you want to delete this complaint?"
          onConfirm={() => handleDelete(record.id)}
          okText="Yes"
          cancelText="No"
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
        headerTitle="Complaints List"
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
              `Failed to fetch complaints: ${
                error?.response?.status || "Unknown error"
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
        title="Complaint Details"
      >
        {currentRow && (
          <ProDescriptions<Complaint>
            column={1}
            dataSource={currentRow}
            columns={[
              {
                title: "Target Type",
                dataIndex: "target_type",
                render: (_, record) => (
                  <Tag color={record.target_type === "POST" ? "blue" : "cyan"}>
                    {record.target_type === "POST" ? "Bài viết" : "Bình luận"}
                  </Tag>
                ),
              },
              {
                title: "Target ID",
                dataIndex: "target_id",
                copyable: true,
              },
              {
                title: "Category",
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
                title: "Status",
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
                title: "Complaint Content",
                dataIndex: "content",
                valueType: "text",
              },
              {
                title: "Admin Notes",
                dataIndex: "admin_notes",
                valueType: "text",
                render: (_, record) => record.admin_notes || "-",
              },
              {
                title: "Reporter ID",
                dataIndex: "user_id",
                copyable: true,
              },
              {
                title: "Created At",
                dataIndex: "created_at",
                valueType: "dateTime",
              },
              {
                title: "Updated At",
                dataIndex: "updated_at",
                valueType: "dateTime",
              },
              {
                title: "Resolved At",
                dataIndex: "resolved_at",
                valueType: "dateTime",
                render: (_, record) => record.resolved_at || "-",
              },
              {
                title: "Resolved By",
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
                  Update Status
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
                <Button icon={<FileTextOutlined />}>View Target Content</Button>
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
