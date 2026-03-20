import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        // Esto solo funcionará cuando corras el proyecto en tu PC
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});