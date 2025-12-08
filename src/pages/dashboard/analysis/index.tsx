import { EllipsisOutlined } from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { Col, Dropdown, Row } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import type { Dayjs } from 'dayjs';
import type { FC } from 'react';
import { Suspense, useState } from 'react';
import IntroduceRow from './components/IntroduceRow';
import OfflineData from './components/OfflineData';
import PageLoading from './components/PageLoading';
import ProportionSales from './components/ProportionSales';
import type { TimeType } from './components/SalesCard';
import SalesCard from './components/SalesCard';
import TopSearch from './components/TopSearch';
import type { AnalysisData } from './data.d';
import useStyles from './style.style';
import { getTimeDistance } from './utils/utils';

type RangePickerValue = RangePickerProps['value'];
type AnalysisProps = {
  dashboardAndanalysis: AnalysisData;
  loading: boolean;
};
type SalesType = 'all' | 'online' | 'stores';
const Analysis: FC<AnalysisProps> = () => {
  const { styles } = useStyles();
  const [salesType, setSalesType] = useState<SalesType>('all');
  const [currentTabKey, setCurrentTabKey] = useState<string>('');
  const [rangePickerValue, setRangePickerValue] = useState<RangePickerValue>(
    getTimeDistance('year'),
  );

  // TODO: Replace with real API call when ready
  // Mock data for demonstration
  const loading = false;
  const data: AnalysisData = {
    visitData: [
      { x: '2024-01', y: 7 },
      { x: '2024-02', y: 5 },
      { x: '2024-03', y: 4 },
      { x: '2024-04', y: 2 },
      { x: '2024-05', y: 4 },
      { x: '2024-06', y: 7 },
      { x: '2024-07', y: 5 },
      { x: '2024-08', y: 6 },
      { x: '2024-09', y: 5 },
      { x: '2024-10', y: 9 },
      { x: '2024-11', y: 6 },
      { x: '2024-12', y: 3 },
    ],
    visitData2: [
      { x: '2024-01', y: 1 },
      { x: '2024-02', y: 6 },
      { x: '2024-03', y: 4 },
      { x: '2024-04', y: 8 },
      { x: '2024-05', y: 3 },
      { x: '2024-06', y: 7 },
    ],
    salesData: [
      { x: '1月', y: 1234 },
      { x: '2月', y: 2345 },
      { x: '3月', y: 3456 },
      { x: '4月', y: 4567 },
      { x: '5月', y: 5678 },
      { x: '6月', y: 6789 },
      { x: '7月', y: 7890 },
      { x: '8月', y: 8901 },
      { x: '9月', y: 9012 },
      { x: '10月', y: 10123 },
      { x: '11月', y: 11234 },
      { x: '12月', y: 12345 },
    ],
    searchData: [
      { index: 1, keyword: '搜索关键词-1', count: 234, range: 12, status: 0 },
      { index: 2, keyword: '搜索关键词-2', count: 189, range: 8, status: 1 },
      { index: 3, keyword: '搜索关键词-3', count: 156, range: -5, status: 0 },
      { index: 4, keyword: '搜索关键词-4', count: 134, range: 15, status: 1 },
      { index: 5, keyword: '搜索关键词-5', count: 98, range: -3, status: 0 },
    ],
    offlineData: [
      { name: 'Stores 0', cvr: 0.7 },
      { name: 'Stores 1', cvr: 0.5 },
      { name: 'Stores 2', cvr: 0.4 },
      { name: 'Stores 3', cvr: 0.8 },
    ],
    offlineChartData: [
      { date: 1, type: 1, value: 45 },
      { date: 1, type: 2, value: 65 },
      { date: 2, type: 1, value: 52 },
      { date: 2, type: 2, value: 72 },
      { date: 3, type: 1, value: 61 },
      { date: 3, type: 2, value: 81 },
    ],
    salesTypeData: [
      { x: '家用电器', y: 4544 },
      { x: '食用酒水', y: 3321 },
      { x: '个护健康', y: 3113 },
      { x: '服饰箱包', y: 2341 },
      { x: '母婴产品', y: 1231 },
    ],
    salesTypeDataOnline: [
      { x: '家用电器', y: 244 },
      { x: '食用酒水', y: 321 },
      { x: '个护健康', y: 311 },
    ],
    salesTypeDataOffline: [
      { x: '家用电器', y: 99 },
      { x: '食用酒水', y: 188 },
      { x: '个护健康', y: 234 },
    ],
    radarData: [],
  };

  /*
  const { loading, data } = useRequest(fakeChartData);
  */
  const selectDate = (type: TimeType) => {
    setRangePickerValue(getTimeDistance(type));
  };
  const handleRangePickerChange = (value: RangePickerValue) => {
    setRangePickerValue(value);
  };
  const isActive = (type: TimeType) => {
    if (!rangePickerValue) {
      return '';
    }
    const value = getTimeDistance(type);
    if (!value) {
      return '';
    }
    if (!rangePickerValue[0] || !rangePickerValue[1]) {
      return '';
    }
    if (
      rangePickerValue[0].isSame(value[0] as Dayjs, 'day') &&
      rangePickerValue[1].isSame(value[1] as Dayjs, 'day')
    ) {
      return styles.currentDate;
    }
    return '';
  };

  let salesPieData: any;
  if (salesType === 'all') {
    salesPieData = data?.salesTypeData;
  } else {
    salesPieData =
      salesType === 'online'
        ? data?.salesTypeDataOnline
        : data?.salesTypeDataOffline;
  }

  const dropdownGroup = (
    <span className={styles.iconGroup}>
      <Dropdown
        menu={{
          items: [
            {
              key: '1',
              label: '操作一',
            },
            {
              key: '2',
              label: '操作二',
            },
          ],
        }}
        placement="bottomRight"
      >
        <EllipsisOutlined />
      </Dropdown>
    </span>
  );
  const handleChangeSalesType = (value: SalesType) => {
    setSalesType(value);
  };
  const handleTabChange = (key: string) => {
    setCurrentTabKey(key);
  };
  const activeKey = currentTabKey || data?.offlineData[0]?.name || '';
  return (
    <GridContent>
      <Suspense fallback={<PageLoading />}>
        <IntroduceRow loading={loading} visitData={data?.visitData || []} />
      </Suspense>

      <Suspense fallback={null}>
        <SalesCard
          rangePickerValue={rangePickerValue}
          salesData={data?.salesData || []}
          isActive={isActive}
          handleRangePickerChange={handleRangePickerChange}
          loading={loading}
          selectDate={selectDate}
        />
      </Suspense>

      <Row
        gutter={24}
        style={{
          marginTop: 24,
        }}
      >
        <Col xl={12} lg={24} md={24} sm={24} xs={24}>
          <Suspense fallback={null}>
            <TopSearch
              loading={loading}
              visitData2={data?.visitData2 || []}
              searchData={data?.searchData || []}
              dropdownGroup={dropdownGroup}
            />
          </Suspense>
        </Col>
        <Col xl={12} lg={24} md={24} sm={24} xs={24}>
          <Suspense fallback={null}>
            <ProportionSales
              dropdownGroup={dropdownGroup}
              salesType={salesType}
              loading={loading}
              salesPieData={salesPieData || []}
              handleChangeSalesType={handleChangeSalesType}
            />
          </Suspense>
        </Col>
      </Row>

      <Suspense fallback={null}>
        <OfflineData
          activeKey={activeKey}
          loading={loading}
          offlineData={data?.offlineData || []}
          offlineChartData={data?.offlineChartData || []}
          handleTabChange={handleTabChange}
        />
      </Suspense>
    </GridContent>
  );
};
export default Analysis;
