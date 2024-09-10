<template>
  <el-container class="login-container">
    <el-form ref="loginForm" :model="loginForm" @submit.prevent="handleLogin" class="full-width-form">
      <div class="project-name">
        <h1>Crawlerctl</h1>
      </div>
      <!-- 用户名输入 -->
      <el-form-item class="full-width-item">
        <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"

        >
          <template #prefix>
            <User/>
          </template>
        </el-input>

      </el-form-item>
      <!-- 密码输入 -->
      <el-form-item class="full-width-item">
        <el-input
            type="password"
            v-model="loginForm.password"
            placeholder="请输入密码"
            show-password>
          <template #prefix>
            <Lock/>
          </template>
        </el-input>
      </el-form-item>
      <!-- 登录按钮 -->
      <el-form-item class="button-center">
        <el-button type="primary" @click="handleLogin" :loading="isSubmitting">登录</el-button>
      </el-form-item>
    </el-form>
  </el-container>
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
import {Lock, User, UserFilled} from "@element-plus/icons-vue";

export default {
  components: {Lock, User, UserFilled},
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      isSubmitting: false
    };
  },
  methods: {
    handleLogin() {
      this.isSubmitting = true;
      // 模拟提交操作
      setTimeout(() => {
        console.log('登录信息', this.loginForm);
        this.isSubmitting = false;
      }, 2000);
    }
  }
};
</script>