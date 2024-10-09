<template>
  <div class="card-container">
    <a-tabs type="card">

      <a-tab-pane key="program" tab="程序管理">
        <a-table :dataSource="programDataSource" :columns="programColumns"/>
      </a-tab-pane>

      <!-- 正确使用 rightExtra 插槽 -->
      <template #rightExtra>
        <a-space>
          <a-select
              ref="select"
              v-model:value="projectValue"
              placeholder="选择项目"
              :options="projectOptions"
              @change="changeProject"
              style="width: 200px"
          >
          </a-select>
          <a-button type="primary" @click="handleAddProgram">新增</a-button>
        </a-space>
      </template>
    </a-tabs>
    <a-modal v-model:open="createProgramIsModalVisible" title="创建程序" centered @ok="handleCreateProgramOk"
             :confirm-loading="createProgramConfirmLoading"
             @cancel="handleCreateProgramCancel">
      <a-form layout="horizontal" :labelCol="{ span: 5 }"
              :wrapperCol="{ span: 16 }"
      >
        <a-form-item label="程序名称">
          <a-input v-model:value="programName" placeholder="请输入程序名称(程序名创建后不能修改)"/>
        </a-form-item>
        <a-form-item label="项目">
          <a-select
              ref="select"
              v-model:value="projectValue"
              placeholder="选择项目"
              :options="projectOptions"
          >
          </a-select>
        </a-form-item>
        <a-form-item label="启动命令">
          <a-input v-model:value="startCommand" placeholder="启动命令相对于根目录执行"/>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script>

import {ref, onMounted} from "vue";
import {SearchOutlined} from '@ant-design/icons-vue';
import http from "@/util/http";
import {message} from "ant-design-vue";

export default {
  setup() {
    const programDataSource = ref([])
    const programName = ref("")
    const projectValue = ref(undefined)
    const projectOptions = ref([])
    const startCommand = ref("")
    const createProgramIsModalVisible = ref(false);
    const createProgramConfirmLoading = ref(false);
    const programColumns = [];

    const handleCreateProgramOk = async () => {
      try {
        let response = await http.post('/programs/add_program', {
          "program_name": programName.value,
          "project_id": projectValue.value,
          "start_command": startCommand.value,
        })
        if (response.data) {
          message.success(`程序${programName.value}创建成功`)
        }

      } catch (err) {
        console.log(err)
      }
    }
    const handleCreateProgramCancel = () => {
      createProgramIsModalVisible.value = false;
    }

    const changeProject = () => {

    }
    const handleAddProgram = () => {
      createProgramIsModalVisible.value = true;
    }
    onMounted(async () => {
      let response = await http.get("/programs/programs")
      console.log(response.data)
      let projectResponse = await http.get('/projects/projects');
      console.log(projectResponse);
      projectOptions.value =  projectResponse.data.map(item => ({
        label: item.ProjectName,
        value: item.ID,
      }));
    })
    return {
      programName,
      projectValue,
      startCommand,
      projectOptions,
      programColumns,
      programDataSource,
      createProgramIsModalVisible,
      createProgramConfirmLoading,
      changeProject,
      handleAddProgram,
      handleCreateProgramOk,
      handleCreateProgramCancel,
      SearchOutlined,
    }
  }
}

</script>
<style scoped>

</style>