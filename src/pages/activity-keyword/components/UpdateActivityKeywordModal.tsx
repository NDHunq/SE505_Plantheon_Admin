import {
  ActivityKeyword,
  getDiseasesForKeyword,
  setKeywordsForDisease,
  updateActivityKeyword,
  UpdateActivityKeywordParams,
} from "@/services/activityKeyword";
import { getDiseases } from "@/services/disease";
import {
  ModalForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import { message } from "antd";
import React, { useEffect, useState } from "react";

interface UpdateActivityKeywordModalProps {
  keyword: ActivityKeyword;
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

const UpdateActivityKeywordModal: React.FC<UpdateActivityKeywordModalProps> = ({
  keyword,
  trigger,
  onSuccess,
}) => {
  const [diseases, setDiseases] = useState<{ label: string; value: string }[]>(
    []
  );
  const [currentDiseaseIds, setCurrentDiseaseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all diseases
        const diseaseResponse = await getDiseases({ page: 1, limit: 1000 });
        const diseaseOptions = diseaseResponse.data.diseases.map((d) => ({
          label: d.name,
          value: d.id,
        }));
        setDiseases(diseaseOptions);

        // Fetch current diseases for this keyword
        const currentDiseasesResponse = await getDiseasesForKeyword(keyword.id);
        const currentIds = currentDiseasesResponse.data.map((d) => d.id);
        setCurrentDiseaseIds(currentIds);
      } catch (error) {
        message.error("Không thể tải danh sách bệnh");
      }
    };
    fetchData();
  }, [keyword.id]);
  return (
    <ModalForm<UpdateActivityKeywordParams>
      title="Cập Nhật Từ Khóa Hoạt Động"
      trigger={trigger}
      width={600}
      modalProps={{
        destroyOnClose: true,
      }}
      initialValues={{
        name: keyword.name,
        description: keyword.description,
        type: keyword.type,
        base_days_offset: keyword.base_days_offset,
        hour_time: keyword.hour_time,
        time_duration: keyword.time_duration,
        disease_ids: currentDiseaseIds,
      }}
      onFinish={async (values) => {
        try {
          setLoading(true);
          // Update the activity keyword
          await updateActivityKeyword(keyword.id, values);

          // Update disease-keyword relationships if diseases changed
          if (values.disease_ids) {
            // For each disease, set the keyword
            await Promise.all(
              values.disease_ids.map((diseaseId: string) =>
                setKeywordsForDisease(diseaseId, [keyword.id])
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
            "Không thể cập nhật từ khóa hoạt động";
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
        placeholder="Chọn loại từ khóa"
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

export default UpdateActivityKeywordModal;
