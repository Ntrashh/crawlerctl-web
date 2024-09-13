<template>
  <div style="background-color: #ececec; padding: 10px; border-radius: 10px">
    <a-row :gutter="16">
      <a-col :span="6">
        <a-card title="虚拟环境名称" :bordered="false" :hoverable="true" size="small">
          <p>{{ envName }}</p>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card title="版本" :bordered="false" :hoverable="true" size="small">
          <p>{{ envVersion }}</p>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="路径" :bordered="false" :hoverable="true" size="small">
          <p>{{ envPath }}</p>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import axios from 'axios';
import {axiosGet} from "@/util/fetch.js";
import {onMounted, ref} from "vue";

export default {
  setup() {
    const envName = ref("");
    const envVersion = ref("");
    const envPath = ref("");

    const getVenvInfo = async (envName) => {
      const response = axiosGet("/envs/get_virtualenv", {"env_name": envName})
      console.log(response.data)

    }

    onMounted(() => {
      getVenvInfo(activeKey.value);
    });

    return {
      envName,
      envVersion,
      envPath,
    }
  }
};
</script>

<style scoped>

</style>