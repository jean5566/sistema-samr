import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      allowedHosts: true,
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL || 'http://sistema-samr.test',
          changeOrigin: true,
        },
      },
    },
  }
})
