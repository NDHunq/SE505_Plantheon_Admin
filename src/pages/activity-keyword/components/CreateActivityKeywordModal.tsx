import {
  createActivityKeyword,
  CreateActivityKeywordParams,
  setKeywordsForDisease,
} from "@/services/activityKeyword";
import { getDiseases } from "@/services/disease";
import { PlusOutlined } from "@ant-design/icons";
import {
  ModalForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import { Button, message } from "antd";
import React, { useEffect, useState } from "react";

interface CreateActivityKeywordModalProps {
  onSuccess?: () => void;
}

const CreateActivityKeywordModal: React.FC<CreateActivityKeywordModalProps> = ({
  onSuccess,
}) => {
  const [diseases, setDiseases] = useState<{ label: string; value: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const response = await getDiseases({ page: 1, limit: 1000 });
        const diseaseOptions = response.data.diseases.map((d) => ({
          label: d.name,
          value: d.id,
        }));
        setDiseases(diseaseOptions);
      } catch (error) {
        message.error("Không thể tải danh sách bệnh");
      }
    };
    fetchDiseases();
  }, []);
  return (
    <ModalForm<CreateActivityKeywordParams>
      title="Tạo Từ Khóa Hoạt Động Mới"
      trigger={
        <Button type="primary" icon={<PlusOutlined />}>
          Từ Khóa Mới
        </Button>
      }
      width={600}
      modalProps={{
        destroyOnClose: true,
      }}
      initialValues={{
        base_days_offset: 0,
        hour_time: 8,
        time_duration: 2,
      }}
      onFinish={async (values) => {
        try {
          setLoading(true);
          // Create the activity keyword
          const response = await createActivityKeyword(values);
          const newKeywordId = response.data.id;

          // If diseases are selected, create disease-keyword relationships
          if (values.disease_ids && values.disease_ids.length > 0) {
            // For each disease, add the keyword to that disease
            await Promise.all(
              values.disease_ids.map((diseaseId: string) =>
                setKeywordsForDisease(diseaseId, [newKeywordId])
              )
            );
          }

          message.success("Cập nhật từ khóa hoạt động thành công!");
          onSuccess?.();
          return true;
        } catch (error: any) {
          const errorMsg =
            error?.response?.data?.error ||
            error?.message ||
            "Không thể tạo từ khóa hoạt động";
          message.error(errorMsg);
          return false;
        } finally {
          setLoading(false);
        }
      }}
    >
      <ProFormText
        name="name"
        label="Tên Từ Khóa"
        placeholder="Ví dụ: Phun thuốc trừ sâu"
        rules={[{ required: true, message: "Vui lòng nhập tên từ khóa" }]}
      />
      <ProFormSelect
        name="type"
        label="Loại Từ Khóa"
        placeholder="Vui lòng chọn loại từ khóa"
        rules={[{ required: true, message: "Vui lòng chọn loại từ khóa" }]}
        options={[
          { label: "Kỹ Thuật", value: "TECHNIQUE" },
          { label: "Khí Hậu", value: "CLIMATE" },
          { label: "Bệnh", value: "DISEASE" },
          { label: "Khác", value: "OTHER" },
          { label: "Chi Phí", value: "EXPENSE" },
          { label: "Thu Nhập", value: "INCOME" },
        ]}
      />
      <ProFormTextArea
        name="description"
        label="Mô Tả"
        placeholder="Mô tả hoạt động"
        fieldProps={{
          rows: 3,
        }}
      />
      <ProFormDigit
        name="base_days_offset"
        label="Số Ngày Lệch"
        tooltip="Khoảng cách giữa ngày thực hiện hoạt động và ngày quét bệnh"
        min={0}
        fieldProps={{ precision: 0 }}
      />
      <ProFormDigit
        name="hour_time"
        label="Giờ Bắt Đầu"
        tooltip="Giờ bắt đầu (0-23)"
        min={0}
        max={23}
        fieldProps={{ precision: 0 }}
      />
      <ProFormDigit
        name="time_duration"
        label="Thời Lượng (giờ)"
        tooltip="Thời lượng tính bằng giờ"
        min={0}
        fieldProps={{ precision: 0, step: 0.5 }}
      />
      <ProFormSelect
        name="disease_ids"
        label="Bệnh Liên Kết"
        placeholder="Chọn bệnh"
        mode="multiple"
        options={diseases}
        fieldProps={{
          loading: diseases.length === 0,
          showSearch: true,
          filterOption: (input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase()),
        }}
      />
    </ModalForm>
  );
};

export default CreateActivityKeywordModal;
