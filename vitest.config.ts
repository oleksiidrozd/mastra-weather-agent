import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test directory
    include: ['tests/**/*.test.ts'],

    // Environment
    environment: 'node',

    // Globals (describe, it, expect without imports)
    globals: true,

    // TypeScript support
    typecheck: {
      tsconfig: './tsconfig.json',
    },

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/__tests__/**',
        'node_modules/**',
      ],
      // Coverage thresholds (from test design)
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70,
      },
    },

    // Timeouts
    testTimeout: 30000, // 30s for integration tests
    hookTimeout: 10000, // 10s for setup/teardown

    // Parallelism
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },

    // Reporters
    reporters: ['default', 'junit'],
    outputFile: {
      junit: './test-results/junit.xml',
    },

    // Setup files
    setupFiles: ['./tests/support/setup.ts'],

    // Isolation between tests
    isolate: true,

    // Retry on CI
    retry: process.env.CI ? 2 : 0,
  },
});
