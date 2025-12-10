import {
  Disease,
  updateDisease,
  UpdateDiseaseParams,
} from "@/services/disease";
import { createPlant, CreatePlantParams, getPlants } from "@/services/plant";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  ModalForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import {
  Button,
  Divider,
  Form,
  Image,
  Input,
  message,
  Modal,
  Space,
} from "antd";
import React, { useRef, useState } from "react";

interface UpdateDiseaseModalProps {
  disease: Disease;
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

const UpdateDiseaseModal: React.FC<UpdateDiseaseModalProps> = ({
  disease,
  trigger,
  onSuccess,
}) => {
  const [addPlantOpen, setAddPlantOpen] = useState(false);
  const [addingPlant, setAddingPlant] = useState(false);
  const [plantForm] = Form.useForm<CreatePlantParams>();
  const plantSelectRef = useRef<any>(null);

  // Convert image_link array to form format
  const initialImageLinks = (disease.image_link || []).map((url) => url);

  const handleAddPlant = async () => {
    try {
      const values = await plantForm.validateFields();

      setAddingPlant(true);
      await createPlant(values);
      message.success("Plant added successfully!");
      setAddPlantOpen(false);
      plantForm.resetFields();
      // Reload the plant options
      plantSelectRef.current?.reload?.();
    } catch (error: any) {
      if (error?.errorFields) {
        // Validation error, do nothing
        return;
      }
      const errorMsg =
        error?.response?.data?.error || error?.message || "Failed to add plant";
      message.error(errorMsg);
    } finally {
      setAddingPlant(false);
    }
  };

  return (
    <>
      <ModalForm<UpdateDiseaseParams & { image_urls: string[] }>
        title="Edit Disease"
        trigger={trigger}
        width={600}
        modalProps={{
          destroyOnClose: true,
        }}
        initialValues={{
          name: disease.name,
          class_name: disease.class_name,
          type: disease.type,
          plant_name: disease.plant_name,
          description: disease.description,
          solution: disease.solution,
          image_urls: initialImageLinks,
        }}
        onFinish={async (values) => {
          try {
            const imageLinks = (values.image_urls || []).filter(
              (link: string) => link?.trim()
            );

            await updateDisease(disease.id, {
              name: values.name,
              class_name: values.class_name,
              type: values.type,
              plant_name: values.plant_name,
              description: values.description,
              solution: values.solution,
              image_link: imageLinks,
            });

            message.success("Disease updated successfully!");
            onSuccess?.();
            return true;
          } catch (error: any) {
            const errorMsg =
              error?.response?.data?.error ||
              error?.message ||
              "Failed to update disease";
            message.error(errorMsg);
            return false;
          }
        }}
      >
        <ProFormText
          name="name"
          label="Disease Name"
          placeholder="Enter disease name"
          rules={[{ required: true, message: "Please enter disease name" }]}
        />
        <ProFormText
          name="class_name"
          label="Class Name"
          placeholder="e.g., leaf_spot"
          rules={[{ required: true, message: "Please enter class name" }]}
          tooltip="Unique identifier for the disease (used in ML model)"
        />
        <ProFormSelect
          name="type"
          label="Disease Type"
          placeholder="Select disease type"
          rules={[{ required: true, message: "Please select disease type" }]}
          options={[
            { label: "Bệnh nấm", value: "BỆNH NẤM" },
            { label: "Cây khỏe", value: "CÂY KHOẺ" },
            { label: "Côn trùng gây hại", value: "CÔN TRÙNG GÂY HẠI" },
            { label: "Bệnh vi khuẩn", value: "BỆNH VI KHUẨN" },
            { label: "Bệnh virus", value: "BỆNH VIRUS" },
            { label: "Bệnh tảo", value: "BỆNH TẢO" },
            { label: "Dinh dưỡng", value: "DINH DƯỠNG" },
          ]}
        />
        <ProFormSelect
          name="plant_name"
          label="Plant Name"
          placeholder="Select a plant"
          showSearch
          fieldProps={{
            ref: plantSelectRef,
            dropdownRender: (menu) => (
              <>
                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  style={{ width: "100%", textAlign: "left", marginBottom: 4 }}
                  onClick={() => setAddPlantOpen(true)}
                >
                  Add new plant
                </Button>
                <Divider style={{ margin: "4px 0" }} />
                {menu}
              </>
            ),
          }}
          request={async () => {
            try {
              const response = await getPlants();
              return (response.data.plants || []).map((plant) => ({
                label: plant.name,
                value: plant.name,
              }));
            } catch {
              return [];
            }
          }}
        />
        <ProFormTextArea
          name="description"
          label="Description"
          placeholder="Describe the disease symptoms and characteristics"
          fieldProps={{
            rows: 4,
          }}
        />
        <ProFormTextArea
          name="solution"
          label="Treatment/Solution"
          placeholder="Describe how to treat or prevent this disease"
          fieldProps={{
            rows: 4,
          }}
        />

        {/* Custom Image URL List with Preview */}
        <Form.Item label="Image URLs">
          <Form.List name="image_urls">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Form.Item key={key} style={{ marginBottom: 8 }}>
                    <Space align="start" style={{ width: "100%" }}>
                      <Form.Item
                        {...restField}
                        name={name}
                        noStyle
                        shouldUpdate
                      >
                        <Input
                          placeholder="https://example.com/image.jpg"
                          style={{ width: 350 }}
                        />
                      </Form.Item>
                      <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, curValues) =>
                          prevValues.image_urls?.[name] !==
                          curValues.image_urls?.[name]
                        }
                      >
                        {({ getFieldValue }) => {
                          const url = getFieldValue(["image_urls", name]);
                          return url ? (
                            <Image
                              src={url}
                              width={60}
                              height={60}
                              style={{ objectFit: "cover", borderRadius: 4 }}
                              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA0ElEQVR4nO3YsQ3CMBRF0RfFPduwBjuwCSOwCQOwBjtQQEMBShSJAln+tvQ7TpN/JV/ZQgghhBBC+EuA5vd68xyQGwArYAEcgR0wBhYqj4C1yhPSHjCqPCPtAcPKc9IeMKo8J+0Bw8pz0h4wqjwn7QHDynPSHjCqPCftAcPKc9IeMKo8J+0Bw8pz0h4wqjwn7QHDynPSHjCqPCftAcPKc9IeMKo8J+0Bw8pz0h4wqjwn7QHDynPSHjCqPCftAcPKc9IeMKq8BiBCCCGEEPgPXk8ZH1NM+1UAAAAASUVORK5CYII="
                            />
                          ) : null;
                        }}
                      </Form.Item>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      />
                    </Space>
                  </Form.Item>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add("")}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Image URL
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>
      </ModalForm>

      {/* Add Plant Modal - Full Form */}
      <Modal
        title="Add New Plant"
        open={addPlantOpen}
        onCancel={() => {
          setAddPlantOpen(false);
          plantForm.resetFields();
        }}
        onOk={handleAddPlant}
        confirmLoading={addingPlant}
        okText="Add Plant"
        width={500}
      >
        <Form form={plantForm} layout="vertical">
          <Form.Item
            name="name"
            label="Plant Name"
            rules={[{ required: true, message: "Please enter plant name" }]}
          >
            <Input placeholder="Enter plant name" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Describe the plant" />
          </Form.Item>
          <Form.Item name="image_url" label="Image URL">
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
                <Form.Item label="Preview">
                  <Image
                    src={url}
                    width={120}
                    height={120}
                    style={{ objectFit: "cover", borderRadius: 8 }}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA0ElEQVR4nO3YsQ3CMBRF0RfFPduwBjuwCSOwCQOwBjtQQEMBShSJAln+tvQ7TpN/JV/ZQgghhBBC+EuA5vd68xyQGwArYAEcgR0wBhYqj4C1yhPSHjCqPCPtAcPKc9IeMKo8J+0Bw8pz0h4wqjwn7QHDynPSHjCqPCftAcPKc9IeMKo8J+0Bw8pz0h4wqjwn7QHDynPSHjCqPCftAcPKc9IeMKo8J+0Bw8pz0h4wqjwn7QHDynPSHjCqPCftAcPKc9IeMKq8BiBCCCGEEPgPXk8ZH1NM+1UAAAAASUVORK5CYII="
                  />
                </Form.Item>
              ) : null;
            }}
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UpdateDiseaseModal;
