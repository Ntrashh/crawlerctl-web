<template>
  <div class="card-container">
    <a-tabs v-model:activeKey="activeKey" type="card">
      <a-tab-pane key="1" tab="pyenv环境">
        <a-table :dataSource="dataSource" :columns="columns"/>
      </a-tab-pane>
      <a-tab-pane key="2" tab="虚拟环境">
        <a-table :dataSource="dataSource" :columns="columns"/>
      </a-tab-pane>

    </a-tabs>
  </div>
</template>


<script>
import {h, onMounted, ref} from 'vue';
import axios from "axios";
import {Button} from "ant-design-vue";
import {CheckOutlined, CloseOutlined} from "@ant-design/icons-vue";

const activeKey = ref('1');

export default {
  setup() {
    // 定义 dataSource 和 columns
    const dataSource = ref([]);
    const columns = [
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
          // 使用按钮，并根据 isGlobal 来控制按钮是否禁用
          return record.isGlobal ? h(CheckOutlined, {style: 'color: green;'}) : h(CloseOutlined, {style: 'color: red;'});
        }
      },
    ];

    // 在组件挂载时发送请求获取后端数据
    onMounted(async () => {
      try {
        const response = await axios.get('/envs/get_versions'); // 修改为你的API端点
        dataSource.value = response.data.data; // 将后端返回的数据赋值给 dataSource
        console.log(dataSource.value)
      } catch (error) {
        console.error('获取数据失败:', error);
      }
    });

    // 返回 dataSource 和 columns
    return {
      dataSource,
      columns,
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

#components-tabs-demo-card-top .code-box-demo {
  padding: 24px;
  overflow: hidden;
  background: #f5f5f5;
}

[data-theme='compact'] .card-container > .ant-tabs-card .ant-tabs-content {
  height: 120px;
  margin-top: -8px;
}

[data-theme='dark'] .card-container > .ant-tabs-card .ant-tabs-tab {
  background: transparent;
  border-color: transparent;
}

[data-theme='dark'] #components-tabs-demo-card-top .code-box-demo {
  background: #000;
}

[data-theme='dark'] .card-container > .ant-tabs-card .ant-tabs-content > .ant-tabs-tabpane {
  background: #141414;
}

[data-theme='dark'] .card-container > .ant-tabs-card .ant-tabs-tab-active {
  background: #141414;
  border-color: #141414;
}
</style>


