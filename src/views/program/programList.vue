<template>
  <div class="card-container">
    <a-tabs type="card">

      <a-tab-pane key="program" tab="程序管理">
        <a-table :dataSource="programDataSource" :columns="programColumns"/>
      </a-tab-pane>
      <!-- 正确使用 rightExtra 插槽 -->
      <template #rightExtra>
        <a-button type="primary" @click="handleAddProgram">新增</a-button>
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
          <a-input v-model:value="script" placeholder="启动命令相对于根目录执行"/>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script>

import {ref} from "vue";

export default {
  setup() {
    const programDataSource = ref([])
    const programName = ref("")
    const projectValue = ref(undefined)
    const projectOptions = ref([])
    const createProgramIsModalVisible = ref(false);
    const createProgramConfirmLoading = ref(false);
    const programColumns = [];

    const handleCreateProgramOk = () => {

    }
    const handleCreateProgramCancel = () => {

    }
    const handleAddProgram = () => {
      createProgramIsModalVisible.value = true;
    }
    return {
      programName,
      projectValue,
      projectOptions,
      programColumns,
      programDataSource,
      createProgramIsModalVisible,
      createProgramConfirmLoading,
      handleAddProgram,
      handleCreateProgramOk,
      handleCreateProgramCancel,
    }
  }
}

</script>
<style scoped>

</style>