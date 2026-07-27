import path from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Force a full-page reload (instead of partial HMR) when the shared package
 * dist changes. Without this, Vite hot-reloads RoomContext / GameContext and
 * creates NEW context objects while old consumers still hold references to the
 * old ones — causing "must be used within Provider" crashes in dev.
 */
function fullReloadOnShared(): Plugin {
  return {
    name: 'full-reload-on-shared',
    handleHotUpdate({ file, server }) {
      if (file.includes('/shared/dist/') || file.includes('\\shared\\dist\\')) {
        server.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    fullReloadOnShared(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Online UNO',
        short_name: 'UNO',
        description: 'Play UNO online with friends',
        theme_color: '#0f0f14',
        background_color: '#0f0f14',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
    }),
  ],
  server: {
    port: 5000,
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      // Proxy /health and /socket.io to the backend so both work through
      // Vite's single port on Replit (and in any reverse-proxy environment).
      '/health': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
