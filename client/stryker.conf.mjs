/** @type {import('@stryker-mutator/core').PartialStrykerOptions} */
const config = {
  testRunner: 'vitest',
  coverageAnalysis: 'perTest',
  timeoutMS: 600000,
  thresholds: {
    high: 80,
    low: 60,
    break: 80,
  },
  mutate: [
    'src/App.tsx',
    'src/types/*.ts',
    'src/stores/authStore.ts',
    'src/stores/scoreStore.ts',
    'src/services/api.ts',
    'src/services/scoreApi.ts',
    'src/components/ProtectedRoute.tsx',
    'src/pages/LoginPage.tsx',
    'src/pages/RegisterPage.tsx',
    'src/pages/HomePage.tsx',
    'src/pages/GameCategoryPage.tsx',
    'src/pages/RankingPage.tsx',
    'src/pages/StatsDashboardPage.tsx',
    'src/pages/StatsHistoryPage.tsx',
    'src/pages/ComingSoonPage.tsx',
  ],
  reporters: ['html', 'json', 'clear-text', 'progress'],
  concurrency: 4,
}

export default config
