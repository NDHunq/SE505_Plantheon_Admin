import {
  AdminUser,
  disableAdminUser,
  enableAdminUser,
  getAdminUsers,
  updateAdminUser,
} from "@/services/adminUser";
import {
  CheckCircleOutlined,
  EditOutlined,
  EyeOutlined,
  StopOutlined,
} from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import {
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormText,
  ProTable,
} from "@ant-design/pro-components";
import { Button, Drawer, Image, message, Popconfirm, Tag } from "antd";
import React, { useRef, useState } from "react";
import CreateAdminModal from "./components/CreateAdminModal";

const getActiveFlag = (user?: Partial<AdminUser>) => {
  if (user?.is_active !== undefined) return Boolean(user.is_active);
  if (user && (user as any).is_disabled !== undefined) {
    return !Boolean((user as any).is_disabled);
  }
  if (user && (user as any).disabled !== undefined) {
    return !Boolean((user as any).disabled);
  }
  if (user && (user as any).isDisabled !== undefined) {
    return !Boolean((user as any).isDisabled);
  }
  return true;
};

const UserManagement: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<AdminUser>();
  const [editingUser, setEditingUser] = useState<AdminUser>();
  const [messageApi, contextHolder] = message.useMessage();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const handleToggleStatus = async (user: AdminUser) => {
    const currentlyActive = getActiveFlag(user);
    const action = currentlyActive ? disableAdminUser : enableAdminUser;
    const successMsg = currentlyActive
      ? "Vô hiệu hóa người dùng thành công"
      : "Kích hoạt người dùng thành công";
    const errorFallback = currentlyActive
      ? "Không thể vô hiệu hóa người dùng"
      : "Không thể kích hoạt người dùng";

    try {
      setTogglingId(user.id);
      await action(user.id);
      messageApi.success(successMsg);

      if (currentRow?.id === user.id) {
        setCurrentRow({
          ...currentRow,
          is_active: !currentlyActive,
          is_disabled: currentlyActive,
        });
      }
      actionRef.current?.reload();
    } catch (error: any) {
      const status = error?.response?.status;
      const errorMsg =
        status === 0
          ? "Không thể kết nối máy chủ (mạng/CORS). Kiểm tra máy chủ API hoặc CORS cho PATCH /admin/users/:id/disable."
          : error?.response?.data?.message || error?.message || errorFallback;
      messageApi.error(errorMsg);
    } finally {
      setTogglingId(null);
    }
  };

  const columns: ProColumns<AdminUser>[] = [
    {
      title: "Ảnh Đại Diện",
      dataIndex: "avatar",
      hideInSearch: true,
      width: 80,
      render: (_, record) =>
        record.avatar ? (
          <Image
            src={record.avatar}
            width={48}
            height={48}
            style={{ objectFit: "cover", borderRadius: 4 }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA0ElEQVR4nO3YsQ3CMBRF0RfFPduwBjuwCSOwCQOwBjtQQEMBShSJAln+tvQ7TpN/JV/ZQgghhBBC+EuA5vd68xyQGwArYAEcgR0wBhYqj4C1yhPSHjCqPCPtAcPKc9IeMKo8J+0Bw8pz0h4wqjwn7QHDynPSHjCqPCftAcPKc9IeMKo8J+0Bw8pz0h4wqjwn7QHDynPSHjCqPCftAcPKc9IeMKo8J+0Bw8pz0h4wqjwn7QHDynPSHjCqPCftAcPKc9IeMKo8J+0Bw8pz0h4wqjwn7QHDynPSHjCqPCftAcPKc9IeMKq8BiBCCCGEEPgPXk8ZH1NM+1UAAAAASUVORK5CYII="
          />
        ) : (
          "-"
        ),
    },
    {
      title: "Họ Tên",
      dataIndex: "full_name",
      render: (dom, entity) => (
        <a
          onClick={() => {
            setCurrentRow(entity);
            setShowDetail(true);
          }}
        >
          {dom || "-"}
        </a>
      ),
    },
    {
      title: "Tên Đăng Nhập",
      dataIndex: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      copyable: true,
    },
    {
      title: "Vai Trò",
      dataIndex: "role",
      valueType: "select",
      valueEnum: {
        admin: { text: "Quản Trị Viên" },
        user: { text: "Người Dùng" },
      },
    },
    {
      title: "Trạng Thái",
      dataIndex: "is_active",
      valueType: "select",
      valueEnum: {
        true: { text: "Hoạt Động", status: "Success" },
        false: { text: "Không Hoạt Động", status: "Error" },
      },
      render: (_, record) => {
        const active = getActiveFlag(record);
        return (
          <Tag color={active ? "green" : "red"}>
            {active ? "Hoạt Động" : "Không Hoạt Động"}
          </Tag>
        );
      },
    },
    {
      title: "Ngày Tạo",
      dataIndex: "created_at",
      valueType: "dateTime",
      hideInSearch: true,
      sorter: true,
    },
    {
      title: "Hành Động",
      dataIndex: "option",
      valueType: "option",
      width: 190,
      render: (_, record) => {
        const active = getActiveFlag(record);
        return [
          <Button
            key="view"
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setCurrentRow(record);
              setShowDetail(true);
            }}
          />,
          <ModalForm
            key="edit"
            title="Chỉnh Sửa Người Dùng"
            trigger={
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => setEditingUser(record)}
              />
            }
            initialValues={record}
            modalProps={{
              destroyOnClose: true,
              onCancel: () => setEditingUser(undefined),
            }}
            open={editingUser?.id === record.id}
            submitter={{
              submitButtonProps: { loading: saving },
            }}
            onFinish={async (values) => {
              try {
                setSaving(true);
                const payload = Object.fromEntries(
                  Object.entries(values).filter(
                    ([, v]) => v !== undefined && v !== null && v !== ""
                  )
                );
                await updateAdminUser(record.id, payload);
                messageApi.success("Cập nhật người dùng thành công");
                setEditingUser(undefined);
                actionRef.current?.reload();
                return true;
              } catch (error: any) {
                const errorMsg =
                  error?.response?.data?.message ||
                  error?.message ||
                  "Không thể cập nhật người dùng";
                messageApi.error(errorMsg);
                return false;
              } finally {
                setSaving(false);
              }
            }}
          >
            <ProFormText name="email" label="Email" />
            <ProFormText name="username" label="Tên Đăng Nhập" />
            <ProFormText name="full_name" label="Họ Tên" />
            <ProFormText name="avatar" label="URL Ảnh Đại Diện" />
          </ModalForm>,
          <Popconfirm
            key="toggle"
            title={active ? "Vô hiệu hóa người dùng" : "Kích hoạt người dùng"}
            description={
              active
                ? "Bạn có chắc chắn muốn vô hiệu hóa người dùng này?"
                : "Cho phép người dùng này truy cập lại?"
            }
            onConfirm={() => handleToggleStatus(record)}
            okText="Có"
            cancelText="Không"
            okButtonProps={{ loading: togglingId === record.id }}
          >
            <Button
              type="text"
              size="small"
              danger={active}
              icon={active ? <StopOutlined /> : <CheckCircleOutlined />}
              loading={togglingId === record.id}
            >
              {active ? "Vô Hiệu Hóa" : "Kích Hoạt"}
            </Button>
          </Popconfirm>,
        ];
      },
    },
  ];

  return (
    <PageContainer>
      {contextHolder}
      <ProTable<AdminUser>
        headerTitle="Danh Sách Người Dùng"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
          searchText: 'Tìm kiếm',
          resetText: 'Đặt lại',
          collapseRender: (collapsed) => (collapsed ? 'Mở rộng' : 'Thu gọn'),
        }}
        request={async (params) => {
          try {
            const response = await getAdminUsers({
              page: params.current || 1,
              limit: params.pageSize || 10,
              username: params.username,
              email: params.email,
              full_name: params.full_name,
              role: params.role,
              is_disabled:
                params.is_disabled === undefined
                  ? undefined
                  : params.is_disabled === true ||
                    params.is_disabled === "true",
            });

            return {
              data: response.data || [],
              success: true,
              total: response.pagination?.total || response.data?.length || 0,
            };
          } catch (error: any) {
            const errorMsg =
              error?.response?.data?.message ||
              error?.message ||
              "Không thể tải danh sách người dùng";
            messageApi.error(errorMsg);
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        columns={columns}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        toolBarRender={() => [
          <CreateAdminModal
            key="create-admin"
            onSuccess={() => actionRef.current?.reload()}
          />,
        ]}
      />

      <Drawer
        width={500}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={true}
        title={currentRow?.full_name || currentRow?.username}
      >
        {currentRow && (
          <ProDescriptions<AdminUser>
            column={1}
            dataSource={currentRow}
            columns={[
              { title: "Họ Tên", dataIndex: "full_name" },
              { title: "Tên Đăng Nhập", dataIndex: "username" },
              { title: "Email", dataIndex: "email" },
              { title: "Vai Trò", dataIndex: "role" },
              {
                title: "Trạng Thái",
                dataIndex: "is_active",
                render: (_, record) => {
                  const active = getActiveFlag(record);
                  return (
                    <Tag color={active ? "green" : "red"}>
                      {active ? "Hoạt Động" : "Không Hoạt Động"}
                    </Tag>
                  );
                },
              },
              {
                title: "Ảnh Đại Diện",
                dataIndex: "avatar",
                render: (_, record) =>
                  record.avatar ? (
                    <Image
                      src={record.avatar}
                      width={180}
                      style={{ borderRadius: 8 }}
                    />
                  ) : (
                    "-"
                  ),
              },
              {
                title: "Ngày Tạo",
                dataIndex: "created_at",
                valueType: "dateTime",
              },
              {
                title: "Ngày Cập Nhật",
                dataIndex: "updated_at",
                valueType: "dateTime",
              },
            ]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default UserManagement;
