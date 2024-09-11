import {createRouter, createWebHistory} from "vue-router";
import Login from "@/components/Login.vue";
import Project from "@/views/Project.vue";
import Envs from "@/views/Envs.vue";
import Home from "@/views/Home.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {path: '/', redirect: '/home'},
        {path: '/login', component: Login},
        {
            path: '/home',
            component: Home,
            meta: {
                requiresAuth: true,
                title: '仪表盘',
                breadcrumb: ['Home'],
            }
        },
        {
            path: '/project',
            component: Project,
            meta: {
                requiresAuth: true,
                title: '项目管理',
                breadcrumb: ['首页', '项目管理'],
            }
        },
        {
            path: '/envs',
            component: Envs,
            meta: {
                requiresAuth: true,
                title: '环境管理',
                breadcrumb: ['首页', '环境管理'],
            }
        },

    ],
});

// 路由守卫，验证是否登录
router.beforeEach((to, from, next) => {
    const isLoggedIn = !!localStorage.getItem('token'); // 检查是否存在JWT
    if (to.matched.some(record => record.meta.requiresAuth) && !isLoggedIn) {
        next('/login');  // 如果没有登录，重定向到登录页
    } else {
        next();  // 如果已经登录，继续跳转
    }
});

export default router;
