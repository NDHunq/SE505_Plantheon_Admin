import MarkdownEditor from "@/components/MarkdownEditor";
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
import MdEditor from "react-markdown-editor-lite";
import MarkdownIt from "markdown-it";
import "react-markdown-editor-lite/lib/index.css";

// Initialize markdown parser
const mdParser = new MarkdownIt();

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
  const [descriptionContent, setDescriptionContent] = useState<string>(
    disease.description || ""
  );
  const [solutionContent, setSolutionContent] = useState<string>(
    disease.solution || ""
  );

  // Convert image_link array to form format
  const initialImageLinks = (disease.image_link || []).map((url) => url);

  const handleAddPlant = async () => {
    try {
      const values = await plantForm.validateFields();

      setAddingPlant(true);
      await createPlant(values);
      message.success("Thêm cây trồng thành công!");
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
        title="Chỉnh sửa bệnh cây"
        trigger={trigger}
        width={800}
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
              description: descriptionContent,
              solution: solutionContent,
              image_link: imageLinks,
            });

            message.success("Cập nhật bệnh cây thành công!");
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
          label="Tên bệnh"
          placeholder="Nhập tên bệnh"
          rules={[{ required: true, message: "Vui lòng nhập tên bệnh" }]}
        />
        <ProFormText
          name="class_name"
          label="Tên lớp"
          placeholder="Ví dụ: leaf_spot"
          rules={[{ required: true, message: "Vui lòng nhập tên lớp" }]}
          tooltip="Mã định danh duy nhất cho bệnh (dùng trong mô hình ML)"
        />
        <ProFormSelect
          name="type"
          label="Loại bệnh"
          placeholder="Chọn loại bệnh"
          rules={[{ required: true, message: "Vui lòng chọn loại bệnh" }]}
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
          label="Tên cây trồng"
          placeholder="Chọn cây trồng"
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
                  Thêm cây trồng mới
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
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
            Mô tả
          </label>
          <MdEditor
            value={descriptionContent}
            style={{ height: "250px" }}
            renderHTML={(text) => mdParser.render(text)}
            onChange={({ text }) => setDescriptionContent(text)}
            placeholder="Mô tả triệu chứng và đặc điểm của bệnh (hỗ trợ markdown)..."
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
            Giải pháp/Cách điều trị
          </label>
          <MdEditor
            value={solutionContent}
            style={{ height: "250px" }}
            renderHTML={(text) => mdParser.render(text)}
            onChange={({ text }) => setSolutionContent(text)}
            placeholder="Mô tả cách điều trị hoặc phòng ngừa bệnh (hỗ trợ markdown)..."
          />
        </div>

        {/* Custom Image URL List with Preview */}
        <Form.Item label="URL hình ảnh">
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
                    Thêm URL hình ảnh
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>
      </ModalForm>

      {/* Add Plant Modal - Full Form */}
      <Modal
        title="Thêm cây trồng mới"
        open={addPlantOpen}
        onCancel={() => {
          setAddPlantOpen(false);
          plantForm.resetFields();
        }}
        onOk={handleAddPlant}
        confirmLoading={addingPlant}
        okText="Thêm cây trồng"
        cancelText="Hủy"
        width={500}
      >
        <Form form={plantForm} layout="vertical">
          <Form.Item
            name="name"
            label="Tên cây trồng"
            rules={[{ required: true, message: "Vui lòng nhập tên cây trồng" }]}
          >
            <Input placeholder="Nhập tên cây trồng" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả cây trồng" />
          </Form.Item>
          <Form.Item name="image_url" label="URL hình ảnh">
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
                <Form.Item label="Xem trước">
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
