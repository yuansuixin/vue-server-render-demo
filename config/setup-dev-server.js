const fs = require("fs");
const chokidar = require("chokidar");
const webpack = require("webpack");
const clientConfig = require("./webpack.client.config");
const serverConfig = require("./webpack.server.config");
const { webpack, web } = require("webpack");
const path = require('path')
const middleware = require("webpack-dev-middleware");
const HMR = require("webpack-hot-middleware");
const MFS = require('memory-fs');
const MemoryFileSystem = require("memory-fs");
const webpackBaseConfig = require("./webpack.base.config");


const readFile = (fs, file) => {
  try {
    return fs.readFileSync(path.join(clientConfig.output.path,file),'utf8')
  } catch () {
    
  }
};

const setupServer = (app, templatePath, cb) => {
  let bundle;
  let clientManifest;
  let template;
  let ready;
  const readeyPromise = new Promise((r) => (ready = r));
  template = fs.readFileSync(templatePath, "utf-8");
  const update = () => {
    if (bundle && clientManifest) {
      //通知server进行渲染
      // 执行createRenderer=>RenderToString
      ready();
      cb(bundle, {
        template,
        clientManifest,
      });
    }
  };

  // webpack对entry-server进行监视产生bundle
  const mfs = new MFS()
  const serverCompiler = webpack(serverConfig)

  serverCompiler.outputFileSystem = mfs
  serverCompiler.watch({}),(err,stats=>{
    stats = stats.toJson();
    stats.errors.forEach((err) => console.error(err));
    if (stats.errors.length) return;
    bundle = JSON.parse(readFile(mfs,'vue-ssr-server-bundle.json'))
    update()
  })


  // webpack=》entry-client =>clientMainfest
  // host-middleware
  clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
  clientConfig.entry.app = [
    "webpack-hot-middleware/client",
    clientConfig.entry.app,
  ];

  const clientCompiler = webpack(clientConfig);
  const devMiddleware = middleware(clientCompiler, {
    noInfo: true,
    publicPath: clientConfig.output.publicPath,
    logLevel:'silent'
  });
  app.use(devMiddleware);
  app.use(HMR(clientCompiler));

  clientCompiler.hooks.done.tap("clientsBuild", (stats) => {
    stats = stats.toJson();
    stats.errors.forEach((err) => console.error(err));
    if (stats.errors.length) return;
    clientManifest = JSON.parse(
      readFile(devMiddleware.fileSystem, "vue-ssr-client-manifest.json")
    );
    update();
  });
  //fs=>tempalePath=>tempalte
  chokidar.watch(templatePath).on("change", () => {
    template = fs.readFileSync(templatePath, "utf-8");
    console.log("template is updated");
    update();
  });
  return readeyPromise;
};

module.exports = setupServer;
