

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from "@/router";
import axios from "axios";
import 'element-plus/theme-chalk/dark/css-vars.css'

axios.defaults.baseURL='http://localhost:8080'   //默认访问路径
const app = createApp(App);

app.use(createPinia())
app.use(router)


app.mount('#app')
