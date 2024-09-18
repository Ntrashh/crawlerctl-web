<template>
  <div class="card-container">
    <a-tabs type="card">

      <a-tab-pane key="project" tab="项目管理">
        <a-table :dataSource="dataSource" :columns="columns"/>
      </a-tab-pane>
      <!-- 正确使用 rightExtra 插槽 -->
      <template #rightExtra>
        <a-button type="primary" @click="handleAddProject">新增</a-button>
      </template>

    </a-tabs>
    <a-modal v-model:open="createProjectIsModalVisible" title="创建项目" centered @ok="handleCreateProjectOk"
             :confirm-loading="confirmLoading"
             @cancel="handleCreateProjectCancel">
      <a-form layout="horizontal" :labelCol="{ span: 5 }"
              :wrapperCol="{ span: 16 }"
      >
        <a-form-item label="项目名称">
          <a-input v-model:value="projectName" placeholder="请输入项目名称(项目名创建后不能修改)"/>
        </a-form-item>
        <a-form-item label="虚拟环境">
          <a-select
              ref="select"
              v-model:value="virtualenvValue"
              placeholder="选择虚拟环境"
              @focus="focus"
              @change="handleChange"
              :options="virtualenvOptions"
          >
          </a-select>
        </a-form-item>
        <a-form-item label="上传项目">
          <a-upload-dragger
              v-model:fileList="fileList"
              name="file"
              accept=".zip"
              :max-count="1"
              :before-upload="beforeUpload"
              @change="handleUploadChange"
              @drop="handleUploadDrop"
              style="width: 100%;"
          >
            <p class="ant-upload-drag-icon">
            </p>
            <p class="ant-upload-text">上传压缩后的zip文件</p>
            <p class="ant-upload-hint">
              只能上传zip文件,其他文件禁止上传！
            </p>
          </a-upload-dragger>

        </a-form-item>

      </a-form>
    </a-modal>
  </div>

</template>

<script>
import {h, onMounted, ref, watch} from "vue";
import {Button, message} from "ant-design-vue";
import JSZip from 'jszip';
import {axiosDel, axiosGet, axiosPost} from "@/util/fetch.js";
import {DeleteOutlined, SettingOutlined} from "@ant-design/icons-vue";


const fileList = ref([]);


export default {
  name: "ProjectList",
  setup() {
    const confirmLoading = ref(false);
    const dataSource = ref([])
    const createProjectIsModalVisible = ref(false);
    const virtualenvValue = ref(undefined);
    const virtualenvOptions = ref([]);
    const projectName = ref("");
    let virtualenvPath = ref("");
    let virtualenvVersion = ref("");


    const columns = [
      {
        title: 'ID',
        dataIndex: 'ID',
        key: 'ID',
      },
      {
        title: '项目名称',
        dataIndex: 'ProjectName',
        key: 'ProjectName',
      },
      {
        title: '虚拟环境名称',
        dataIndex: 'VirtualEnvName',
        key: 'VirtualEnvName',
      },
      {
        title: '虚拟环境路径',
        dataIndex: 'VirtualEnvPath',
        key: 'VirtualEnvPath',
      },
      {
        title: '虚拟环境版本',
        dataIndex: 'VirtualEnvVersion',
        key: 'VirtualEnvVersion',
      },
      {
        title: '创建时间',
        dataIndex: 'CreatedAt',
        key: 'CreatedAt',
        customRender: ({text}) => {
          return text ? new Date(text).toLocaleString() : '';
        },
      },
      {
        title: '更新时间',
        dataIndex: 'UpdatedAt',
        key: 'UpdatedAt',
        customRender: ({text}) => {
          return text ? new Date(text).toLocaleString() : '';
        },
      },
      {
        title: '操作',
        key: 'action',
        customRender: ({record}) => {
          return h('div', [
            h(
                Button,
                {
                  type: 'link',
                  icon: h(SettingOutlined),
                  onClick: () => editProject(record),
                },
                () => '编辑'
            ),
            h(
                Button,
                {
                  type: 'link',
                  danger: true,
                  icon: h(DeleteOutlined),
                  onClick: () => deleteProject(record),
                },
                () => '删除'
            ),
          ]);
        },
      },
    ];


    const fetchData = async () => {
      try {
        const response = await axiosGet('/projects/projects');
        if (Array.isArray(response.data)) {
          dataSource.value = response.data;
        } else {
          dataSource.value = [response.data];
        }
      } catch (error) {
        console.error('获取项目列表失败：', error);
      }
    };

    function editProject(record) {
      return undefined;
    }

    async function deleteProject(record) {
     try {
       await axiosDel(`/projects/${record.ID}`);
       message.success('项目已成功删除');
       dataSource.value = dataSource.value.filter(item => item.ID !== record.ID);
     }catch(error) {
       console.log(error)
     }
    }

    const handleAddProject = () => {
      createProjectIsModalVisible.value = true;
    }

    const handleChange = (value, option) => {
      virtualenvPath = option.path;
      virtualenvVersion = option.version;


    };
    const handleCreateProjectOk = async () => {
      if (!projectName.value) {
        message.warning('请填写项目名称');
        return;
      }
      if (!virtualenvValue.value) {
        message.warning('请选择虚拟环境');
        return;
      }
      if (fileList.value.length === 0) {
        message.warning('请先选择 ZIP 文件');
        return;
      }

      const file = fileList.value[0].originFileObj;
      const formData = new FormData();
      formData.append('project_name', projectName.value);
      formData.append('virtualenv_name', virtualenvValue.value);
      formData.append('virtualenv_path', virtualenvPath);
      formData.append('virtualenv_version', virtualenvVersion);
      formData.append('file', file);
      try {
        confirmLoading.value = true
        const response = await axiosPost('/projects/add_project', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 300000
        });
        message.success('文件上传成功');
        await fetchData()
      } catch (error) {
        console.error('文件上传失败：', error);
      } finally {
        projectName.value = '';
        virtualenvValue.value = undefined;
        fileList.value = [];
        confirmLoading.value = false
        createProjectIsModalVisible.value = false;

      }
    }
    const handleCreateProjectCancel = () => {
      createProjectIsModalVisible.value = false;

    }
    const beforeUpload = (file) => {
      const isZip = file.type === 'application/zip' || file.name.endsWith('.zip');
      if (!isZip) {
        message.error('只能上传 ZIP 文件');
        fileList.value = [];
        return false;
      }
      const reader = new FileReader();

      reader.onload = async (e) => {
        const content = e.target.result;
        try {
          const zip = await JSZip.loadAsync(content);
        } catch (err) {
          console.error('ZIP 文件解析失败：', err);
          message.error('无法解析 ZIP 文件');
          // 从文件列表中移除该文件
          fileList.value = [];
        }
      };

      reader.readAsArrayBuffer(file);

      // 返回 false，阻止自动上传
      return false;
    };


    const focus = () => {

    }
    const handleUploadChange = ({fileList: newFileList}) => {
      fileList.value = newFileList.slice(-1); // 只保留最新上传的一个文件
    };

    const handleUploadDrop = (e) => {
      console.log(e);
    }
    watch(createProjectIsModalVisible, async (newVal) => {
      if (newVal) {
        const response = await axiosGet('/envs/get_versions', {
          "type": "virtual"
        }); // 替换为实际接口
        for (const item of response.data) {
          virtualenvOptions.value = response.data.map(item => ({
            label: item.envName, // 版本名
            value: item.envName, // 版本ID
            version: item.version,
            path: item.path,
          }));
        }
      }
    });
    onMounted(() => {
      fetchData();
    });
    return {
      columns,
      dataSource,
      createProjectIsModalVisible,
      fileList,
      virtualenvValue,
      virtualenvOptions,
      confirmLoading,
      projectName,
      focus,
      handleChange,
      handleUploadChange,
      handleUploadDrop,
      beforeUpload,
      handleAddProject,
      handleCreateProjectOk,
      handleCreateProjectCancel,
    }
  }
}
</script>

<style scoped>

</style>