import { AvatarDropdown, AvatarName, Footer } from "@/components";
import type { Settings as LayoutSettings } from "@ant-design/pro-components";
import { SettingDrawer } from "@ant-design/pro-components";
import "@ant-design/v5-patch-for-react-19";
import type { RequestConfig, RunTimeLayoutConfig } from "@umijs/max";
import { history } from "@umijs/max";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import defaultSettings from "../config/defaultSettings";
import { errorConfig } from "./requestErrorConfig";

const isDev = process.env.NODE_ENV === "development" || process.env.CI;
const loginPath = "/user/login";

// Define CurrentUser type inline since we removed the API namespace
type CurrentUser = {
  name?: string;
  avatar?: string;
  userid?: string;
  email?: string;
  signature?: string;
  title?: string;
  group?: string;
  [key: string]: any;
};

/**
 * @see https://umijs.org/docs/api/runtime-config#getinitialstate
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      // Read user from localStorage
      const userStr = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (userStr && token) {
        const user = JSON.parse(userStr);
        return {
          name: user.full_name || user.username,
          avatar:
            user.avatar ||
            "https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png",
          userid: user.id,
          email: user.email,
          role: user.role,
        };
      }
      return undefined;
    } catch (_error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return undefined;
    }
  };
  const { location } = history;
  if (
    ![loginPath, "/user/register", "/user/register-result"].includes(
      location.pathname
    )
  ) {
    const currentUser = await fetchUserInfo();
    if (!currentUser) {
      history.push(loginPath);
    }
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

export const layout: RunTimeLayoutConfig = ({
  initialState,
  setInitialState,
}) => {
  return {
    actionsRender: () => [],
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    waterMarkProps: {
      content: "", // Watermark disabled
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    bgLayoutImgList: [
      {
        src: "https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr",
        left: 85,
        bottom: 100,
        height: "303px",
      },
      {
        src: "https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr",
        bottom: -68,
        right: -45,
        height: "303px",
      },
      {
        src: "https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr",
        bottom: 0,
        left: 0,
        width: "331px",
      },
    ],
    menuHeaderRender: undefined,
    childrenRender: (children) => {
      return (
        <ConfigProvider 
          locale={{
            ...viVN,
            Form: {
              ...viVN.Form,
              defaultValidateMessages: {
                default: 'Lỗi xác thực trường ${label}',
                required: 'Vui lòng nhập ${label}',
                enum: '${label} phải là một trong [${enum}]',
                whitespace: '${label} không được để trống',
                date: {
                  format: '${label} định dạng ngày không hợp lệ',
                  parse: '${label} không thể chuyển đổi thành ngày',
                  invalid: '${label} là ngày không hợp lệ',
                },
                types: {
                  string: '${label} không phải là chuỗi hợp lệ',
                  method: '${label} không phải là phương thức hợp lệ',
                  array: '${label} không phải là mảng hợp lệ',
                  object: '${label} không phải là đối tượng hợp lệ',
                  number: '${label} không phải là số hợp lệ',
                  date: '${label} không phải là ngày hợp lệ',
                  boolean: '${label} không phải là boolean hợp lệ',
                  integer: '${label} không phải là số nguyên hợp lệ',
                  float: '${label} không phải là số thực hợp lệ',
                  regexp: '${label} không phải là biểu thức chính quy hợp lệ',
                  email: '${label} không phải là email hợp lệ',
                  url: '${label} không phải là url hợp lệ',
                  hex: '${label} không phải là hex hợp lệ',
                },
                string: {
                  len: '${label} phải có ${len} ký tự',
                  min: '${label} phải có ít nhất ${min} ký tự',
                  max: '${label} phải có tối đa ${max} ký tự',
                  range: '${label} phải có từ ${min} đến ${max} ký tự',
                },
                number: {
                  len: '${label} phải bằng ${len}',
                  min: '${label} phải lớn hơn hoặc bằng ${min}',
                  max: '${label} phải nhỏ hơn hoặc bằng ${max}',
                  range: '${label} phải nằm trong khoảng ${min} đến ${max}',
                },
                array: {
                  len: '${label} phải có ${len} phần tử',
                  min: '${label} phải có ít nhất ${min} phần tử',
                  max: '${label} phải có tối đa ${max} phần tử',
                  range: '${label} phải có từ ${min} đến ${max} phần tử',
                },
                pattern: {
                  mismatch: '${label} không khớp với mẫu ${pattern}',
                },
              },
            },
          }}
        >
          {children}
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </ConfigProvider>
      );
    },
    ...initialState?.settings,
  };
};

export const request: RequestConfig = {
  baseURL: "https://plantheon-backend.duckdns.org/api/v1",
  ...errorConfig,
};
