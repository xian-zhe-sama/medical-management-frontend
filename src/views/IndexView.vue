<script lang="ts" setup>
import {logout} from "@/net/index.js";
import router from "@/router/index.js";
import {ElMessage} from "element-plus";
import {Avatar, House, Lock, Remove, Tickets} from "@element-plus/icons-vue";

import {ArrowLeft, ArrowRight, Calendar, CopyDocument, Discount, Filter, Setting, User} from "@element-plus/icons-vue";
import {onMounted, onUnmounted, ref} from 'vue'
// 初始定义侧边栏折叠状态

const isRotating = ref(false);
let animationTimeout: number | null = null;
//清除旋转动画
const clearAnimationTimeout = () => {
  if (animationTimeout !== null) {
    clearTimeout(animationTimeout);
    animationTimeout = null;
  }
};
const addRotateClass = () => {
  if(isRotating.value) return;
  isRotating.value = true;
  clearAnimationTimeout();
  animationTimeout = window.setTimeout(() => {
    isRotating.value = false;
  },1000)//设置动画完成后移出旋转类，时间与动画时间一致
};
//移出旋转类
const removeRotateClass = () => {
  isRotating.value = false;
  clearAnimationTimeout();
};

const username = ref('');
function getUser(){
  const storeUsername = sessionStorage.getItem('username')|| localStorage.getItem('username');
  if (storeUsername) {
    username.value = JSON.parse(storeUsername);
  }else{
    ElMessage.warning('请先登录')
    router.push('/')
  }
}
//组件加载时获取用户名
onMounted(()=>{
  getUser()
})
//组件销毁时清除计时器，防止内存泄露
onUnmounted(()=>{
  clearAnimationTimeout();
})
const isCollapsed = ref(false);
//切换侧边栏状态
function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value;
}

// function userLogout(){
//   logout(()=> {
//     router.push('/')
//   })
// }
//  TS代码
const userLogout = ()=>{
  logout(()=>{
    router.push('/')
  })
}

</script>

<template style="margin: 0">
  <div style="background-color: #d9ecff;">
    <el-container class="layout-container-demo" style="height: 100%">
      <el-header style="background-color: #f89898;margin-bottom: 20px">
        <el-text type="primary" class="mx-1" size="large" style="font-size: 20px; font-weight: bold">医疗管理系统</el-text>
       <div style="float: right">
         <el-dropdown>
           <el-icon style="margin-right: 8px; margin-top: 1px" :size="30"
                    @mouseenter="addRotateClass"
                    @mouseleave="removeRotateClass"
                    :class="{'icon-rotate':isRotating}">
             <setting/>
           </el-icon>
           <template #dropdown>
             <el-dropdown-menu>
               <el-dropdown-item>View</el-dropdown-item>
               <el-dropdown-item>Add</el-dropdown-item>
               <el-dropdown-item>
                 <div>
                   <el-button @click="userLogout">退出登录</el-button>
                 </div>
               </el-dropdown-item>
             </el-dropdown-menu>
           </template>
         </el-dropdown>

        <el-text type="primary" class="mx-1" size="large" style="font-size: 20px; font-weight: bold">{{username}}</el-text>
       </div>
      </el-header>
      <el-container>
        <el-aside :width="isCollapsed ? '65px':'200px'" style="margin-right: 20px;background-color: #f3d19e" class="el-aside">
          <!--        <div class="user-profile">-->
          <!--          &lt;!&ndash; 用户头像 &ndash;&gt;-->
          <!--          <img src="../../../src/image/RE4wtbD.jpg" alt="User Avatar" class="user-avatar">-->
          <!--          &lt;!&ndash; 用户名 &ndash;&gt;-->
          <!--          <p class="user-name">Dr. Smith</p>-->
          <!--        </div>-->
          <el-scrollbar>
            <el-menu :default-openeds="['1']" background-color="#f3d19e">
              <!-- 医生信息管理菜单 -->
              <el-menu-item index="1">
                <template #title>
                  <el-icon   :class="{'icon-large': isCollapsed}"><User/></el-icon>
                  <transition name="fade">
                    <el-text v-show="!isCollapsed">医生管理</el-text>
                  </transition>

                </template>
              </el-menu-item>
              <!-- 药品管理菜单 -->
              <el-menu-item index="2">
                <template #title>
                  <el-icon :class="{'icon-large': isCollapsed}"><CopyDocument/></el-icon>
                  <transition name="fade">
                    <el-text v-show="!isCollapsed">科室管理</el-text>
                  </transition>
                </template>
              </el-menu-item>
              <el-menu-item index="3">
                <template #title>
                  <el-icon :class="{'icon-large': isCollapsed}"><Discount/></el-icon>
                  <transition name="fade">
                    <el-text v-show="!isCollapsed">护士管理</el-text>
                  </transition>
                </template>
              </el-menu-item>
              <el-menu-item index="4">
                <template #title>
                  <el-icon :class="{'icon-large': isCollapsed}"><Calendar /></el-icon>
                  <transition name="fade">
                    <el-text v-show="!isCollapsed">住院管理</el-text>
                  </transition>
                </template>
              </el-menu-item>
              <el-menu-item index="5">
                <template #title>
                  <el-icon :class="{'icon-large': isCollapsed}"><Filter /></el-icon>
                  <transition name="fade">
                    <el-text v-show="!isCollapsed">药品管理</el-text>
                  </transition>
                </template>
              </el-menu-item>
            </el-menu>
            <el-button type="warning" @click="toggleSidebar" :icon="!isCollapsed ? ArrowLeft : ArrowRight" style="position:relative; left: 10px"/>
          </el-scrollbar>



        </el-aside>


        <el-main style="min-height:calc(100vh - 80px)">
          <router-view>

          </router-view>

        </el-main>
      </el-container>
    </el-container>
  </div>

<!--  <router-view>-->

<!--  </router-view>-->


</template>

<style scoped>
@keyframes rotate-icon {
  from{
    transform: rotate(0deg);
  }
  to{
    transform: rotate(180deg);
  }
}
.icon-rotate{
  /* 应用动画，持续1s*/
  animation: rotate-icon 1s;
}
/*设置文本渐变消失和显示*/
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

/* 侧边栏的动画过渡 */
.el-aside  {
  transition: width 0.3s;
}
.el-icon{
  transition: all 0.5s;
}
.icon-large {
  transform: scale(1.5);

}


.user-profile {
  text-align: center;
  padding: 20px;
}
.user-avatar {
  border-radius: 50%; /* 使头像呈圆形 */
  width: 100px; /* 头像大小 */
  height: 100px; /* 头像大小 */
  border: 2px solid #fff; /* 可选的: 为头像添加边框 */
  margin-bottom: 10px;
}
.user-name {
  font-size: 16px;
  color: #333;
  margin-bottom: 20px;
}
.layout-container-demo .el-header {
  position: relative;
  background-color: var(--el-color-primary-light-7);
  color: var(--el-text-color-primary);
}
.layout-container-demo .el-aside {
  color: var(--el-text-color-primary);
  background: var(--el-color-primary-light-8);
}
.layout-container-demo .el-menu {
  border-right: none;
}
.layout-container-demo .el-main {
  padding: 0;
}
.layout-container-demo .toolbar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  right: 20px;
}
</style>