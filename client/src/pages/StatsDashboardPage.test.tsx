import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
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

  it('should display all category names from lookup table', () => {
    vi.mocked(useScoreStore).mockReturnValue({
      stats: {
        totalGamesPlayed: 5,
        totalDuration: 300,
        averageScore: 70,
        categoryAverages: [
          { category: 'memory', averageScore: 80, gamesPlayed: 1 },
          { category: 'calculation', averageScore: 80, gamesPlayed: 1 },
          { category: 'vocabulary', averageScore: 80, gamesPlayed: 1 },
          { category: 'logic', averageScore: 80, gamesPlayed: 1 },
          { category: 'reaction', averageScore: 80, gamesPlayed: 1 },
        ],
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

    expect(screen.getByText('記憶力')).toBeInTheDocument()
    expect(screen.getByText('計算力')).toBeInTheDocument()
    expect(screen.getByText('語彙力')).toBeInTheDocument()
    expect(screen.getByText('論理思考')).toBeInTheDocument()
    expect(screen.getByText('反応速度')).toBeInTheDocument()
  })

  it('should show raw category when category is unknown', () => {
    vi.mocked(useScoreStore).mockReturnValue({
      stats: {
        totalGamesPlayed: 1,
        totalDuration: 60,
        averageScore: 50,
        categoryAverages: [
          { category: 'unknown', averageScore: 50, gamesPlayed: 1 },
        ],
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

    expect(screen.getByText('unknown')).toBeInTheDocument()
  })

  it('should display best scores with category names', () => {
    vi.mocked(useScoreStore).mockReturnValue({
      stats: {
        totalGamesPlayed: 1,
        totalDuration: 60,
        averageScore: 100,
        categoryAverages: [],
        bestScores: [
          { gameId: '1', gameName: 'パターン認識', category: 'logic', difficulty: 'normal', score: 95 },
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

    expect(screen.getByText('パターン認識')).toBeInTheDocument()
    expect(screen.getByText('論理思考')).toBeInTheDocument()
    expect(screen.getByText('95点')).toBeInTheDocument()
  })

  it('should show raw category in bestScores for unknown category', () => {
    vi.mocked(useScoreStore).mockReturnValue({
      stats: {
        totalGamesPlayed: 1,
        totalDuration: 60,
        averageScore: 100,
        categoryAverages: [],
        bestScores: [
          { gameId: '1', gameName: 'テストゲーム', category: 'unknown', difficulty: 'easy', score: 50 },
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

    expect(screen.getByText('unknown')).toBeInTheDocument()
  })

  it('should format duration without hours', () => {
    vi.mocked(useScoreStore).mockReturnValue({
      stats: {
        totalGamesPlayed: 1,
        totalDuration: 125,
        averageScore: 80,
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

    expect(screen.getByText('2分5秒')).toBeInTheDocument()
  })

  it('should format duration with zero seconds', () => {
    vi.mocked(useScoreStore).mockReturnValue({
      stats: {
        totalGamesPlayed: 1,
        totalDuration: 120,
        averageScore: 80,
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

    expect(screen.getByText('2分0秒')).toBeInTheDocument()
  })

  it('should format duration with multiple hours', () => {
    vi.mocked(useScoreStore).mockReturnValue({
      stats: {
        totalGamesPlayed: 1,
        totalDuration: 7200,
        averageScore: 80,
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

    expect(screen.getByText('2時間0分')).toBeInTheDocument()
  })

  it('should display category average scores and play counts', () => {
    vi.mocked(useScoreStore).mockReturnValue({
      stats: {
        totalGamesPlayed: 3,
        totalDuration: 180,
        averageScore: 80,
        categoryAverages: [
          { category: 'vocabulary', averageScore: 75, gamesPlayed: 3 },
        ],
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

    expect(screen.getByText('75点（3回プレイ）')).toBeInTheDocument()
  })
})
