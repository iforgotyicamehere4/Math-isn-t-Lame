import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  // Android/Capacitor must use "/" while GitHub Pages uses "/Math-isn-t-Lame/".
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  }
}));
