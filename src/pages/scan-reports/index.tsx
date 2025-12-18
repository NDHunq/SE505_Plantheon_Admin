import {
  Complaint,
  deleteComplaint,
  exportTrainingData,
  getComplaintsCount,
  getComplaints,
} from "@/services/complaint";
import {
  getComplaintTrends,
  getOverallStats,
  getProblematicDiseases,
  getTopContributors,
} from "@/services/analytics";
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
  Button,
  Card,
  Col,
  Drawer,
  Image,
  message,
  Popconfirm,
  Row,
  Segmented,
  Space,
  Table,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useEffect, useRef, useState } from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
  });

  // Analytics state
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [overallStats, setOverallStats] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [trendsDays, setTrendsDays] = useState<number>(30);
  const [problematicDiseases, setProblematicDiseases] = useState<any[]>([]);
  const [topContributors, setTopContributors] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [unverifiedRes, verifiedRes] = await Promise.all([
        getComplaintsCount({ is_verified: false, target_type: "SCAN" }),
        getComplaintsCount({ is_verified: true, target_type: "SCAN" }),
      ]);

      setStats({
        unverified: unverifiedRes.data.count,
        verified: verifiedRes.data.count,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  // Analytics useEffects
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  useEffect(() => {
    fetchTrends();
  }, [trendsDays]);

  const fetchAnalyticsData = async () => {
    setAnalyticsLoading(true);
    try {
      await Promise.all([
        fetchOverallStats(),
        fetchTrends(),
        fetchProblematicDiseases(),
        fetchTopContributors(),
      ]);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchOverallStats = async () => {
    try {
      const response = await getOverallStats();
      setOverallStats(response.data);
    } catch (error) {
      console.error("Failed to fetch overall stats:", error);
    }
  };

  const fetchTrends = async () => {
    try {
      const response = await getComplaintTrends({ days: trendsDays });
      const formattedData = response.data.map((item) => ({
        ...item,
        date: item.date.split('T')[0],
      }));
      setTrends(formattedData);
    } catch (error) {
      console.error("Failed to fetch trends:", error);
    }
  };

  const fetchProblematicDiseases = async () => {
    try {
      const response = await getProblematicDiseases({ limit: 10 });
      setProblematicDiseases(response.data);
    } catch (error) {
      console.error("Failed to fetch problematic diseases:", error);
    }
  };

  const fetchTopContributors = async () => {
    try {
      const response = await getTopContributors({ limit: 10 });
      setTopContributors(response.data);
    } catch (error) {
      console.error("Failed to fetch top contributors:", error);
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

  // Analytics table columns
  const problematicColumns: ColumnsType<any> = [
    {
      title: "Tên Bệnh",
      dataIndex: ["disease", "name"],
      key: "disease_name",
      ellipsis: true,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.disease.name}</div>
          <div style={{ fontSize: 12, color: "#666" }}>
            {record.disease.plant_name}
          </div>
        </div>
      ),
    },
    {
      title: "Tổng Complaints",
      dataIndex: "complaint_count",
      key: "complaint_count",
      sorter: (a, b) => a.complaint_count - b.complaint_count,
    },
    {
      title: "Đã Verify",
      dataIndex: "verified_count",
      key: "verified_count",
    },
    {
      title: "Confidence TB",
      dataIndex: "avg_confidence",
      key: "avg_confidence",
      render: (val: number) => (
        <Tag color={val > 0.7 ? "green" : val > 0.5 ? "orange" : "red"}>
          {(val * 100).toFixed(1)}%
        </Tag>
      ),
    },
    {
      title: "Tỷ Lệ Lỗi",
      dataIndex: "error_rate",
      key: "error_rate",
      sorter: (a, b) => a.error_rate - b.error_rate,
      render: (val: number) => (
        <Tag color={val > 50 ? "red" : val > 30 ? "orange" : "green"}>
          {val.toFixed(1)}%
        </Tag>
      ),
    },
  ];

  const contributorsColumns: ColumnsType<any> = [
    {
      title: "Hạng",
      key: "rank",
      width: 80,
      render: (_, __, index) => {
        const medals = ["🥇", "🥈", "🥉"];
        return medals[index] || `#${index + 1}`;
      },
    },
    {
      title: "Người Dùng",
      dataIndex: ["user", "full_name"],
      key: "user_name",
      ellipsis: true,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {record.user.avatar && (
            <Image
              src={record.user.avatar}
              alt={record.user.full_name}
              width={32}
              height={32}
              style={{ borderRadius: "50%", objectFit: "cover" }}
              preview={false}
            />
          )}
          <div>
            <div style={{ fontWeight: 500 }}>{record.user.full_name}</div>
            <div style={{ fontSize: 12, color: "#666" }}>@{record.user.username}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Tổng Complaints",
      dataIndex: "complaint_count",
      key: "complaint_count",
    },
    {
      title: "Đã Verify",
      dataIndex: "verified_count",
      key: "verified_count",
    },
    {
      title: "Đúng",
      dataIndex: "correct_count",
      key: "correct_count",
    },
  ];



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
      title: "Đã verify",
      dataIndex: "is_verified",
      hideInSearch: true,
      filters: [
        { text: "Đã verify", value: true },
        { text: "Chưa verify", value: false },
      ],
      onFilter: (value, record) => record.is_verified === value,
      render: (_, record) => (
        <Tag color={record.is_verified ? "green" : "orange"}>
          {record.is_verified ? "Đã verify" : "Chưa verify"}
        </Tag>
      ),
      width: 140,
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

      {/* Analytics Dashboard Section */}
      {overallStats && (
        <StatisticCard.Group direction="row" style={{ marginBottom: 24 }}>
          <StatisticCard
            statistic={{
              title: "Tổng Complaints",
              value: overallStats.total_complaints,
              icon: "📊",
            }}
          />
          <StatisticCard
            statistic={{
              title: "Đã Verify",
              value: overallStats.verified_complaints,
              status: "success",
              icon: "✅",
            }}
          />
          <StatisticCard
            statistic={{
              title: "Độ Chính Xác AI",
              value: overallStats.ai_correct_rate,
              suffix: "%",
              status: "default",
              icon: "🎯",
            }}
          />
        </StatisticCard.Group>
      )}

      {/* Trends Chart */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card
            title="Xu Hướng Complaints"
            loading={analyticsLoading}
            extra={
              <Segmented
                options={[
                  { label: "7 ngày", value: 7 },
                  { label: "30 ngày", value: 30 },
                  { label: "90 ngày", value: 90 },
                ]}
                value={trendsDays}
                onChange={(value) => setTrendsDays(value as number)}
              />
            }
          >
            {trends.length > 0 ? (
              <div style={{ width: '100%', height: 300 }}>
                <LineChart 
                  width={1000} 
                  height={300} 
                  data={trends} 
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 'auto']} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="complaint_count"
                    stroke="#1890ff"
                    strokeWidth={2}
                    name="Tổng Complaints"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    label={{ position: 'top', fill: '#1890ff', fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="verified_count"
                    stroke="#52c41a"
                    strokeWidth={2}
                    name="Đã Verify"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    label={{ position: 'bottom', fill: '#52c41a', fontSize: 12 }}
                  />
                </LineChart>
              </div>
            ) : (
              <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                Không có dữ liệu
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Problematic Diseases Table */}
      <Card
        title="🚨 Problematic Diseases (Top 10)"
        style={{ marginBottom: 24 }}
        loading={analyticsLoading}
      >
        <Table
          columns={problematicColumns}
          dataSource={problematicDiseases}
          rowKey={(record) => record.disease.id}
          pagination={false}
        />
      </Card>

      {/* Top Contributors */}
      <Card title="🏆 Top Contributors" loading={analyticsLoading} style={{ marginBottom: 24 }}>
        <Table
          columns={contributorsColumns}
          dataSource={topContributors}
          rowKey={(record) => record.user.id}
          pagination={false}
        />
      </Card>

      <ProTable<Complaint>
        headerTitle="Danh sách Scan Reports"
        actionRef={actionRef}
        rowKey="id"
        search={false}
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
