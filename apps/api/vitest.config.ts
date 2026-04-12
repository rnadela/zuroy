import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts'],
    exclude: ['dist/**', 'node_modules/**'],
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.spec.ts',
        'src/**/*.module.ts',
        'src/**/dto/**',
        'src/**/*.controller.ts',
        'src/**/guards/**',
        'src/**/strategies/**',
        'src/**/decorators/**',
        'src/**/pipes/**',
        'src/**/processors/**',
        'src/**/*.processor.ts',
        'src/**/*.interceptor.ts',
        'src/**/*.indicator.ts',
        'src/prisma/**',
        'src/redis/redis.service.ts',
        'src/main.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
  plugins: [swc.vite({ module: { type: 'es6' } })],
});
