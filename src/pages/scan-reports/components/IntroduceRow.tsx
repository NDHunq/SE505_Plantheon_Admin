import { InfoCircleOutlined } from '@ant-design/icons';
import { Col, Row, Tooltip } from 'antd';
import numeral from 'numeral';
import { ChartCard, Field } from './Charts';
import Trend from './Trend';

const topColResponsiveProps = {
  xs: 24,
  sm: 12,
  md: 12,
  lg: 12,
  xl: 8,
  style: {
    marginBottom: 24,
  },
};

interface IntroduceRowProps {
  loading: boolean;
  data: {
    total_complaints: number;
    verified_complaints: number;
    ai_correct_rate: number;
  } | null;
}

const IntroduceRow = ({ loading, data }: IntroduceRowProps) => {
  if (!data) return null;

  return (
    <Row gutter={24}>
      <Col {...topColResponsiveProps}>
        <ChartCard
          variant="borderless"
          title="Tổng Complaints"
          action={
            <Tooltip title="Tổng số scan complaints trong hệ thống">
              <InfoCircleOutlined />
            </Tooltip>
          }
          loading={loading}
          total={numeral(data.total_complaints).format('0,0')}
          contentHeight={46}
        >
          <div style={{ fontSize: 14, color: '#666' }}>
            📊 Tổng số báo cáo
          </div>
        </ChartCard>
      </Col>

      <Col {...topColResponsiveProps}>
        <ChartCard
          variant="borderless"
          loading={loading}
          title="Đã Verify"
          action={
            <Tooltip title="Số complaints đã được admin xác minh">
              <InfoCircleOutlined />
            </Tooltip>
          }
          total={numeral(data.verified_complaints).format('0,0')}
          contentHeight={46}
        >
          <div style={{ fontSize: 14, color: '#52c41a' }}>
            ✅ Đã xử lý
          </div>
        </ChartCard>
      </Col>

      <Col {...topColResponsiveProps}>
        <ChartCard
          loading={loading}
          variant="borderless"
          title="Độ Chính Xác AI"
          action={
            <Tooltip title="Tỷ lệ AI dự đoán đúng trong các complaints đã verify">
              <InfoCircleOutlined />
            </Tooltip>
          }
          total={`${data.ai_correct_rate.toFixed(1)}%`}
          contentHeight={46}
        >
          <Trend flag={data.ai_correct_rate > 70 ? 'up' : 'down'}>
            <span style={{ marginRight: 4 }}>Độ chính xác</span>
            <span style={{ fontWeight: 500 }}>
              {data.ai_correct_rate > 70 ? 'Tốt' : 'Cần cải thiện'}
            </span>
          </Trend>
        </ChartCard>
      </Col>
    </Row>
  );
};

export default IntroduceRow;
