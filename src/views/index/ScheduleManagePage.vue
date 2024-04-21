<script setup >

import {Search} from "@element-plus/icons-vue";
import {onMounted, ref} from "vue";
import {get,post} from "@/net/index.js"
import {ElMessage, ElMessageBox} from "element-plus";
const item = {}
const dialogFormVisible = ref(false);
const tableData = ref(Array.from({ length: 10 }).fill(item))
const searchText = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const jumpPage = ref('');
const selectedScheduleIds = ref([]);
const pagePlaceholder = ref();
const formLabelWidth = '140px'
const isQuery = ref(false);
const formRef=ref();
const departmentList=ref([]);
const form = ref({
  scheduleId: '',
  name: '',
  status: '',
  department: '',
});
const rule = ref({
  name: [
    {required: true, message: '请输入日程信息名',  trigger: ['blur', 'change']},
  ],
  scheduleId: [
    { required: true, message: '请输入日程信息编号', trigger: 'blur' },
    { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'blur' }
  ],
  status: [
    {required: true, message: '请选择日程信息状态', trigger: ['blur', 'change']},
  ],
  departmentId: [
    {required: true, message: '请选择科室', trigger: ['blur', 'change']},
  ],
});


onMounted(()=>{
  get("/api/schedule/getAll"+`?currentPage=1`,(data)=>{
    tableData.value = data.records.map((record) => {
      console.log(record.birthday)
      // 更新记录
      return {
        ...record,
        startTime: formatDate(record.startDate),
        endTime: formatDate(record.endDate),
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

function getAllschedule()
{
  get("/api/schedule/getAll"+`?currentPage=${currentPage.value}`,(data)=>{
    tableData.value = data.records.map((record) => {
      console.log(record.birthday)
      // 更新记录
      return {
        ...record,
        startTime: formatDate(record.startDate),
        endTime: formatDate(record.endDate),
      };
    })
    totalPages.value=data.pages
    pagePlaceholder.value=`${currentPage.value} / ${totalPages.value}`
    isQuery.value = false;
  })
}


function getScheduleByName(){
  if(!isQuery.value){
    currentPage.value = 1;
  }
  get("/api/schedule/getByName"+`?name=${searchText.value}&currentPage=${currentPage.value}`,(data)=>{
    totalPages.value = data.pages
    tableData.value = data.records.map((record) => {
      console.log(record.birthday)
      // 更新记录
      return {
        ...record,
        startTime: formatDate(record.startDate),
        endTime: formatDate(record.endDate),
      };
    })
    pagePlaceholder.value=`${currentPage.value} / ${totalPages.value}`
    isQuery.value = searchText.value !== '';
  })
}
function saveSchedule() {
  formRef.value.validate((valid) => {
    if (valid) {
      post("/api/schedule/save",form.value,()=>{
        if (isQuery.value) {
          getScheduleByName()
        }else{
          getAllschedule();
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
  if (selectedScheduleIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的日程信息');
  }else {
    ElMessageBox.confirm('确定要删除选中的日程信息吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      console.log('删除日程信息：', selectedScheduleIds.value);
      post('api/schedule/batchDelete',selectedScheduleIds.value,()=>{
        ElMessage.success('删除成功')
        if(isQuery.value){
          getScheduleByName()
        }else {
          getAllschedule()
        }
      })
    })
  }
  console.log('Selected doctor IDs:', selectedScheduleIds.value);
}
function handleDelete(schedule) {
  ElMessageBox.confirm('确定要删除该日程信息吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    console.log(schedule)
    post('api/schedule/deleteById',schedule,()=>{
      ElMessage.success('删除成功')
      if(isQuery.value){
        getScheduleByName()
      }else{
        getAllschedule()
      }
    })
    console.log('删除日程信息：', schedule);
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
 * @param {Array} selection - 用户选择的日程信息列表，每个项包含一个doctorId。
 */
function handleSelectionChange(selection) {
  // 将选择的日程信息映射并更新到selectedDoctorIds中
  selectedScheduleIds.value = selection.map((item) => item.scheduleId)
}
function handleEdit(schedule) {
  Object.assign(form.value, schedule)
  this.dialogFormVisible = true;
}

//页面跳转函数，默认为第一页，默认每页10条数据
function changePage(newPage) {
  console.log(newPage)
  currentPage.value = newPage
  jumpPage.value=newPage
  if (isQuery.value) {
    getScheduleByName();
  }else{
    getAllschedule();
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
</script>

<template>
  <div>
    <div class="top-div">
      <el-row type="flex" justify="end" align="middle" style="height: 100%;">
        <el-col  style="text-align: right;">
          <el-button type="primary" @click="dialogFormVisible = true" style="margin-right: 8px;" plain disabled>新增</el-button>
          <el-button type="danger" style="margin-right: 8px;" plain @click="deleteSelected">批量删除</el-button>
          <el-input placeholder="请输入医生名称" style="width: auto; " v-model="searchText"></el-input>
          <el-button type="primary"  @click="getScheduleByName" :icon="Search"></el-button>
        </el-col>
      </el-row>
    </div>

    <el-dialog align-center v-model="dialogFormVisible" title="保存值班信息" width="500">
      <el-form :model="form" :rules="rule" ref="formRef">
        <el-form-item label="日程信息名称" :label-width="formLabelWidth" prop="name">
          <el-input v-model="form.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="开始时间" :label-width="formLabelWidth" prop="startTime">
          <el-date-picker v-model="form.startTime" type="datetime" placeholder="选择值班开始时间" />
        </el-form-item>
        <el-form-item label="结束时间" :label-width="formLabelWidth" prop="endTime">
          <el-date-picker v-model="form.endTime" type="datetime" placeholder="选择值班结束时间" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetForm">重置</el-button>
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="saveSchedule">提交</el-button>
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
        <el-table-column prop="scheduleId" label="日程信息编号" />
        <el-table-column prop="name" label="医生名称" />
        <el-table-column prop="departmentName" label="科室"/>
        <el-table-column prop="startTime" label="开始时间" />
        <el-table-column prop="endTime" label="结束时间" />
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