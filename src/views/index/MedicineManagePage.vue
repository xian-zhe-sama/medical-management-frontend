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
const selectedMedicineIds = ref([]);
const pagePlaceholder = ref();
const formLabelWidth = '140px'
const isQuery = ref(false);
const formRef=ref();
const form = ref({
  medicineId: '',
  name: '',
  description: '',
  price: '',
  quantity: '',
  inboundTime: '',
  expirationTime: '',
});
const rule = ref({
  name: [
    { required: true, message: '请输入药品名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  medicineId: [
    { required: true, message: '请输入药品编号', trigger: 'blur' },
    { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入药品描述', trigger: 'blur' },
  ],
  price: [
    { required: true, message: '请输入药品价格', trigger: 'blur' },
  ],
  quantity: [
    {required: true, message: '请输入药品数量', trigger: ['blur', 'change']},
  ],
  inboundTime: [
    {type: 'date', required: true, message: '请选择过期日期', trigger: ['blur', 'change']},
  ],
  expirationTime: [
    {type: 'date', required: true, message: '请选择生产日期', trigger: ['blur', 'change']},
  ],
});
onMounted(()=>{
  get("/api/medicine/getAll"+`?currentPage=1`,(data)=>{
    totalPages.value=data.pages
    pagePlaceholder.value=`${currentPage.value} / ${totalPages.value}`
    tableData.value = data.records;
  })
})
function getAllMedicine()
{
  get("/api/medicine/getAll"+`?currentPage=${currentPage.value}`,(data)=>{
    totalPages.value=data.pages
    pagePlaceholder.value=`${currentPage.value} / ${totalPages.value}`
    tableData.value = data.records;
    isQuery.value = false;
  })
}
function getMedicineByName(){
  if(!isQuery.value){
    currentPage.value = 1;
  }
  get("/api/medicine/getByName"+`?name=${searchText.value}&currentPage=${currentPage.value}`,(data)=>{
    tableData.value = data.records;
    pagePlaceholder.value=`${currentPage.value} / ${totalPages.value}`
    isQuery.value = searchText.value !== '';
  })
}
function saveMedicine() {
  formRef.value.validate((valid) => {
    if (valid) {
      post("/api/medicine/save",form.value,()=>{
        if (isQuery.value) {
          getMedicineByName()
        }else{
          getAllMedicine();
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
  if (selectedMedicineIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的药品');
  }else {
    ElMessageBox.confirm('确定要删除选中的药品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      console.log('删除药品：', selectedMedicineIds.value);
      post('api/medicine/batchDelete',selectedMedicineIds.value,()=>{
        ElMessage.success('删除成功')
        if(isQuery.value){
          getMedicineByName()
        }else {
          getAllMedicine()
        }
      })
    })
  }
  console.log('Selected doctor IDs:', selectedMedicineIds.value);
}
function handleDelete(medicine) {
  ElMessageBox.confirm('确定要删除该药品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    console.log(medicine)
    post('api/medicine/deleteById',medicine,()=>{
      ElMessage.success('删除成功')
      if(isQuery.value){
        getMedicineByName()
      }else{
        getAllMedicine()
      }
    })
    console.log('删除药品：', medicine);
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
 * @param {Array} selection - 用户选择的药品列表，每个项包含一个doctorId。
 */
function handleSelectionChange(selection) {
  // 将选择的药品映射并更新到selectedDoctorIds中
  selectedMedicineIds.value = selection.map((item) => item.medicineId)
}
function handleEdit(medicine) {
  Object.assign(form.value, medicine)
  this.dialogFormVisible = true;
}

//页面跳转函数，默认为第一页，默认每页10条数据
function changePage(newPage) {
  console.log(newPage)
  currentPage.value = newPage
  jumpPage.value=newPage
  if (isQuery.value) {
    getMedicineByName();
  }else{
    getAllMedicine();
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
          <el-input placeholder="请输入药品名" style="width: auto; " v-model="searchText"></el-input>
          <el-button type="primary"  @click="getMedicineByName" :icon="Search"></el-button>
        </el-col>
      </el-row>
    </div>

    <el-dialog align-center v-model="dialogFormVisible" title="保存药品信息" width="500">
      <el-form :model="form" :rules="rule" ref="formRef">
        <el-form-item label="药品名" :label-width="formLabelWidth" prop="name">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="描述" :label-width="formLabelWidth" prop="description">
          <el-input v-model="form.description" autocomplete="off" />
        </el-form-item>
        <el-form-item label="价格" :label-width="formLabelWidth" prop="price">
          <el-input-number v-model="form.price" :precision="2" :min="0.01" :max="999999999" :controls="false" />
        </el-form-item>
        <el-form-item label="数量" :label-width="formLabelWidth" prop="quantity">
          <el-input-number v-model="form.quantity" :min="1" :max="999999999" :controls="false" />
        </el-form-item>
        <el-form-item label="生产日期" :label-width="formLabelWidth" prop="inboundTime">
          <el-date-picker v-model="form.inboundTime" type="date" placeholder="Pick a day" />
        </el-form-item>
        <el-form-item label="过期日期" :label-width="formLabelWidth" prop="expirationTime">
          <el-date-picker v-model="form.expirationTime" type="date" placeholder="Pick a day" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="warning" @click="resetForm">重置</el-button>
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="saveMedicine">提交</el-button>
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
        <el-table-column prop="medicineId" label="药品编号" />
        <el-table-column prop="name" label="药品名称" />
        <el-table-column prop="description" label="描述" >
          <template #default="scope">
            <el-scrollbar style="height: 42px">
              <div>{{ scope.row.description }}</div>
            </el-scrollbar>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" />
        <el-table-column prop="quantity" label="数量" />
        <el-table-column prop="inboundTime" label="生产日期" />
        <el-table-column prop="expirationTime" label="过期日期" />
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