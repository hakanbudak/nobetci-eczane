import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api/eczane': {
        target: 'https://eczaneapi.com/api/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/eczane/, ''),
      },
    },
  },
})
