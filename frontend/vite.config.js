import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api/catalog': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/inventory': {
        target: 'http://localhost:8084',
        changeOrigin: true,
      },
      '/api/identity': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/api/orders': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
