import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import {
  Avatar,
  Button,
  Card,
  Col,
  Dropdown,
  Input,
  List,
  Modal,
  Progress,
  Row,
  Segmented,
} from 'antd';
import dayjs from 'dayjs';
import type { FC } from 'react';
import React, { useState } from 'react';
import OperationModal from './components/OperationModal';
import type { BasicListItemDataType } from './data.d';
import useStyles from './style.style';

const { Search } = Input;
const Info: FC<{
  title: React.ReactNode;
  value: React.ReactNode;
  bordered?: boolean;
}> = ({ title, value, bordered }) => {
  const { styles } = useStyles();
  return (
    <div className={styles.headerInfo}>
      <span>{title}</span>
      <p>{value}</p>
      {bordered && <em />}
    </div>
  );
};
const ListContent = ({
  data: { owner, createdAt, percent, status },
}: {
  data: BasicListItemDataType;
}) => {
  const { styles } = useStyles();
  return (
    <div>
      <div className={styles.listContentItem}>
        <span>Owner</span>
        <p>{owner}</p>
      </div>
      <div className={styles.listContentItem}>
        <span>开始时间</span>
        <p>{dayjs(createdAt).format('YYYY-MM-DD HH:mm')}</p>
      </div>
      <div className={styles.listContentItem}>
        <Progress
          percent={percent}
          status={status}
          size={6}
          style={{
            width: 180,
          }}
        />
      </div>
    </div>
  );
};
export const BasicList: FC = () => {
  const { styles } = useStyles();
  const [done, setDone] = useState<boolean>(false);
  const [open, setVisible] = useState<boolean>(false);
  const [current, setCurrent] = useState<
    Partial<BasicListItemDataType> | undefined
  >(undefined);

  // TODO: Replace with real API calls when ready
  // Mock data for demonstration
  const listData: { list: BasicListItemDataType[] } = {
    list: [
      {
        id: '1',
        owner: '付小小',
        title: 'Alipay',
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/WdGqmHpayyMjiEhcKoVE.png',
        cover: 'https://gw.alipayobjects.com/zos/rmsportal/uMfMFlvUuceEyPpotzlq.png',
        status: 'active',
        percent: 80,
        logo: 'https://gw.alipayobjects.com/zos/rmsportal/WdGqmHpayyMjiEhcKoVE.png',
        href: 'https://ant.design',
        updatedAt: '2024-12-01',
        createdAt: '2024-11-01',
        subDescription: '那是一种内在的东西，他们到达不了，也无法触及的',
        description: '在中台产品的研发过程中，会出现不同的设计规范和实现方式',
        activeUser: 158,
        newUser: 1234,
        star: 102,
        like: 88,
        message: 12,
        content: '段落示意：蚂蚁金服设计平台 ant.design',
        members: [],
      },
      {
        id: '2',
        owner: '曲丽丽',
        title: 'Angular',
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/zOsKZmFRdUtvpqCImOVY.png',
        cover: 'https://gw.alipayobjects.com/zos/rmsportal/iZBVOIhGJiAnhplqjvZW.png',
        status: 'exception',
        percent: 45,
        logo: 'https://gw.alipayobjects.com/zos/rmsportal/zOsKZmFRdUtvpqCImOVY.png',
        href: 'https://ant.design',
        updatedAt: '2024-11-28',
        createdAt: '2024-10-15',
        subDescription: '希望是一个好东西，也许是最好的，好东西是不会消亡的',
        description: '在中台产品的研发过程中，会出现不同的设计规范和实现方式',
        activeUser: 234,
        newUser: 2345,
        star: 98,
        like: 156,
        message: 24,
        content: '段落示意：蚂蚁金服设计平台 ant.design',
        members: [],
      },
      {
        id: '3',
        owner: '林东东',
        title: 'Ant Design',
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/dURIMkkrRFpPgTuzkwnB.png',
        cover: 'https://gw.alipayobjects.com/zos/rmsportal/iXjVmWVHbCJAyqvDxdtx.png',
        status: 'normal',
        percent: 65,
        logo: 'https://gw.alipayobjects.com/zos/rmsportal/dURIMkkrRFpPgTuzkwnB.png',
        href: 'https://ant.design',
        updatedAt: '2024-11-25',
        createdAt: '2024-10-01',
        subDescription: '城镇中有那么多的酒馆，她却偏偏走进了我的酒馆',
        description: '在中台产品的研发过程中，会出现不同的设计规范和实现方式',
        activeUser: 456,
        newUser: 3456,
        star: 234,
        like: 345,
        message: 45,
        content: '段落示意：蚂蚁金服设计平台 ant.design',
        members: [],
      },
    ],
  };
  const loading = false;
  const mutate = () => { };

  /*
  const {
    data: listData,
    loading,
    mutate,
  } = useRequest(() => {
    return queryFakeList({
      count: 50,
    });
  });
  */

  const postRun = (_method?: any, _params?: any) => {
    // TODO: Implement API calls when ready
  };

  /*
  const { run: postRun } = useRequest(
    (method, params) => {
      if (method === 'remove') {
        return removeFakeList(params);
      }
      if (method === 'update') {
        return updateFakeList(params);
      }
      return addFakeList(params);
    },
    {
      manual: true,
      onSuccess: (result) => {
        mutate(result);
      },
    },
  );
  */
  const list = listData?.list || [];
  const paginationProps = {
    showSizeChanger: true,
    showQuickJumper: true,
    pageSize: 5,
    total: list.length,
  };
  const showEditModal = (item: BasicListItemDataType) => {
    setVisible(true);
    setCurrent(item);
  };
  const deleteItem = (id: string) => {
    postRun('remove', {
      id,
    });
  };
  const editAndDelete = (
    key: string | number,
    currentItem: BasicListItemDataType,
  ) => {
    if (key === 'edit') showEditModal(currentItem);
    else if (key === 'delete') {
      Modal.confirm({
        title: '删除任务',
        content: '确定删除该任务吗？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => deleteItem(currentItem.id),
      });
    }
  };
  const extraContent = (
    <div>
      <Segmented
        defaultValue="all"
        options={[
          { label: '全部', value: 'all' },
          { label: '进行中', value: 'progress' },
          { label: '等待中', value: 'waiting' },
        ]}
      // 如有需要可添加 onChange 事件
      />
      <Search
        className={styles.extraContentSearch}
        placeholder="请输入"
        onSearch={() => ({})}
        variant="filled"
      />
    </div>
  );

  const renderMoreBtn = (item: BasicListItemDataType) => {
    return (
      <Dropdown
        menu={{
          onClick: ({ key }) => editAndDelete(key, item),
          items: [
            {
              key: 'edit',
              label: '编辑',
            },
            {
              key: 'delete',
              label: '删除',
            },
          ],
        }}
      >
        <a>
          更多 <DownOutlined />
        </a>
      </Dropdown>
    );
  };

  const handleDone = () => {
    setDone(false);
    setVisible(false);
    setCurrent({});
  };
  const handleSubmit = (values: BasicListItemDataType) => {
    setDone(true);
    const method = values?.id ? 'update' : 'add';
    postRun(method, values);
  };
  return (
    <div>
      <PageContainer>
        <div className={styles.standardList}>
          <Card variant="borderless">
            <Row>
              <Col sm={8} xs={24}>
                <Info title="我的待办" value="8个任务" bordered />
              </Col>
              <Col sm={8} xs={24}>
                <Info title="本周任务平均处理时间" value="32分钟" bordered />
              </Col>
              <Col sm={8} xs={24}>
                <Info title="本周完成任务数" value="24个任务" />
              </Col>
            </Row>
          </Card>

          <Card
            className={styles.listCard}
            variant="borderless"
            title="基本列表"
            style={{
              marginTop: 24,
            }}
            styles={{
              body: {
                padding: '0 32px 40px 32px',
              },
            }}
            extra={extraContent}
          >
            <List
              size="large"
              rowKey="id"
              loading={loading}
              pagination={paginationProps}
              dataSource={list}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <a
                      key="edit"
                      onClick={(e) => {
                        e.preventDefault();
                        showEditModal(item);
                      }}
                    >
                      编辑
                    </a>,
                    renderMoreBtn(item),
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar src={item.logo} shape="square" size="large" />
                    }
                    title={<a href={item.href}>{item.title}</a>}
                    description={item.subDescription}
                  />
                  <ListContent data={item} />
                </List.Item>
              )}
            />
          </Card>
        </div>
      </PageContainer>
      <Button
        type="dashed"
        onClick={() => {
          setVisible(true);
        }}
        style={{
          width: '100%',
          marginBottom: 8,
        }}
      >
        <PlusOutlined />
        添加
      </Button>
      <OperationModal
        done={done}
        open={open}
        current={current}
        onDone={handleDone}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
export default BasicList;
