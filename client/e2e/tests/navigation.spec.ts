import { test, expect } from '@playwright/test'

test.describe('ナビゲーション', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    })
  })

  test('should navigate between login and register pages', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('ログイン')).toBeVisible()

    await page.getByText('新規アカウント登録').click()
    await expect(page).toHaveURL('/register')
    await expect(page.getByText('新規アカウント登録')).toBeVisible()

    await page.getByText('ログイン').click()
    await expect(page).toHaveURL('/login')
  })

  test('should redirect unknown routes to home', async ({ page }) => {
    await page.goto('/unknown-page')

    await expect(page).toHaveURL('/login')
  })
})
