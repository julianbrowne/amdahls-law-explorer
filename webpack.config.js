
const path = require('path');
const webpack = require('webpack');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = { 

	mode: 'development',

	entry: "./src/js/main.js",

	resolve: { 
		modules: [ 
			path.join(__dirname, "src"),
			"node_modules"
		]
	},

	output: { 
		path: path.resolve(__dirname, "dist"),
		filename: 'amdahl-explorer.js',
		library: 'AmdahlExplorer',
		libraryTarget: 'window',
		libraryExport: 'default'
  	},

	optimization: { 
		minimize: false
	},

	plugins: [ 

		new webpack.ProvidePlugin({ 
		  $: 'jquery',
		  jQuery: 'jquery',
		}),

		new ESLintPlugin()

	],

	module: { 
		rules: [ 
			{ 
				test: /\.css$/i,
				use: [ 
					'style-loader',
					'css-loader'
				],
			},
			{
				test: /\.(scss)$/,
				use: [ 
					{
						loader: 'style-loader'
					},
					{
						loader: 'css-loader'
					},
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								plugins: () => [
									require('autoprefixer')
								]
							}
						}
					},
					{
						loader: 'sass-loader'
					}
				]
			}
		]
	}

};
