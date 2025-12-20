import { createPlant, CreatePlantParams } from "@/services/plant";
import { PlusOutlined } from "@ant-design/icons";
import {
  ModalForm,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import { Button, Form, Image, Input, message, Space } from "antd";
import React from "react";

interface CreatePlantModalProps {
  onSuccess?: () => void;
}

const CreatePlantModal: React.FC<CreatePlantModalProps> = ({ onSuccess }) => {
  return (
    <ModalForm<CreatePlantParams>
      title="Tạo cây trồng mới"
      trigger={
        <Button type="primary" icon={<PlusOutlined />}>
          Cây trồng mới
        </Button>
      }
      width={500}
      modalProps={{
        destroyOnClose: true,
      }}
      onFinish={async (values) => {
        try {
          await createPlant(values);
          message.success("Tạo cây trồng thành công!");
          onSuccess?.();
          return true;
        } catch (error: any) {
          const errorMsg =
            error?.response?.data?.error ||
            error?.message ||
            "Tạo cây trồng thất bại";
          message.error(errorMsg);
          return false;
        }
      }}
    >
      <ProFormText
        name="name"
        label="Tên cây trồng"
        placeholder="Nhập tên cây trồng"
        rules={[{ required: true, message: "Vui lòng nhập tên cây trồng" }]}
      />
      <ProFormTextArea
        name="description"
        label="Mô tả"
        placeholder="Mô tả về cây trồng"
        fieldProps={{
          rows: 4,
        }}
      />
      <Form.Item name="image_url" label="URL hình ảnh">
        <Space direction="vertical" style={{ width: "100%" }}>
          <Form.Item name="image_url" noStyle>
            <Input placeholder="https://example.com/plant.jpg" />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, curValues) =>
              prevValues.image_url !== curValues.image_url
            }
          >
            {({ getFieldValue }) => {
              const url = getFieldValue("image_url");
              return url ? (
                <Image
                  src={url}
                  width={120}
                  height={120}
                  style={{ objectFit: "cover", borderRadius: 8 }}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA0ElEQVR4nO3YsQ3CMBRF0RfFPduwBjuwCSOwCQOwBjtQQEMBShSJAln+tvQ7TpN/JV/ZQgghhBBC+EuA5vd68xyQGwArYAEcgR0wBhYqj4C1yhPSHjCqPCPtAcPKc9IeMKo8J+0Bw8pz0h4wqjwn7QHDynPSHjCqPCftAcPKc9IeMKo8J+0Bw8pz0h4wqjwn7QHDynPSHjCqPCftAcPKc9IeMKo8J+0Bw8pz0h4wqjwn7QHDynPSHjCqPCftAcPKc9IeMKq8BiBCCCGEEPgPXk8ZH1NM+1UAAAAASUVORK5CYII="
                />
              ) : null;
            }}
          </Form.Item>
        </Space>
      </Form.Item>
    </ModalForm>
  );
};

export default CreatePlantModal;
