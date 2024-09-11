import {createApp} from "vue";
import App from "./App.vue";
import router from "./router";
import axios from "axios";
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
const app = createApp(App);


// 设置 Axios 全局默认配置
axios.defaults.baseURL = 'http://192.168.0.118:8080';  // 设置后端 API 的基础 URL


// 添加请求拦截器，自动附加 JWT Token
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});



app.use(router);
app.use(Antd).mount('#app');
