const path = require("path");
const DefinePlugin = require("webpack").DefinePlugin;
const CleanWebpackPlugin = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const SpritesmithPlugin = require("webpack-spritesmith");

const DEBUG = process.env.NODE_ENV === "development";
const DIST_DIR = path.resolve(__dirname, "dist");
const JS_NAME = st(DEBUG ? "index.js" : "[chunkhash:10].js");
const CSS_NAME = st(DEBUG ? "index.css" : "[contenthash:10].css");
const ASSET_NAME = st(DEBUG ? "[name].[ext]" : "[hash:10].[ext]");
const API_PREFIX = DEBUG ? "/api" : process.env.KPOPNET_API_PREFIX;
const FILE_PREFIX = DEBUG
  ? "http://localhost:8001/uploads"
  : process.env.KPOPNET_FILE_PREFIX;

function st(name) {
  return `static/${name}`;
}

function createSpritePlugin() {
  return new SpritesmithPlugin({
    src: {
      cwd: path.resolve(__dirname, "labels/icons"),
      glob: "*@[24]x.png",
    },
    target: {
      image: path.resolve(__dirname, "labels/labels.png"),
      css: [
        [
          path.resolve(__dirname, "labels/labels.css"),
          { formatOpts: { cssSelector: (l) => ".label-" + l.name } },
        ],
      ],
    },
    apiOptions: {
      cssImageRef: "labels.png",
      generateSpriteName: (l) => path.basename(l.slice(0, -7)),
    },
    // This is a bit more complex than it should be because we
    // provide 1x/2x and 2x/4x (normal/retina) combinations of label
    // icons.
    retina: {
      classifier: (l) => ({
        type: l.endsWith("@2x.png") ? "normal" : "retina",
        normalName: l.slice(0, -7) + "@2x.png",
        retinaName: l.slice(0, -7) + "@4x.png",
      }),
      targetImage: path.resolve(__dirname, "labels/labels@2x.png"),
      cssImageRef: "labels@2x.png",
    },
    spritesmithOptions: {
      // https://github.com/twolfson/gulp.spritesmith/issues/97
      padding: 1,
    },
  });
}

module.exports = {
  mode: DEBUG ? "development" : "production",
  entry: path.resolve(__dirname, "index/index.tsx"),
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.less$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "less-loader"],
        exclude: /node_modules/,
      },
      {
        test: /\.(png|svg)$/,
        use: { loader: "file-loader", options: { name: ASSET_NAME } },
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(DIST_DIR, { verbose: false }),
    new DefinePlugin({
      API_PREFIX: JSON.stringify(API_PREFIX),
      FILE_PREFIX: JSON.stringify(FILE_PREFIX),
    }),
    new HtmlWebpackPlugin({
      title: "K-pop idols network | Profiles, images and face recognition",
      favicon: path.resolve(__dirname, "index/favicon.ico"),
    }),
    createSpritePlugin(),
    new MiniCssExtractPlugin({ filename: CSS_NAME }),
  ].concat(DEBUG ? [] : [new OptimizeCssAssetsPlugin()]),
  output: {
    path: DIST_DIR,
    filename: JS_NAME,
    publicPath: "/",
  },
  devServer: {
    proxy: { "/api": "http://localhost:8002" },
  },
  stats: {
    children: false,
    modules: false,
  },
};
