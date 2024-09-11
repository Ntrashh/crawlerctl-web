<template>
  <a-layout class="login-container">
    <a-card class="full-width-form">
      <div class="project-name">
        <h1>Crawlerctl</h1>
      </div>
      <!-- 用户名输入 -->
      <a-form
          :model="loginForm"
          @submit.prevent="handleLogin"
          layout="vertical"
          ref="loginFormRef"
      >
        <a-form-item label="用户名">
          <a-input
              v-model:value="loginForm.username"
              placeholder="请输入用户名"
              prefix-icon="User"
              allow-clear
          />
        </a-form-item>

        <!-- 密码输入 -->
        <a-form-item label="密码">
          <a-input-password
              v-model:value="loginForm.password"
              placeholder="请输入密码"
              allow-clear
          />
        </a-form-item>

        <!-- 登录按钮 -->
        <a-form-item class="button-center">
          <a-button type="primary" @click="handleLogin" :loading="isSubmitting" block>登录</a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </a-layout>
</template>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 400px;
  margin: auto;
  padding: 40px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  background-color: white;
  border-radius: 10px; /* 添加圆角 */
  color: #333;

  /* 添加的样式用于居中登录表单 */
  position: absolute; /* 绝对定位 */
  top: 50%; /* 从顶部开始到50%的位置 */
  left: 50%; /* 从左侧开始到50%的位置 */
  transform: translate(-50%, -50%); /* 向左和向上各偏移自身宽高的50% */
}


.full-width-form {
  width: 100%;
}

.full-width-item {
  width: 100%;
}

.button-center {
  display: flex;
  flex-direction: column;
  align-items: center;
}


.project-name {
  width: 100%;
  text-align: center; /* 确保文字在父容器内居中 */
  margin-bottom: 20px; /* 提供与输入框之间的间隔 */
}

.project-name h1 {
  font-size: 24px;
  color: #333;
}
</style>


<script>
import axios from 'axios';
import {LockOutlined, UserOutlined} from "@ant-design/icons-vue";
import {message} from 'ant-design-vue';

export default {
  components: {
    UserOutlined,
    LockOutlined,
  },
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      isSubmitting: false,
      loginFormRef: null
    };
  },
  methods: {
    async handleLogin() {
      this.isSubmitting = true;

      try {
        // 发送登录请求
        const response = await axios.post('/login', {
          username: this.loginForm.username,
          password: this.loginForm.password
        });
        // 假设登录成功，后端返回 JWT Token
        const token = response.data.data.token;
        // 将 JWT Token 存储到 localStorage
        localStorage.setItem('token', token);

        // 显示成功消息
        message.success('登录成功');

        // 跳转到另一个页面（例如 dashboard）
        this.$router.push('/home');
      } catch (error) {
        // 登录失败的处理
        let msg;
        if (error.code === "ERR_NETWORK") {
          msg = error.message;
        } else {
          msg = '登录失败，请检查用户名或密码'
        }
        console.error('登录失败:', error.message);
        message.error(msg);
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>