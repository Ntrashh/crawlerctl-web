<script setup lang="ts"></script>

<template>
  <div class="card-container">
    <a-tabs type="card">
      <a-tab-pane key="pyenv" tab="pyenv环境">
        <a-table :dataSource="dataSource" :columns="columns" />
      </a-tab-pane>
      <!-- 正确使用 rightExtra 插槽 -->
      <template #rightExtra>
        <a-button type="primary" @click="handlePythonAdd">新增</a-button>
      </template>
    </a-tabs>

    <!-- 弹出框部分 -->
    <a-modal
      v-model:open="isModalVisible"
      title="新增python版本"
      :confirm-loading="confirmLoading"
      centered
      @ok="handlePythonOk"
      @cancel="handlePythonCancel"
    >
      <div class="centered-container">
        <a-form name="customized_form_controls" layout="inline" open>
          <a-form-item
            name="install_version"
            label="选择安装的Python版本"
          ></a-form-item>
          <a-form-item>
            <a-select
              v-model:value="value"
              show-search
              placeholder="Select python version"
              style="width: 200px"
              :options="options"
            ></a-select>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<style scoped></style>
