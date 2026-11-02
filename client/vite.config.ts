import { defineConfig } from "vite";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
	server: {
		hmr: true,
		port: 5173,
	},
	plugins: [react(), tailwindcss()],
	build: {
		outDir: "../public",
		emitAssets: true,
		rollupOptions: {
			input: {
				main: resolve(__dirname, "index.html"),
				admin: resolve(__dirname, "admin.html"),
			},
		},
	},
});
