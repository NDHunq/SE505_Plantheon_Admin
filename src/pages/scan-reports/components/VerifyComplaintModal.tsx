import { Complaint, verifyComplaint } from "@/services/complaint";
import { Modal, Form, Input, message, Image, Descriptions, Tag } from "antd";
import React, { useState } from "react";
import DiseaseSelector from "./DiseaseSelector";

interface VerifyComplaintModalProps {
  complaint: Complaint;
  trigger: React.ReactNode;
  onSuccess: () => void;
}

const VerifyComplaintModal: React.FC<VerifyComplaintModalProps> = ({
  complaint,
  trigger,
  onSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await verifyComplaint(complaint.id, {
        verified_disease_id: values.verified_disease_id,
        is_verified: true,
        admin_notes: values.admin_notes,
      });

      messageApi.success("Xác minh complaint thành công");
      setOpen(false);
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.error ||
        error?.message ||
        "Xác minh thất bại";
      messageApi.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <Modal
        title="Xác minh Scan Complaint"
        open={open}
        onOk={handleSubmit}
        onCancel={() => {
          setOpen(false);
          form.resetFields();
        }}
        confirmLoading={loading}
        okText="Xác minh"
        cancelText="Hủy"
        width={800}
      >
        <div style={{ marginBottom: 24 }}>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Ảnh scan">
              {complaint.image_url ? (
                <Image
                  src={complaint.image_url}
                  alt="Scan"
                  style={{ maxWidth: "100%", maxHeight: 300 }}
                />
              ) : (
                "-"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="AI Prediction">
              {complaint.predicted_disease ? (
                <div>
                  <div style={{ fontWeight: 500 }}>
                    {complaint.predicted_disease.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    {complaint.predicted_disease.plant_name} - {complaint.predicted_disease.type}
                  </div>
                </div>
              ) : (
                complaint.predicted_disease_id || "-"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="User Suggestion">
              {complaint.user_suggested_disease ? (
                <div>
                  <div style={{ fontWeight: 500 }}>
                    {complaint.user_suggested_disease.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    {complaint.user_suggested_disease.plant_name} - {complaint.user_suggested_disease.type}
                  </div>
                </div>
              ) : (
                complaint.user_suggested_disease_id || "-"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Confidence Score">
              {complaint.confidence_score ? (
                <Tag color={complaint.confidence_score > 0.7 ? "green" : "orange"}>
                  {(complaint.confidence_score * 100).toFixed(1)}%
                </Tag>
              ) : (
                "-"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Nội dung complaint">
              {complaint.content || "-"}
            </Descriptions.Item>
          </Descriptions>
        </div>

        <Form form={form} layout="vertical">
          <Form.Item
            name="verified_disease_id"
            label="Chọn bệnh cây chính xác (Ground Truth)"
            rules={[{ required: true, message: "Vui lòng chọn bệnh cây" }]}
          >
            <DiseaseSelector placeholder="Chọn bệnh cây đúng..." />
          </Form.Item>

          <Form.Item
            name="admin_notes"
            label="Ghi chú của Admin"
            rules={[{ max: 1000, message: "Ghi chú tối đa 1000 ký tự" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập ghi chú về việc xác minh..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default VerifyComplaintModal;
