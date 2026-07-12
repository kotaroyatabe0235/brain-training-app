import { defineConfig } from '@stryker-mutator/core'

export default defineConfig({
  testRunner: 'vitest',
  vitest: {
    projectType: 'vitest',
  },
  coverageAnalysis: 'perTest',
  thresholds: {
    high: 80,
    low: 60,
    break: 80,
  },
  mutate: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.{test,spec}.{ts,tsx}',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
  reporters: ['html', 'json', 'clear-text', 'progress'],
  concurrency: 2,
})
