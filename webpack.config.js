/* eslint-disable */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	name: 'Maui',
	entry: './src/index.js',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: 'babel-loader',
			},
			{
				test: /.(jpg|jpeg|png|svg)$/,
				loader: 'file-loader',
				options: {
					outputPath: 'assets',
					name: '[name].[ext]',
				},
			},
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: 'src/index.html',
		}),
	],
	devServer: {
		contentBase: path.join(__dirname, 'dist'),
		historyApiFallback: true, // Redirect requests to our root file.
	},
};
