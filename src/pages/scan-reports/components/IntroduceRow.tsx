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
          title="Tổng báo cáo"
          action={
            <Tooltip title="Tổng số báo cáo kết quả quét trong hệ thống">
              <InfoCircleOutlined />
            </Tooltip>
          }
          loading={loading}
          total={numeral(data.total_complaints).format('0,0')}
          contentHeight={46}
        >
        </ChartCard>
      </Col>

      <Col {...topColResponsiveProps}>
        <ChartCard
          variant="borderless"
          loading={loading}
          title="Đã xác minh"
          action={
            <Tooltip title="Số báo cáo đã được admin xác minh">
              <InfoCircleOutlined />
            </Tooltip>
          }
          total={numeral(data.verified_complaints).format('0,0')}
          contentHeight={46}
        >
        </ChartCard>
      </Col>

      <Col {...topColResponsiveProps}>
        <ChartCard
          loading={loading}
          variant="borderless"
          title="Tỉ lệ báo cáo sai"
          action={
            <Tooltip title="Tỷ lệ AI dự đoán đúng trong các báo cáo đã xác minh">
              <InfoCircleOutlined />
            </Tooltip>
          }
          total={`${data.ai_correct_rate.toFixed(1)}%`}
          contentHeight={46}
        >
        </ChartCard>
      </Col>
    </Row>
  );
};

export default IntroduceRow;
