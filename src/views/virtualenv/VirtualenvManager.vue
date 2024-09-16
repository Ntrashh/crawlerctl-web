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
      <!--      <a-table :dataSource="dataSource" :columns="columns"/>-->
      <a-table :data-source="dataSource" :columns="columns">

        <template
            #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
        >
          <div style="padding: 8px">
            <a-input
                ref="searchInput"
                :placeholder="`Search ${column.dataIndex}`"
                :value="selectedKeys[0]"
                style="width: 188px; margin-bottom: 8px; display: block"
                @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
                @pressEnter="handleSearch(selectedKeys, confirm, column.dataIndex)"
            />
            <a-button
                type="primary"
                size="small"
                style="width: 90px; margin-right: 8px"
                @click="handleSearch(selectedKeys, confirm, column.dataIndex)"
            >
              Search
            </a-button>
            <a-button size="small" style="width: 90px" @click="handleReset(clearFilters)">
              Reset
            </a-button>
          </div>
        </template>

        <template #bodyCell="{ text, column }">
      <span v-if="state.searchText && state.searchedColumn === column.dataIndex">
        <template
            v-for="(fragment, i) in text
            .toString()
            .split(new RegExp(`(?<=${state.searchText})|(?=${state.searchText})`, 'i'))"
        >
          <mark
              v-if="fragment.toLowerCase() === state.searchText.toLowerCase()"
              :key="i"
              class="highlight"
          >
            {{ fragment }}
          </mark>
          <template v-else>{{ fragment }}</template>
        </template>
      </span>
        </template>
      </a-table>
    </a-tab-pane>
    <!-- 正确使用 rightExtra 插槽 -->
    <!--    <template #rightExtra>-->
    <!--    </template>-->

    <template #rightExtra>
      <a-space>
        <a-button type="primary" @click="handleImport">pip导入requirements</a-button>
        <a-button type="primary" @click="handleAdd">pip 安装</a-button>
      </a-space>
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


  <a-modal v-model:open="isRequirementsModalVisible"
           title="导入 requirements.txt"
           @ok="handleRequirementsOk"
           centered
  >
    <a-form-item label="源">
      <a-select
          v-model:value="selectedInstallationSource"
          :options="installationSources"
      ></a-select>
    </a-form-item>
    <a-upload-dragger
        v-model:fileList="fileList"
        name="file"
        accept=".txt"
        :max-count="1"
        :before-upload="beforeUpload"
        @change="handleChange"
        @drop="handleDrop"
    >
      <p class="ant-upload-drag-icon">
      </p>
      <p class="ant-upload-text">上传requirements文件</p>
      <p class="ant-upload-hint">
        只能上传requirements.txt,其他文件禁止上传！
      </p>
    </a-upload-dragger>
  </a-modal>


</template>

<script  lang="ts">

import {axiosGet, axiosPost} from "@/util/fetch.js";
import {computed, h, onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import {Button, message} from "ant-design-vue";
import {DeleteOutlined} from "@ant-design/icons-vue";
import {SearchOutlined} from '@ant-design/icons-vue';
import { InboxOutlined } from '@ant-design/icons-vue';
import  type { UploadChangeParam } from 'ant-design-vue';

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
    const isRequirementsModalVisible = ref(false);
    const fileList = ref([]);


    function handleDrop(e: DragEvent) {
      console.log(e);
    }

    const state = ref({
      searchText: '',
      searchedColumn: '',
    });

    const searchInput = ref();
    const columns = computed(() => {
      return [
        {
          title: '名称',
          dataIndex: 'name',
          key: 'name',
          width: 600, // 设置固定宽度为 150px
          customFilterDropdown: true,
          onFilter: (value, record) => record.name.toString().toLowerCase().includes(value.toLowerCase()),
          onFilterDropdownOpenChange: visible => {
            if (visible) {
              setTimeout(() => {
                searchInput.value.focus();
              }, 100);
            }
          },
        },
        {
          title: '版本',
          dataIndex: 'version',
          key: 'version',
          width: 400, // 设置固定宽度为 150px

        },
        {
          title: '操作', // 新增的操作列
          key: 'actions',
          width: 300, // 设置固定宽度为 150px
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


    const handleSearch = (selectedKeys, confirm, dataIndex) => {
      confirm();
      state.searchText = selectedKeys[0];
      state.searchedColumn = dataIndex;
    };

    const handleReset = clearFilters => {
      clearFilters({confirm: true});
      state.searchText = '';
    };

    // 定义安装源选项
    const installationSources = [
      {label: '阿里云', value: 'http://mirrors.aliyun.com/pypi/simple/'},
      {label: '中国科技大学', value: 'https://mirrors.ustc.edu.cn/pypi/simple/'},
      {label: '清华源', value: 'https://pypi.tuna.tsinghua.edu.cn/simple/'},
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


    const handleImport = () => {
      isRequirementsModalVisible.value = true;
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
        await installedPackages()
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

    // 文件上传前的校验，返回 false 阻止自动上传
    const beforeUpload = (file) => {
      const isTxt = file.type === 'text/plain' || file.name.endsWith('.txt');
      const isCorrectName = file.name === 'requirements.txt';
      if (!isTxt || !isCorrectName) {
        message.error('只能上传 requirements.txt 文件');
        return false;
      }

      // 创建 FileReader 对象
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target.result;
        // 对文件内容进行校验
        const isValid = validateRequirementsContent(content);
        if (!isValid) {
          message.error('文件内容不是标准的 requirements.txt 格式');
          // 从文件列表中移除该文件
          fileList.value = [];
        }
      };

      // 读取文件内容
      reader.readAsText(file);

      // 返回 false，阻止自动上传
      return false;
    };


    const validateRequirementsContent = (content) => {
      const lines = content.split(/\r?\n/);
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine === '' || trimmedLine.startsWith('#')) {
          continue;
        }
        // 校验每一行的格式
        const regex = /^[a-zA-Z0-9_\-\.]+(\s*(==|>=|<=|>|<|~=)\s*[a-zA-Z0-9_\-\.]+)?$/;

        if (!regex.test(trimmedLine)) {
          return false;
        }
      }
      return true;
    };

    // 处理文件列表变化
    const handleChange = ({ fileList: newFileList }) => {
      fileList.value = newFileList.slice(-1); // 只保留最新上传的一个文件
    };



    const handleRequirementsOk = async () => {
      if (fileList.value.length === 0) {
        message.warning('请先选择 requirements.txt 文件');
        return;
      }

      const file = fileList.value[0].originFileObj;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('virtualenv_path', virtualEnvPath.value);
      formData.append('installation_source', selectedInstallationSource.value);

      confirmLoading.value = true;


      try {
        await axiosPost('/envs/install_requirements', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        message.success('依赖安装成功');
        await installedPackages()
        isRequirementsModalVisible.value = false;

      } catch (error) {
        console.error('依赖安装失败：', error);
        message.error(error.response?.data?.error || '依赖安装失败，请检查文件内容');
      } finally {
        confirmLoading.value = false;
        fileList.value = [];
      }
    };


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
      SearchOutlined,
      handleSearch,
      handleReset,
      handleImport,
      InboxOutlined,
      handleChange,
      handleDrop,
      handleRequirementsOk,
      beforeUpload,
      handleChange,
      fileList,
      isRequirementsModalVisible,
      searchInput,
      state,
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

