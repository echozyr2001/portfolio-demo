/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test-setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './'),
    },
  },
});