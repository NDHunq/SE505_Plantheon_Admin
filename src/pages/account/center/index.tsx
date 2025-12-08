import {
  ClusterOutlined,
  ContactsOutlined,
  HomeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import {
  Avatar,
  Card,
  Col,
  Divider,
  Input,
  type InputRef,
  Row,
  Tag,
} from 'antd';
import React, { useRef, useState } from 'react';
import useStyles from './Center.style';
import Applications from './components/Applications';
import Articles from './components/Articles';
import Projects from './components/Projects';
import type { CurrentUser, TagType, tabKeyType } from './data.d';

const operationTabList = [
  {
    key: 'articles',
    tab: (
      <span>
        文章{' '}
        <span
          style={{
            fontSize: 14,
          }}
        >
          (8)
        </span>
      </span>
    ),
  },
  {
    key: 'applications',
    tab: (
      <span>
        应用{' '}
        <span
          style={{
            fontSize: 14,
          }}
        >
          (8)
        </span>
      </span>
    ),
  },
  {
    key: 'projects',
    tab: (
      <span>
        项目{' '}
        <span
          style={{
            fontSize: 14,
          }}
        >
          (8)
        </span>
      </span>
    ),
  },
];
const TagList: React.FC<{
  tags: CurrentUser['tags'];
}> = ({ tags }) => {
  const { styles } = useStyles();
  const ref = useRef<InputRef | null>(null);
  const [newTags, setNewTags] = useState<TagType[]>([]);
  const [inputVisible, setInputVisible] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const showInput = () => {
    setInputVisible(true);
    if (ref.current) {
      // eslint-disable-next-line no-unused-expressions
      ref.current?.focus();
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  const handleInputConfirm = () => {
    let tempsTags = [...newTags];
    if (
      inputValue &&
      tempsTags.filter((tag) => tag.label === inputValue).length === 0
    ) {
      tempsTags = [
        ...tempsTags,
        {
          key: `new-${tempsTags.length}`,
          label: inputValue,
        },
      ];
    }
    setNewTags(tempsTags);
    setInputVisible(false);
    setInputValue('');
  };
  return (
    <div className={styles.tags}>
      <div className={styles.tagsTitle}>标签</div>
      {(tags || []).concat(newTags).map((item) => (
        <Tag key={item.key}>{item.label}</Tag>
      ))}
      {inputVisible && (
        <Input
          ref={ref}
          size="small"
          style={{
            width: 78,
          }}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
        />
      )}
      {!inputVisible && (
        <Tag
          onClick={showInput}
          style={{
            borderStyle: 'dashed',
          }}
        >
          <PlusOutlined />
        </Tag>
      )}
    </div>
  );
};
const Center: React.FC = () => {
  const { styles } = useStyles();
  const [tabKey, setTabKey] = useState<tabKeyType>('articles');

  //  获取用户信息
  // TODO: Replace with real API call when ready
  // Mock data for demonstration
  const loading = false;
  const currentUser: CurrentUser = {
    name: '吴彦祖',
    avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
    userid: '00000001',
    email: 'antdesign@alipay.com',
    signature: '海纳百川，有容乃大',
    title: '交互专家',
    group: '蚂蚁金服－某某某事业群－某某平台部－某某技术部－UED',
    tags: [
      { key: '1', label: '很有想法的' },
      { key: '2', label: '专注设计' },
      { key: '3', label: '辣~' },
      { key: '4', label: '大长腿' },
      { key: '5', label: '川妹子' },
      { key: '6', label: '海纳百川' },
    ],
    notice: [
      {
        id: '1',
        title: '科学搬砖组',
        logo: 'https://gw.alipayobjects.com/zos/rmsportal/WdGqmHpayyMjiEhcKoVE.png',
        description: '那是一种内在的东西',
        member: '8名成员',
        href: '',
      },
      {
        id: '2',
        title: '程序员日常',
        logo: 'https://gw.alipayobjects.com/zos/rmsportal/zOsKZmFRdUtvpqCImOVY.png',
        description: '希望是一个好东西',
        member: '6名成员',
        href: '',
      },
    ],
    notifyCount: 12,
    unreadCount: 5,
    country: 'China',
    geographic: {
      province: { label: '浙江省', key: '330000' },
      city: { label: '杭州市', key: '330100' },
    },
    address: '西湖区工专路 77 号',
    phone: '0752-268888888',
  };

  /*
  const { data: currentUser, loading } = useRequest(() => {
    return queryCurrent();
  });
  */

  //  渲染用户信息
  const renderUserInfo = ({
    title,
    group,
    geographic,
  }: Partial<CurrentUser>) => {
    return (
      <div className={styles.detail}>
        <p>
          <ContactsOutlined
            style={{
              marginRight: 8,
            }}
          />
          {title}
        </p>
        <p>
          <ClusterOutlined
            style={{
              marginRight: 8,
            }}
          />
          {group}
        </p>
        <p>
          <HomeOutlined
            style={{
              marginRight: 8,
            }}
          />
          {
            (
              geographic || {
                province: {
                  label: '',
                },
              }
            ).province.label
          }
          {
            (
              geographic || {
                city: {
                  label: '',
                },
              }
            ).city.label
          }
        </p>
      </div>
    );
  };

  // 渲染tab切换
  const renderChildrenByTabKey = (tabValue: tabKeyType) => {
    if (tabValue === 'projects') {
      return <Projects />;
    }
    if (tabValue === 'applications') {
      return <Applications />;
    }
    if (tabValue === 'articles') {
      return <Articles />;
    }
    return null;
  };
  return (
    <GridContent>
      <Row gutter={24}>
        <Col lg={7} md={24}>
          <Card
            variant="borderless"
            style={{
              marginBottom: 24,
            }}
            loading={loading}
          >
            {!loading && currentUser && (
              <>
                <div className={styles.avatarHolder}>
                  <img alt="" src={currentUser.avatar} />
                  <div className={styles.name}>{currentUser.name}</div>
                  <div>{currentUser?.signature}</div>
                </div>
                {renderUserInfo(currentUser)}
                <Divider dashed />
                <TagList tags={currentUser.tags || []} />
                <Divider
                  style={{
                    marginTop: 16,
                  }}
                  dashed
                />
                <div className={styles.team}>
                  <div className={styles.teamTitle}>团队</div>
                  <Row gutter={36}>
                    {currentUser.notice?.map((item) => (
                      <Col key={item.id} lg={24} xl={12}>
                        <a href={item.href}>
                          <Avatar size="small" src={item.logo} />
                          {item.member}
                        </a>
                      </Col>
                    ))}
                  </Row>
                </div>
              </>
            )}
          </Card>
        </Col>
        <Col lg={17} md={24}>
          <Card
            className={styles.tabsCard}
            variant="borderless"
            tabList={operationTabList}
            activeTabKey={tabKey}
            onTabChange={(_tabKey: string) => {
              setTabKey(_tabKey as tabKeyType);
            }}
          >
            {renderChildrenByTabKey(tabKey)}
          </Card>
        </Col>
      </Row>
    </GridContent>
  );
};
export default Center;
