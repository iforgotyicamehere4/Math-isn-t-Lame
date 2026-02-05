import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
base: '/Math-isn-t-Lame/',   // GitHub Pages repository subdirectory
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: {
      host: '192.168.1.71',
      port: 5173
    }
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
});

