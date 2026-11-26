import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // The PROXY: during development, React runs on port 5173 and Express on 3000.
    // Any request React makes to a path starting with /api gets forwarded to Express.
    // So in React we can write fetch('/api/health') and never hard-code a port.
    // Because the browser thinks everything comes from ONE origin, we avoid
    // CORS errors, and login cookies (Phase 2) will just work.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
