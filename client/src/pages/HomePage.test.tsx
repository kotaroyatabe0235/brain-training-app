import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import HomePage from './HomePage'
import { useAuthStore } from '../stores/authStore'

vi.mock('../stores/authStore', () => ({
  useAuthStore: vi.fn(),
}))

describe('HomePage', () => {
  const mockLogout = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: '1', email: 'test@example.com', displayName: 'テストユーザー' },
      logout: mockLogout,
    } as any)
  })

  it('should display user name', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByText('テストユーザー')).toBeInTheDocument()
  })

  it('should display welcome message with user name', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByText('ようこそ、テストユーザーさん！')).toBeInTheDocument()
  })

  it('should display all 5 game category cards', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByText('記憶力トレーニング')).toBeInTheDocument()
    expect(screen.getByText('計算力トレーニング')).toBeInTheDocument()
    expect(screen.getByText('語彙力トレーニング')).toBeInTheDocument()
    expect(screen.getByText('論理思考トレーニング')).toBeInTheDocument()
    expect(screen.getByText('反応速度トレーニング')).toBeInTheDocument()
  })

  it('should call logout when logout button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    await user.click(screen.getByText('ログアウト'))

    expect(mockLogout).toHaveBeenCalled()
  })

  it('should display app title', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Brain Training App')).toBeInTheDocument()
  })

  it('should have links to game categories', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByText('記憶力トレーニング').closest('a')).toHaveAttribute('href', '/games/memory')
    expect(screen.getByText('計算力トレーニング').closest('a')).toHaveAttribute('href', '/games/calculation')
    expect(screen.getByText('語彙力トレーニング').closest('a')).toHaveAttribute('href', '/games/vocabulary')
    expect(screen.getByText('論理思考トレーニング').closest('a')).toHaveAttribute('href', '/games/logic')
    expect(screen.getByText('反応速度トレーニング').closest('a')).toHaveAttribute('href', '/games/reaction')
  })

  it('should display hero subtitle', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByText('脳トレアプリへようこそ。ゲームを選んでトレーニングを始めましょう。')).toBeInTheDocument()
  })

  it('should display game card descriptions', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByText('カードマッチ、数字記憶など')).toBeInTheDocument()
    expect(screen.getByText('速算チャレンジ、電卓パズルなど')).toBeInTheDocument()
    expect(screen.getByText('類義語チェック、穴埋めクイズなど')).toBeInTheDocument()
    expect(screen.getByText('パターン認識、推理クイズなど')).toBeInTheDocument()
    expect(screen.getByText('ターゲットクリック、色文字マッチなど')).toBeInTheDocument()
  })

  it('should have navigation links', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByText('履歴').closest('a')).toHaveAttribute('href', '/stats/history')
    expect(screen.getByText('ダッシュボード').closest('a')).toHaveAttribute('href', '/stats/dashboard')
    expect(screen.getByText('ランキング').closest('a')).toHaveAttribute('href', '/stats/ranking')
  })

  it('should have logout button', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: 'ログアウト' })).toBeInTheDocument()
  })
})
