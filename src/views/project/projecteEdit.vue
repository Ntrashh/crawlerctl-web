<template>
  <a-layout class="custom-layout" style="min-height: 100%">
    <!-- 侧边栏 -->
    <a-layout-sider width="300px" theme="light">
      <!-- 左侧：文件树 -->
      <a-directory-tree
          v-model:expandedKeys="expandedKeys"
          v-model:selectedKeys="selectedKeys"
          style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis"
          @select="onSelect"
          :tree-data="treeData"
          class="directory-tree"
      ></a-directory-tree>
    </a-layout-sider>

    <!-- 右侧：代码编辑器 -->
    <a-layout-content class="content">
      <div id="editor" class="editor"></div>
    </a-layout-content>
  </a-layout>

</template>
<script>
import {onMounted, toRaw} from "vue";
import * as monaco from 'monaco-editor';
import {ref} from 'vue';

import {useRoute} from "vue-router";
import {Base64} from "js-base64";
import {message} from "ant-design-vue";
import http from "@/util/http";


export default {
  name: 'projectEdit',

  setup() {
    // 定义响应式变量
    const route = useRoute();
    const folderPath = ref('');  // 文件夹路径
    const selectedKeys = ref([]);
    const expandedKeys = ref([]);
    const treeData = ref([]);  // 文件树数据
    const selectedFilePath = ref('');  // 选中的文件路径
    const editor = ref(null);  // Monaco Editor 实例
    const codeContent = ref('');  // 代码内容

    const getProjectInfo = async (id) => {
      const response = await http.get(`/projects/${id}`);
      folderPath.value = response.data.SavePath
    }
    // 获取文件夹内容
    const getFolderContents = async () => {

      if (!folderPath.value) {
        return;
      }
      try {
        const response = await http.get('/projects/get_folders', {
          folderPath: folderPath.value
        });
        treeData.value = response.data;
      } catch (error) {
        console.error('获取文件列表失败:', error);
      }
    };

    // 选择文件
    const onSelect = (selectedKeys, info) => {
      if (info.node.isLeaf) {
        selectedFilePath.value = info.node.key;
        openFile();
      }
    };
    // 打开文件

    const openFile = async () => {
      try {
        const response = await http.get('/projects/read_file', {
          filePath: selectedFilePath.value,
        });
        codeContent.value = Base64.decode(response.data);
        // 检查编辑器实例是否已经初始化
        if (!editor.value) {
          editor.value = monaco.editor.create(document.getElementById('editor'), {
            value: codeContent.value,
            scrollBeyondLastLine: false,
            language: getLanguageByExtension(selectedFilePath.value),
            theme: 'vs-dark',
          });
          editor.value.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function () {
            // 自定义保存逻辑
            saveFile();
          });


        } else {
          toRaw(editor.value).setValue(codeContent.value);
          monaco.editor.setModelLanguage(
              toRaw(editor.value).getModel(),
              getLanguageByExtension(selectedFilePath.value)
          );
        }
      } catch (error) {
        console.error('读取文件失败:', error);
      }
    };
    // 保存文件
    const saveFile = async () => {
      const newContent = toRaw(editor.value).getValue();
      try {
        let response = await http.post('/projects/save_file', {
          file_path: selectedFilePath.value,
          content: Base64.encode(newContent),
        });
        if (response.data) {
          message.success("保存成功")
        } else {
          message.error("保存失败")
        }
      } catch (error) {
        console.error('保存文件失败:', error);
      }
    };

    // 根据文件扩展名获取语言类型
    const getLanguageByExtension = (filePath) => {
      const extension = filePath.split('.').pop();
      const languageMap = {
        js: 'javascript',
        ts: 'typescript',
        vue: 'vue',
        py: 'python',
        java: 'java',
        c: 'c',
        cpp: 'cpp',
        go: 'go',
      };
      return languageMap[extension] || 'plaintext';
    };

    onMounted(async () => {
      await getProjectInfo(route.query.id)
      await getFolderContents()
    })
    // 返回 setup 中定义的响应式变量和方法
    return {
      treeData,
      folderPath,
      expandedKeys,
      selectedKeys,
      selectedFilePath,
      openFile,
      onSelect,
      getProjectInfo,
      getFolderContents,
      saveFile,

    };
  },
};
</script>

<style scoped>
#editor {
  height: 100%;
  width: 100%;
}


</style>
