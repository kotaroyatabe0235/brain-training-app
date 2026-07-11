import { test, expect } from '@playwright/test'

test.describe('ログインフロー', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    })
  })

  test('should login with valid credentials', async ({ page }) => {
    const email = `login-${Date.now()}@example.com`

    await page.goto('/register')
    await page.getByPlaceholder('表示名').fill('ログインテスト')
    await page.getByPlaceholder('メールアドレス').fill(email)
    await page.getByPlaceholder('パスワード（8文字以上）').fill('password123')
    await page.getByPlaceholder('パスワード確認').fill('password123')
    await page.getByRole('button', { name: '登録' }).click()
    await expect(page).toHaveURL('/')

    await page.evaluate(() => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    })

    await page.goto('/login')
    await expect(page.getByText('ログイン')).toBeVisible()

    await page.getByPlaceholder('メールアドレス').fill(email)
    await page.getByPlaceholder('パスワード').fill('password123')
    await page.getByRole('button', { name: 'ログイン' }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByText('ログインテスト')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.getByPlaceholder('メールアドレス').fill('nonexistent@example.com')
    await page.getByPlaceholder('パスワード').fill('wrongpassword')
    await page.getByRole('button', { name: 'ログイン' }).click()

    await expect(page.getByText('メールアドレスまたはパスワードが正しくありません')).toBeVisible()
  })

  test('should navigate to register page from login', async ({ page }) => {
    await page.goto('/login')

    await page.getByText('新規アカウント登録').click()

    await expect(page).toHaveURL('/register')
  })
})
