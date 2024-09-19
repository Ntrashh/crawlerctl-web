<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider>
      <div class="logo">
        <h1>CrawlerCtl</h1>
      </div>
      <a-menu theme="dark" mode="inline"
              :selectedKeys="[activeMenu]"
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
      <a-layout-header style="background: #fff; padding: 0"/>
      <a-layout-content style="margin: 0 16px">

        <a-breadcrumb style="margin: 16px 0">
          <a-breadcrumb-item v-for="(breadcrumb, index) in breadcrumbs" :key="index">
            {{ breadcrumb }}
          </a-breadcrumb-item>
        </a-breadcrumb>
        <div :style="{ padding: '24px', background: '#fff', minHeight: '360px' }">
          <router-view></router-view>
        </div>
      </a-layout-content>
      <a-layout-footer style="text-align: center">
        Ant Design ©2018 Created by Ant UED
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script>
import {useRouter, useRoute} from 'vue-router';
import {ref, watch} from 'vue';
import * as Icons from '@ant-design/icons-vue';

export default {
  "name":"CrawlerCtlLayout",
  setup() {
    const router = useRouter();
    const route = useRoute();

    const activeMenu = ref(route.path); // 当前选中的菜单项
    const breadcrumbs = ref([]); // 面包屑

    // 动态菜单项
    const menuRoutes = router.options.routes.find((r) => r.path === "/").children;
    // 处理菜单点击事件
    const handleMenuClick = ({key}) => {
      activeMenu.value = key;
      router.push({path:key}); // 跳转到对应的路由
    };

    const getIconComponent = (iconName) =>{
      return Icons[iconName];
    };

    // 监听路由变化，更新面包屑
    watch(
        () => route.path,
        (newPath) => {
          activeMenu.value = newPath; // 更新菜单项
          breadcrumbs.value = route.meta.breadcrumb || []; // 更新面包屑
        },
        {immediate: true}
    );


    return {
      activeMenu,
      breadcrumbs,
      menuRoutes,
      handleMenuClick,
      getIconComponent
    };
  }
};
</script>

<style scoped>
.logo {
  text-align: center;
  height: 32px;
  margin: 16px;
}

.logo h1 {
  font-size: 24px;
  color: white;
  font-weight: bold;

}

.site-layout .site-layout-background {
  background: #fff;
}

[data-theme='dark'] .site-layout .site-layout-background {
  background: #141414;
}
</style>
