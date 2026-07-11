import { test, expect } from '@playwright/test'

test.describe('クライアント側バリデーション', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    })
  })

  test('should show error when passwords do not match', async ({ page }) => {
    await page.goto('/register')

    await page.getByPlaceholder('表示名').fill('テスト')
    await page.getByPlaceholder('メールアドレス').fill('test@example.com')
    await page.getByPlaceholder('パスワード（8文字以上）').fill('password123')
    await page.getByPlaceholder('パスワード確認').fill('differentpassword')
    await page.getByRole('button', { name: '登録' }).click()

    await expect(page.getByText('パスワードが一致しません')).toBeVisible()
  })

  test('should show error when password is less than 8 characters', async ({ page }) => {
    await page.goto('/register')

    await page.getByPlaceholder('表示名').fill('テスト')
    await page.getByPlaceholder('メールアドレス').fill('test@example.com')
    await page.getByPlaceholder('パスワード（8文字以上）').fill('short')
    await page.getByPlaceholder('パスワード確認').fill('short')
    await page.getByRole('button', { name: '登録' }).click()

    await expect(page.getByText('パスワードは8文字以上で入力してください')).toBeVisible()
  })

  test('should clear local error when user types', async ({ page }) => {
    await page.goto('/register')

    await page.getByPlaceholder('表示名').fill('テスト')
    await page.getByPlaceholder('メールアドレス').fill('test@example.com')
    await page.getByPlaceholder('パスワード（8文字以上）').fill('short')
    await page.getByPlaceholder('パスワード確認').fill('short')
    await page.getByRole('button', { name: '登録' }).click()
    await expect(page.getByText('パスワードは8文字以上で入力してください')).toBeVisible()

    await page.getByPlaceholder('パスワード（8文字以上）').fill('password123')

    await expect(page.getByText('パスワードは8文字以上で入力してください')).not.toBeVisible()
  })
})
