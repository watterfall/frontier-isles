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
      // Pin IPv4: on developer machines another app may own ::1:8787 while
      // Frontier Isles correctly listens on 0.0.0.0:8787. `localhost` would
      // then proxy to the unrelated IPv6 service and make every landing 404.
      '/api': { target: 'http://127.0.0.1:8787', changeOrigin: true },
      '/yjs': { target: 'ws://127.0.0.1:8787', ws: true },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
