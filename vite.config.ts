import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '^/auth/(?!callback)': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    }
  },
  build: {
    outDir: 'server/dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/react-router-dom/')
          ) {
            return 'react-vendor'
          }

          if (id.includes('/leaflet/') || id.includes('/react-leaflet/')) {
            return 'map-vendor'
          }

          if (id.includes('/react-hot-toast/') || id.includes('/lucide-react/')) {
            return 'ui-vendor'
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Aumentar el límite a 1000 kB
  },
})