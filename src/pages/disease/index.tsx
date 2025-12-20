import { deleteDisease, Disease, getDiseases } from "@/services/disease";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import {
  PageContainer,
  ProDescriptions,
  ProTable,
} from "@ant-design/pro-components";
import { Button, Drawer, Image, message, Popconfirm, Space, Tag } from "antd";
import MarkdownIt from "markdown-it";
import React, { useRef, useState } from "react";
import CreateDiseaseModal from "./components/CreateDiseaseModal";
import ImportModal from "./components/ImportModal";
import UpdateDiseaseModal from "./components/UpdateDiseaseModal";

const DiseaseTypeColors: Record<string, string> = {
  "BỆNH NẤM": "green",
  "CÂY KHOẺ": "lime",
  "CÔN TRÙNG GÂY HẠI": "volcano",
  "BỆNH VI KHUẨN": "orange",
  "BỆNH VIRUS": "red",
  "BỆNH TẢO": "cyan",
  "DINH DƯỠNG": "blue",
};

const mdParser = new MarkdownIt();

const DiseaseManagement: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<Disease>();
  const [messageApi, contextHolder] = message.useMessage();

  const handleDelete = async (className: string) => {
    try {
      await deleteDisease(className);
      messageApi.success("Disease deleted successfully");
      actionRef.current?.reload();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to delete disease";
      messageApi.error(errorMsg);
    }
  };

  const columns: ProColumns<Disease>[] = [
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
      title: "Class Name",
      dataIndex: "class_name",
      copyable: true,
    },
    {
      title: "Type",
      dataIndex: "type",
      valueType: "select",
      valueEnum: {
        "BỆNH NẤM": { text: "Bệnh nấm" },
        "CÂY KHOẺ": { text: "Cây khỏe" },
        "CÔN TRÙNG GÂY HẠI": { text: "Côn trùng gây hại" },
        "BỆNH VI KHUẨN": { text: "Bệnh vi khuẩn" },
        "BỆNH VIRUS": { text: "Bệnh virus" },
        "BỆNH TẢO": { text: "Bệnh tảo" },
        "DINH DƯỠNG": { text: "Dinh dưỡng" },
      },
      render: (_, record) => (
        <Tag color={DiseaseTypeColors[record.type] || "default"}>
          {record.type?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Plant",
      dataIndex: "plant_name",
      hideInSearch: true,
    },
    {
      title: "Images",
      dataIndex: "image_link",
      hideInSearch: true,
      render: (_, record) => {
        const images = record.image_link || [];
        if (images.length === 0) return "-";
        return (
          <Image.PreviewGroup>
            <Space>
              {images.slice(0, 2).map((url, index) => (
                <Image
                  key={index}
                  src={url}
                  width={40}
                  height={40}
                  style={{ objectFit: "cover", borderRadius: 4 }}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgesGxwYGQHFAAA=="
                />
              ))}
              {images.length > 2 && (
                <span style={{ color: "#999" }}>+{images.length - 2}</span>
              )}
            </Space>
          </Image.PreviewGroup>
        );
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
        <UpdateDiseaseModal
          key="edit"
          disease={record}
          trigger={<Button type="text" size="small" icon={<EditOutlined />} />}
          onSuccess={() => actionRef.current?.reload()}
        />,
        <Popconfirm
          key="delete"
          title="Delete Disease"
          description="Are you sure you want to delete this disease?"
          onConfirm={() => handleDelete(record.class_name)}
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
      <ProTable<Disease>
        headerTitle="Disease List"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <ImportModal
            key="import"
            onSuccess={() => actionRef.current?.reload()}
          />,
          <CreateDiseaseModal
            key="create"
            onSuccess={() => actionRef.current?.reload()}
          />,
        ]}
        request={async (params, sort) => {
          try {
            const response = await getDiseases({
              page: params.current || 1,
              limit: params.pageSize || 10,
              search: params.name,
              type: params.type,
            });

            return {
              data: response.data.diseases,
              success: true,
              total: response.data.total,
            };
          } catch (error) {
            messageApi.error("Failed to fetch diseases");
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
          <ProDescriptions<Disease>
            column={1}
            dataSource={currentRow}
            columns={[
              { title: "Name", dataIndex: "name" },
              { title: "Class Name", dataIndex: "class_name" },
              {
                title: "Type",
                dataIndex: "type",
                render: (_, record) => (
                  <Tag color={DiseaseTypeColors[record.type] || "default"}>
                    {record.type?.toUpperCase()}
                  </Tag>
                ),
              },
              { title: "Plant", dataIndex: "plant_name" },
              {
                title: "Description",
                dataIndex: "description",
                render: (_, record) => (
                  <div
                    style={{
                      maxHeight: "300px",
                      overflow: "auto",
                      padding: "8px",
                      backgroundColor: "#fafafa",
                      borderRadius: "4px",
                      border: "1px solid #f0f0f0",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: mdParser.render(record.description || ""),
                    }}
                  />
                ),
              },
              {
                title: "Solution",
                dataIndex: "solution",
                render: (_, record) => (
                  <div
                    style={{
                      maxHeight: "300px",
                      overflow: "auto",
                      padding: "8px",
                      backgroundColor: "#fafafa",
                      borderRadius: "4px",
                      border: "1px solid #f0f0f0",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: mdParser.render(record.solution || ""),
                    }}
                  />
                ),
              },
              {
                title: "Images",
                dataIndex: "image_link",
                render: (_, record) => {
                  const images = record.image_link || [];
                  if (images.length === 0) return "-";
                  return (
                    <Image.PreviewGroup>
                      <Space wrap>
                        {images.map((url, index) => (
                          <Image
                            key={index}
                            src={url}
                            width={100}
                            height={100}
                            style={{ objectFit: "cover", borderRadius: 8 }}
                          />
                        ))}
                      </Space>
                    </Image.PreviewGroup>
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

export default DiseaseManagement;
