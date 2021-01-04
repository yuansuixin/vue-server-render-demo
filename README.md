
#### SSR步骤

* 熟悉vue文档中Vue SSR指南的编写通用代码部分
* 创建demo项目，根据文档中的源码结构部分，分好结构，初始的代码，安装相应的依赖
* 根据文档中的基本用法，与服务器集成
* 熟悉Bundle Renderer指引，
* 想要server.js里面的内容去响应src里面的路径就要借助到webpack
* createBundleRenderer的API，就是把服务端这边打包过后的代码渲染出来

```bash
初始化项目
npm init -y
安装
yarn add vue vue-server-renderer -S
yarn add express -S 
安装依赖
yarn add webpack webpack-cli friendly-errors-webpack-plugin vue-loader babel-loader @babel/core url-loader file-loader vue-style-loader css-loader sass-loader sass webpack-merge webpack-node-externals -D
yarn add clean-webpack-plugin @babel/preset-env -D
配置到webpack的配置里面
yarn add vue-template-compiler -S
npm install rimraf -D
```

* 在package.json里面配置常用的脚本
* webpack 打包   `npm run build`
* 然后将打包后的代码进行服务端的渲染，需要使用到一个非常重要的API，createBundleRenderer的API，
* template查看文档中的基本用法的页面模板，新建一个html的模板，模板中可以使用模板语法'
* webpack热重载
  * 安装依赖  ``npm install webpack-dev-middleware webpack-hot-middleware -D``
* chokidar库主要是监视文件的变化，当文件发生变化的时候可以调用相应的事件进行操作
* `npm install memory-fs -D`用这个依赖将server端的数据写入内存