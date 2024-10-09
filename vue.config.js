const { defineConfig } = require('@vue/cli-service')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
module.exports = defineConfig({
  publicPath: process.env.BASE_URL || '/',
  devServer:{
    client:{
      //为true的时候就是有红色罩子，false就没有
      overlay:false,
    },
  },
  transpileDependencies: [
    'ant-design-vue',
    // 如果你使用其他需要转译的依赖，可以在这里添加
  ],
  runtimeCompiler: true,
  configureWebpack: {
    plugins: [
      new MonacoWebpackPlugin({
        // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
        languages: ['python', 'css', 'html', 'typescript', 'json','go']
      })
    ]
  }




})
