import type { RequestOptions } from "@@/plugin-request/request";
import type { RequestConfig } from "@umijs/max";
import { message, notification } from "antd";

enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}
interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

export const errorConfig: RequestConfig = {
  errorConfig: {

    errorThrower: (res) => {
      const { success, data, errorCode, errorMessage, showType } =
        res as unknown as ResponseStructure;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = "BizError";
        error.info = { errorCode, errorMessage, showType, data };
        throw error;
      }
    },
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      if (error.name === "BizError") {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { errorMessage, errorCode } = errorInfo;
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:

              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warning(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                description: errorMessage,
                message: errorCode,
              });
              break;
            case ErrorShowType.REDIRECT:

              break;
            default:
              message.error(errorMessage);
          }
        }
      } else if (error.response) {

        console.error("❌ [Error Handler] Response error:", {
          status: error.response.status,
          statusText: error.response.statusText,
          url: error.response.config?.url,
          headers: error.response.config?.headers,
          data: error.response.data,
        });

        if (error.response.status === 401) {
          console.error("🚫 [401 Unauthorized] Authentication failed!");
          console.error("🚫 [401] Request URL:", error.response.config?.url);
          console.error(
            "🚫 [401] Request headers:",
            error.response.config?.headers
          );
          console.error("🚫 [401] Response data:", error.response.data);
          message.error(
            `Authentication failed (401): ${
              error.response.data?.error || "Unauthorized"
            }`
          );
        } else {
          message.error(`Response status:${error.response.status}`);
        }
      } else if (error.request) {

        message.error("None response! Please retry.");
      } else {

        message.error("Request error, please retry.");
      }
    },
  },

  requestInterceptors: [
    (config: RequestOptions) => {
      const token = localStorage.getItem("token");
      console.log("🔐 [Request Interceptor] URL:", config.url);
      console.log("🔐 [Request Interceptor] Token exists:", !!token);
      console.log(
        "🔐 [Request Interceptor] Token:",
        token?.substring(0, 50) + "..."
      );
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
        console.log("🔐 [Request Interceptor] Authorization header set");
      } else {
        console.warn(
          "⚠️ [Request Interceptor] No token found in localStorage!"
        );
      }
      return config;
    },
  ],

  responseInterceptors: [
    (response) => {
      const { data } = response as unknown as ResponseStructure;

      if (data?.success === false) {
        message.error("Request failed!");
      }
      return response;
    },
  ],
};
