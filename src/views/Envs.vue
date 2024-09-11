<template>
  <div class="card-container">
    <a-tabs v-model:activeKey="activeKey" type="card">
      <a-tab-pane key="pyenv" tab="pyenv环境">
        <a-table :dataSource="dataSource" :columns="columns"/>
      </a-tab-pane>
      <a-tab-pane key="virtual" tab="虚拟环境">
        <a-table :dataSource="dataSource" :columns="columns"/>
      </a-tab-pane>
      <template #rightExtra>
        <a-button type="primary"  @click="handleAdd">新增</a-button>
      </template>
    </a-tabs>

    <!--弹出框部分 -->
    <a-modal  v-model:visible="isModalVisible" title="创建环境" centered @ok="handleOk" @cancel="handleCancel" >
      <template v-if="activeKey === 'pyenv'">
        <div class="centered-container">
          <a-form name="customized_form_controls" layout="inline" open>
            <a-form-item name="install_version" label="选择安装的Python版本">
            </a-form-item>
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
        <p>这是虚拟环境的新增内容</p>
      </template>
    </a-modal>

  </div>
</template>


<script>
import {computed, h, onMounted, ref, watch} from 'vue';
import axios from "axios";
import {message} from "ant-design-vue";
import {CheckOutlined, CloseOutlined} from "@ant-design/icons-vue";


export default {
  setup() {
    const activeKey = ref('pyenv');
    // 定义 dataSource 和 columns
    const dataSource = ref([]);
    const isModalVisible = ref(false);
    const options = ref([]);
    const value = ref(undefined);
    let eventSource = null; // 用于存储 SSE 连接
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
            key: 'path',
          },
          {
            title: '全局版本',
            key: 'isGlobal',
            customRender: ({record}) => {
              return record.isGlobal ? h(CheckOutlined, {style: 'color: green;'}) : h(CloseOutlined, {style: 'color: red;'});
            }
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

        ];
      }
    });
    const fetchData = async (key) => {
      try {
        const response = await axios.get(`/envs/get_versions?type=${key}`); // 将 activeKey 作为查询参数
        dataSource.value = response.data.data; // 更新 dataSource
      } catch (error) {
        console.error('获取数据失败:', error);
        message.error(error.response.data.message);
      }
    };
    // 监听 activeKey 的变化，并重新获取数据
    watch(activeKey, (newKey) => {
      fetchData(newKey);
    });

    watch(isModalVisible, async (newVal) => {
      if (newVal) {
        try {
          console.log(newVal)
          // 发起请求获取 Python 版本数据
          const response = await axios.get('/envs/remote_versions'); // 替换为实际接口
          options.value = response.data.data.map(item => ({
            label: item, // 版本名
            value: item, // 版本ID
          }));
        } catch (error) {
          console.error('获取 Python 版本失败:', error);
          message.error(error.response.data.message);
        }
      }
    });


    const handleAdd = () => {
      isModalVisible.value = true;  // 显示弹出框
    };

    const handleOk = () => {
      isModalVisible.value = false;  // 隐藏弹出框
      startSSE();
    };
    const startSSE = () => {
      const version = '3.9.2'; // 你需要传递的参数
      const eventSource = new EventSource(`http://192.168.0.118:8080/envs/install?version=${version}`);

      // 监听每次收到的消息
      eventSource.onmessage = (event) => {
        // 任务完成时关闭模态框
        if (event.data === true) {
          eventSource.close(); // 任务完成后关闭 SSE 连接
          isModalVisible.value = false;
        }
      };

      // 监听 SSE 错误
      eventSource.onerror = (error) => {
        console.error('SSE 错误', error);
        loading.value = false;
        eventSource.close();
      };
    };

    const handleCancel = () => {
      isModalVisible.value = false;  // 隐藏弹出框
    };

    // 在组件挂载时初次获取数据
    onMounted(() => {
      fetchData(activeKey.value);
    });

    // 返回 dataSource 和 columns
    return {
      isModalVisible,
      handleOk,
      handleCancel,
      handleAdd,
      dataSource,
      columns,
      activeKey,
      options,
      value
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
  justify-content: center;  /* 水平居中 */
  align-items: center;  /* 垂直居中 */
  height: 100%;  /* 设置高度以支持垂直居中 */
}
</style>
