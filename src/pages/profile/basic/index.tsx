import type { ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { Badge, Card, Descriptions, Divider } from 'antd';
import type { FC } from 'react';
import React from 'react';
import type { BasicGood, BasicProgress } from './data.d';
import useStyles from './style.style';

const progressColumns: ProColumns<BasicProgress>[] = [
  {
    title: '时间',
    dataIndex: 'time',
    key: 'time',
  },
  {
    title: '当前进度',
    dataIndex: 'rate',
    key: 'rate',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (text: React.ReactNode) => {
      if (text === 'success') {
        return <Badge status="success" text="成功" />;
      }
      return <Badge status="processing" text="进行中" />;
    },
  },
  {
    title: '操作员ID',
    dataIndex: 'operator',
    key: 'operator',
  },
  {
    title: '耗时',
    dataIndex: 'cost',
    key: 'cost',
  },
];
const Basic: FC = () => {
  const { styles } = useStyles();

  // TODO: Replace with real API call when ready
  // Mock data for demonstration
  const loading = false;
  const data = {
    basicGoods: [
      {
        id: 'PROD-001',
        name: '矿泉水 550ml',
        barcode: '12421432143214321',
        price: '2.00',
        num: '1',
        amount: '2.00',
      },
      {
        id: 'PROD-002',
        name: '凉茶 300ml',
        barcode: '12421432143214322',
        price: '3.00',
        num: '2',
        amount: '6.00',
      },
      {
        id: 'PROD-003',
        name: '好吃的薯片',
        barcode: '12421432143214323',
        price: '7.00',
        num: '4',
        amount: '28.00',
      },
      {
        id: 'PROD-004',
        name: '特别好吃的蛋卷',
        barcode: '12421432143214324',
        price: '8.50',
        num: '3',
        amount: '25.50',
      },
    ],
    basicProgress: [
      {
        key: '1',
        time: '2024-12-01 12:00',
        rate: '联系客户',
        status: 'processing',
        operator: 'OP-001',
        cost: '5mins',
      },
      {
        key: '2',
        time: '2024-12-01 14:30',
        rate: '取货员出发',
        status: 'success',
        operator: 'OP-002',
        cost: '1h',
      },
      {
        key: '3',
        time: '2024-12-01 16:00',
        rate: '取货员接货',
        status: 'success',
        operator: 'OP-002',
        cost: '30mins',
      },
      {
        key: '4',
        time: '2024-12-01 17:00',
        rate: '签收',
        status: 'success',
        operator: 'OP-003',
        cost: '10mins',
      },
    ],
  };

  /*
  const { data, loading } = useRequest(() => {
    return queryBasicProfile();
  });
  */

  const { basicGoods, basicProgress } = data || {
    basicGoods: [],
    basicProgress: [],
  };
  let goodsData: typeof basicGoods = [];
  if (basicGoods.length) {
    let num = 0;
    let amount = 0;
    basicGoods.forEach((item) => {
      num += Number(item.num);
      amount += Number(item.amount);
    });
    goodsData = basicGoods.concat({
      id: '总计',
      num,
      amount,
    });
  }
  const renderContent = (value: any, _: any, index: any) => {
    const obj: {
      children: any;
      props: {
        colSpan?: number;
      };
    } = {
      children: value,
      props: {},
    };
    if (index === basicGoods.length) {
      obj.props.colSpan = 0;
    }
    return obj;
  };
  const goodsColumns: ProColumns<BasicGood>[] = [
    {
      title: '商品编号',
      dataIndex: 'id',
      key: 'id',
      render: (text: React.ReactNode, _: any, index: number) => {
        if (index < basicGoods.length) {
          return <span>{text}</span>;
        }
        return {
          children: (
            <span
              style={{
                fontWeight: 600,
              }}
            >
              总计
            </span>
          ),
          props: {
            colSpan: 4,
          },
        };
      },
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      render: renderContent,
    },
    {
      title: '商品条码',
      dataIndex: 'barcode',
      key: 'barcode',
      render: renderContent,
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      align: 'right' as 'left' | 'right' | 'center',
      render: renderContent,
    },
    {
      title: '数量（件）',
      dataIndex: 'num',
      key: 'num',
      align: 'right' as 'left' | 'right' | 'center',
      render: (text: React.ReactNode, _: any, index: number) => {
        if (index < basicGoods.length) {
          return text;
        }
        return (
          <span
            style={{
              fontWeight: 600,
            }}
          >
            {text}
          </span>
        );
      },
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as 'left' | 'right' | 'center',
      render: (text: React.ReactNode, _: any, index: number) => {
        if (index < basicGoods.length) {
          return text;
        }
        return (
          <span
            style={{
              fontWeight: 600,
            }}
          >
            {text}
          </span>
        );
      },
    },
  ];
  return (
    <PageContainer>
      <Card variant="borderless">
        <Descriptions
          title="退款申请"
          style={{
            marginBottom: 32,
          }}
        >
          <Descriptions.Item label="取货单号">1000000000</Descriptions.Item>
          <Descriptions.Item label="状态">已取货</Descriptions.Item>
          <Descriptions.Item label="销售单号">1234123421</Descriptions.Item>
          <Descriptions.Item label="子订单">3214321432</Descriptions.Item>
        </Descriptions>
        <Divider
          style={{
            marginBottom: 32,
          }}
        />
        <Descriptions
          title="用户信息"
          style={{
            marginBottom: 32,
          }}
        >
          <Descriptions.Item label="用户姓名">付小小</Descriptions.Item>
          <Descriptions.Item label="联系电话">18100000000</Descriptions.Item>
          <Descriptions.Item label="常用快递">菜鸟仓储</Descriptions.Item>
          <Descriptions.Item label="取货地址">
            浙江省杭州市西湖区万塘路18号
          </Descriptions.Item>
          <Descriptions.Item label="备注">无</Descriptions.Item>
        </Descriptions>
        <Divider
          style={{
            marginBottom: 32,
          }}
        />
        <div className={styles.title}>退货商品</div>
        <ProTable
          style={{
            marginBottom: 24,
          }}
          pagination={false}
          search={false}
          loading={loading}
          options={false}
          toolBarRender={false}
          dataSource={goodsData}
          columns={goodsColumns}
          rowKey="id"
        />
        <div className={styles.title}>退货进度</div>
        <ProTable
          style={{
            marginBottom: 16,
          }}
          pagination={false}
          loading={loading}
          search={false}
          options={false}
          toolBarRender={false}
          dataSource={basicProgress}
          columns={progressColumns}
        />
      </Card>
    </PageContainer>
  );
};
export default Basic;
