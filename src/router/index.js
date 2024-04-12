import {createRouter, createWebHistory} from "vue-router";
import {unauthorized} from "@/net/index.js";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes:[
        {
            path: '/',
            name: 'welcome',
            component: () => import('@/views/WelcomeView.vue'),
            children: [
                {
                    path: '',
                    name: 'welcome-login',
                    component:()=>import('@/views/welcome/LoginPage.vue')
                },{
                    path: 'register',
                    name: 'welcome-register',
                    component: () => import('@/views/welcome/RegisterPage.vue')
                },{
                    path: 'reset',
                    name: 'welcome-reset',
                    component: () => import('@/views/welcome/ResetPage.vue'),
                }
            ]
        },{
            path:'/index',
            name: 'index',
            component: () => import('@/views/IndexView.vue'),
            children: [
                {
                    path: '',
                    name: 'index-sidebar',
                    component: () => import('@/views/index/SidebarPage.vue'),
                }
            ],

        }
    ]
})

router.beforeEach((to,from,next)=>{
    const isUnauthorized = unauthorized();
    if (to.name.startsWith('welcome-')&&!isUnauthorized){
        //已登录进入主界面,进入登录页面自动进入主界面
        next('/index');
    }else if (to.fullPath.startsWith('/index') && isUnauthorized) {
        //未登录返回登录页面
        next('/')
    }else{
        next()
    }
})
export default router