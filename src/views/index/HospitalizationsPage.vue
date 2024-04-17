<script setup >

import {Search} from "@element-plus/icons-vue";
import {onMounted, ref} from "vue";
import {get,post} from "@/net/index"
import {ElMessage, ElMessageBox} from "element-plus";
const item = {}
const dialogFormVisible = ref(false);
const tableData = ref(Array.from({ length: 10 }).fill(item))
const searchText = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const jumpPage = ref('');
const selectedHospitalizationsIds = ref([]);
const pagePlaceholder = ref();
const formLabelWidth = '140px'
const isQuery = ref(false);
const formRef=ref();
const departmentList=ref([]);
const form = ref({
  hospitalizationsId: '',
  name: '',
  remark: '',
  gender: '',
  department: '',
  birthday: '',
});
const rule = ref({
  name: [
    {validator: validateUsername, trigger: ['blur', 'change']},
    {min: 2, max: 16, message: '姓名的长度必须在2-16个之间', trigger: ['blur', 'change']}
  ],
  hospitalizationsId: [
    { required: true, message: '请输入住院编号', trigger: 'blur' },
    { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'blur' }
  ],
  remark: [
    { required: true, message: '请输入患者备注', trigger: 'blur' },
  ],
  birthday: [
    {type: 'date', required: true, message: '请选择出生日期', trigger: ['blur', 'change']},
  ],
  gender: [
    {required: true, message: '请选择性别', trigger: ['blur', 'change']},
  ],
  departmentId: [
    {required: true, message: '请选择科室', trigger: ['blur', 'change']},
  ],
});

function validateUsername (rule,value,callback) {
  if (value === '') {
    callback(new Error('请输入姓名'))
  }else if (!/^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test(value)) {
    callback(new Error('姓名不能包含特殊字符，只能是中英文'))
  }else {
    callback();
  }
}

onMounted(()=>{
  get("/api/hospitalizations/getAll"+`?currentPage=1`,(data)=>{
    tableData.value = data.records.map((record) => {
      console.log(record.birthday)
      // 更新记录
      return {
        ...record,
        age: calculateAge(record.birthday)
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

function getAllhospitalizations()
{
  get("/api/hospitalizations/getAll"+`?currentPage=${currentPage.value}`,(data)=>{
    tableData.value = data.records.map((record) => {
      console.log(record.birthday)
      // 更新记录
      return {
        ...record,
        age: calculateAge(record.birthday)
      };
    })
    totalPages.value=data.pages
    pagePlaceholder.value=`${currentPage.value} / ${totalPages.value}`
    isQuery.value = false;
  })
}

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

function getHospitalizationsByName(){
  if(!isQuery.value){
    currentPage.value = 1;
  }
  get("/api/hospitalizations/getByName"+`?name=${searchText.value}&currentPage=${currentPage.value}`,(data)=>{
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
  })
}
function saveHospitalizations() {
  formRef.value.validate((valid) => {
    if (valid) {
      post("/api/hospitalizations/save",form.value,()=>{
        if (isQuery.value) {
          getHospitalizationsByName()
        }else{
          getAllhospitalizations();
        }
        ElMessage.success('保存成功')
        dialogFormVisible.value = false;
      })
    }else{
      ElMessage.warning('请填写正确的信息')
    }
  })
}

function resetForm(){
  formRef.value.resetFields();
}

function deleteSelected() {
  if (selectedHospitalizationsIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的住院');
  }else {
    ElMessageBox.confirm('确定要删除选中的住院吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      console.log('删除住院：', selectedHospitalizationsIds.value);
      post('api/hospitalizations/batchDelete',selectedHospitalizationsIds.value,()=>{
        ElMessage.success('删除成功')
        if(isQuery.value){
          getHospitalizationsByName()
        }else {
          getAllhospitalizations()
        }
      })
    })
  }
  console.log('Selected doctor IDs:', selectedHospitalizationsIds.value);
}
function handleDelete(hospitalizations) {
  ElMessageBox.confirm('确定要删除该住院吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    console.log(hospitalizations)
    post('api/hospitalizations/deleteById',hospitalizations,()=>{
      ElMessage.success('删除成功')
      if(isQuery.value){
        getHospitalizationsByName()
      }else{
        getAllhospitalizations()
      }
    })
    console.log('删除住院：', hospitalizations);
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
 * @param {Array} selection - 用户选择的住院列表，每个项包含一个doctorId。
 */
function handleSelectionChange(selection) {
  // 将选择的住院映射并更新到selectedDoctorIds中
  selectedHospitalizationsIds.value = selection.map((item) => item.hospitalizationsId)
}
function handleEdit(hospitalizations) {
  Object.assign(form.value, hospitalizations)
  this.dialogFormVisible = true;
}

//页面跳转函数，默认为第一页，默认每页10条数据
function changePage(newPage) {
  console.log(newPage)
  currentPage.value = newPage
  jumpPage.value=newPage
  if (isQuery.value) {
    getHospitalizationsByName();
  }else{
    getAllhospitalizations();
  }

}
</script>

<template>
  <div>
    <div class="top-div">
      <el-row type="flex" justify="end" align="middle" style="height: 100%;">
        <el-col  style="text-align: right;">
          <el-button type="primary" @click="dialogFormVisible = true" style="margin-right: 8px;" plain >新增</el-button>
          <el-button type="danger" style="margin-right: 8px;" plain @click="deleteSelected">批量删除</el-button>
          <el-input placeholder="请输入住院名" style="width: auto; " v-model="searchText"></el-input>
          <el-button type="primary"  @click="getHospitalizationsByName" :icon="Search"></el-button>
        </el-col>
      </el-row>
    </div>

    <el-dialog align-center v-model="dialogFormVisible" title="保存住院信息" width="500">
      <el-form :model="form" :rules="rule" ref="formRef">
        <el-form-item label="患者名" :label-width="formLabelWidth" prop="name">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="性别" :label-width="formLabelWidth" prop="gender">
          <el-radio-group v-model="form.gender" >
            <el-radio label="男" />
            <el-radio label="女" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="科室" :label-width="formLabelWidth" prop="departmentId">
          <el-select v-model="form.departmentId" placeholder="请选择科室" @click="getDepartmentList">
            <el-option v-for="department in departmentList" :key="department.departmentId" :label="department.name" :value="department.departmentId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="患者出生日期" :label-width="formLabelWidth" prop="birthday">
          <el-date-picker v-model="form.birthday" type="date" placeholder="Pick a day" />
        </el-form-item>
        <el-form-item label="备注" :label-width="formLabelWidth" prop="remark">
          <el-input v-model="form.remark" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="warning" @click="resetForm">重置</el-button>
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="saveHospitalizations">提交</el-button>
        </div>
      </template>
    </el-dialog>
    <el-scrollbar>
      <el-table
          :data="tableData"
          @selection-change="handleSelectionChange"
          style="width: 100%"
      >
        <el-table-column
            type="selection"
            width="55">
        </el-table-column>
        <el-table-column prop="hospitalizationsId" label="住院编号" />
        <el-table-column prop="name" label="患者名称" />
        <el-table-column prop="gender" label="性别" />
        <el-table-column prop="age" label="年龄" />
        <el-table-column prop="departmentName" label="科室"/>
        <el-table-column prop="remark" label="备注" >
        <template #default="scope">
          <el-scrollbar style="height: 42px">
            <div>{{ scope.row.remark }}</div>
          </el-scrollbar>
        </template>
      </el-table-column>
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