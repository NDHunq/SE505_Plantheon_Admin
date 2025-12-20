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
      title="Cập Nhật Trạng Thái Báo Cáo"
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

          message.success("Cập nhật trạng thái báo cáo thành công!");
          onSuccess?.();
          return true;
        } catch (error: any) {
          const errorMsg =
            error?.response?.data?.error ||
            error?.message ||
            "Không thể cập nhật trạng thái báo cáo";
          message.error(errorMsg);
          return false;
        }
      }}
    >
      <ProFormSelect
        name="status"
        label="Trạng Thái"
        placeholder="Chọn trạng thái"
        rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
        options={COMPLAINT_STATUSES.map((s) => ({
          label: s.label,
          value: s.value,
        }))}
      />
      <ProFormTextArea
        name="admin_notes"
        label="Ghi Chú Của Quản Trị Viên"
        placeholder="Thêm ghi chú về việc giải quyết báo cáo này (tùy chọn)"
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
