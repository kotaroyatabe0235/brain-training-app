import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useScoreStore } from './scoreStore'

vi.mock('../services/scoreApi', () => ({
  scoreApi: {
    submitScore: vi.fn(),
    getUserScores: vi.fn(),
    getBestScores: vi.fn(),
    getRanking: vi.fn(),
    getStats: vi.fn(),
  },
  gameApi: {
    getAllGames: vi.fn(),
  },
}))

const { scoreApi, gameApi } = await import('../services/scoreApi')

describe('scoreStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useScoreStore.setState({
      scores: [],
      games: [],
      bestScores: [],
      ranking: [],
      stats: null,
      isLoading: false,
      error: null,
    })
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useScoreStore())

      expect(result.current.scores).toEqual([])
      expect(result.current.games).toEqual([])
      expect(result.current.bestScores).toEqual([])
      expect(result.current.ranking).toEqual([])
      expect(result.current.stats).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('submitScore', () => {
    it('should add score to array on success', async () => {
      const mockScore = { id: '1', gameId: 'g1', score: 100, difficulty: 'easy' as const, duration: 60, userId: 'u1', createdAt: '2025-01-01' }
      vi.mocked(scoreApi.submitScore).mockResolvedValue(mockScore)

      const { result } = renderHook(() => useScoreStore())

      let returned: unknown
      await act(async () => {
        returned = await result.current.submitScore({ gameId: 'g1', score: 100, difficulty: 'easy', duration: 60 })
      })

      expect(returned).toEqual(mockScore)
      expect(result.current.scores).toEqual([mockScore])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should set error on failure', async () => {
      vi.mocked(scoreApi.submitScore).mockRejectedValue(new Error('投稿失敗'))

      const { result } = renderHook(() => useScoreStore())

      let returned: unknown
      await act(async () => {
        returned = await result.current.submitScore({ gameId: 'g1', score: 100, difficulty: 'easy', duration: 60 })
      })

      expect(returned).toBeNull()
      expect(result.current.error).toBe('投稿失敗')
      expect(result.current.isLoading).toBe(false)
    })

    it('should use default message on non-Error submit failure', async () => {
      vi.mocked(scoreApi.submitScore).mockRejectedValue('unknown')

      const { result } = renderHook(() => useScoreStore())

      await act(async () => {
        await result.current.submitScore({ gameId: 'g1', score: 100, difficulty: 'easy', duration: 60 })
      })

      expect(result.current.error).toBe('スコアの投稿に失敗しました')
    })
  })

  describe('fetchScores', () => {
    it('should populate scores array', async () => {
      const mockScores = [{ id: '1', gameId: 'g1', score: 100, difficulty: 'easy' as const, duration: 60, userId: 'u1', createdAt: '2025-01-01' }]
      vi.mocked(scoreApi.getUserScores).mockResolvedValue(mockScores)

      const { result } = renderHook(() => useScoreStore())

      await act(async () => {
        await result.current.fetchScores()
      })

      expect(result.current.scores).toEqual(mockScores)
      expect(result.current.isLoading).toBe(false)
    })

    it('should set error on failure', async () => {
      vi.mocked(scoreApi.getUserScores).mockRejectedValue(new Error('取得失敗'))

      const { result } = renderHook(() => useScoreStore())

      await act(async () => {
        await result.current.fetchScores()
      })

      expect(result.current.error).toBe('取得失敗')
      expect(result.current.isLoading).toBe(false)
    })

    it('should use default message on non-Error fetchScores failure', async () => {
      vi.mocked(scoreApi.getUserScores).mockRejectedValue('unknown')

      const { result } = renderHook(() => useScoreStore())

      await act(async () => {
        await result.current.fetchScores()
      })

      expect(result.current.error).toBe('スコアの取得に失敗しました')
    })
  })

  describe('fetchGames', () => {
    it('should populate games array', async () => {
      const mockGames = [{ id: 'g1', name: 'Test Game', category: 'logic', description: 'desc', config: {} }]
      vi.mocked(gameApi.getAllGames).mockResolvedValue(mockGames)

      const { result } = renderHook(() => useScoreStore())

      await act(async () => {
        await result.current.fetchGames()
      })

      expect(result.current.games).toEqual(mockGames)
      expect(result.current.isLoading).toBe(false)
    })

    it('should set error on failure', async () => {
      vi.mocked(gameApi.getAllGames).mockRejectedValue(new Error('ゲーム取得失敗'))

      const { result } = renderHook(() => useScoreStore())

      await act(async () => {
        await result.current.fetchGames()
      })

      expect(result.current.error).toBe('ゲーム取得失敗')
      expect(result.current.isLoading).toBe(false)
    })

    it('should use default message on non-Error fetchGames failure', async () => {
      vi.mocked(gameApi.getAllGames).mockRejectedValue('unknown')

      const { result } = renderHook(() => useScoreStore())

      await act(async () => {
        await result.current.fetchGames()
      })

      expect(result.current.error).toBe('ゲーム一覧の取得に失敗しました')
    })
  })

  describe('fetchBestScores', () => {
    it('should populate bestScores', async () => {
      const mockBest = [{ gameId: 'g1', difficulty: 'easy', bestScore: 200 }]
      vi.mocked(scoreApi.getBestScores).mockResolvedValue(mockBest)

      const { result } = renderHook(() => useScoreStore())

      await act(async () => {
        await result.current.fetchBestScores()
      })

      expect(result.current.bestScores).toEqual(mockBest)
    })

    it('should handle error silently', async () => {
      vi.mocked(scoreApi.getBestScores).mockRejectedValue(new Error('失敗'))

      const { result } = renderHook(() => useScoreStore())

      await act(async () => {
        await result.current.fetchBestScores()
      })

      expect(result.current.error).toBeNull()
      expect(result.current.bestScores).toEqual([])
    })
  })

  describe('fetchRanking', () => {
    it('should populate ranking', async () => {
      const mockRanking = [{ rank: 1, user: { id: 'u1', displayName: 'Test' }, bestScore: 100 }]
      vi.mocked(scoreApi.getRanking).mockResolvedValue(mockRanking)

      const { result } = renderHook(() => useScoreStore())

      await act(async () => {
        await result.current.fetchRanking('g1')
      })

      expect(result.current.ranking).toEqual(mockRanking)
      expect(result.current.isLoading).toBe(false)
    })

    it('should set error on failure', async () => {
      vi.mocked(scoreApi.getRanking).mockRejectedValue(new Error('ランキング失敗'))

      const { result } = renderHook(() => useScoreStore())

      await act(async () => {
        await result.current.fetchRanking('g1')
      })

      expect(result.current.error).toBe('ランキング失敗')
      expect(result.current.isLoading).toBe(false)
    })

    it('should use default message on non-Error fetchRanking failure', async () => {
      vi.mocked(scoreApi.getRanking).mockRejectedValue('unknown')

      const { result } = renderHook(() => useScoreStore())

      await act(async () => {
        await result.current.fetchRanking('g1')
      })

      expect(result.current.error).toBe('ランキングの取得に失敗しました')
    })
  })

  describe('fetchStats', () => {
    it('should populate stats', async () => {
      const mockStats = { totalGamesPlayed: 10, totalDuration: 300, averageScore: 50, categoryAverages: [], bestScores: [] }
      vi.mocked(scoreApi.getStats).mockResolvedValue(mockStats)

      const { result } = renderHook(() => useScoreStore())

      await act(async () => {
        await result.current.fetchStats()
      })

      expect(result.current.stats).toEqual(mockStats)
      expect(result.current.isLoading).toBe(false)
    })

    it('should set error on failure', async () => {
      vi.mocked(scoreApi.getStats).mockRejectedValue(new Error('統計失敗'))

      const { result } = renderHook(() => useScoreStore())

      await act(async () => {
        await result.current.fetchStats()
      })

      expect(result.current.error).toBe('統計失敗')
      expect(result.current.isLoading).toBe(false)
    })

    it('should use default message on non-Error fetchStats failure', async () => {
      vi.mocked(scoreApi.getStats).mockRejectedValue('unknown')

      const { result } = renderHook(() => useScoreStore())

      await act(async () => {
        await result.current.fetchStats()
      })

      expect(result.current.error).toBe('統計情報の取得に失敗しました')
    })
  })

  describe('clearError', () => {
    it('should clear error state', async () => {
      vi.mocked(scoreApi.getUserScores).mockRejectedValue(new Error('テストエラー'))

      const { result } = renderHook(() => useScoreStore())

      await act(async () => {
        await result.current.fetchScores()
      })

      expect(result.current.error).toBe('テストエラー')

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })
})
