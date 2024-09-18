<template>
  <div class="card-container">
    <a-tabs type="card">
      <a-tab-pane key="pyenv" tab="pyenv环境">
        <a-table :dataSource="dataSource" :columns="columns"/>
      </a-tab-pane>
      <!-- 正确使用 rightExtra 插槽 -->
      <template #rightExtra>
        <a-button type="primary" @click="handlePythonAdd">新增</a-button>
      </template>
    </a-tabs>

    <!-- 弹出框部分 -->
    <a-modal v-model:open="isModalVisible"
             title="新增python版本" :confirm-loading="confirmLoading" centered
             @ok="handlePythonOk"
             @cancel="handlePythonCancel">
      <div class="centered-container">
        <a-form name="customized_form_controls" layout="inline" open>
          <a-form-item name="install_version" label="选择安装的Python版本"></a-form-item>
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

<script>
import {computed, h, onMounted, ref, watch} from 'vue';
import {CheckOutlined, CloseOutlined, DeleteOutlined, SettingOutlined} from "@ant-design/icons-vue";
import {axiosGet, axiosPost} from "@/util/fetch.js";
import {Button, message, Modal} from "ant-design-vue";

export default {
  name: "Python",
  setup() {
    const activeKey = ref('pyenv');
    const dataSource = ref([]);
    const isModalVisible = ref(false);
    const options = ref([]);
    const value = ref(undefined);
    const loadingStates = ref({});
    const taskStatus = ref('pending');
    const confirmLoading = ref(false);

    // 表格列配置
    const columns = computed(() => {
      return [
        {
          title: '版本',
          dataIndex: 'version',
          key: 'version',
          width: 200,
        },
        {
          title: '路径',
          dataIndex: 'path',
          key: 'path',
          width: 600,

        },
        {
          title: '全局版本',
          key: 'isGlobal',
          width: 200,
          customRender: ({record}) => {
            return record.isGlobal
                ? h(CheckOutlined, {style: 'color: green;'})
                : h(CloseOutlined, {style: 'color: red;'});
          },
        },
        {
          title: '操作',
          key: 'actions',
          width: 300,

          customRender: ({record}) => {
            return h('div', [
              h(
                  Button,
                  {
                    type: 'link',
                    icon: h(SettingOutlined),
                    onClick: () => handleSetGlobal(record),
                  },
                  () => '设置为全局版本'
              ),
              h(
                  Button,
                  {
                    type: 'link',
                    danger: true,
                    icon: h(DeleteOutlined),
                    loading: loadingStates.value[record.version] || false,
                    onClick: () => handleDelete(record),
                  },
                  () => '删除'
              ),
            ]);
          },
        },
      ];
    });

    // 获取 Python 环境数据
    const fetchPythonData = async () => {
      try {
        const response = await axiosGet(`/envs/get_versions?type=pyenv`);
        dataSource.value = response.data;
      } catch (error) {
        console.error('获取 Python 环境数据失败:', error);
      }
    };

    // 获取远程版本数据
    const fetchRemoteVersions = async () => {
      try {
        const response = await axiosGet('/envs/remote_versions');
        options.value = response.data.map(item => ({
          label: item,
          value: item,
        }));
      } catch (error) {
        console.error('获取远程版本失败:', error);
      }
    };

    // 监听弹窗是否打开，并加载版本数据
    watch(isModalVisible, async (newVal) => {
      if (newVal) {
        await fetchRemoteVersions();
      }
    });

    // 添加 Python 版本
    const handlePythonAdd = () => {
      isModalVisible.value = true;
    };

    // 安装 Python 版本
    const pythonInstall = async () => {
      try {
        const response = await axiosPost("/envs/install", {version: value.value});
        const taskId = response.data;
        message.success(`Python ${value.value}安装任务提交成功: ${taskId}`);
        isModalVisible.value = false;
        await pollTaskStatus(taskId);
      } catch (error) {
        console.error('安装 Python 版本失败:', error);
      }
    };

    // 轮询任务状态
    const pollTaskStatus = async (taskId) => {
      try {
        const statusResponse = await axiosGet(`/tasks/task_status?task_id=${taskId}`);
        const statusData = statusResponse.data;
        taskStatus.value = statusData.status;

        if (taskStatus.value === 'done' || taskStatus.value === 'failed') {
          handleTaskCompletion(statusData);
        } else {
          setTimeout(() => pollTaskStatus(taskId), 4000);
        }
      } catch (error) {
        console.error('轮询任务状态失败:', error);
      }
    };

    // 处理任务完成逻辑
    const handleTaskCompletion = (statusData) => {
      if (taskStatus.value === 'done') {
        Modal.success({
          title: `安装${statusData.result.version}版本成功!`,
          content: h('div', {}, [
            h('p', {
              style: {
                whiteSpace: 'pre-line'  // 使用 pre-line 样式来保留换行符
              }
            }, statusData.result.message),
          ]),
          async onOk() {
            await fetchPythonData();
          },
        });
      } else if (taskStatus.value === 'failed') {
        Modal.error({
          title: `安装${statusData.result.version}版本失败!`,
          content: h('div', {}, [
            h('p', {
              style: {
                whiteSpace: 'pre-line'  // 使用 pre-line 样式来保留换行符
              }
            }, statusData.result.message),
          ]),
          async onOk() {
            await fetchPythonData();
          },
        });
      }
    };

    // 设置全局版本
    const handleSetGlobal = async (record) => {
      try {
        await axiosPost("/envs/set_global", {version: record.version});
        message.success(`设置版本 ${record.version} 为全局版本成功`);
        await fetchPythonData();
      } catch (error) {
        console.error('设置全局版本失败:', error);
      }
    };

    // 删除操作
    const handleDelete = async (record) => {
      try {
        loadingStates.value = {...loadingStates.value, [record.version]: true};
        let version = await axiosGet("/projects/projects_by_version", {
          "version": record.version,
        })
        if (version.data) {
          message.error("当前Python版本正被项目依赖，无法删除!")
          return
        }
        await axiosPost("/envs/delete_python", {version: record.version});
        message.success(`删除 Python 版本 ${record.version} 成功`);
        await fetchPythonData();
      } catch (error) {
        console.error('删除版本失败:', error);
      } finally {
        loadingStates.value = {...loadingStates.value, [record.version]: false};
      }
    };

    // OK 按钮处理
    const handlePythonOk = async () => {
      await pythonInstall();
    };

    // 取消按钮处理
    const handlePythonCancel = () => {
      isModalVisible.value = false;
    };

    // 组件挂载时获取数据
    onMounted(() => {
      fetchPythonData();
    });

    return {
      handlePythonOk,
      handlePythonCancel,
      handlePythonAdd,
      handleSetGlobal,
      handleDelete,
      isModalVisible,
      confirmLoading,
      dataSource,
      columns,
      options,
      value,

    };
  }
};
</script>

<style scoped>
.card-container p {
  margin: 0;
}

.card-container > .ant-tabs-card .ant-tabs-content {
  height: 120px;
  margin-top: -16px;
}

.card-container > .ant-tabs-card .ant-tabs-content > .ant-tabs-tabpane {
  padding: 16px;
  background: #fff;
}

.card-container > .ant-tabs-card > .ant-tabs-nav::before {
  display: none;
}

.card-container > .ant-tabs-card .ant-tabs-tab,
[data-theme='compact'] .card-container > .ant-tabs-card .ant-tabs-tab {
  background: transparent;
  border-color: transparent;
}

.card-container > .ant-tabs-card .ant-tabs-tab-active,
[data-theme='compact'] .card-container > .ant-tabs-card .ant-tabs-tab-active {
  background: #fff;
  border-color: #fff;
}

.centered-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
