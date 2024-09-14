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

  <a-modal
      v-model:open="isPackageModalVisible"
      title="pip install"
      :confirm-loading="confirmLoading"
      @ok="handlePackageInstall"
      @cancel="handlePackageCancel"
      centered
  >
    <a-form layout="horizontal" :labelCol="{ span: 4 }"
            :wrapperCol="{ span: 18 }">
      <a-form-item label="包名">
        <a-input v-model:value="packageName" @blur="fetchPackageVersions" placeholder="请输入包名"/>

      </a-form-item>


      <a-form-item label="版本">

        <a-select
            v-model:value="selectedVersion"
            placeholder="请选择版本"
            :disabled="packageVersions.length === 0"
            :options="packageVersions"
        ></a-select>
      </a-form-item>
      <a-form-item label="源">
        <a-select
            v-model:value="selectedInstallationSource"
            :options="installationSources"
        ></a-select>
      </a-form-item>
    </a-form>
  </a-modal>


</template>

<script>

import {axiosGet, axiosPost} from "@/util/fetch.js";
import {computed, h, onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import {Button, message} from "ant-design-vue";
import {DeleteOutlined} from "@ant-design/icons-vue";
import Virtualenv from "@/views/virtualenv/Virtualenv.vue";

export default {
  setup() {
    const route = useRoute();
    const virtualEnvName = ref("");
    const virtualEnvVersion = ref("");
    const virtualEnvPath = ref("");
    const dataSource = ref([]);
    const loadingStates = ref({});

    // 弹窗
    const isPackageModalVisible = ref(false);
    const packageName = ref('');
    const packageVersions = ref([]);
    const selectedVersion = ref(undefined);
    const confirmLoading = ref(false);

    const columns = computed(() => {
      return [
        {
          title: '名称',
          dataIndex: 'name',
          key: 'name',
        },
        {
          title: '版本',
          dataIndex: 'version',
          key: 'version',
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
                    danger: true,
                    icon: h(DeleteOutlined),
                    loading: loadingStates.value[record.name] || false,
                    onClick: () => uninstallPackages(record),
                  },
                  () => '卸载'
              ),
            ]);
          },
        }
      ];
    });

    // 定义安装源选项
    const installationSources = [
      {label: '阿里云', value: 'http://mirrors.aliyun.com/pypi/simple/'},
      {label: '清华源', value: 'https://pypi.tuna.tsinghua.edu.cn/simple'},
      {label: '中国科技大学', value: 'https://mirrors.ustc.edu.cn/pypi/simple/'},
      {label: '中国科学技术大学', value: 'http://pypi.mirrors.ustc.edu.cn/simple/'},
      {label: '官方源', value: 'https://pypi.org/simple'},
    ];
    const selectedInstallationSource = ref(installationSources[0].value);

    const getVenvInfo = async (envName) => {
      const response = await axiosGet("/envs/get_virtualenv", {"env_name": envName})
      virtualEnvName.value = response.data.envName;
      virtualEnvVersion.value = response.data.version;
      virtualEnvPath.value = response.data.path;
    };
    const installedPackages = async () => {
      const response = await axiosPost("/envs/installed_packages", {
        "env_path": virtualEnvPath.value
      })
      dataSource.value = response.data;
    };

    const uninstallPackages = async (record) => {
      try {
        loadingStates.value = {...loadingStates.value, [record.name]: true};
        const response = await axiosPost("/envs/uninstall_packages", {
          "virtualenv_path": virtualEnvPath.value,
          "package_name": record.name
        })

      } catch (error) {
        console.log(error);
      } finally {
        await installedPackages();
        loadingStates.value = {...loadingStates.name, [record.version]: false};

      }
    }

    function compareVersions(v1, v2) {
      const nums1 = v1.split('.').map(Number);
      const nums2 = v2.split('.').map(Number);
      const length = Math.max(nums1.length, nums2.length);

      for (let i = 0; i < length; i++) {
        const n1 = nums1[i] || 0;
        const n2 = nums2[i] || 0;

        if (n1 !== n2) {
          return n2 - n1; // 降序排序，如果要升序，返回 n1 - n2
        }
      }
      return 0;
    }


    const handleAdd = () => {
      isPackageModalVisible.value = true;

    };
    const handleDelete = () => {

    }

    const handleAddPackage = () => {
      isPackageModalVisible.value = true;
    };
    const handlePackageCancel = () => {
      isPackageModalVisible.value = false;
    }

    const handlePackageInstall = async () => {
      try {
        await fetchPackageVersions()
        const url = "/envs/install_packages";
        console.log(selectedInstallationSource.value)
        confirmLoading.value = true;
        const response = await axiosPost(url, {
          "package_name": packageName.value,
          "virtualenv_path": virtualEnvPath.value,
          "package_version": selectedVersion.value,
          "installation_source": selectedInstallationSource.value
        }, {
          timeout: 300000
        })
        confirmLoading.value = false;
        isPackageModalVisible.value = false;
        message.success(`Package ${packageName.value} 安装成功!`);
      } catch (error) {
        message.success(`Package ${packageName.value} 安装失败!`);
        console.log(error);
      }
    }


    const fetchPackageVersions = async () => {
      let paramsPackageName = packageName.value.trim()
      if (!paramsPackageName) {
        packageVersions.value = [];
        return;
      }
      try {
        // 调用后端接口获取包的版本列表
        const response = await axiosGet(`/envs/package_versions`, {
          "package_name": paramsPackageName,
        });
        let responsePackageVersions = response.data;
        responsePackageVersions.sort(compareVersions)
        packageVersions.value = responsePackageVersions.map((version) => ({
          label: version,
          value: version,
        }));
        // 自动选择最新版本
        if (packageVersions.value.length > 0) {
          selectedVersion.value = packageVersions.value[0].value;
        } else {
          selectedVersion.value = '';
        }
      } catch (error) {
        console.error('获取包版本失败:', error);
        packageVersions.value = [];
        message.error('获取包版本失败，请检查包名是否正确');
      }
    }



    onMounted(async () => {
      await getVenvInfo(route.query.envName)
      await installedPackages(route.query.envName)
    })

    return {
      handleAdd,
      handleDelete,
      uninstallPackages,
      handleAddPackage,
      handlePackageInstall,
      handlePackageCancel,
      fetchPackageVersions,
      selectedInstallationSource,
      installationSources,
      isPackageModalVisible,
      packageName,
      packageVersions,
      selectedVersion,
      confirmLoading,
      virtualEnvName,
      virtualEnvVersion,
      virtualEnvPath,
      dataSource,
      columns,

    }
  }
};
</script>

<style scoped>

</style>

