<script setup>

</script>

<template>

  <div style="width: 100vw;height: 100vh;overflow: hidden;display: flex">
    <div style="flex:1;background-color: black">
      <el-image style="width: 100%;height: 100%" fit="cover"
                src="src/image/RE4wtbD.jpg"/>
    </div>
    <div class="welcome-title">
      <div style="font-size: 30px;font-weight: bold">欢迎来到医疗管理系统</div>
      <div style="margin-top: 10px">高效快捷的医疗团队管理</div>
      <div style="margin-top: 5px">全面的医疗设备管理</div>
    </div>
    <div class="right-card">
      <router-view v-slot="{Component}">
        <transition name="el-fade-in-linear" mode="out-in">
          <component :is="Component"></component>
        </transition>
      </router-view>
    </div>
  </div>

</template>

<style scoped>
.welcome-title {
  position: absolute;
  bottom: 30px;
  left: 30px;
  color: white;
  text-shadow: 0 0 30px black;
}
.right-card {
  width: 400px;
  z-index: 1;
  background-color: var(--el-bg-color);
}
</style>