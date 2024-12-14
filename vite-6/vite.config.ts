import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	build: {
		target: "esnext",
	},
	base: "./",
	worker: {
		format: "es",
	},
	// Workaround for: https://github.com/vitejs/vite/issues/8427
	optimizeDeps: {
		exclude: ["@kixelated/moq"],
	},
});
