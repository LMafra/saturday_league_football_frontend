import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: process.env.PORT && process.env.PORT.trim() !== "" 
      ? parseInt(process.env.PORT, 10) 
      : (process.env.VITE_PORT ? parseInt(process.env.VITE_PORT, 10) : 3002),
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3004',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log('Proxying request:', req.method, req.url, '-> http://localhost:3004');
          });
        },
      },
    },
  },
});
