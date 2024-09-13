import {createRouter, createWebHistory} from "vue-router";
import Login from "@/components/Login.vue";
import Project from "@/views/Project.vue";
import Envs from "@/views/env/Envs.vue";
import Home from "@/views/Home.vue";
import Layout from "@/components/Layout.vue";
import Virtualenv from "@/views/env/Virtualenv.vue";
import EnvManager from "@/views/env/EnvManager.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/home',
            component: Layout,
            children: [
                {
                    path: '/home',
                    component: Home,
                    meta: {
                        requiresAuth: true,
                        title: '主页',
                        icon: 'HomeOutlined',
                        breadcrumb: ['主页'],
                    }
                },
                {
                    path: '/project',
                    component: Project,
                    meta: {
                        requiresAuth: true,
                        title: '项目管理',
                        icon: 'FundProjectionScreenOutlined',
                        breadcrumb: ['主页', '项目管理'],
                    }
                },
                {
                    path: '/envs',
                    redirect: '/envs/manager',
                    component: Envs,
                    meta: {
                        requiresAuth: true,
                        title: '环境管理',
                        icon: 'HddOutlined',
                        breadcrumb: ['主页', '环境管理'],
                    },
                    children: [
                        {
                            path: 'manager', // 注意，这里不要以斜杠开头
                            component: EnvManager,
                            meta: {
                                requiresAuth: true,
                                title: '虚拟环境',
                                breadcrumb: ['主页', '环境管理'],
                            },
                        },
                        {
                            path: 'virtualenv', // 注意，这里不要以斜杠开头
                            component: Virtualenv,
                            meta: {
                                requiresAuth: true,
                                title: '虚拟环境',
                                breadcrumb: ['主页', '环境管理', '虚拟环境'],
                            },
                        },

                    ],

                },

            ]
        },

        {path: '/login', component: Login},


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
