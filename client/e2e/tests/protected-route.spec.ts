import { test, expect } from '@playwright/test'

test.describe('認証ガード', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    })
  })

  test('should redirect unauthenticated user to /login', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveURL('/login')
  })

  test('should allow authenticated user to access home', async ({ page }) => {
    const email = `guard-${Date.now()}@example.com`

    await page.goto('/register')
    await page.getByPlaceholder('表示名').fill('認証テスト')
    await page.getByPlaceholder('メールアドレス').fill(email)
    await page.getByPlaceholder('パスワード（8文字以上）').fill('password123')
    await page.getByPlaceholder('パスワード確認').fill('password123')
    await page.getByRole('button', { name: '登録' }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByText('Brain Training App')).toBeVisible()
  })

  test('should redirect to /login after token expiry', async ({ page }) => {
    const email = `guard-${Date.now()}@example.com`

    await page.goto('/register')
    await page.getByPlaceholder('表示名').fill('テスト')
    await page.getByPlaceholder('メールアドレス').fill(email)
    await page.getByPlaceholder('パスワード（8文字以上）').fill('password123')
    await page.getByPlaceholder('パスワード確認').fill('password123')
    await page.getByRole('button', { name: '登録' }).click()
    await expect(page).toHaveURL('/')

    await page.evaluate(() => {
      localStorage.setItem('token', 'expired-invalid-token')
    })

    await page.goto('/')

    await expect(page).toHaveURL('/login')
  })
})
