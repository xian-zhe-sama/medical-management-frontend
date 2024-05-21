<script setup >

import {EditPen, Lock, Message, Search, User} from "@element-plus/icons-vue";
import {onMounted, ref,reactive} from "vue";
import {get,post} from "@/net/index"
import {ElMessage, ElMessageBox} from "element-plus";
const item = {}
const dialogFormVisible = ref(false);
const tableData = ref(Array.from({ length: 10 }).fill(item))
const searchText = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const jumpPage = ref('');
const selectedAccountIds = ref([]);
const pagePlaceholder = ref();
const formLabelWidth = '140px'
const isQuery = ref(false);
const formRef=ref();
const departmentList=ref([]);
const isEdit=ref(false)

const form = reactive({
  id: '',
  username: '',
  password: '',
  password_repeat: '',
  email: '',
  role: '',
});
const formInit = reactive({
  id: '',
  username: '',
  password: '',
  password_repeat: '',
  email: '',
  role: '',
});
const validatePassword = (rule,value,callback)=>{
  if(value ===''){
    callback(new Error('请再次输入密码'))
  }else if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  }else{
    callback();
  }
}

const validateUsername = (rule,value,callback) =>{
  if (value === '') {
    callback(new Error('请输入用户名'))
  }else if (!/^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test(value)) {
    callback(new Error('用户名不能包含特殊字符，只能是中英文'))
  }else {
    callback();
  }
}

const rule = {
  username: [
    {validator: validateUsername, trigger: ['blur', 'change']},
    {min: 2, max: 12, message: '用户名的长度必须在2-12个之间', trigger: ['blur', 'change']}
  ],
  password: [
    {required: true, message: '请输入密码', trigger: ['blur']},
    {min: 6, max: 20, message: '密码的长度必须在6-20个字符之间', trigger: ['blur']}
  ],
  password_repeat:[
    {validator: validatePassword, trigger: ['blur', 'change']}
  ],
  email:[
    {required: true,message:'请输入邮件地址', trigger: 'blur'},
    {type:'email',message:'请输入合法的电子邮件地址', trigger: ['blur']}
  ],
  role:[
    {required:true,message:'请选择权限',trigger:'blur'}
  ]
}

onMounted(()=>{
  get("/api/account/getAll"+`?currentPage=1`,(data)=>{
    tableData.value = data.records.map((record) => {
      console.log(record.birthday)
      // 更新记录
      return {
        ...record,
        role: calculateRole(record.role),
        registerTimeView:formatDate(record.registerTime)
      };
    })
    totalPages.value=data.pages
    pagePlaceholder.value=`${currentPage.value} / ${totalPages.value}`
  })
})
function getDepartmentList(){
  get(`/api/department/list`,(data)=>{
    console.log("成功获取科室列表")
    departmentList.value = data
  },(message)=>{
    ElMessage.warning("获取科室列表失败",message)
  })
}

function getAllaccount()
{
  get("/api/account/getAll"+`?currentPage=${currentPage.value}`,(data)=>{
    tableData.value = data.records.map((record) => {
      console.log(record.birthday)
      // 更新记录
      return {
        ...record,
        role: calculateRole(record.role),
        registerTimeView:formatDate(record.registerTime)
      };
    })
    totalPages.value=data.pages
    pagePlaceholder.value=`${currentPage.value} / ${totalPages.value}`
    isQuery.value = false;
  })
}

function calculateRole(role) {
  if (role === 'admin') {
    return '管理员'
  }
  if (role === 'doctor') {
    return '医生'
  }
  if (role === 'nurse') {
    return '护士'
  }
  if (role === 'user') {
    return '普通用户'
  }
  if (role === 'pharmacist') {
    return '药品管理员'
  }
}

function formatDate(dateString) {
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };
  const date = new Date(dateString);
  const formatter = new Intl.DateTimeFormat('zh-CN', options);
  const parts = formatter.formatToParts(date);
  let year, month, day;
  for (const part of parts) {
    if (part.type === 'year') {
      year = part.value;
    }else if (part.type === 'month') {
      month = part.value;
    }else if (part.type === 'day') {
      day = part.value;
    }
  }

  const timeString = date.toTimeString().split(' ')[0];
  return `${year}-${month}-${day} ${timeString}`
}

function getAccountByName(){
  if(!isQuery.value){
    currentPage.value = 1;
  }
  get("/api/account/getByName"+`?name=${searchText.value}&currentPage=${currentPage.value}`,(data)=>{
    totalPages.value = data.pages
    tableData.value = data.records.map((record) => {
      // 更新记录
      return {
        ...record,
        role: calculateRole(record.role),
        registerTimeView:formatDate(record.registerTime)
      };
    })
    pagePlaceholder.value=`${currentPage.value} / ${totalPages.value}`
    isQuery.value = searchText.value !== '';
  })
}
function saveAccount() {
  formRef.value.validate((valid) => {
    if (valid) {
      if(isEdit.value){
        post("/api/account/change",form,()=>{
          if (isQuery.value) {
            getAccountByName()
          }else{
            getAllaccount();
          }
          ElMessage.success('保存成功')
          Object.assign(form, formInit)
          dialogFormVisible.value = false;
        },(message)=>{
          ElMessage.warning(message);
        })
      }else {
        post("/api/account/save",form,()=>{
          if (isQuery.value) {
            getAccountByName()
          }else{
            getAllaccount();
          }
          ElMessage.success('保存成功')
          Object.assign(form, formInit)
          dialogFormVisible.value = false;
        },(message)=>{
          ElMessage.warning(message);
        })
      }
    }else{
      ElMessage.warning('请填写正确的信息')
    }
  })
}

function resetForm(){
  formRef.value.resetFields();
  Object.assign(form, formInit)
}

function deleteSelected() {
  if (selectedAccountIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的账号');
  }else {
    ElMessageBox.confirm('确定要删除选中的账号吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      console.log('删除账号：', selectedAccountIds.value);
      post('api/account/batchDelete',selectedAccountIds.value,()=>{
        ElMessage.success('删除成功')
        if(isQuery.value){
          getAccountByName()
        }else {
          getAllaccount()
        }
      })
    })
  }
  console.log('Selected doctor IDs:', selectedAccountIds.value);
}
function handleDelete(account) {
  ElMessageBox.confirm('确定要删除该账号吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    console.log(account)
    post('api/account/deleteById',account,()=>{
      ElMessage.success('删除成功')
      if(isQuery.value){
        getAccountByName()
      }else{
        getAllaccount()
      }
    })
    console.log('删除账号：', account);
  }).catch(() => {
    // 取消删除逻辑
  });
}

function jumpToPage() {
  const page = parseInt(jumpPage.value);
  if (!isNaN(page) && page >= 1 && page <= totalPages.value) {
    changePage(page);
  } else {
    ElMessage.error('请输入正确的页数');
    jumpPage.value = `${currentPage.value}`;
  }
}

/**
 * 处理选择项变化的事件处理器。
 * @param {Array} selection - 用户选择的账号列表，每个项包含一个doctorId。
 */
function handleSelectionChange(selection) {
  // 将选择的账号映射并更新到selectedDoctorIds中
  selectedAccountIds.value = selection.map((item) => item.id)
}
function handleEditCancle() {
  Object.assign(form, formInit)
  dialogFormVisible.value = false;
}
function handleEdit(account) {
  isEdit.value=true
  Object.assign(form, account)
  dialogFormVisible.value = true;
}

function addNew() {
  isEdit.value = false;
  dialogFormVisible.value = true;
}
//页面跳转函数，默认为第一页，默认每页10条数据
function changePage(newPage) {
  console.log(newPage)
  currentPage.value = newPage
  jumpPage.value=newPage
  if (isQuery.value) {
    getAccountByName();
  }else{
    getAllaccount();
  }

}
</script>

<template>
  <div>
    <div class="top-div">
      <el-row type="flex" justify="end" align="middle" style="height: 100%;">
        <el-col  style="text-align: right;">
          <el-button type="primary" @click="addNew" style="margin-right: 8px;" plain >新增</el-button>
          <el-button type="danger" style="margin-right: 8px;" plain @click="deleteSelected">批量删除</el-button>
          <el-input placeholder="请输入账号名" style="width: auto; " v-model="searchText"></el-input>
          <el-button type="primary"  @click="getAccountByName" :icon="Search"></el-button>
        </el-col>
      </el-row>
    </div>

    <el-dialog align-center v-model="dialogFormVisible" title="保存用户信息" width="500">
      <el-form :model="form" :rules="rule" ref="formRef">
        <el-form-item prop="username" v-if="!isEdit" >
          <el-input v-model="form.username" minlength="2" maxlength="8" type="text" placeholder="用户名" autocomplete="off">
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password" v-if="!isEdit">
          <el-input v-model="form.password" minlength="6" maxlength="20" type="password" placeholder="密码" autocomplete="off">
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password_repeat" v-if="!isEdit" >
          <el-input v-model="form.password_repeat" minlength="6" maxlength="20" type="password" placeholder="重复密码">
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item  aria-placeholder="选择用户权限" prop="role">
          <el-select v-model="form.role" placeholder="请选择权限">
            <el-option label="管理员" value="admin"></el-option>
            <el-option label="医生" value="doctor"></el-option>
            <el-option label="护士" value="nurse"></el-option>
            <el-option label="药品管理员" value="pharmacist"></el-option>
            <el-option label="用户" value="user"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="email" v-if="!isEdit" :disabled="isEdit">
          <el-input v-model="form.email"  type="email" placeholder="电子邮箱">
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="warning" @click="resetForm">重置</el-button>
          <el-button @click="handleEditCancle">取消</el-button>
          <el-button type="primary" @click="saveAccount">提交</el-button>
        </div>
      </template>
    </el-dialog>
    <el-scrollbar>
      <el-table
          :data="tableData"
          @selection-change="handleSelectionChange"
          style="width: 100%;font-size: 17px"
      >
        <el-table-column
            type="selection"
            width="55">
        </el-table-column>
        <el-table-column prop="id" label="用户编号" />
        <el-table-column prop="username" label="用户名称" />
        <el-table-column prop="email" label="用户邮箱" />
        <el-table-column prop="role" label="用户权限"/>
        <el-table-column prop="registerTimeView" label="用户注册时间" />
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <div class="table-operation-buttons">
              <el-button size="default" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="default" type="danger" @click="handleDelete(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-scrollbar>
    <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
      <el-button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">上一页</el-button>

      <el-input v-model="jumpPage" :placeholder="pagePlaceholder"  style="width: 100px; margin: 0 10px;"></el-input>
      <el-button @click="jumpToPage">跳转</el-button>
      <el-button :disabled="currentPage === totalPages|| totalPages<1" @click="changePage(currentPage + 1)">下一页</el-button>
    </div>
  </div>
</template>

<style scoped>
.top-div{
  background-color: white;
  height: 50px;
  width: 100%;
}
.dialog-footer{
  text-align: right;
}

.table-operation-buttons {
  display: flex;
  justify-content: center; /* 水平居中 */
}
</style>