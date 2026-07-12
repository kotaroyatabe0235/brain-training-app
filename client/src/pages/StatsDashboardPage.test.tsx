import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import StatsDashboardPage from './StatsDashboardPage'
import { useScoreStore } from '../stores/scoreStore'

vi.mock('../stores/scoreStore', () => ({
  useScoreStore: vi.fn(),
}))

describe('StatsDashboardPage', () => {
  const mockFetchStats = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading state', () => {
    vi.mocked(useScoreStore).mockReturnValue({
      stats: null,
      fetchStats: mockFetchStats,
      isLoading: true,
    } as any)

    render(
      <MemoryRouter>
        <StatsDashboardPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
  })

  it('should show stats when loaded', () => {
    vi.mocked(useScoreStore).mockReturnValue({
      stats: {
        totalGamesPlayed: 10,
        totalDuration: 3661,
        averageScore: 85,
        categoryAverages: [
          { category: 'memory', averageScore: 90, gamesPlayed: 5 },
          { category: 'calculation', averageScore: 80, gamesPlayed: 5 },
        ],
        bestScores: [
          { gameId: '1', gameName: '数字記憶', category: 'memory', difficulty: 'hard', score: 100 },
        ],
      },
      fetchStats: mockFetchStats,
      isLoading: false,
    } as any)

    render(
      <MemoryRouter>
        <StatsDashboardPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('10回')).toBeInTheDocument()
    expect(screen.getByText('85点')).toBeInTheDocument()
    expect(screen.getByText('1時間1分')).toBeInTheDocument()
    expect(screen.getAllByText('記憶力').length).toBeGreaterThan(0)
    expect(screen.getByText('計算力')).toBeInTheDocument()
    expect(screen.getByText('数字記憶')).toBeInTheDocument()
    expect(screen.getByText('100点')).toBeInTheDocument()
  })

  it('should show empty state when no stats', () => {
    vi.mocked(useScoreStore).mockReturnValue({
      stats: null,
      fetchStats: mockFetchStats,
      isLoading: false,
    } as any)

    render(
      <MemoryRouter>
        <StatsDashboardPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('データを読み込めませんでした')).toBeInTheDocument()
  })

  it('should call fetchStats on mount', () => {
    vi.mocked(useScoreStore).mockReturnValue({
      stats: null,
      fetchStats: mockFetchStats,
      isLoading: false,
    } as any)

    render(
      <MemoryRouter>
        <StatsDashboardPage />
      </MemoryRouter>,
    )

    expect(mockFetchStats).toHaveBeenCalledTimes(1)
  })

  it('should show no play history message when categoryAverages is empty', () => {
    vi.mocked(useScoreStore).mockReturnValue({
      stats: {
        totalGamesPlayed: 0,
        totalDuration: 0,
        averageScore: 0,
        categoryAverages: [],
        bestScores: [],
      },
      fetchStats: mockFetchStats,
      isLoading: false,
    } as any)

    render(
      <MemoryRouter>
        <StatsDashboardPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('まだプレイ履歴がありません')).toBeInTheDocument()
    expect(screen.getByText('まだスコアがありません')).toBeInTheDocument()
  })
})
