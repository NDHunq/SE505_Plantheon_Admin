import { Line } from '@ant-design/plots';
import { Card, Segmented } from 'antd';

interface TrendsCardProps {
  loading: boolean;
  data: Array<{
    date: string;
    complaint_count: number;
    verified_count: number;
  }>;
  days: number;
  onDaysChange: (days: number) => void;
}

const TrendsCard = ({ loading, data, days, onDaysChange }: TrendsCardProps) => {
  const chartData = data.flatMap(item => [
    {
      date: item.date,
      value: item.complaint_count,
      category: 'Tổng báo cáo',
    },
    {
      date: item.date,
      value: item.verified_count,
      category: 'Đã xác minh',
    },
  ]);

  const config = {
    data: chartData,
    xField: 'date',
    yField: 'value',
    seriesField: 'category',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    point: {
      size: 5,
      shape: 'circle',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
    color: ['#722ed1', '#52c41a'],
    legend: {
      position: 'top' as const,
    },
    yAxis: {
      label: {
        formatter: (v: string) => `${v}`,
      },
    },
    lineStyle: {
      lineWidth: 3,
    },
  };

  return (
    <Card
      loading={loading}
      variant="borderless"
      title="Xu hướng báo cáo kết quả quét"
      extra={
        <Segmented
          options={[
            { label: '7 ngày', value: 7 },
            { label: '30 ngày', value: 30 },
            { label: '90 ngày', value: 90 },
          ]}
          value={days}
          onChange={(value) => onDaysChange(value as number)}
        />
      }
      style={{ marginBottom: 24 }}
    >
      {data.length > 0 ? (
        <Line {...config} height={300} />
      ) : (
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
          Không có dữ liệu
        </div>
      )}
    </Card>
  );
};

export default TrendsCard;
