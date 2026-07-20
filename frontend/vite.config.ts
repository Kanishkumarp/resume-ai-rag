import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  root: __dirname,
  publicDir: resolve(__dirname, '../public'),
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/v1': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: resolve(__dirname, '../dist/frontend'),
    emptyOutDir: true,
  },
});
