/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, '../../../'),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [path.resolve(__dirname, './setup.ts')],
    css: true,
    reporters: ['verbose', 'json'],
    outputFile: {
      json: './integration-test-results.json'
    },
    coverage: {
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage/integration',
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
        '**/*.d.ts',
        '**/*.config.*',
        'build/',
        'src/__tests__/**',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
    // Integration test specific configuration
    testTimeout: 60000, // 1 minute for integration tests
    hookTimeout: 30000, // 30 seconds for setup/teardown
    maxConcurrency: 5, // Limit concurrent tests to avoid resource issues
    
    // Test patterns
    include: [
      'src/__tests__/integration/**/*.integration.test.{js,ts,jsx,tsx}'
    ],
    exclude: [
      'node_modules/**',
      'build/**',
      '**/*.unit.test.*',
      '**/*.spec.*'
    ],

    // Performance testing configuration
    benchmark: {
      include: ['**/*.bench.{js,ts,jsx,tsx}'],
      exclude: ['node_modules/**'],
      reporters: ['verbose']
    },

    // Environment variables for testing
    env: {
      NODE_ENV: 'test',
      VITE_API_BASE_URL: 'http://localhost:8080/api',
      VITE_APP_NAME: 'Certificate System Test'
    }
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
})