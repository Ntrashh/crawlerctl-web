
<template>
  <div class="card-container">
    <a-tabs v-model:activeKey="activeKey" type="card">
      <a-tab-pane key="pyenv" tab="pyenv环境">
        <a-table :dataSource="dataSource" :columns="columns"/>
      </a-tab-pane>
      <a-tab-pane key="virtual" tab="虚拟环境">
        <a-table :dataSource="dataSource" :columns="columns"/>
      </a-tab-pane>

      <!-- 正确使用 rightExtra 插槽 -->
      <template #rightExtra>
        <a-button type="primary" @click="handleAdd">新增</a-button>
      </template>
    </a-tabs>

    <!-- 弹出框部分 -->
    <a-modal v-model:open="isModalVisible" title="创建环境" :confirm-loading="confirmLoading" centered @ok="handleOk"
             @cancel="handleCancel">
      <template v-if="activeKey === 'pyenv'">
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
      </template>

      <template v-else-if="activeKey === 'virtual'">
        <a-form layout="horizontal" :labelCol="{ span: 6 }"
                :wrapperCol="{ span: 18 }"
        >
          <a-form-item label="Python 版本">
            <a-select
                ref="select"
                v-model:value="value"
                @focus="focus"
                :options="options"
            >
            </a-select>
          </a-form-item>
          <a-form-item label="虚拟环境名称">
            <a-input v-model:value="name" placeholder="请输入虚拟环境名称"/>
          </a-form-item>
        </a-form>
      </template>

    </a-modal>
  </div>
</template>


<script>
import {computed, h, onMounted, ref, watch} from 'vue';
import {CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined, SettingOutlined} from "@ant-design/icons-vue";
import {axiosGet, axiosPost} from "@/util/fetch.js";
import {Button, message, Modal} from "ant-design-vue";
import axios from "axios";
import router from "@/router/index.js";


export default {
  setup() {
    const activeKey = ref('pyenv');
    // 定义 dataSource 和 columns
    const dataSource = ref([]);
    const isModalVisible = ref(false);
    const options = ref([]);
    const value = ref(undefined);
    const name = ref("");
    const loadingStates = ref({});
    const taskStatus = ref('pending'); // 保存任务状态
    const taskResult = ref(null);      // 保存任务结果
    const confirmLoading = ref(false);

    // 根据 activeKey 动态计算 columns
    const columns = computed(() => {
      if (activeKey.value === 'pyenv') {
        return [
          {
            title: '版本',
            dataIndex: 'version',
            key: 'version',
          },
          {
            title: '路径',
            dataIndex: 'path',
            key: 'path'
          },
          {
            title: '全局版本',
            key: 'isGlobal',
            customRender: ({record}) => {
              return record.isGlobal ? h(CheckOutlined, {style: 'color: green;'}) : h(CloseOutlined, {style: 'color: red;'});
            }
          },
          {
            title: '操作', // 新增的操作列
            key: 'actions',
            customRender: ({record}) => {
              return h('div', [
                // 编辑按钮
                h(
                    Button,
                    {
                      type: 'link',
                      icon: h(SettingOutlined),
                      onClick: () => handleSetGlobal(record),
                    },
                    () => '设置为全局版本'
                ),
                // 删除按钮
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
          }
        ];


      } else if (activeKey.value === 'virtual') {
        return [
          {
            title: '环境名称',
            dataIndex: 'envName',
            key: 'envName',
          },
          {
            title: '版本',
            dataIndex: 'version',
            key: 'version',
          },
          {
            title: '路径',
            dataIndex: 'path',
            key: 'path',
          },
          {
            title: '操作', // 新增的操作列
            key: 'actions',
            customRender: ({record}) => {
              return h('div', [
                h(
                    Button,
                    {
                      type: 'link',
                      icon: h(SettingOutlined),
                      onClick: () => handleManage(record),
                    },
                    () => '管理'
                ),
                // 删除按钮
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
          }

        ];
      }
    });
    const fetchData = async (key) => {
      const response = await axiosGet(`/envs/get_versions?type=${key}`); // 将 activeKey 作为查询参数
      dataSource.value = response.data; // 更新 dataSource
    };
    // 监听 activeKey 的变化，并重新获取数据
    watch(activeKey, (newKey) => {
      dataSource.value = []
      fetchData(newKey);
    });

    watch(isModalVisible, async (newVal) => {
      if (newVal) {
        if (activeKey.value === "pyenv") {
          // 发起请求获取 Python 版本数据
          const response = await axiosGet('/envs/remote_versions'); // 替换为实际接口
          options.value = response.data.map(item => ({
            label: item, // 版本名
            value: item, // 版本ID
          }));
        } else {
          const response = await axiosGet('/envs/get_versions', {
            "type": "pyenv"
          }); // 替换为实际接口
          for (const item of response.data) {
            if (item.isGlobal) {
              value.value = item.version;
            }
          }
          options.value = response.data.map(item => ({
            label: item.version, // 版本名
            value: item.version, // 版本ID
          }));
        }

      }
    });


    const handleAdd = () => {
      isModalVisible.value = true;  // 显示弹出框
    };

    const pythonInstall = async function () {
      // 发起安装请求并获取任务 ID
      try {
        const response = await axiosPost("/envs/install", {version: value.value});
        const taskId = response.data;  // 从响应中获取任务 ID
        console.log(`Task ID: ${taskId}`);
        isModalVisible.value = false;  // 隐藏弹出框
        message.success(`Python ${value.value}安装任务提交成功:${taskId}`);
        // 轮询任务状态
        const intervalId = setInterval(async () => {
          try {
            const statusResponse = await axiosGet(`/tasks/task_status?task_id=${taskId}`);
            const statusData = statusResponse.data;
            // console.log(statusData.error)
            taskStatus.value = statusData.status;  // 更新任务状态
            taskResult.value = statusData.result;  // 更新任务结果
            console.log(`Task Status: ${taskStatus.value}`);
            // 如果任务完成或失败，停止轮询
            if (taskStatus.value === 'done' || taskStatus.value === 'failed') {
              clearInterval(intervalId);  // 停止轮询
              // console.log('Task Result:', taskResult.value);
              if (taskStatus.value === 'done') {
                // 任务成功处理逻辑
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
                    await fetchData(activeKey.value)
                    console.log('ok');
                  },
                });
              } else if (taskStatus.value === 'failed') {
                console.log(statusData)
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
                    await fetchData(activeKey.value)
                  },
                });
              }
            }
          } catch (error) {
            console.log(error);
            clearInterval(intervalId);  // 停止轮询
          }
        }, 4000);  // 每隔3秒轮询一次任务状态
      } catch (error) {
        console.log(error);
      }
    }

    const virtualenvCreate = async function () {
      try {
        const nameStr = name.value;
        const versionStr = value.value;
        confirmLoading.value = true;
        const response = await axiosPost("/envs/create_virtualenv", {
          "version": versionStr,
          "env_name": nameStr
        }, {
          timeout: 60000  // 设置超时时间为 5000 毫秒（5秒）
        })
        confirmLoading.value = false;
        isModalVisible.value = false;  // 隐藏弹出框
        message.success(`虚拟环境${nameStr} 版本${versionStr}创建成功` );
        fetchData(activeKey.value)
      } catch (error) {
        confirmLoading.value = false
        console.log(error)
      }
    }
    const handleOk = async () => {
      if (activeKey.value === 'pyenv') {
        await pythonInstall()
      } else {
        await virtualenvCreate()
      }

    };


    // 编辑操作的处理函数
    const handleSetGlobal = async (record) => {
      try {
        const response = await axiosPost("/envs/set_global", {
          "version": record.version,
        })

        message.success(`设置版本: ${record.version}为全局版本成功`, 3);
        await fetchData(activeKey.value)
      } catch (error) {
        // console.log(error);
      }
      // 在这里处理编辑逻辑
    };

// 删除操作的处理函数
    const handleDelete = async (record) => {
      try {
        console.log(record)
        loadingStates.value = {...loadingStates.value, [record.version]: true};
        if (activeKey.value ==="pyenv"){
          const response = await axiosPost("/envs/delete_python", {
            "version": record.version,
          })
          message.success(`删除Python版本${record.version}成功`, 3);
        }else{
          const response = await axiosPost("/envs/delete_virtualenv", {
            "env_name":record.envName
          })
          message.success(`删除虚拟环境 ${record.envName} 版本:${record.version} 成功`, 3);
        }

        await fetchData(activeKey.value)
      } catch (error) {
        console.log(error);
      } finally {
        // 请求完成后将 loading 状态设为 false
        loadingStates.value = {...loadingStates.value, [record.version]: false};
      }
    };


    const handleCancel = () => {
      isModalVisible.value = false;  // 隐藏弹出框
    };

    const handleManage = async (record) => {
      router.push({path:"/envs/virtualenv", query: { envName: record.envName }} ); // 跳转到对应的路由
    }

    // 在组件挂载时初次获取数据
    onMounted(() => {
      fetchData(activeKey.value);
    });
    const focus = () => {
      console.log('focus');
    };
    // 返回 dataSource 和 columns
    return {
      handleOk,
      handleCancel,
      handleAdd,
      handleSetGlobal,
      handleDelete,
      focus,
      confirmLoading,
      isModalVisible,
      dataSource,
      columns,
      activeKey,
      options,
      value,
      name
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
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  height: 100%; /* 设置高度以支持垂直居中 */
}
</style>
