const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        preview: './preview.js'
    },
    output: {
        filename: ((env = 'develop') => {
            let assignFilename = {
                'develop': '[name].bundle.js',
                'release': '[name].bundle.js'
            };
            return assignFilename[env];
        })(process.env.NODE_ENV),
        path: path.resolve(__dirname, './'),
    },
    module: {
        rules: [
            {
	            test: /\.css$|\.scss$/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            localIdentName: '[local]'
                        }
                    },
                    {
                        loader: 'sass-loader'
                    }
                ]
	        },
            {
                test: /\.js?$|\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                use: [
                    {
						loader: 'babel-loader',
						query: {
							// stage-0 is to es7 es 2015 is to es5
							plugins: ['transform-runtime'],
							presets: ['es2015', 'stage-0', 'react'],
						}
				        // options: {
                        //     presets: ['env', 'react']
				        // }
				    }
                ]
            }
        ]
    },
    devServer: {
        contentBase: path.join(__dirname, './'),
        compress: false,
        port: 9000
    },
    devtool: process.env.NODE_ENV === 'develop' ? 'source-map' : '',
    plugins: [
        new HtmlWebpackPlugin({
      		inject: true,
            template: './template.html'
    	}),
        new webpack.HotModuleReplacementPlugin()
    ]
};