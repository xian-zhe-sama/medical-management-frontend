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
const selectedDepartmentIds = ref([]);
const pagePlaceholder = ref();
const formLabelWidth = '140px'
const isQuery = ref(false);
const form = ref({
  name: '',
  departmentId: '',
});
const formInit = ref({
  name: '',
  departmentId: '',
});
const rule = ref({
  name: [
    { required: true, message: '请输入科室名', trigger: 'blur' },
    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  departmentId: [
    { required: true, message: '请输入科室编号', trigger: 'blur' },
  ],
});

onMounted(()=>{
  get("/api/department/getAll"+`?currentPage=1`,(data)=>{
    totalPages.value=data.pages
    pagePlaceholder.value=`${currentPage.value} / ${totalPages.value}`
    tableData.value = data.records;
  })
})

function getAllDepartment()
{
  get("/api/department/getAll"+`?currentPage=${currentPage.value}`,(data)=>{
    if(data.pages!==0)
    totalPages.value=data.pages
    pagePlaceholder.value=`${currentPage.value} / ${totalPages.value}`
    tableData.value = data.records;
    isQuery.value = false;
  })
}
function getDepartmentByName(){
  if(!isQuery.value){
    currentPage.value = 1;
  }
  get("/api/department/getDepartmentByName"+`?name=${searchText.value}&currentPage=${currentPage.value}`,(data)=>{
    tableData.value = data.records;
    pagePlaceholder.value=`${currentPage.value} / ${totalPages.value}`
    isQuery.value = searchText.value !== '';
  });
}
function saveDepartment()
{
  post("/api/department/save",form.value,()=>{
    if (isQuery.value) {
      getDepartmentByName()
    }else{
      getAllDepartment();
    }
    ElMessage.success('保存成功')
    Object.assign(form, formInit)
    dialogFormVisible.value = false;
  })
}
function deleteSelected() {
  if (selectedDepartmentIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的科室');
  }else {
    ElMessageBox.confirm('确定要删除选中的科室吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      console.log('删除科室：', selectedDepartmentIds.value);
      post('api/department/batchDelete',selectedDepartmentIds.value,()=>{
        ElMessage.success('删除成功')
        if(isQuery.value){
          getDepartmentByName()
        }else {
          getAllDepartment()
        }

      })
    })
  }

  console.log('Selected doctor IDs:', selectedDepartmentIds.value);

}
function handleDelete(department) {
  ElMessageBox.confirm('确定要删除该科室吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    console.log(department)
    post('api/department/deleteById',department,()=>{
      ElMessage.success('删除成功')
      getAllDepartment()
    })
    console.log('删除科室：', department);
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
    jumpPage.value = 2;
  }
}

/**
 * 处理选择项变化的事件处理器。
 * @param {Array} selection - 用户选择的科室列表，每个项包含一个doctorId。
 */
function handleSelectionChange(selection) {
  // 将选择的科室映射并更新到selectedDoctorIds中
  selectedDepartmentIds.value = selection.map((item) => item.departmentId)
}
function handleEdit(department) {
  Object.assign(form.value, department)
  this.dialogFormVisible = true;
}

//页面跳转函数，默认为第一页，默认每页10条数据
function changePage(newPage) {
  console.log(newPage)
  currentPage.value = newPage
  jumpPage.value=newPage
  if (isQuery.value) {
    getDepartmentByName();
  }else{
    getAllDepartment();
  }

}

function handleEditCancle() {
  Object.assign(form, formInit)
  dialogFormVisible.value = false;
}
</script>

<template>
<div>
  <div class="top-div">
    <el-row type="flex" justify="end" align="middle" style="height: 100%;">
      <el-col  style="text-align: right;">
        <el-button type="primary" @click="dialogFormVisible = true" style="margin-right: 8px;" plain >新增</el-button>
        <el-button type="danger" style="margin-right: 8px;" plain @click="deleteSelected">批量删除</el-button>
        <el-input placeholder="请输入科室名" style="width: auto; " v-model="searchText"></el-input>
        <el-button type="primary"  @click="getDepartmentByName" :icon="Search"></el-button>
      </el-col>
    </el-row>
  </div>

  <el-dialog align-center v-model="dialogFormVisible" title="保存科室信息" width="500">
    <el-form :model="form" :rules="rule" ref="formRef">
      <el-form-item label="科室id" :label-width="formLabelWidth" prop="departmentId" v-if="false">
        <el-input v-model="form.departmentId" autocomplete="off" />
      </el-form-item>
    </el-form>
    <el-form :model="form" :rules="rule" ref="formRef">
      <el-form-item label="科室名" :label-width="formLabelWidth" prop="name">
        <el-input v-model="form.name" autocomplete="off" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleEditCancle">取消</el-button>
        <el-button type="primary" @click="saveDepartment">
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
      <el-table-column prop="departmentId" label="科室编号" />
      <el-table-column prop="name" label="科室" />
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