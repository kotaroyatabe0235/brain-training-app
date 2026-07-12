import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import RankingPage from './RankingPage'
import { gameApi, scoreApi } from '../services/scoreApi'

vi.mock('../services/scoreApi', () => ({
  gameApi: {
    getAllGames: vi.fn(),
  },
  scoreApi: {
    getRanking: vi.fn(),
  },
}))

describe('RankingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(gameApi.getAllGames).mockResolvedValue([
      { id: '1', name: '数字記憶', category: 'memory', description: '', config: {} },
      { id: '2', name: '計算クイズ', category: 'calculation', description: '', config: {} },
    ])
  })

  it('should show loading state after game selection', async () => {
    vi.mocked(scoreApi.getRanking).mockReturnValue(new Promise(() => {}))

    render(
      <MemoryRouter>
        <RankingPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('ゲームを選んでください')).toBeInTheDocument()
    })

    const user = userEvent.setup()
    const select = screen.getByRole('combobox')
    await user.selectOptions(select, '1')

    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
  })

  it('should show game selector dropdown', async () => {
    render(
      <MemoryRouter>
        <RankingPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('数字記憶')).toBeInTheDocument()
    })

    expect(screen.getByText('ゲームを選択')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('ゲームを選んでください')).toBeInTheDocument()
    expect(screen.getByText('計算クイズ')).toBeInTheDocument()
  })

  it('should show ranking table when game is selected', async () => {
    vi.mocked(scoreApi.getRanking).mockResolvedValue([
      { rank: 1, user: { id: 'u1', displayName: 'プレイヤー1' }, bestScore: 100 },
      { rank: 2, user: { id: 'u2', displayName: 'プレイヤー2' }, bestScore: 80 },
    ])

    render(
      <MemoryRouter>
        <RankingPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('数字記憶')).toBeInTheDocument()
    })

    const user = userEvent.setup()
    await user.selectOptions(screen.getByRole('combobox'), '1')

    await waitFor(() => {
      expect(screen.getByText('プレイヤー1')).toBeInTheDocument()
      expect(screen.getByText('プレイヤー2')).toBeInTheDocument()
      expect(screen.getByText('100点')).toBeInTheDocument()
      expect(screen.getByText('80点')).toBeInTheDocument()
      expect(screen.getByText('数字記憶 - ランキング')).toBeInTheDocument()
    })
  })

  it('should show medals for top 3 ranks', async () => {
    vi.mocked(scoreApi.getRanking).mockResolvedValue([
      { rank: 1, user: { id: 'u1', displayName: 'プレイヤー1' }, bestScore: 100 },
      { rank: 2, user: { id: 'u2', displayName: 'プレイヤー2' }, bestScore: 90 },
      { rank: 3, user: { id: 'u3', displayName: 'プレイヤー3' }, bestScore: 80 },
      { rank: 4, user: { id: 'u4', displayName: 'プレイヤー4' }, bestScore: 70 },
    ])

    render(
      <MemoryRouter>
        <RankingPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('数字記憶')).toBeInTheDocument()
    })

    const user = userEvent.setup()
    await user.selectOptions(screen.getByRole('combobox'), '1')

    await waitFor(() => {
      expect(screen.getByText('🥇')).toBeInTheDocument()
      expect(screen.getByText('🥈')).toBeInTheDocument()
      expect(screen.getByText('🥉')).toBeInTheDocument()
      expect(screen.getByText('4位')).toBeInTheDocument()
    })
  })

  it('should show empty state when no ranking data', async () => {
    vi.mocked(scoreApi.getRanking).mockResolvedValue([])

    render(
      <MemoryRouter>
        <RankingPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('数字記憶')).toBeInTheDocument()
    })

    const user = userEvent.setup()
    await user.selectOptions(screen.getByRole('combobox'), '1')

    await waitFor(() => {
      expect(screen.getByText('まだスコアがありません')).toBeInTheDocument()
    })
  })

  it('should show "ゲームを選択してください" when no game selected', async () => {
    render(
      <MemoryRouter>
        <RankingPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('ゲームを選択してください')).toBeInTheDocument()
    })
  })
})
