import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), wasm()],
	// Workaround until fixed: https://github.com/vitejs/vite/issues/8427
	optimizeDeps: {
		exclude: ["@kixelated/moq"],
	},
});