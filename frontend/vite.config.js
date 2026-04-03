//vite.config.js

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:9999", // ❗ 여기서 '/api' 붙이면 안됨
        changeOrigin: true,
      },
    },
  },
});
