import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { message } from "ant-design-vue";

// -------------------------1. 创建axios实例-----------------------
const instance = axios.create({
  baseURL: "http://124.221.183.163:19200",
  timeout: 3000,
});

// -------------------------2.请求拦截-----------------------
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem("token");
    if (token) {
      (
        config.headers as Record<string, string>
      ).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error) => {
    if (!error.response) {
      if (error.message.includes("Network Error")) {
        console.error("网络错误，请检查您的网络连接");
        message.error("网络错误，请检查您的网络连接");
      } else if (error.code === "ECONNABORTED") {
        console.error("请求超时");
        message.error("请求超时");
      } else {
        console.error("未知的网络错误");
        message.error("未知的网络错误");
      }
    } else {
      switch (error.response.status) {
        case 401:
          console.error("未授权，跳转登录页");
          message.error("未授权，跳转登录页");
          window.location.href = "/login";
          break;
        case 500:
          console.error("服务器错误");
          message.error("服务器错误").then(() => {});
          break;
        default:
          message.error(error.response.data.message);
          break;
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
