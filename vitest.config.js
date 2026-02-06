import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.js',
    globals: true,
    exclude: ['tests/e2e/**'],
  },
});
