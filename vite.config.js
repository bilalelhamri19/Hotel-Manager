import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/Hotel-Manager/',
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
})
