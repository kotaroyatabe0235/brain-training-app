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

  it('should display category names from lookup table', () => {
    vi.mocked(useScoreStore).mockReturnValue({
      scores: [
        { id: '1', score: 80, difficulty: 'easy', duration: 60, createdAt: '2024-01-15T10:30:00Z', game: { name: '速算チャレンジ', category: 'calculation' } },
        { id: '2', score: 90, difficulty: 'normal', duration: 90, createdAt: '2024-01-16T11:00:00Z', game: { name: '類義語チェック', category: 'vocabulary' } },
        { id: '3', score: 70, difficulty: 'easy', duration: 45, createdAt: '2024-01-17T12:00:00Z', game: { name: 'パターン認識', category: 'logic' } },
        { id: '4', score: 85, difficulty: 'hard', duration: 30, createdAt: '2024-01-18T13:00:00Z', game: { name: 'ターゲットクリック', category: 'reaction' } },
      ],
      fetchScores: mockFetchScores,
      isLoading: false,
    } as any)

    render(
      <MemoryRouter>
        <StatsHistoryPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('計算力')).toBeInTheDocument()
    expect(screen.getByText('語彙力')).toBeInTheDocument()
    expect(screen.getByText('論理思考')).toBeInTheDocument()
    expect(screen.getByText('反応速度')).toBeInTheDocument()
  })

  it('should display difficulty names from lookup table', () => {
    vi.mocked(useScoreStore).mockReturnValue({
      scores: [
        { id: '1', score: 80, difficulty: 'easy', duration: 60, createdAt: '2024-01-15T10:30:00Z', game: { name: '数字記憶', category: 'memory' } },
        { id: '2', score: 90, difficulty: 'normal', duration: 90, createdAt: '2024-01-16T11:00:00Z', game: { name: '数字記憶', category: 'memory' } },
        { id: '3', score: 95, difficulty: 'hard', duration: 120, createdAt: '2024-01-17T12:00:00Z', game: { name: '数字記憶', category: 'memory' } },
      ],
      fetchScores: mockFetchScores,
      isLoading: false,
    } as any)

    render(
      <MemoryRouter>
        <StatsHistoryPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('やさしい')).toBeInTheDocument()
    expect(screen.getByText('ふつう')).toBeInTheDocument()
    expect(screen.getByText('むずかしい')).toBeInTheDocument()
  })

  it('should show dash for unknown category', () => {
    vi.mocked(useScoreStore).mockReturnValue({
      scores: [
        { id: '1', score: 50, difficulty: 'easy', duration: 30, createdAt: '2024-01-15T10:30:00Z', game: { name: 'テスト', category: 'unknown_category' } },
      ],
      fetchScores: mockFetchScores,
      isLoading: false,
    } as any)

    render(
      <MemoryRouter>
        <StatsHistoryPage />
      </MemoryRouter>,
    )

    const cells = screen.getAllByText('-')
    expect(cells.length).toBeGreaterThanOrEqual(1)
  })

  it('should show dash when game name is missing', () => {
    vi.mocked(useScoreStore).mockReturnValue({
      scores: [
        { id: '1', score: 50, difficulty: 'easy', duration: 30, createdAt: '2024-01-15T10:30:00Z', game: null },
      ],
      fetchScores: mockFetchScores,
      isLoading: false,
    } as any)

    render(
      <MemoryRouter>
        <StatsHistoryPage />
      </MemoryRouter>,
    )

    const cells = screen.getAllByText('-')
    expect(cells.length).toBeGreaterThanOrEqual(1)
  })

  it('should show raw difficulty value for unknown difficulty', () => {
    vi.mocked(useScoreStore).mockReturnValue({
      scores: [
        { id: '1', score: 50, difficulty: 'extreme', duration: 30, createdAt: '2024-01-15T10:30:00Z', game: { name: '数字記憶', category: 'memory' } },
      ],
      fetchScores: mockFetchScores,
      isLoading: false,
    } as any)

    render(
      <MemoryRouter>
        <StatsHistoryPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('extreme')).toBeInTheDocument()
  })

  it('should display memory category name', () => {
    vi.mocked(useScoreStore).mockReturnValue({
      scores: [
        { id: '1', score: 80, difficulty: 'easy', duration: 60, createdAt: '2024-01-15T10:30:00Z', game: { name: '数字記憶', category: 'memory' } },
      ],
      fetchScores: mockFetchScores,
      isLoading: false,
    } as any)

    render(
      <MemoryRouter>
        <StatsHistoryPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('記憶力')).toBeInTheDocument()
  })
})
