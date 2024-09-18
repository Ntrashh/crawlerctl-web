<template>
  <div>
    <!-- 如果当前页面不是登录页面，显示 Layout -->
    <Layout v-if="!isLoginPage">
      <router-view />
    </Layout>

    <!-- 如果是登录页面，直接渲染登录 -->
    <router-view v-else />
  </div>
</template>

<script>
import { useRoute } from 'vue-router';
import Login from "@/components/Login.vue";

export default {
  components: {
    Login,
  },
  setup() {
    const route = useRoute();

    // 判断当前路由是否是登录页面
    const isLoginPage = route.path === '/login';

    return {
      isLoginPage,
    };
  }
};
</script>
