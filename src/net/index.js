import axios from 'axios'
import {ElMessage} from "element-plus";
//用户token名称
const authItemName = "access_token"

const defaultFailure = (message,code,url)=>{
    console.warn(`请求地址：${url},状态码：${code},错误信息:${message}`)
    ElMessage.warning(message)
}

const defaultError = (err) =>{
    console.error(err)
    ElMessage.warning('发生了一些错误，请联系管理员')
}

function takeAccessToken() {
    const str = localStorage.getItem(authItemName) || sessionStorage.getItem(authItemName);
    if(!str) {
        // ElMessage.warning('未检测到本地token')
        return null;
    }
    const authObj = JSON.parse(str);
    if (authObj.expire <= new Date()) {
        deleteAccessToken()
        ElMessage.warning('登录状态已过期，请重新登录')
        return null
    }
    return authObj.token
    // ElMessage.success(`成功获得本地token${authObj.token}`)
}

function storeAccessToken(token, remember, expire) {
    const authObj = {token:token, expire: expire}
    //存到storage里要以字符串的形式
    const str = JSON.stringify(authObj)
    if (remember) {
        localStorage.setItem(authItemName,str)
    }else{
        sessionStorage.setItem(authItemName,str)
    }
}

function deleteAccessToken() {
    localStorage.removeItem(authItemName);
    sessionStorage.removeItem(authItemName);
}
//获取请求头
function accessHeader(){
    const token = takeAccessToken();
    // ElMessage.success(`token+++++++${takeAccessToken()}`)
    // ElMessage.success('{')
    // ElMessage.success(`Authorization : Bearer ${token}`)
    // ElMessage.success('}')
    return token ? {'Authorization':`Bearer ${takeAccessToken()}`} : {};
}
//内部封装Post
function internalPost(url,data,header,success,failure,error=defaultError){
    axios.post(url,data,{headers:header}).then(({data})=>{
        if(data.code=== 200){
            success(data.data)
        }else{
            failure(data.message,data.code,url)
        }
    }).catch(err =>error(err))
}

//内部封装Get
function internalGet(url,header,success,failure,error=defaultError) {
    // ElMessage.success(`header ++++++++++++${header.Authorization}`)
//     axios({
//         method: 'get',
//         url: url,
//         headers: header,
//     }).then(({data}) => {
//         if (data.code === 200) {
//             success(data.data)
//         } else {
//             failure(data.message, data.code, url)
//         }
//     }).catch(err => error(err))
// }
    axios.get(url,{headers:header}).then(({data})=>{
        if(data.code=== 200){
            success(data.data)
        }else{
            failure(data.message,data.code,url)
        }
    }).catch(err =>error(err))
}

//封装的外部使用的get
function get(url, success, failure = defaultFailure) {
    internalGet(url,accessHeader(),success,failure)
}

//封装的外部使用的post
function post(url,data,success,failure= defaultFailure){
    internalPost(url,data,accessHeader(),success,failure)
}
function login(username,password,remember,success,failure=defaultFailure){
    internalPost('/api/auth/login',{
        username: username,
        password: password,
    },{
        //springSecurity只支持表单登录，所以把axios的默认json变成表单的形式
        'Content-Type': 'application/x-www-form-urlencoded',

    },(data)=>{
        storeAccessToken(data.token,remember,data.expire)
        ElMessage.success(`登陆成功，欢迎${data.username}`)
        success(data);
    },failure)
}
function logout(success,failure = defaultFailure){
   get('/api/auth/logout',()=>{
       deleteAccessToken();
       ElMessage.success('退出登录成功，欢迎您再次使用')
       success()
   },failure)
}

//未登录为true
function unauthorized (){
    return !takeAccessToken();
}
//将方法暴露出去
export {login,logout,get,post,unauthorized}