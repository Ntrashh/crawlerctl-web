import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import BaseHome from "@/views/Homes/BaseHome.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: () => import("@/layout/BaseLayout.vue"),
    children: [
      {
        path: "/home",
        component: BaseHome,
        meta: {
          requiresAuth: true,
          title: "主页",
          icon: "HomeOutlined",
          breadcrumb: ["主页"],
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
