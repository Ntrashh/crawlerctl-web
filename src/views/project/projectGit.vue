<template>
  <div class="box">
    <div class="git">
      <a-form
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 16 }"
      >
        <a-form-item
            label="GIT地址"
        >
          <a-input v-model:value="gitPath" :disabled="true"/>
        </a-form-item>
        <a-form-item
            label="分支"
        >
          <a-space-compact block>

            <a-select
                v-model:value="branch"
                placeholder="选择分支"
                :options="branchOptions"
                @change="handleBranchChange"
            ></a-select>
            <a-button type="primary">PULL</a-button>
          </a-space-compact>
        </a-form-item>
        <a-timeline style="padding: 50px">
          <a-timeline-item
              v-for="commit in commits"
              :key="commit.hash"
              :dot="getDot(commit)"
              :color="getColor(commit)"
          >
            <div>
              <br/>
              <strong>author:</strong>{{ commit.author }}
            </div>
            <div> <strong>message:</strong>{{ commit.message }}</div>
            <div><strong>hash:</strong><code>{{ commit.hash }}</code></div>
          </a-timeline-item>
          <a-timeline-item v-if="commits.length > 0">
            ......
          </a-timeline-item>
        </a-timeline>
      </a-form>
    </div>
  </div>


  <a-modal
      v-model:open="gitLoginVisible"
      title="配置项目GIT"
      centered
      :footer=null
      :maskClosable="false"
  >

    <a-form
        :model="formState"
        name="basic"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
        autocomplete="off"
        @finish="onFinish"
        @finishFailed="onFinishFailed"
    >

      <a-form-item
          label="GIT地址"
          name="gitPath"
          :rules="[{ required: true, message: 'Please input your git path!' }]"
      >
        <a-input v-model:value="formState.gitPath"/>
      </a-form-item>
      <a-form-item
          label="Username"
          name="username"
          :rules="[{ required: true, message: 'Please input your username!' }]"
      >
        <a-input v-model:value="formState.username"/>
      </a-form-item>

      <a-form-item
          label="Password"
          name="password"
          :rules="[{ required: true, message: 'Please input your password!' }]"
      >
        <a-input-password v-model:value="formState.password"/>
      </a-form-item>

      <a-form-item :wrapper-col="{ offset: 9, span: 16 }">
        <a-button type="primary" html-type="submit">Submit</a-button>
      </a-form-item>

    </a-form>
  </a-modal>
</template>
<script>

import {onMounted,watch, ref} from "vue";
import {axiosGet, axiosPost} from "@/util/fetch";
import {useRoute} from "vue-router";

export default {
  setup() {
    const route = useRoute();
    const gitLoginVisible = ref(false);
    const gitPath = ref("")
    const gitStatus = ref(false)
    const branch = ref(undefined);
    const branchOptions = ref([]);
    const commits = ref([])
    const formState = ref({
      gitPath: '',
      username: '',
      password: '',
    });
    const handleBranchChange = async (value) => {
      await breachCommits(value)

    }
    const onFinish = async (values) => {
      try {
        const response = await axiosPost("/git/create_git", {
          "project_id": parseInt(route.query.id),
          "git_path": values.gitPath,
          "username": values.username,
          "password": values.password,
        })
        if (response.data.ID) {
          gitLoginVisible.value = false;
          gitPath.value = response.data.GitPath;
          gitStatus.value = true;
        }

      } catch (err) {
        console.log(err);
      }
    };
    const onFinishFailed = errorInfo => {
      console.log('Failed:', errorInfo);
    };
    // 计算属性：过滤掉 'origin/' 前缀


    const breachCommits = async (breachName) => {
      try {
        let response = await axiosGet(`/git/remote_commits`, {
          "id": route.query.id,
          "branch_name": breachName,
        })
        commits.value = response.data;
      } catch (e) {
        console.log(e)
      }
    }

    const showBranch = async () => {
      try {
        let response = await axiosGet(`/git/remote_branches/${route.query.id}`)
        branchOptions.value = response.data.map(item => ({
          label: item.replace(/^origin\//, ''),
          value: item.replace(/^origin\//, ''),
        }));
      }catch (err){
        console.log(err)
      }
    }

    const gitState = async (id) => {
      try {
        let response = await axiosGet(`/git/${id}`)
        if (response.data === null) {
          gitLoginVisible.value = true;

        } else {
          gitPath.value = response.data.GitPath
          gitStatus.value = true

        }
      } catch (err) {
        console.log(err);
      }

    }
    const getDot = (commit)=> {
      return commit.commitTime
      // 可根据提交信息定制时间点的图标或样式
      // return <a-icon type="clock-circle" />;
    }
    const getColor = () => {
      // 可根据提交信息定制时间点的颜色
      return 'blue';
    }
    // 监听 gitLoginVisible 的变化
    watch(gitStatus, async (newVal) => {
      if (newVal) {
        await showBranch()
      }
    });
    onMounted(async () => {
      await gitState(route.query.id)
    })
    return {
      gitLoginVisible,
      formState,
      gitPath,
      branch,
      commits,
      branchOptions,
      getDot,
      getColor,
      onFinish,
      handleBranchChange,
      onFinishFailed,
    }
  }
}
</script>
<style scoped>
.box {
  width: 100%;
  height: 100%; /* 根据需要调整高度 */
  display: flex;
  justify-content: center; /* 水平居中内容 */
  align-items: center; /* 垂直居中内容 */
}

.git {
  width: 70%;
  height: 100%; /* 根据需要调整高度 */
  padding: 40px;
  //background-color: #141414;
  color: white; /* 文字颜色 */
  //align-items: center;     /* 垂直居中内容 */
  //font-size: 24px;         /* 文字大小 */
  //border-radius: 8px;      /* 圆角（可选） */
}
</style>