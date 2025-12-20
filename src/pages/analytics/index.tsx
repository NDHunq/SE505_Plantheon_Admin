import {
  getComplaintTrends,
  getOverallStats,
  getProblematicDiseases,
  getTopContributors,
} from "@/services/analytics";
import { PageContainer, StatisticCard } from "@ant-design/pro-components";
import { Card, Col, message, Row, Segmented, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useEffect, useState } from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const { Statistic } = StatisticCard;

const AnalyticsDashboard: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  // State for data
  const [overallStats, setOverallStats] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [trendsDays, setTrendsDays] = useState<number>(30);
  const [problematicDiseases, setProblematicDiseases] = useState<any[]>([]);
  const [topContributors, setTopContributors] = useState<any[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    fetchTrends();
  }, [trendsDays]);

  const fetchAllData = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const fetchOverallStats = async () => {
    try {
      const response = await getOverallStats();
      setOverallStats(response.data);
    } catch (error) {
      messageApi.error("Không thể tải thống kê tổng quan");
    }
  };



  const fetchTrends = async () => {
    try {
      const response = await getComplaintTrends({ days: trendsDays });
      // Format dates to YYYY-MM-DD for chart display
      const formattedData = response.data.map((item) => ({
        ...item,
        date: item.date.split('T')[0], // Extract YYYY-MM-DD from ISO format
      }));
      console.log("📊 [Trends] Formatted data:", formattedData);
      setTrends(formattedData);
    } catch (error) {
      messageApi.error("Không thể tải xu hướng complaints");
    }
  };

  const fetchProblematicDiseases = async () => {
    try {
      const response = await getProblematicDiseases({ limit: 10 });
      setProblematicDiseases(response.data);
    } catch (error) {
      messageApi.error("Không thể tải danh sách bệnh có vấn đề");
    }
  };

  const fetchTopContributors = async () => {
    try {
      const response = await getTopContributors({ limit: 10 });
      setTopContributors(response.data);
    } catch (error) {
      messageApi.error("Không thể tải danh sách người đóng góp");
    }
  };

  // Table columns
  const problematicColumns: ColumnsType<any> = [
    {
      title: "ID Bệnh",
      dataIndex: "disease_id",
      key: "disease_id",
      ellipsis: true,
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
      title: "ID Người Dùng",
      dataIndex: "user_id",
      key: "user_id",
      ellipsis: true,
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

  return (
    <PageContainer>
      {contextHolder}

      {/* Overview Stats Cards */}
      {overallStats && (
        <StatisticCard.Group direction="row" style={{ marginBottom: 24 }}>
          <StatisticCard
            statistic={{
              title: "Tổng báo cáo",
              value: overallStats.total_complaints,
              icon: "📊",
            }}
          />
          <StatisticCard
            statistic={{
              title: "Đã xác minh",
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

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Trends Chart */}
        <Col xs={24}>
          <Card
            title="Xu Hướng báo cáo kết quả quét"
            loading={loading}
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
        loading={loading}
      >
        <Table
          columns={problematicColumns}
          dataSource={problematicDiseases}
          rowKey="disease_id"
          pagination={false}
        />
      </Card>





      {/* Top Contributors */}
      <Card title="🏆 Top Contributors" loading={loading}>
        <Table
          columns={contributorsColumns}
          dataSource={topContributors}
          rowKey="user_id"
          pagination={false}
        />
      </Card>
    </PageContainer>
  );
};

export default AnalyticsDashboard;
