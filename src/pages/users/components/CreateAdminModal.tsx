import { registerAdmin, RegisterAdminParams } from "@/services/auth";
import { UserOutlined } from "@ant-design/icons";
import { ModalForm, ProFormText } from "@ant-design/pro-components";
import { Button, message } from "antd";
import React, { useState } from "react";

interface CreateAdminModalProps {
  onSuccess?: () => void;
}

const CreateAdminModal: React.FC<CreateAdminModalProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);

  return (
    <ModalForm<RegisterAdminParams & { confirmPassword: string }>
      title="Tạo Tài Khoản Admin"
      trigger={
        <Button type="primary" icon={<UserOutlined />}>
          Tạo Admin
        </Button>
      }
      width={500}
      modalProps={{
        destroyOnClose: true,
      }}
      submitter={{
        submitButtonProps: { loading },
      }}
      onFinish={async (values) => {
        try {
          setLoading(true);
          const { confirmPassword, ...params } = values;

          if (params.password !== confirmPassword) {
            message.error("Mật khẩu xác nhận không khớp!");
            return false;
          }

          await registerAdmin(params);
          message.success("Tạo tài khoản admin thành công!");
          onSuccess?.();
          return true;
        } catch (error: any) {
          const errorMsg =
            error?.response?.data?.error ||
            error?.response?.data?.message ||
            error?.message ||
            "Không thể tạo tài khoản admin";
          message.error(errorMsg);
          return false;
        } finally {
          setLoading(false);
        }
      }}
    >
      <ProFormText
        name="email"
        label="Email"
        placeholder="admin@example.com"
        rules={[
          { required: true, message: "Vui lòng nhập email" },
          { type: "email", message: "Email không hợp lệ" },
        ]}
      />
      <ProFormText
        name="username"
        label="Tên đăng nhập"
        placeholder="admin_username"
        rules={[
          { required: true, message: "Vui lòng nhập tên đăng nhập" },
          { min: 3, message: "Tên đăng nhập phải có ít nhất 3 ký tự" },
        ]}
      />
      <ProFormText
        name="full_name"
        label="Họ và tên"
        placeholder="Nguyễn Văn A"
        rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
      />
      <ProFormText.Password
        name="password"
        label="Mật khẩu"
        placeholder="Nhập mật khẩu"
        rules={[
          { required: true, message: "Vui lòng nhập mật khẩu" },
          { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
        ]}
      />
      <ProFormText.Password
        name="confirmPassword"
        label="Xác nhận mật khẩu"
        placeholder="Nhập lại mật khẩu"
        rules={[
          { required: true, message: "Vui lòng xác nhận mật khẩu" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
            },
          }),
        ]}
      />
    </ModalForm>
  );
};

export default CreateAdminModal;
