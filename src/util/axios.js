import axios from "axios";
import {message} from "ant-design-vue";
// -------------------------1. 创建axios实例-----------------------
const instance = axios.create({
    // 接口
    baseURL:'http://124.221.183.163:19200', // 超时时间
    timeout: 3000,
});
// -------------------------2.请求拦截-----------------------
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
                window.location.href = '/login'; // 或完整路径
                break;
            case 500:
                console.error('服务器错误');
                message.error('服务器错误').then(() => {});
                break;
            default:
                message.error(error.response.data.message);
                break

        }
    }
    return Promise.reject(error);
});


export default instance;
