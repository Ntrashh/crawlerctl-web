<template>
  <div class="card-container">
    <a-tabs type="card">

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
    </a-modal>
  </div>
</template>


<script>
import {computed, h, onMounted, ref, watch} from 'vue';
import {DeleteOutlined, SettingOutlined} from "@ant-design/icons-vue";
import {axiosGet, axiosPost} from "@/util/fetch.js";
import {Button, message} from "ant-design-vue";
import router from "@/router/index.js";


export default {
  name: "VirtualenvList",
  setup() {
    // 定义 dataSource 和 columns
    const dataSource = ref([]);
    const isModalVisible = ref(false);
    const options = ref([]);
    const value = ref(undefined);
    const name = ref("");
    const loadingStates = ref({});
    const confirmLoading = ref(false);

    // 根据 activeKey 动态计算 columns
    const columns = computed(() => {
      return [
        {
          title: '环境名称',
          dataIndex: 'envName',
          key: 'envName',
          width: 300,

        },
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
          title: '操作', // 新增的操作列
          key: 'actions',
          width: 200,
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
    });

    const fetchVirtualenvData = async () => {
      try {
        const response = await axiosGet(`/envs/get_versions?type=virtual`);
        dataSource.value = response.data;
      } catch (error) {
        console.error('获取虚拟环境数据失败:', error);
      }
    };

    watch(isModalVisible, async (newVal) => {
      if (newVal) {
        const response = await axiosGet('/envs/get_versions', {
          "type": "pyenv"
        }); // 替换为实际接口
        for (const item of response.data) {
          if (item.isGlobal) {
            value.value = item.version;
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


    const virtualenvCreate = async function () {
      try {
        const nameStr = name.value;
        const versionStr = value.value;
        confirmLoading.value = true;
        await axiosPost("/envs/create_virtualenv", {
          "version": versionStr,
          "env_name": nameStr
        }, {
          timeout: 60000
        })
        confirmLoading.value = false;
        isModalVisible.value = false;  // 隐藏弹出框
        message.success(`虚拟环境${nameStr} 版本${versionStr}创建成功`);
        await fetchVirtualenvData()
      } catch (error) {
        confirmLoading.value = false
        console.log(error)
      }
    }
    const handleOk = async () => {
      await virtualenvCreate()
    };


    // 删除操作的处理函数
    const handleDelete = async (record) => {
      try {
        loadingStates.value = {...loadingStates.value, [record.version]: true};
        let  version = await axiosGet("/projects/projects_by_version",{
          "version": record.version,
        })
        if(version.data){
          message.error("当前虚拟环境正被项目依赖，无法删除!")
          return
        }

        await axiosPost("/envs/delete_virtualenv", {
          "env_name": record.envName
        })
        message.success(`删除虚拟环境 ${record.envName} 版本:${record.version} 成功`, 3);
        await fetchVirtualenvData()
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
      await router.push({path: "/virtualenv/manager", query: {envName: record.envName}}); // 跳转到对应的路由
    }

    onMounted(() => {
      fetchVirtualenvData()
    });

    const focus = () => {
      console.log('focus');
    };
    // 返回 dataSource 和 columns
    return {
      handleOk,
      handleCancel,
      handleAdd,
      handleDelete,
      focus,
      confirmLoading,
      isModalVisible,
      dataSource,
      columns,
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
