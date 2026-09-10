import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 47821,
    proxy: {
      '/api': {
        target: 'http://localhost:47820',
        changeOrigin: true,
      },
    },
  },
  build: { outDir: 'dist' },
});