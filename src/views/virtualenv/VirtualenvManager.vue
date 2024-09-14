<template>
  <div style="background-color: #ececec; padding: 10px; border-radius: 10px">
    <a-row :gutter="16">
      <a-col :span="6">
        <a-card title="虚拟环境名称" :bordered="false" :hoverable="true" size="small">
          <p style="font-weight: bold; font-size: 16px;">{{ virtualEnvName }}</p>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card title="版本" :bordered="false" :hoverable="true" size="small">
          <p style="font-weight: bold; font-size: 16px;">{{ virtualEnvVersion }}</p>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="路径" :bordered="false" :hoverable="true" size="small">
          <p style="font-weight: bold; font-size: 16px;">{{ virtualEnvPath }}</p>
        </a-card>
      </a-col>
    </a-row>


  </div>

  <a-tabs type="card" style="padding-top: 20px">
    <a-tab-pane key="virtualManage" tab="pip包管理">
      <a-table :dataSource="dataSource" :columns="columns"/>
    </a-tab-pane>
    <!-- 正确使用 rightExtra 插槽 -->
    <template #rightExtra>
      <a-button type="primary" @click="handleAdd">新增</a-button>
    </template>
  </a-tabs>
</template>

<script>

import {axiosGet} from "@/util/fetch.js";
import {onMounted, ref} from "vue";
import {useRoute} from "vue-router";

export default {
  setup() {
    const route = useRoute();
    const virtualEnvName = ref("");
    const virtualEnvVersion = ref("");
    const virtualEnvPath = ref("");

    const getVenvInfo = async (envName) => {
      const response = await axiosGet("/envs/get_virtualenv", {"env_name": envName})
      virtualEnvName.value = response.data.envName;
      virtualEnvVersion.value = response.data.version;
      virtualEnvPath.value = response.data.path;
    }

  onMounted(() => {
    getVenvInfo(route.query.envName)
  })

    return {
      virtualEnvName,
      virtualEnvVersion,
      virtualEnvPath,
    }
  }
};
</script>

<style scoped>

</style>

