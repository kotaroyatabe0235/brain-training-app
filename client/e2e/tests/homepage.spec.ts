import { test, expect } from '@playwright/test'

test.describe('ホームページ', () => {
  test('should display user name and welcome message', async ({ page }) => {
    const email = `home-${Date.now()}@example.com`

    await page.goto('/register')
    await page.getByPlaceholder('表示名').fill('ホームテスト')
    await page.getByPlaceholder('メールアドレス').fill(email)
    await page.getByPlaceholder('パスワード（8文字以上）').fill('password123')
    await page.getByPlaceholder('パスワード確認').fill('password123')
    await page.getByRole('button', { name: '登録' }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByText('ホームテスト')).toBeVisible()
    await expect(page.getByText('ようこそ、ホームテストさん！')).toBeVisible()
  })

  test('should display all 5 game category cards', async ({ page }) => {
    const email = `home-${Date.now()}@example.com`

    await page.goto('/register')
    await page.getByPlaceholder('表示名').fill('カードテスト')
    await page.getByPlaceholder('メールアドレス').fill(email)
    await page.getByPlaceholder('パスワード（8文字以上）').fill('password123')
    await page.getByPlaceholder('パスワード確認').fill('password123')
    await page.getByRole('button', { name: '登録' }).click()
    await expect(page).toHaveURL('/')

    await expect(page.getByText('記憶力トレーニング')).toBeVisible()
    await expect(page.getByText('計算力トレーニング')).toBeVisible()
    await expect(page.getByText('語彙力トレーニング')).toBeVisible()
    await expect(page.getByText('論理思考トレーニング')).toBeVisible()
    await expect(page.getByText('反応速度トレーニング')).toBeVisible()
  })

  test('should display app title in header', async ({ page }) => {
    const email = `home-${Date.now()}@example.com`

    await page.goto('/register')
    await page.getByPlaceholder('表示名').fill('タイトルテスト')
    await page.getByPlaceholder('メールアドレス').fill(email)
    await page.getByPlaceholder('パスワード（8文字以上）').fill('password123')
    await page.getByPlaceholder('パスワード確認').fill('password123')
    await page.getByRole('button', { name: '登録' }).click()
    await expect(page).toHaveURL('/')

    await expect(page.getByText('Brain Training App')).toBeVisible()
  })
})
