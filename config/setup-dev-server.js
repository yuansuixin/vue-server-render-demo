const webpack = require("webpack");
const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const middleware = require("webpack-dev-middleware");
const HMR = require("webpack-hot-middleware");
const MFS = require("memory-fs");

const clientConfig = require("./webpack.client.config");
const serverConfig = require("./webpack.server.config");

const readFile = (fs, file) => {
  try {
    return fs.readFileSync(path.join(clientConfig.output.path, file), "utf8");
  } catch (error) {}
};

const setupServer = (app, templatePath, cb) => {
  let bundle;
  let clientManifest;
  let template;
  let ready;
  const readyPromise = new Promise((r) => (ready = r));

  template = fs.readFileSync(templatePath, "utf8");
  const update = () => {
    if (bundle && clientManifest) {
      // 通知 server 进行渲染
      // 执行 createRenderer -> RenderToString
      ready();
      cb(bundle, {
        template,
        clientManifest,
      });
    }
  };
  // webpack -> entry-server -> bundle
  const mfs = new MFS();
  const serverCompiler = webpack(serverConfig);

  serverCompiler.outputFileSystem = mfs;
  serverCompiler.watch({}, (err, stats) => {
    if (err) throw err;
    // 之后读取输出：
    stats = stats.toJson();
    stats.errors.forEach((err) => console.error(err));
    stats.warnings.forEach((err) => console.warn(err));
    if (stats.errors.length) return;
    bundle = JSON.parse(readFile(mfs, "vue-ssr-server-bundle.json"));
    update();
  });

  // webpack -> entry-client -> clientManifest
  // hot-middleware
  clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
  clientConfig.entry.app = [
    "webpack-hot-middleware/client",
    clientConfig.entry.app,
  ];
  clientConfig.output.filename = "[name].js";

  const clientCompiler = webpack(clientConfig);

  const devMiddleware = middleware(clientCompiler, {
    noInfo: true,
    publicPath: clientConfig.output.publicPath,
    // logLevel: "silent",
  });
  app.use(devMiddleware);

  app.use(HMR(clientCompiler));

  clientCompiler.hooks.done.tap("clientsBuild", (stats) => {
    stats = stats.toJson();
    stats.errors.forEach((err) => console.error(err));
    stats.warnings.forEach((err) => console.warn(err));
    if (stats.errors.length) return;
    clientManifest = JSON.parse(
      readFile(devMiddleware.fileSystem, "vue-ssr-client-manifest.json")
    );
    update();
  });

  // fs -> templatePath -> template
  chokidar.watch(templatePath).on("change", () => {
    template = fs.readFileSync(templatePath, "utf8");
    console.log("template is updated");
    update();
  });

  return readyPromise;
};

module.exports = setupServer;
