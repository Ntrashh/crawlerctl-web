<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider>
      <div class="logo">
        <h1>Crawlerctl</h1>
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
        <!--        <br/>-->
        <!--        {{ $route.path }}-->
        <!--        <a-breadcrumb style="margin: 16px 0">-->
        <!--          <a-breadcrumb-item>User</a-breadcrumb-item>-->
        <!--          <a-breadcrumb-item>Bill</a-breadcrumb-item>-->
        <!--        </a-breadcrumb>-->
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

export default {
  setup() {
    const router = useRouter();
    const route = useRoute();

    const activeMenu = ref(route.path); // 当前选中的菜单项
    const breadcrumbs = ref([]); // 面包屑

    // 动态菜单项
    const menuRoutes = router.options.routes.filter((r) => r.meta && r.meta.title);

    // 处理菜单点击事件
    const handleMenuClick = ({key}) => {
      console.log(key)
      activeMenu.value = key;
      router.push(key); // 跳转到对应的路由
    };

    // 监听路由变化，更新面包屑
    watch(
        () => route.path,
        (newPath) => {
          console.log(newPath);
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
