import { Footer } from "@/components";
import { login } from "@/services/auth";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { LoginForm, ProFormText } from "@ant-design/pro-components";
import { Helmet, useModel } from "@umijs/max";
import { Alert, App } from "antd";
import { createStyles } from "antd-style";
import React, { useState } from "react";
import { flushSync } from "react-dom";
import Settings from "../../../../config/defaultSettings";

const useStyles = createStyles(({ token }) => {
  return {
    container: {
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      overflow: "auto",
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: "100% 100%",
    },
  };
});

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const Login: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { initialState, setInitialState } = useModel("@@initialState");
  const { styles } = useStyles();
  const { message } = App.useApp();

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await login({
        email: values.email,
        password: values.password,
      });

      const { user, token } = response.data;

      if (user.role !== "admin") {
        setErrorMessage(
          "Truy cập bị từ chối. Chỉ quản trị viên mới có thể truy cập hệ thống này."
        );
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      message.success("Đăng nhập thành công!");

      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: {
            name: user.full_name || user.username,
            avatar:
              user.avatar ||
              "https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png",
            userid: user.id,
            email: user.email,
            role: user.role,
          },
        }));
      });

      const urlParams = new URL(window.location.href).searchParams;
      window.location.href = urlParams.get("redirect") || "/";
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMsg =
        error?.response?.data?.error ||
        error?.message ||
        "Đăng nhập thất bại. Vui lòng thử lại.";
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>Login - {Settings.title}</title>
      </Helmet>
      <div
        style={{
          flex: "1",
          padding: "32px 0",
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: "75vw",
          }}
          logo={<img alt="logo" src="/logo.png" />}
          title="Quản trị Plantheon"
          subTitle="Hệ thống quản lý bệnh cây trồng"
          initialValues={{
            autoLogin: true,
          }}
          submitter={{
            searchConfig: {
              submitText: "Đăng nhập",
            },
            submitButtonProps: {
              loading: loading,
              size: "large",
              style: {
                width: "100%",
              },
            },
          }}
          onFinish={async (values) => {
            await handleSubmit(values as { email: string; password: string });
          }}
        >
          {errorMessage && <LoginMessage content={errorMessage} />}

          <ProFormText
            name="email"
            fieldProps={{
              size: "large",
              prefix: <MailOutlined />,
            }}
            placeholder="Email"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập email!",
              },
              {
                type: "email",
                message: "Vui lòng nhập email hợp lệ!",
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: "large",
              prefix: <LockOutlined />,
            }}
            placeholder="Mật khẩu"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu!",
              },
            ]}
          />
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
