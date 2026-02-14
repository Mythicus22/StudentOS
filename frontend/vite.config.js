import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/user': 'http://localhost:5000',
      '/todo': 'http://localhost:5000',
      '/note': 'http://localhost:5000',
      '/url': 'http://localhost:5000',
      '/tools': 'http://localhost:5000'
    }
  }
})
