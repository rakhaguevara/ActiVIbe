import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || 'http://localhost:4000'

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] })
    ],
    server: {
      port: env.PORT ? parseInt(env.PORT) : 5173,
      strictPort: false,
      // Proxy: semua request /auth /profile /events /applications
      // diteruskan ke backend sehingga browser tidak perlu lintas origin
      proxy: {
        '/auth': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
        '/profile': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
        '/events': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
        '/applications': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
