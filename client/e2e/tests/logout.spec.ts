import { test, expect } from '@playwright/test'

test.describe('ログアウトフロー', () => {
  test('should logout and redirect to login', async ({ page }) => {
    const email = `logout-${Date.now()}@example.com`

    await page.goto('/register')
    await page.getByPlaceholder('表示名').fill('ログアウトテスト')
    await page.getByPlaceholder('メールアドレス').fill(email)
    await page.getByPlaceholder('パスワード（8文字以上）').fill('password123')
    await page.getByPlaceholder('パスワード確認').fill('password123')
    await page.getByRole('button', { name: '登録' }).click()
    await expect(page).toHaveURL('/')
    await expect(page.getByText('ログアウトテスト')).toBeVisible()

    await page.getByText('ログアウト').click()

    await expect(page).toHaveURL('/login')
  })

  test('should clear user data after logout', async ({ page }) => {
    const email = `logout-${Date.now()}@example.com`

    await page.goto('/register')
    await page.getByPlaceholder('表示名').fill('テストユーザー')
    await page.getByPlaceholder('メールアドレス').fill(email)
    await page.getByPlaceholder('パスワード（8文字以上）').fill('password123')
    await page.getByPlaceholder('パスワード確認').fill('password123')
    await page.getByRole('button', { name: '登録' }).click()
    await expect(page).toHaveURL('/')

    await page.getByText('ログアウト').click()
    await expect(page).toHaveURL('/login')

    const token = await page.evaluate(() => localStorage.getItem('token'))
    expect(token).toBeNull()
  })
})
