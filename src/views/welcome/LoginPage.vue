<script setup>
const form = reactive({
  username : '',
  password : '',
  remember: false,

});
</script>

<template>

  <div style="text-align:center;margin: 0 20px">
    <div style="margin-top: 150px">
      <div style="font-size: 25px;font-weight: bold">登录</div>
      <div style="font-size: 14px;color: grey">在进入系统前请先输入用户名和密码登录</div>
    </div>
    <div style="margin-top: 50px">
      <el-form v-model="form">
        <el-form-item>
          <el-input v-model="form.username" maxlength="10" type="text" placeholder="用户名/邮箱">
          </el-input>
        </el-form-item>
      </el-form>

    </div>
  </div>

</template>

<style scoped>

</style>