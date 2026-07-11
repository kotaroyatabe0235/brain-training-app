import { test, expect } from '@playwright/test'

test.describe('新規登録フロー', () => {
  test('should register a new user and redirect to home', async ({ page }) => {
    await page.goto('/register')

    await expect(page.getByText('新規アカウント登録')).toBeVisible()

    await page.getByPlaceholder('表示名').fill('テストユーザー')
    await page.getByPlaceholder('メールアドレス').fill(`test-${Date.now()}@example.com`)
    await page.getByPlaceholder('パスワード（8文字以上）').fill('password123')
    await page.getByPlaceholder('パスワード確認').fill('password123')

    await page.getByRole('button', { name: '登録' }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByText('Brain Training App')).toBeVisible()
  })

  test('should show error for duplicate email', async ({ page }) => {
    const email = `dup-${Date.now()}@example.com`

    await page.goto('/register')
    await page.getByPlaceholder('表示名').fill('ユーザー1')
    await page.getByPlaceholder('メールアドレス').fill(email)
    await page.getByPlaceholder('パスワード（8文字以上）').fill('password123')
    await page.getByPlaceholder('パスワード確認').fill('password123')
    await page.getByRole('button', { name: '登録' }).click()
    await expect(page).toHaveURL('/')

    await page.evaluate(() => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    })

    await page.goto('/register')
    await page.getByPlaceholder('表示名').fill('ユーザー2')
    await page.getByPlaceholder('メールアドレス').fill(email)
    await page.getByPlaceholder('パスワード（8文字以上）').fill('password123')
    await page.getByPlaceholder('パスワード確認').fill('password123')
    await page.getByRole('button', { name: '登録' }).click()

    await expect(page.getByText('このメールアドレスは既に使用されています')).toBeVisible()
  })

  test('should navigate to login page from register', async ({ page }) => {
    await page.goto('/register')

    await page.getByText('ログイン').click()

    await expect(page).toHaveURL('/login')
  })
})
