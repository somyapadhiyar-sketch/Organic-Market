import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    base: '/',
    server: {
      open: true,
      port: 3000,
      proxy: {
        '/webhook': {
          target: env.VITE_BACKEND_TARGET || 'http://localhost:5678',
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})
