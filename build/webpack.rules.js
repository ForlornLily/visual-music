// const extractTextPlugin = require("extract-text-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const devMode = process.env.NODE_ENV !== 'production'

const rules = [{
  test: /\.css$/,
  // 区别开发环境和生成环境
  use: [
    devMode ? 'style-loader' : {
      loader: MiniCssExtractPlugin.loader,
      options: {
        // you can specify a publicPath here
        // by default it use publicPath in webpackOptions.output
        publicPath: '../'
      }
    },
    'css-loader',
    'postcss-loader'
  ]
},
{
  test: /\.js$/,
  use: [{
    loader: "babel-loader"
  }],
  // 不检查node_modules下的js文件
  // exclude: "/node_modules/"
}, {
  test: /\.(png|jpg|gif)$/,
  use: [{
    loader: "file-loader",
    options: {
      limit: 5 * 1024, //小于这个时将会已base64位图片打包处理
      // 图片文件输出的文件夹
      publicPath: "../images",
      outputPath: "images"
    }
  }]
},
{
  test: /\.html$/,
  // html中的img标签
  use: {
    loader: 'html-loader',
    options: {
      attrs: ['img:src', 'img:data-src', 'audio:src'],
      minimize: true
    }
  }
}
];
module.exports = rules;