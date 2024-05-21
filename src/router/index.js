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
                    path: 'doctor',
                    name: 'index-doctor',
                    component: () => import('@/views/index/DoctorManagePage.vue'),
                },
                {
                    path: 'nurse',
                    name: 'index-nurse',
                    component: () => import('@/views/index/NurseManagePage.vue'),
                },
                {
                    path: 'department',
                    name: 'index-department',
                    component: () => import('@/views/index/DepartmentManagePage.vue'),
                },
                {
                    path: 'medicine',
                    name: 'index-medicine',
                    component: () => import('@/views/index/MedicineManagePage.vue'),
                }, {
                    path: 'hospitalizations',
                    name: 'index-hospitalizations',
                    component: () => import('@/views/index/HospitalizationsPage.vue'),
                }, {
                    path: 'account',
                    name: 'index-account',
                    component: () => import('@/views/index/AccountManagePage.vue'),
                },{
                    path: 'equipment',
                    name: 'index-equipment',
                    component: () => import('@/views/index/EquipmentManagePage.vue'),
                },{
                    path: 'schedule',
                    name: 'index-schedule',
                    component: () => import('@/views/index/ScheduleManagePage.vue'),
                },{
                    path: 'pharmacist',
                    name: 'index-pharmacist',
                    component: () => import('@/views/index/PharmacistManagePage.vue'),
                }
            ],


        },{
            path: '/doctorIndex',
            name: 'doctorIndex',
            component: () => import('@/views/DoctorIndexView.vue'),
            children: [
                {
                    path: 'medicine',
                    name: 'doctor-index-medicine',
                    component: () => import('@/views/index/doctor/MedicineManagePage.vue'),
                },{
                    path: 'hospitalizations',
                    name: 'doctor-index-hospitalizations',
                    component: () => import('@/views/index/doctor/HospitalizationsPage.vue'),
                },{
                    path: 'equipment',
                    name: 'doctor-equipment',
                    component: () => import('@/views/index/doctor/EquipmentManagePage.vue'),
                },{
                    path: 'schedule',
                    name: 'doctor-schedule',
                    component: () => import('@/views/index/doctor/ScheduleManagePage.vue'),
                },{
                    path: 'nurse',
                    name: 'doctor-nurse',
                    component: () => import('@/views/index/doctor/NurseManagePage.vue'),
                }
            ]
        },{
            path: '/nurseIndex',
            name: 'nurseIndex',
            component: () => import('@/views/NurseIndexView.vue'),
            children: [
                {
                    path: 'medicine',
                    name: 'nurse-medicine',
                    component: () => import('@/views/index/MedicineManagePage.vue'),
                },{
                    path: 'hospitalizations',
                    name: 'nurse-hospitalizations',
                    component: () => import('@/views/index/HospitalizationsPage.vue'),
                }
            ]
        },{
            path: '/pharmacistIndex',
            name: 'pharmacistIndex',
            component: () => import('@/views/PharmacistIndexView.vue'),
            children: [
                {
                    path: 'medicine',
                    name: 'pharmacist-medicine',
                    component: () => import('@/views/index/MedicineManagePage.vue'),
                }
            ]
        }
    ]
})

router.beforeEach((to,from,next)=>{
    const isUnauthorized = unauthorized();
    if (to.name.startsWith('welcome-')&&!isUnauthorized){
        let sessionRole;
        let localRole;
        try {
            sessionRole = JSON.parse(sessionStorage.getItem('role'));
            localRole = JSON.parse(localStorage.getItem('role'));
        } catch (e){
            console.error('Error parsing role from sessionStorage',e)
        }

        if(localRole==='doctor'||sessionRole==='doctor')
            next('/doctorIndex');
        if(localRole==='nurse'||sessionRole==='nurse')
            next('/nurseIndex');
        if(localRole==='pharmacist'||sessionRole==='pharmacist')
            next('/pharmacistIndex');
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