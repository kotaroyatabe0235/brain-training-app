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
  mutate: ['src/**/*.ts', '!src/**/*.test.ts', '!src/index.ts'],
  reporters: ['html', 'json', 'clear-text', 'progress'],
  concurrency: 2,
})
