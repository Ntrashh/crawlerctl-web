import axios from 'axios';
import {message} from "ant-design-vue";

// 创建一个 axios 实例
const instance = axios.create({
    // 设置 Axios 全局默认配置
// a    xios.defaults.baseURL = 'http://192.168.0.118:8080';  // 设置后端 API 的基础 URL
//     axios.defaults.baseURL = 'http://124.221.183.163:19200'  // 设置后端 API 的基础 URL
    baseURL: 'http://124.221.183.163:19200', // API的基础路径
    timeout: 5000, // 请求超时时间
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器（可以在这里添加token等信息）
instance.interceptors.request.use(config => {
    // 可以在这里添加全局的请求头或token
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// 响应拦截器（处理全局错误提示等）
instance.interceptors.response.use(response => {
    return response.data;
}, error => {
    // 判断是否是网络错误
    if (!error.response) {
        if (error.message.includes('Network Error')) {
            console.error('网络错误，请检查您的网络连接');
            message.error('网络错误，请检查您的网络连接');
        } else if (error.code === 'ECONNABORTED') {
            console.error('请求超时');
            message.error('请求超时');

        } else {
            console.error('未知的网络错误');
            message.error('未知的网络错误');

        }
    } else {
        // 处理HTTP状态码错误
        switch (error.response.status) {
            case 401:
                // 未授权处理逻辑
                console.error('未授权，跳转登录页');
                message.error('未授权，跳转登录页');
                break;
            case 500:
                console.error('服务器错误');
                message.error('服务器错误');

                break;
            default:
                message.error(error.response.data.message);
                break

        }
    }
    return Promise.reject(error);
});

// 封装的 GET 请求
export function axiosGet(url, params = {}) {
    return instance.get(url, {params});
}

// 封装的 POST 请求
export function axiosPost(url, data = {}) {
    return instance.post(url, data);
}

export default {
    axiosGet, axiosPost,
};
