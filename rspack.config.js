// Based on https://github.com/rustwasm/wasm-bindgen/blob/main/examples/hello_world/webpack.config.js

const path = require('node:path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const rspack = require('@rspack/core');
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

module.exports = {
    entry: './moq-demo/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
    },
    plugins: [
        new HtmlWebpackPlugin({
			template: 'moq-demo/index.html'
		}),
        new WasmPackPlugin({
            crateDirectory: path.resolve(__dirname, 'moq-worker'),
            outDir: path.resolve(__dirname, 'moq-worker/dist'),
            withTypeScript: true,
        }),
    ],
    mode: 'development',
    experiments: {
        asyncWebAssembly: true,
        topLevelAwait: true
    },
   // Typescript support
	module: {
		rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
				loader: 'builtin:swc-loader',
				options: {
                    jsc: {
                        parser: {
                            syntax: 'typescript',
                        },
                    },
                },
				type: 'javascript/auto',
            },
		],
	},
    resolve: {
        extensions: ['.ts', '.js'],
    },
};
