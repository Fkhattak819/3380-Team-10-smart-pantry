import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    open: true,
    // proxy: {
    //   '/api': {
    //     target: 'https://epistemic-postnasal-reid.ngrok-free.dev',
    //     changeOrigin: true,
    //     secure: false,
    //     rewrite: path => path.replace(/^\/api/, ''),
    //   }
    // }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
