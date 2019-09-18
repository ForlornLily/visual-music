const path = require('path');
const webpack = require("webpack");
const merge = require("webpack-merge");
// 清除目录等
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
//4.x之后用以压缩
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
// const extractTextPlugin = require("extract-text-webpack-plugin");
//4.x之后提取css
const miniCssExtractPlugin = require('mini-css-extract-plugin');
const webpackConfigBase = require('./webpack.common.js');

const webpackConfigProd = {
	mode: 'production', // 通过 mode 声明生产环境

	output: {
		path: path.resolve(__dirname, '../dist'),
		// 打包多出口文件
		filename: 'js/[name].[hash].js',
		publicPath: '../'
	},

	devtool: 'cheap-module-eval-source-map',

	plugins: [
		//删除dist目录
		new CleanWebpackPlugin(),
		new webpack.DefinePlugin({
			'process.env.BASE_URL': '\"' + process.env.BASE_URL + '\"'
		}),
		// 分离css插件参数为提取出去的路径
		new miniCssExtractPlugin({
			filename: 'css/[name].[hash:8].min.css',
		}),
		//压缩css
		new OptimizeCSSPlugin({
			cssProcessorOptions: {
				safe: true
			}
		})
	],
	optimization: {
    minimizer: [new UglifyJSPlugin({
			exclude: /node_modules/
		})],
  }
}
module.exports = merge(webpackConfigBase, webpackConfigProd);