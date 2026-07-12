import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import StatsHistoryPage from './StatsHistoryPage'
import { useScoreStore } from '../stores/scoreStore'

vi.mock('../stores/scoreStore', () => ({
  useScoreStore: vi.fn(),
}))

describe('StatsHistoryPage', () => {
  const mockFetchScores = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading state', () => {
    vi.mocked(useScoreStore).mockReturnValue({
      scores: [],
      fetchScores: mockFetchScores,
      isLoading: true,
    } as any)

    render(
      <MemoryRouter>
        <StatsHistoryPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
  })

  it('should show score history table with correct columns', () => {
    vi.mocked(useScoreStore).mockReturnValue({
      scores: [
        {
          id: '1',
          gameId: 'g1',
          score: 95,
          difficulty: 'hard',
          duration: 120,
          createdAt: '2024-01-15T10:30:00Z',
          game: { id: 'g1', name: '数字記憶', category: 'memory' },
        },
      ],
      fetchScores: mockFetchScores,
      isLoading: false,
    } as any)

    render(
      <MemoryRouter>
        <StatsHistoryPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('日時')).toBeInTheDocument()
    expect(screen.getByText('ゲーム')).toBeInTheDocument()
    expect(screen.getByText('カテゴリ')).toBeInTheDocument()
    expect(screen.getByText('難易度')).toBeInTheDocument()
    expect(screen.getByText('スコア')).toBeInTheDocument()
    expect(screen.getByText('時間')).toBeInTheDocument()
    expect(screen.getByText('数字記憶')).toBeInTheDocument()
    expect(screen.getByText('95点')).toBeInTheDocument()
    expect(screen.getByText('120秒')).toBeInTheDocument()
  })

  it('should show empty state with link to play games', () => {
    vi.mocked(useScoreStore).mockReturnValue({
      scores: [],
      fetchScores: mockFetchScores,
      isLoading: false,
    } as any)

    render(
      <MemoryRouter>
        <StatsHistoryPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('まだスコアがありません')).toBeInTheDocument()
    const link = screen.getByText('ゲームをプレイする')
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', '/')
  })

  it('should call fetchScores on mount', () => {
    vi.mocked(useScoreStore).mockReturnValue({
      scores: [],
      fetchScores: mockFetchScores,
      isLoading: false,
    } as any)

    render(
      <MemoryRouter>
        <StatsHistoryPage />
      </MemoryRouter>,
    )

    expect(mockFetchScores).toHaveBeenCalledTimes(1)
  })
})
