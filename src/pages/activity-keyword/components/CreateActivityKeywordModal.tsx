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
        message.error("Failed to load diseases");
      }
    };
    fetchDiseases();
  }, []);
  return (
    <ModalForm<CreateActivityKeywordParams>
      title="Create New Activity Keyword"
      trigger={
        <Button type="primary" icon={<PlusOutlined />}>
          New Keyword
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
            "Failed to create activity keyword";
          message.error(errorMsg);
          return false;
        } finally {
          setLoading(false);
        }
      }}
    >
      <ProFormText
        name="name"
        label="Keyword Name"
        placeholder="e.g., Phun thuốc trừ sâu"
        rules={[{ required: true, message: "Please enter keyword name" }]}
      />
      <ProFormSelect
        name="type"
        label="Keyword Type"
        placeholder="Select keyword type"
        rules={[{ required: true, message: "Please select keyword type" }]}
        options={[
          { label: "Technique", value: "TECHNIQUE" },
          { label: "Climate", value: "CLIMATE" },
          { label: "Disease", value: "DISEASE" },
          { label: "Other", value: "OTHER" },
          { label: "Expense", value: "EXPENSE" },
          { label: "Income", value: "INCOME" },
        ]}
      />
      <ProFormTextArea
        name="description"
        label="Description"
        placeholder="Describe the activity"
        fieldProps={{
          rows: 3,
        }}
      />
      <ProFormDigit
        name="base_days_offset"
        label="Base Days Offset"
        tooltip="Number of days offset for scheduling"
        min={0}
        fieldProps={{ precision: 0 }}
      />
      <ProFormDigit
        name="hour_time"
        label="Start Hour"
        tooltip="Start hour (0-23)"
        min={0}
        max={23}
        fieldProps={{ precision: 0 }}
      />
      <ProFormDigit
        name="time_duration"
        label="Duration (hours)"
        tooltip="Duration in hours"
        min={0}
        fieldProps={{ precision: 0, step: 0.5 }}
      />
      <ProFormSelect
        name="disease_ids"
        label="Linked Diseases"
        placeholder="Select diseases"
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
