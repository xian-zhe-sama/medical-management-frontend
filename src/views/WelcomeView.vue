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
      <div style="margin-top: 10px">在这里你可以找到各种医疗设施</div>
      <div style="margin-top: 5px">在这里你可以找到各个学校的医疗团队</div>
    </div>
    <div class="right-card">
      <router-view/>
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
  background-color: white;
}
</style>