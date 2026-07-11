import { defineConfig } from '@stryker-mutator/core'

export default defineConfig({
  testRunner: 'vitest',
  vitest: {
    projectType: 'vitest',
  },
  coverageAnalysis: 'perTest',
  thresholds: {
    high: 95,
    low: 80,
    break: 95,
  },
  mutate: ['src/**/*.ts', '!src/**/*.test.ts'],
  reporters: ['html', 'clear-text', 'progress'],
  concurrency: 2,
})
