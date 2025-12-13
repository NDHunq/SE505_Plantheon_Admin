import {
  Complaint,
  COMPLAINT_STATUSES,
  updateComplaintStatus,
  UpdateComplaintStatusParams,
} from "@/services/complaint";
import {
  ModalForm,
  ProFormSelect,
  ProFormTextArea,
} from "@ant-design/pro-components";
import { message } from "antd";
import React from "react";

interface UpdateComplaintStatusModalProps {
  complaint: Complaint;
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

const UpdateComplaintStatusModal: React.FC<UpdateComplaintStatusModalProps> = ({
  complaint,
  trigger,
  onSuccess,
}) => {
  return (
    <ModalForm<UpdateComplaintStatusParams>
      title="Update Complaint Status"
      trigger={trigger}
      width={500}
      modalProps={{
        destroyOnClose: true,
      }}
      initialValues={{
        status: complaint.status,
        admin_notes: complaint.admin_notes || "",
      }}
      onFinish={async (values) => {
        try {
          await updateComplaintStatus(complaint.id, {
            status: values.status,
            admin_notes: values.admin_notes,
          });

          message.success("Cập nhật trạng thái khiếu nại thành công!");
          onSuccess?.();
          return true;
        } catch (error: any) {
          const errorMsg =
            error?.response?.data?.error ||
            error?.message ||
            "Failed to update complaint status";
          message.error(errorMsg);
          return false;
        }
      }}
    >
      <ProFormSelect
        name="status"
        label="Status"
        placeholder="Select status"
        rules={[{ required: true, message: "Please select a status" }]}
        options={COMPLAINT_STATUSES.map((s) => ({
          label: s.label,
          value: s.value,
        }))}
      />
      <ProFormTextArea
        name="admin_notes"
        label="Admin Notes"
        placeholder="Add notes about this complaint resolution (optional)"
        fieldProps={{
          rows: 4,
          maxLength: 1000,
          showCount: true,
        }}
      />
    </ModalForm>
  );
};

export default UpdateComplaintStatusModal;
