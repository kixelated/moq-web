import type { Configuration } from "@rspack/cli";

import path from "node:path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import WasmPackPlugin from "@wasm-tool/wasm-pack-plugin";

const config: Configuration = {
	entry: "./lib/index.ts",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "index.js",
		globalObject: "this",
		library: {
			name: "Moq",
			type: "umd",
		},
	},
	plugins: [
		new WasmPackPlugin({
			crateDirectory: path.resolve(__dirname, "worker"),
			outDir: path.resolve(__dirname, "worker/dist"),
		}),
		new HtmlWebpackPlugin({
			template: "demo/index.html",
		}),
	],
	mode: process.env.NODE_ENV === "production" ? "production" : "development",
	experiments: {
		asyncWebAssembly: true,
		topLevelAwait: true,
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				loader: "builtin:swc-loader",
				options: {
					jsc: {
						parser: {
							syntax: "typescript",
						},
					},
					compilerOptions: {
						declaration: true,
						emitDeclarationOnly: true,
						outDir: "dist/types",
					},
				},
				type: "javascript/auto",
			},
		],
	},
	resolve: {
		extensions: [".ts", ".js"],
	},
};

export default config;
