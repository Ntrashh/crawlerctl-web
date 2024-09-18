<template>
  <div style="display: flex; height: 100vh;">
    <!-- 左侧：文件树 -->
    <div style="width: 300px; border-right: 1px solid #ddd; overflow: auto;">
      <div style="padding: 16px;">
        <a-input
            v-model:value="folderPath"
            placeholder="请输入文件夹路径"
            style="width: 200px; margin-right: 8px;"
        />
        <a-button type="primary" @click="getFolderContents">打开文件夹</a-button>
      </div>
      <a-tree
          :tree-data="treeData"
          :defaultExpandAll="true"
          @select="onSelect"
      />
    </div>

    <!-- 右侧：代码编辑器 -->
    <div style="flex: 1; padding: 16px;">

        <a-button type="primary" @click="saveFile" style="margin-bottom: 8px;">保存文件</a-button>
        <div id="editor" style="height: calc(100vh - 100px); border: 1px solid #ddd;"></div>
    </div>
  </div>
</template>

<script>
import * as monaco from 'monaco-editor';
import { ref, onMounted } from 'vue';
import {axiosGet} from "@/util/fetch.js";


// 手动设置 Web Worker 的加载路径
window.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    if (label === 'json') {
      return '/monaco/json.worker.js';
    }
    if (label === 'css') {
      return '/monaco/css.worker.js';
    }
    if (label === 'html') {
      return '/monaco/html.worker.js';
    }
    if (label === 'typescript' || label === 'javascript') {
      return '/monaco/ts.worker.js';
    }
    return '/monaco/editor.worker.js';
  }
};

export default {
  name: 'ProjectEdit',
  setup() {
    // 定义响应式变量
    const folderPath = ref('');  // 文件夹路径
    const treeData = ref([]);  // 文件树数据
    const selectedFilePath = ref('');  // 选中的文件路径
    const editor = ref(null);  // Monaco Editor 实例
    const codeContent = ref('');  // 代码内容

    // 获取文件夹内容
    const getFolderContents = async () => {
      console.log(folderPath.value);
      if (!folderPath.value) {
        return;
      }
      try {
        const response = await axiosGet('/projects/get_folders', {
          folderPath: folderPath.value
        });
        treeData.value = response.data;
      } catch (error) {
        console.error('获取文件列表失败:', error);
        window.$message.error('获取文件列表失败');
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
        const response = await axiosGet('/projects/read_file', {
          filePath: selectedFilePath.value,
        });
        codeContent.value = response.data;
        console.log(editor.value)
        // 检查编辑器实例是否已经初始化
        if (!editor.value) {
          editor.value = monaco.editor.create(document.getElementById('editor'), {
            value: codeContent.value,
            language: getLanguageByExtension(selectedFilePath.value),
            theme: 'vs-dark',
          });
        } else {
          editor.value.setValue(codeContent.value);
          monaco.editor.setModelLanguage(
              editor.value.getModel(),
              getLanguageByExtension(selectedFilePath.value)
          );
        }
      } catch (error) {
        console.error('读取文件失败:', error);
      }
    };
    // 保存文件
    const saveFile = async () => {
      const newContent = editor.value.getValue();
      try {
        await axios.post('/api/save_file', {
          filePath: selectedFilePath.value,
          content: newContent,
        });
        window.$message.success('文件保存成功');
      } catch (error) {
        console.error('保存文件失败:', error);
        window.$message.error('保存文件失败');
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

    // 返回 setup 中定义的响应式变量和方法
    return {
      folderPath,
      treeData,
      selectedFilePath,
      getFolderContents,
      onSelect,
      saveFile,
    };
  },
};
</script>

<style scoped>
/* 样式保持不变 */
</style>
