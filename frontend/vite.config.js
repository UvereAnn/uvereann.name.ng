/**
 * vite.config.js
 *
 * CONCEPT — Vite Proxy:
 * During development, your frontend runs on port 5173
 * and your backend runs on port 3000.
 *
 * Instead of hardcoding http://localhost:3000 in every
 * fetch() call, we configure a proxy here.
 *
 * Any request your React app makes to /api/* or /health
 * gets forwarded by Vite to http://localhost:3000.
 *
 * BENEFIT: In production, Nginx does the same proxying.
 * Your frontend code never needs to change between
 * development and production — it always calls /api/*.
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/health': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
