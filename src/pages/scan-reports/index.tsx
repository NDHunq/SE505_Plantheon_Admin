import {
  Complaint,
  COMPLAINT_STATUSES,
  deleteComplaint,
  exportTrainingData,
  getComplaintsCount,
  getComplaints,
} from "@/services/complaint";
import {
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import {
  PageContainer,
  ProDescriptions,
  ProTable,
  StatisticCard,
} from "@ant-design/pro-components";
import {
  Badge,
  Button,
  Drawer,
  Image,
  message,
  Popconfirm,
  Space,
  Tag,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import VerifyComplaintModal from "./components/VerifyComplaintModal";

const { Statistic } = StatisticCard;

const ScanReportManagement: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<Complaint>();
  const [messageApi, contextHolder] = message.useMessage();
  const [stats, setStats] = useState({
    unverified: 0,
    verified: 0,
    pending: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [unverifiedRes, verifiedRes, pendingRes] = await Promise.all([
        getComplaintsCount({ is_verified: false, target_type: "SCAN" }),
        getComplaintsCount({ is_verified: true, target_type: "SCAN" }),
        getComplaintsCount({ status: "PENDING", target_type: "SCAN" }),
      ]);

      setStats({
        unverified: unverifiedRes.data.count,
        verified: verifiedRes.data.count,
        pending: pendingRes.data.count,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteComplaint(id);
      messageApi.success("Xóa scan report thành công");
      actionRef.current?.reload();
      fetchStats();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.error ||
        error?.message ||
        "Xóa scan report thất bại";
      messageApi.error(errorMsg);
    }
  };

  const handleExportTrainingData = async () => {
    try {
      messageApi.loading("Đang export training data...", 0);
      const response = await exportTrainingData();

      // Convert to JSON and download
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `training_data_${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      messageApi.destroy();
      messageApi.success(`Đã export ${response.count} records thành công`);
    } catch (error: any) {
      messageApi.destroy();
      const errorMsg =
        error?.response?.data?.error || error?.message || "Export thất bại";
      messageApi.error(errorMsg);
    }
  };

  const getStatusBadge = (status: string) => {
    const stat = COMPLAINT_STATUSES.find((s) => s.value === status);
    return stat?.color || "default";
  };

  const columns: ProColumns<Complaint>[] = [
    {
      title: "Ảnh scan",
      dataIndex: "image_url",
      hideInSearch: true,
      width: 100,
      render: (_, record) => {
        if (!record.image_url) return "-";
        return (
          <Image
            src={record.image_url}
            alt="Scan"
            width={60}
            height={60}
            style={{ objectFit: "cover", borderRadius: 4 }}
          />
        );
      },
    },
    {
      title: "AI Prediction",
      dataIndex: "predicted_disease_id",
      hideInSearch: true,
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.predicted_disease?.name || record.predicted_disease_id || "-"}
          </div>
          {record.predicted_disease && (
            <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
              {record.predicted_disease.plant_name} - {record.predicted_disease.type}
            </div>
          )}
          {record.confidence_score && (
            <Tag
              color={record.confidence_score > 0.7 ? "green" : "orange"}
              style={{ marginTop: 4 }}
            >
              {(record.confidence_score * 100).toFixed(1)}%
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "User Suggestion",
      dataIndex: "user_suggested_disease_id",
      hideInSearch: true,
      width: 200,
      render: (_, record) => {
        if (!record.user_suggested_disease && !record.user_suggested_disease_id) {
          return "-";
        }
        return (
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.user_suggested_disease?.name || record.user_suggested_disease_id}
            </div>
            {record.user_suggested_disease && (
              <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                {record.user_suggested_disease.plant_name} - {record.user_suggested_disease.type}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Verified Disease",
      dataIndex: "verified_disease_id",
      hideInSearch: true,
      width: 200,
      render: (_, record) => {
        if (!record.verified_disease && !record.verified_disease_id) {
          return "-";
        }
        return (
          <div>
            <Tag color="green" icon={<SafetyCertificateOutlined />}>
              {record.verified_disease?.name || record.verified_disease_id}
            </Tag>
            {record.verified_disease && (
              <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                {record.verified_disease.plant_name} - {record.verified_disease.type}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
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
      title: "Đã verify",
      dataIndex: "is_verified",
      valueType: "select",
      valueEnum: {
        true: { text: "Đã verify" },
        false: { text: "Chưa verify" },
      },
      render: (_, record) => (
        <Tag color={record.is_verified ? "green" : "orange"}>
          {record.is_verified ? "Đã verify" : "Chưa verify"}
        </Tag>
      ),
      width: 120,
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      valueType: "dateTime",
      hideInSearch: true,
      sorter: true,
      width: 180,
    },
    {
      title: "Thao tác",
      dataIndex: "option",
      valueType: "option",
      width: 150,
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
        !record.is_verified && (
          <VerifyComplaintModal
            key="verify"
            complaint={record}
            trigger={
              <Button
                type="text"
                size="small"
                icon={<SafetyCertificateOutlined />}
              />
            }
            onSuccess={() => {
              actionRef.current?.reload();
              fetchStats();
            }}
          />
        ),
        <Popconfirm
          key="delete"
          title="Xóa scan report"
          description="Bạn có chắc chắn muốn xóa scan report này?"
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

      <StatisticCard.Group direction="row" style={{ marginBottom: 16 }}>
        <StatisticCard
          statistic={{
            title: "Chưa verify",
            value: stats.unverified,
            status: "default",
          }}
        />
        <StatisticCard
          statistic={{
            title: "Đã verify",
            value: stats.verified,
            status: "success",
          }}
        />
        <StatisticCard
          statistic={{
            title: "Chờ xử lý",
            value: stats.pending,
            status: "processing",
          }}
        />
      </StatisticCard.Group>

      <ProTable<Complaint>
        headerTitle="Danh sách Scan Reports"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            key="export"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExportTrainingData}
          >
            Export Training Data
          </Button>,
        ]}
        request={async (params, sort) => {
          console.log(
            "🔄 [Scan Report Page] Fetching scan reports with params:",
            params
          );
          try {
            const response = await getComplaints({
              page: params.current || 1,
              limit: params.pageSize || 10,
              target_type: "SCAN",
              status: params.status,
              is_verified: params.is_verified,
            });

            console.log("✅ [Scan Report Page] Got response:", response);
            return {
              data: response.data.complaints,
              success: true,
              total: response.data.total,
            };
          } catch (error: any) {
            console.error(
              "❌ [Scan Report Page] Error fetching scan reports:",
              error
            );
            messageApi.error(
              `Tải danh sách scan reports thất bại: ${
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
        width={700}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={true}
        title="Chi tiết Scan Report"
      >
        {currentRow && (
          <>
            <ProDescriptions<Complaint>
              column={1}
              dataSource={currentRow}
              columns={[
                {
                  title: "Ảnh scan",
                  dataIndex: "image_url",
                  render: (_, record) => {
                    if (!record.image_url) return "-";
                    return (
                      <Image
                        src={record.image_url}
                        alt="Scan"
                        style={{ maxWidth: "100%", maxHeight: 400 }}
                      />
                    );
                  },
                },
                {
                  title: "AI Prediction",
                  dataIndex: "predicted_disease_id",
                  render: (_, record) => (
                    <div>
                      <div style={{ fontWeight: 500, marginBottom: 4 }}>
                        {record.predicted_disease?.name || record.predicted_disease_id || "-"}
                      </div>
                      {record.predicted_disease && (
                        <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
                          {record.predicted_disease.plant_name} - {record.predicted_disease.type}
                        </div>
                      )}
                      {record.confidence_score && (
                        <Tag
                          color={
                            record.confidence_score > 0.7 ? "green" : "orange"
                          }
                        >
                          Confidence: {(record.confidence_score * 100).toFixed(1)}%
                        </Tag>
                      )}
                    </div>
                  ),
                },
                {
                  title: "User Suggestion",
                  dataIndex: "user_suggested_disease_id",
                  render: (_, record) => {
                    if (!record.user_suggested_disease && !record.user_suggested_disease_id) {
                      return "-";
                    }
                    return (
                      <div>
                        <div style={{ fontWeight: 500 }}>
                          {record.user_suggested_disease?.name || record.user_suggested_disease_id}
                        </div>
                        {record.user_suggested_disease && (
                          <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                            {record.user_suggested_disease.plant_name} - {record.user_suggested_disease.type}
                          </div>
                        )}
                      </div>
                    );
                  },
                },
                {
                  title: "Verified Disease (Ground Truth)",
                  dataIndex: "verified_disease_id",
                  render: (_, record) => {
                    if (!record.verified_disease && !record.verified_disease_id) {
                      return "-";
                    }
                    return (
                      <div>
                        <Tag color="green" icon={<SafetyCertificateOutlined />}>
                          {record.verified_disease?.name || record.verified_disease_id}
                        </Tag>
                        {record.verified_disease && (
                          <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                            {record.verified_disease.plant_name} - {record.verified_disease.type}
                          </div>
                        )}
                      </div>
                    );
                  },
                },
                {
                  title: "Trạng thái verify",
                  dataIndex: "is_verified",
                  render: (_, record) => (
                    <Tag color={record.is_verified ? "green" : "orange"}>
                      {record.is_verified ? "Đã verify" : "Chưa verify"}
                    </Tag>
                  ),
                },
                {
                  title: "Trạng thái",
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
                  title: "Nội dung complaint",
                  dataIndex: "content",
                  valueType: "text",
                  render: (_, record) => record.content || "-",
                },
                {
                  title: "Ghi chú Admin",
                  dataIndex: "admin_notes",
                  valueType: "text",
                  render: (_, record) => record.admin_notes || "-",
                },
                {
                  title: "Verified by",
                  dataIndex: "verified_by",
                  copyable: true,
                  render: (_, record) => record.verified_by || "-",
                },
                {
                  title: "Verified at",
                  dataIndex: "verified_at",
                  valueType: "dateTime",
                  render: (_, record) => record.verified_at || "-",
                },
                {
                  title: "Reporter ID",
                  dataIndex: "user_id",
                  copyable: true,
                },
                {
                  title: "Ngày tạo",
                  dataIndex: "created_at",
                  valueType: "dateTime",
                },
                {
                  title: "Ngày cập nhật",
                  dataIndex: "updated_at",
                  valueType: "dateTime",
                },
              ]}
            />

            {!currentRow.is_verified && (
              <div style={{ marginTop: 16 }}>
                <VerifyComplaintModal
                  complaint={currentRow}
                  trigger={
                    <Button
                      type="primary"
                      icon={<SafetyCertificateOutlined />}
                      block
                    >
                      Xác minh Scan Report
                    </Button>
                  }
                  onSuccess={() => {
                    actionRef.current?.reload();
                    setShowDetail(false);
                    fetchStats();
                  }}
                />
              </div>
            )}
          </>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default ScanReportManagement;
