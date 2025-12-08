import { PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { Button, Card, List, Typography } from 'antd';
import type { CardListItemDataType } from './data.d';
import useStyles from './style.style';

const { Paragraph } = Typography;
const CardList = () => {
  const { styles } = useStyles();

  // TODO: Replace with real API call when ready
  // Mock data for demonstration
  const loading = false;
  const data = {
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
        body: '',
        updatedAt: '2024-12-01',
        createdAt: '2024-11-01',
        subDescription: '那是一种内在的东西，他们到达不了，也无法触及的',
        description: '在中台产品的研发过程中，会出现不同的设计规范和实现方式，但其中往往存在很多类似的页面和组件',
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
        body: '',
        updatedAt: '2024-11-28',
        createdAt: '2024-10-15',
        subDescription: '希望是一个好东西，也许是最好的，好东西是不会消亡的',
        description: '希望是一个好东西，也许是最好的，好东西是不会消亡的',
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
        body: '',
        updatedAt: '2024-11-25',
        createdAt: '2024-10-01',
        subDescription: '城镇中有那么多的酒馆，她却偏偏走进了我的酒馆',
        description: '城镇中有那么多的酒馆，她却偏偏走进了我的酒馆',
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

  /*
  const { data, loading } = useRequest(() => {
    return queryFakeList({
      count: 8,
    });
  });
  */

  const list = data?.list || [];
  const content = (
    <div className={styles.pageHeaderContent}>
      <p>
        段落示意：蚂蚁金服务设计平台
        ant.design，用最小的工作量，无缝接入蚂蚁金服生态，
        提供跨越设计与开发的体验解决方案。
      </p>
      <div className={styles.contentLink}>
        <a>
          <img
            alt=""
            src="https://gw.alipayobjects.com/zos/rmsportal/MjEImQtenlyueSmVEfUD.svg"
          />{' '}
          快速开始
        </a>
        <a>
          <img
            alt=""
            src="https://gw.alipayobjects.com/zos/rmsportal/NbuDUAuBlIApFuDvWiND.svg"
          />{' '}
          产品简介
        </a>
        <a>
          <img
            alt=""
            src="https://gw.alipayobjects.com/zos/rmsportal/ohOEPSYdDTNnyMbGuyLb.svg"
          />{' '}
          产品文档
        </a>
      </div>
    </div>
  );
  const extraContent = (
    <div className={styles.extraImg}>
      <img
        alt="这是一个标题"
        src="https://gw.alipayobjects.com/zos/rmsportal/RzwpdLnhmvDJToTdfDPe.png"
      />
    </div>
  );
  const nullData: Partial<CardListItemDataType> = {};
  return (
    <PageContainer content={content} extraContent={extraContent}>
      <div className={styles.cardList}>
        <List<Partial<CardListItemDataType>>
          rowKey="id"
          loading={loading}
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 3,
            lg: 3,
            xl: 4,
            xxl: 4,
          }}
          dataSource={[nullData, ...list]}
          renderItem={(item) => {
            if (item?.id) {
              return (
                <List.Item key={item.id}>
                  <Card
                    hoverable
                    className={styles.card}
                    actions={[
                      <a key="option1">操作一</a>,
                      <a key="option2">操作二</a>,
                    ]}
                  >
                    <Card.Meta
                      avatar={
                        <img
                          alt=""
                          className={styles.cardAvatar}
                          src={item.avatar}
                        />
                      }
                      title={<a>{item.title}</a>}
                      description={
                        <Paragraph
                          className={styles.item}
                          ellipsis={{
                            rows: 3,
                          }}
                        >
                          {item.description}
                        </Paragraph>
                      }
                    />
                  </Card>
                </List.Item>
              );
            }
            return (
              <List.Item>
                <Button type="dashed" className={styles.newButton}>
                  <PlusOutlined /> 新增产品
                </Button>
              </List.Item>
            );
          }}
        />
      </div>
    </PageContainer>
  );
};
export default CardList;
