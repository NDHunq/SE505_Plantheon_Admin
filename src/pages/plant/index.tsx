import { deletePlant, getPlants, Plant } from "@/services/plant";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import {
  PageContainer,
  ProDescriptions,
  ProTable,
} from "@ant-design/pro-components";
import { Button, Drawer, Image, message, Popconfirm } from "antd";
import React, { useRef, useState } from "react";
import CreatePlantModal from "./components/CreatePlantModal";
import UpdatePlantModal from "./components/UpdatePlantModal";

const PlantManagement: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<Plant>();
  const [messageApi, contextHolder] = message.useMessage();

  const handleDelete = async (id: string) => {
    try {
      await deletePlant(id);
      messageApi.success("Xóa cây trồng thành công");
      actionRef.current?.reload();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.error ||
        error?.message ||
        "Xóa cây trồng thất bại";
      messageApi.error(errorMsg);
    }
  };

  const columns: ProColumns<Plant>[] = [
    {
      title: "Hình ảnh",
      dataIndex: "image_url",
      hideInSearch: true,
      width: 80,
      render: (_, record) =>
        record.image_url ? (
          <Image
            src={record.image_url}
            width={50}
            height={50}
            style={{ objectFit: "cover", borderRadius: 4 }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA0ElEQVR4nO3YsQ3CMBRF0RfFPduwBjuwCSOwCQOwBjtQQEMBShSJAln+tvQ7TpN/JV/ZQgghhBBC+EuA5vd68xyQGwArYAEcgR0wBhYqj4C1yhPSHjCqPCPtAcPKc9IeMKo8J+0Bw8pz0h4wqjwn7QHDynPSHjCqPCftAcPKc9IeMKo8J+0Bw8pz0h4wqjwn7QHDynPSHjCqPCftAcPKc9IeMKo8J+0Bw8pz0h4wqjwn7QHDynPSHjCqPCftAcPKc9IeMKq8BiBCCCGEEPgPXk8ZH1NM+1UAAAAASUVORK5CYII="
          />
        ) : (
          "-"
        ),
    },
    {
      title: "Tên",
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
      title: "Mô tả",
      dataIndex: "description",
      hideInSearch: true,
      ellipsis: true,
      width: 300,
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      valueType: "dateTime",
      hideInSearch: true,
      sorter: true,
    },
    {
      title: "Thao tác",
      dataIndex: "option",
      valueType: "option",
      width: 120,
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
        <UpdatePlantModal
          key="edit"
          plant={record}
          trigger={<Button type="text" size="small" icon={<EditOutlined />} />}
          onSuccess={() => actionRef.current?.reload()}
        />,
        <Popconfirm
          key="delete"
          title="Xóa cây trồng"
          description="Bạn có chắc chắn muốn xóa cây trồng này?"
          onConfirm={() => handleDelete(record.id)}
          okText="Có"
          cancelText="Không"
        >
          <Button type="text" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      {contextHolder}
      <ProTable<Plant>
        headerTitle="Danh sách cây trồng"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <CreatePlantModal
            key="create"
            onSuccess={() => actionRef.current?.reload()}
          />,
        ]}
        request={async (params) => {
          try {
            const response = await getPlants();
            let plants = response.data.plants || [];

            // Client-side search by name
            if (params.name) {
              plants = plants.filter((p) =>
                p.name.toLowerCase().includes(params.name.toLowerCase())
              );
            }

            return {
              data: plants,
              success: true,
              total: plants.length,
            };
          } catch (error) {
            messageApi.error("Tải danh sách cây trồng thất bại");
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
        width={500}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={true}
        title={currentRow?.name}
      >
        {currentRow && (
          <ProDescriptions<Plant>
            column={1}
            dataSource={currentRow}
            columns={[
              { title: "Tên", dataIndex: "name" },
              {
                title: "Mô tả",
                dataIndex: "description",
                valueType: "text",
              },
              {
                title: "Hình ảnh",
                dataIndex: "image_url",
                render: (_, record) =>
                  record.image_url ? (
                    <Image
                      src={record.image_url}
                      width={200}
                      style={{ borderRadius: 8 }}
                    />
                  ) : (
                    "-"
                  ),
              },
              {
                title: "Ngày tạo",
                dataIndex: "created_at",
                valueType: "dateTime",
              },
              {
                title: "Ngày cập nhật",
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

export default PlantManagement;
