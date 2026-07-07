/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev proxy targets the Hono/y-websocket server (apps/server) on 8787.
// The web app runs fully on static fallback data if that server is absent,
// so these are best-effort routes (see src/api/client.ts).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:8787', changeOrigin: true },
      '/yjs': { target: 'ws://localhost:8787', ws: true },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
