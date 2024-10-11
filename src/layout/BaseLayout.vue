<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider v-model:collapsed="collapsed" collapsible theme="light">
      <div class="logo"><h1>CrawlerCTL</h1></div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        theme="light"
        mode="inline"
        @click="handleMenuClick"
      >
        <a-menu-item
          v-for="route in menuRoutes"
          :key="route.path"
          :route="route.path"
        >
          <component :is="getIconComponent(route.meta.icon)" />
          <span>{{ route.meta.title }}</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header
        :style="{
          background: '#fff',
          padding: 0,
          position: 'sticky',
          top: '0',
          zIndex: 10,
          width: '100%',
        }"
      >
        <a-breadcrumb style="margin: 20px 0">
          <a-breadcrumb-item>User</a-breadcrumb-item>
          <a-breadcrumb-item>Bill</a-breadcrumb-item>
        </a-breadcrumb>
      </a-layout-header>
      <a-layout-content style="margin: 30px">
        <div
          :style="{ padding: '20px', background: '#fff', minHeight: '360px' }"
        >
          <router-view />
        </div>
      </a-layout-content>
      <a-layout-footer style="text-align: center">
        Ant Design ©2018 Created by Ant UED
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>
<script lang="ts" setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as Icons from "@ant-design/icons-vue";
const router = useRouter();
const route = useRoute();
const menuRoutes = router.options.routes.find((r) => r.path === "/").children;
const collapsed = ref<boolean>(false);

const selectedKeys = ref<Array>([route.path]); // 当前选中的菜单项
const handleMenuClick = ({ key }) => {
  selectedKeys.value = [key];
  router.push({ path: key }); // 跳转到对应的路由
};
const getIconComponent = (iconName) => {
  return Icons[iconName];
};
// 监听路由变化，更新面包屑
watch(
  () => route.path,
  (newPath) => {
    selectedKeys.value = [newPath]; // 更新菜单项
    // breadcrumbs.value = route.meta.breadcrumb || []; // 更新面包屑
  },
  { immediate: true }
);
</script>
<style scoped>
#components-layout-demo-side .logo {
  height: 32px;
  margin: 16px;
  background: rgba(255, 255, 255, 0.3);
}

.site-layout .site-layout-background {
  background: #fff;
}

.logo {
  text-align: center;
  height: 60px;
  margin: 16px;
}

.logo h1 {
  padding-top: 10px;
  font-size: 24px;
  color: black;
  font-weight: bold;
}
[data-theme="dark"] .site-layout .site-layout-background {
  background: #141414;
}
</style>
