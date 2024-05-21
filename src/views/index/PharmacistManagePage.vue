<script  setup>

import {reactive, ref} from "vue";
import {Search} from "@element-plus/icons-vue";
import {ElMessage, ElMessageBox} from "element-plus";
import {onMounted} from "vue";
import {get, post} from "@/net"
import axios from "axios";
const item = {

}
const tableData = ref(Array.from({ length: 10 }).fill(item))
const searchText = ref('');
const formRef = ref();
const currentPage = ref(1)
const totalPages =  ref(0)
const jumpPage = ref('')
const selectedPharmacistIds = ref([])
const pagePlaceholder = ref()
const isQuery = ref(false)
function getAllPharmacists() {
  console.log('currentPage:' + currentPage.value);
  get('api/pharmacist/getAll'+`?currentPage=${currentPage.value}`, (data) => {
    isQuery.value=false
    totalPages.value=data.pages
    if(jumpPage.value!==''){
      currentPage.value=jumpPage.value
    }
    tableData.value = data.records.map((record) => {
      // 更新记录
      return {
        ...record,
        age: calculateAge(record.birthday)
      };
    })
    pagePlaceholder.value=`${currentPage.value} / ${totalPages.value}`
  })
}
onMounted(() => {
  get('api/pharmacist/getAll'+`?currentPage=${currentPage.value}`,(data) => {
    tableData.value = data.records.map((record) => {
      // 更新记录
      return {
        ...record,
        age: calculateAge(record.birthday)
      };
    })
    // totalPages=data.pages
    totalPages.value = data.pages
    pagePlaceholder.value=`${currentPage.value} / ${totalPages.value}`
  })
})

/**
 * 计算给定生日日期到当前日期的年龄。
 * @param {string|Date} birthday - 生日，可以是日期字符串或Date对象。
 * @returns {number} 当前年龄。
 */
function calculateAge(birthday) {
  // 获取当前日期
  const today = new Date();
  // 将生日参数转换为Date对象
  const birthDate = new Date(birthday);
  // 计算基础年龄差（按年计算）
  let age = today.getFullYear() - birthDate.getFullYear();
  // 计算月份差异，以调整可能的年龄错误
  const monthDiff = today.getMonth() - birthDate.getMonth();
  // 如果出生月份还未到达，或者出生日期在当前日期之后，则年龄减一
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
//页面跳转函数，默认为第一页，默认每页10条数据
function changePage(newPage) {
  console.log(newPage)
  currentPage.value = newPage
  jumpPage.value=newPage
  if (isQuery.value) {
    getPharmacistByName()
  }else{
    getAllPharmacists();
  }
}


/**
 * 处理选择项变化的事件处理器。
 * @param {Array} selection - 用户选择的药品管理员列表，每个项包含一个pharmacistId。
 */
function handleSelectionChange(selection) {
  // 将选择的药品管理员映射并更新到selectedPharmacistIds中
  selectedPharmacistIds.value = selection.map((item) => item.pharmacistId)
}

function handleEdit(pharmacist) {
  Object.assign(form, pharmacist)
  this.dialogFormVisible = true;
}
function handleDelete(pharmacist) {
  ElMessageBox.confirm('确定要删除该药品管理员吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    console.log(pharmacist)
    post('api/pharmacist/deleteById',pharmacist,()=>{
      ElMessage.success('删除成功')
      if (isQuery.value) {
        getPharmacistByName()
      }else {
        getAllPharmacists();
      }
    })
    console.log('删除药品管理员：', pharmacist);
  }).catch(() => {
    // 取消删除逻辑
  });
}
function deleteSelected() {
  if (selectedPharmacistIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的药品管理员');
  }else {
    ElMessageBox.confirm('确定要删除选中的药品管理员吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      post('api/pharmacist/batchDelete',selectedPharmacistIds.value,()=>{
        ElMessage.success('删除成功')
        if (isQuery.value) {
          getPharmacistByName();
        } else {
          getAllPharmacists();
        }

      })
    })
  }
  console.log('Selected pharmacist IDs:', selectedPharmacistIds.value);
}

function getPharmacistByName() {
  if (!isQuery.value) {
    currentPage.value=1;
  }
  console.log(searchText.value)
  get('api/pharmacist/getByName'+`?name=${searchText.value}`+`&currentPage=${currentPage.value}`,(data) => {
    totalPages.value = data.pages
    tableData.value = data.records.map((record) => {
      // 更新记录
      return {
        ...record,
        age: calculateAge(record.birthday)
      };
    })
    pagePlaceholder.value=`${currentPage.value} / ${totalPages.value}`
    isQuery.value = searchText.value !== '';
    console.log(isQuery.value)
  })
}

const validateUsername = (rule,value,callback) =>{
  if (value === '') {
    callback(new Error('请输入姓名'))
  }else if (!/^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test(value)) {
    callback(new Error('姓名不能包含特殊字符，只能是中英文'))
  }else {
    callback();
  }
}
const validatePhoneNumber = (rule,value, callback) => {
  // 定义中国大陆手机号的正则表达式规则
  const reg = /^1[3-9]\d{9}$/;
  if (value === '') {
    callback(new Error('请输入手机号'));
  } else if (!reg.test(value)) {
    callback(new Error('手机号格式不正确'));
  } else {
    callback();
  }
};
//姓名和手机号验证
const rule ={
  name: [
    {validator: validateUsername, trigger: ['blur', 'change']},
    {min: 2, max: 16, message: '姓名的长度必须在2-16个之间', trigger: ['blur', 'change']}
  ],
  gender: [
    {required: true, message: '请选择性别', trigger: ['blur', 'change']},
  ],
  departmentId: [
    {required: true, message: '请选择科室', trigger: ['blur', 'change']},
  ],
  birthday: [
    {type: 'date', required: true, message: '请选择出生日期', trigger: ['blur', 'change']},
  ],
  phone: [
    {validator: validatePhoneNumber, message: '请输入正确的手机号', trigger: ['blur']},
  ],
  assessment:[
    {required: true, message: '请填写职称信息', trigger: ['blur', 'change']},
  ]

}
const form = reactive({
  pharmacistId: '',
  name: '',
  gender: '',
  departmentId: '',
  birthday: '',
  phone: '',
  assessment: '',
})
const formInit = reactive({
  pharmacistId: '',
  name: '',
  gender: '',
  departmentId: '',
  birthday: '',
  phone: '',
  assessment: '',
})
const dialogFormVisible = ref(false)
const formLabelWidth = '140px'
const departmentList= ref([])
//获取科室列表
function getDepartmentList(){
  get(`/api/department/list`,(data)=>{
    console.log("成功获取科室列表")
    departmentList.value = data
  },(message)=>{
    ElMessage.warning("获取科室列表失败",message)
  })
}
//保存药品管理员
function savePharmacist(){
  formRef.value.validate((valid)=>{
    if(valid){
      post(`/api/pharmacist/save`,{...form},(data)=>{
        Object.assign(form, formInit)
        dialogFormVisible.value = false
        // this.$refs[formRef].resetFields();
        ElMessage.success("成功保存信息")
        if(isQuery.value){
          getPharmacistByName()
        }else {
          getAllPharmacists()
        }
      })
    }else {
      ElMessage.warning("请完整填写内容")
    }
  })
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

function resetForm(){
  formRef.value.resetFields();
  Object.assign(form, formInit)
}
function handleEditCancle() {
  Object.assign(form, formInit)
  dialogFormVisible.value = false;
}
</script>


<template >
  <div>
    <div class="top-div">
      <el-row type="flex" justify="end" align="middle" style="height: 100%;">
        <el-col  style="text-align: right;">
          <el-button type="primary" @click="dialogFormVisible = true" style="margin-right: 8px;" plain >新增</el-button>
          <el-button type="danger" style="margin-right: 8px;" plain @click="deleteSelected">批量删除</el-button>
          <el-input placeholder="请输入姓名" style="width: auto; " v-model="searchText"></el-input>
          <el-button type="primary"  @click="getPharmacistByName" :icon="Search"></el-button>
        </el-col>
      </el-row>
    </div>
    <el-dialog align-center v-model="dialogFormVisible" title="保存药品管理员信息" width="500">
      <el-form :model="form" :rules="rule" ref="formRef">
        <el-form-item label="姓名" :label-width="formLabelWidth" prop="name">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="性别" :label-width="formLabelWidth" prop="gender">
          <el-radio-group v-model="form.gender" >
            <el-radio label="男" />
            <el-radio label="女" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="手机号" :label-width="formLabelWidth" prop="phone">
          <el-input v-model="form.phone" autocomplete="off" />
        </el-form-item>
        <el-form-item label="生日" :label-width="formLabelWidth" prop="birthday">
          <el-date-picker v-model="form.birthday" type="date" placeholder="Pick a day" />
        </el-form-item>

      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="warning" @click="resetForm">重置</el-button>
          <el-button @click="handleEditCancle">取消</el-button>
          <el-button type="primary" @click="savePharmacist">
            提交
          </el-button>
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
        <el-table-column prop="pharmacistId" label="药品管理员编号" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="gender" label="性别" />
        <el-table-column prop="age" label="年龄" />
        <el-table-column prop="phone" label="电话" />
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
.el-button {
  margin: 0 4px; /* 为按钮保存一些空间防止贴在一起 */
}
</style>

