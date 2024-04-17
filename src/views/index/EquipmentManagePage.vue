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
const selectedEquipmentIds = ref([]);
const pagePlaceholder = ref();
const formLabelWidth = '140px'
const isQuery = ref(false);
const formRef=ref();
const departmentList=ref([]);
const form = ref({
  equipmentId: '',
  name: '',
  status: '',
  department: '',
});
const rule = ref({
  name: [
    {required: true, message: '请输入设备名',  trigger: ['blur', 'change']},
  ],
  equipmentId: [
    { required: true, message: '请输入设备编号', trigger: 'blur' },
    { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'blur' }
  ],
  status: [
    {required: true, message: '请选择设备状态', trigger: ['blur', 'change']},
  ],
  departmentId: [
    {required: true, message: '请选择科室', trigger: ['blur', 'change']},
  ],
});


onMounted(()=>{
  get("/api/equipment/getAll"+`?currentPage=1`,(data)=>{
    tableData.value = data.records
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

function getAllequipment()
{
  get("/api/equipment/getAll"+`?currentPage=${currentPage.value}`,(data)=>{
    tableData.value = data.records
    totalPages.value=data.pages
    pagePlaceholder.value=`${currentPage.value} / ${totalPages.value}`
    isQuery.value = false;
  })
}


function getEquipmentByName(){
  if(!isQuery.value){
    currentPage.value = 1;
  }
  get("/api/equipment/getByName"+`?name=${searchText.value}&currentPage=${currentPage.value}`,(data)=>{
    totalPages.value = data.pages
    tableData.value = data.records
    pagePlaceholder.value=`${currentPage.value} / ${totalPages.value}`
    isQuery.value = searchText.value !== '';
  })
}
function saveEquipment() {
  formRef.value.validate((valid) => {
    if (valid) {
      post("/api/equipment/save",form.value,()=>{
        if (isQuery.value) {
          getEquipmentByName()
        }else{
          getAllequipment();
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
  if (selectedEquipmentIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的设备');
  }else {
    ElMessageBox.confirm('确定要删除选中的设备吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      console.log('删除设备：', selectedEquipmentIds.value);
      post('api/equipment/batchDelete',selectedEquipmentIds.value,()=>{
        ElMessage.success('删除成功')
        if(isQuery.value){
          getEquipmentByName()
        }else {
          getAllequipment()
        }
      })
    })
  }
  console.log('Selected doctor IDs:', selectedEquipmentIds.value);
}
function handleDelete(equipment) {
  ElMessageBox.confirm('确定要删除该设备吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    console.log(equipment)
    post('api/equipment/deleteById',equipment,()=>{
      ElMessage.success('删除成功')
      if(isQuery.value){
        getEquipmentByName()
      }else{
        getAllequipment()
      }
    })
    console.log('删除设备：', equipment);
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
 * @param {Array} selection - 用户选择的设备列表，每个项包含一个doctorId。
 */
function handleSelectionChange(selection) {
  // 将选择的设备映射并更新到selectedDoctorIds中
  selectedEquipmentIds.value = selection.map((item) => item.equipmentId)
}
function handleEdit(equipment) {
  Object.assign(form.value, equipment)
  this.dialogFormVisible = true;
}

//页面跳转函数，默认为第一页，默认每页10条数据
function changePage(newPage) {
  console.log(newPage)
  currentPage.value = newPage
  jumpPage.value=newPage
  if (isQuery.value) {
    getEquipmentByName();
  }else{
    getAllequipment();
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
          <el-input placeholder="请输入设备名" style="width: auto; " v-model="searchText"></el-input>
          <el-button type="primary"  @click="getEquipmentByName" :icon="Search"></el-button>
        </el-col>
      </el-row>
    </div>

    <el-dialog align-center v-model="dialogFormVisible" title="保存设备信息" width="500">
      <el-form :model="form" :rules="rule" ref="formRef">
        <el-form-item label="设备名称" :label-width="formLabelWidth" prop="name">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="科室" :label-width="formLabelWidth" prop="departmentId">
          <el-select v-model="form.departmentId" placeholder="请选择科室" @click="getDepartmentList">
            <el-option v-for="department in departmentList" :key="department.departmentId" :label="department.name" :value="department.departmentId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设备状态" :label-width="formLabelWidth" aria-placeholder="选择设备状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="正常" value="正常"></el-option>
            <el-option label="故障" value="故障"></el-option>
            <el-option label="维修中" value="维修中"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetForm">重置</el-button>
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEquipment">提交</el-button>
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
        <el-table-column prop="equipmentId" label="设备编号" />
        <el-table-column prop="name" label="设备名称" />
        <el-table-column prop="status" label="状态" />
        <el-table-column prop="departmentName" label="科室"/>
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