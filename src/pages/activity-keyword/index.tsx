import {
  ActivityKeywordWithDiseases,
  deleteActivityKeyword,
  getDiseasesForKeyword,
  queryActivityKeywords,
} from "@/services/activityKeyword";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import {
  PageContainer,
  ProDescriptions,
  ProTable,
} from "@ant-design/pro-components";
import { Button, Drawer, message, Popconfirm, Tag } from "antd";
import React, { useRef, useState } from "react";
import CreateActivityKeywordModal from "./components/CreateActivityKeywordModal";
import ImportCsvModal from "./components/ImportCsvModal";
import UpdateActivityKeywordModal from "./components/UpdateActivityKeywordModal";

const KeywordTypeColors: Record<string, string> = {
  TECHNIQUE: "blue",
  CLIMATE: "cyan",
  DISEASE: "red",
  OTHER: "default",
  EXPENSE: "orange",
  INCOME: "green",
};

const ActivityKeywordManagement: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<ActivityKeywordWithDiseases>();
  const [messageApi, contextHolder] = message.useMessage();

  const handleDelete = async (id: string) => {
    try {
      await deleteActivityKeyword(id);
      messageApi.success("Xóa từ khóa hoạt động thành công");
      actionRef.current?.reload();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to delete activity keyword";
      messageApi.error(errorMsg);
    }
  };

  const columns: ProColumns<ActivityKeywordWithDiseases>[] = [
    {
      title: "Name",
      dataIndex: "name",
      render: (dom, entity) => (
        <a
          onClick={() => {
            setCurrentRow(entity);
            setShowDetail(true);
          }}
        >
          {dom}
        </a>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      valueType: "select",
      valueEnum: {
        TECHNIQUE: { text: "Technique" },
        CLIMATE: { text: "Climate" },
        DISEASE: { text: "Disease" },
        OTHER: { text: "Other" },
        EXPENSE: { text: "Expense" },
        INCOME: { text: "Income" },
      },
      render: (_, record) => (
        <Tag color={KeywordTypeColors[record.type] || "default"}>
          {record.type}
        </Tag>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      hideInSearch: true,
      ellipsis: true,
      width: 200,
    },
    {
      title: "Days Offset",
      dataIndex: "base_days_offset",
      hideInSearch: true,
      width: 100,
    },
    {
      title: "Start Hour",
      dataIndex: "hour_time",
      hideInSearch: true,
      width: 100,
      render: (_, record) => `${record.hour_time}:00`,
    },
    {
      title: "Duration (hours)",
      dataIndex: "time_duration",
      hideInSearch: true,
      width: 120,
      render: (_, record) =>
        record.time_duration ? `${record.time_duration}h` : "-",
    },
    {
      title: "Diseases",
      dataIndex: "diseases",
      hideInSearch: true,
      width: 200,
      render: (_, record) => {
        if (!record.diseases || record.diseases.length === 0) {
          return <span style={{ color: "#999" }}>-</span>;
        }
        return <span>{record.diseases.map((d) => d.name).join(", ")}</span>;
      },
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      valueType: "dateTime",
      hideInSearch: true,
      sorter: true,
    },
    {
      title: "Actions",
      dataIndex: "option",
      valueType: "option",
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
        <UpdateActivityKeywordModal
          key="edit"
          keyword={record}
          trigger={<Button type="text" size="small" icon={<EditOutlined />} />}
          onSuccess={() => actionRef.current?.reload()}
        />,
        <Popconfirm
          key="delete"
          title="Delete Activity Keyword"
          description="Are you sure you want to delete this keyword?"
          onConfirm={() => handleDelete(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="text" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      {contextHolder}
      <ProTable<ActivityKeywordWithDiseases>
        headerTitle="Activity Keywords"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <ImportCsvModal
            key="import"
            onSuccess={() => actionRef.current?.reload()}
          />,
          <CreateActivityKeywordModal
            key="create"
            onSuccess={() => actionRef.current?.reload()}
          />,
        ]}
        request={async (params) => {
          try {
            // Use unified query endpoint with all filters
            const queryResponse = await queryActivityKeywords({
              name: params.name,
              type: params.type,
              page: params.current || 1,
              limit: params.pageSize || 20,
            });

            const data = queryResponse.data || [];

            // Fetch diseases for each keyword
            const keywordsWithDiseases = await Promise.all(
              data.map(async (keyword) => {
                try {
                  const diseaseResponse = await getDiseasesForKeyword(
                    keyword.id
                  );
                  return {
                    ...keyword,
                    diseases: diseaseResponse.data || [],
                  };
                } catch (error) {
                  return { ...keyword, diseases: [] };
                }
              })
            );

            return {
              data: keywordsWithDiseases,
              success: true,
              total: queryResponse.pagination.total,
            };
          } catch (error) {
            messageApi.error("Failed to fetch activity keywords");
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
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={true}
        title={currentRow?.name}
      >
        {currentRow && (
          <ProDescriptions<ActivityKeywordWithDiseases>
            column={1}
            dataSource={currentRow}
            columns={[
              { title: "Name", dataIndex: "name" },
              {
                title: "Type",
                dataIndex: "type",
                render: (_, record) => (
                  <Tag color={KeywordTypeColors[record.type] || "default"}>
                    {record.type}
                  </Tag>
                ),
              },
              { title: "Description", dataIndex: "description" },
              { title: "Days Offset", dataIndex: "base_days_offset" },
              {
                title: "Start Hour",
                dataIndex: "hour_time",
                render: (_, record) => `${record.hour_time}:00`,
              },
              {
                title: "Duration",
                dataIndex: "time_duration",
                render: (_, record) =>
                  record.time_duration ? `${record.time_duration} hours` : "-",
              },
              {
                title: "Diseases",
                render: (_, record) => {
                  if (!record.diseases || record.diseases.length === 0) {
                    return "-";
                  }
                  return (
                    <div>
                      {record.diseases.map((disease) => (
                        <Tag key={disease.id} style={{ marginBottom: 4 }}>
                          {disease.name}
                        </Tag>
                      ))}
                    </div>
                  );
                },
              },
              {
                title: "Created At",
                dataIndex: "created_at",
                valueType: "dateTime",
              },
              {
                title: "Updated At",
                dataIndex: "updated_at",
                valueType: "dateTime",
              },
            ]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default ActivityKeywordManagement;
