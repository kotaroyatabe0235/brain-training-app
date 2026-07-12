import { describe, it, expect, vi, beforeEach } from 'vitest'
import { gameApi, scoreApi } from './scoreApi'

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

const { default: api } = await import('./api')

describe('gameApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllGames', () => {
    it('should call api.get with /games and return data', async () => {
      const mockGames = [{ id: '1', name: 'Test Game', category: 'logic', description: 'desc', config: {} }]
      vi.mocked(api.get).mockResolvedValue({ data: mockGames } as never)

      const result = await gameApi.getAllGames()

      expect(api.get).toHaveBeenCalledWith('/games')
      expect(result).toEqual(mockGames)
    })
  })

  describe('getGameById', () => {
    it('should call api.get with /games/:id and return data', async () => {
      const mockGame = { id: '1', name: 'Test Game', category: 'logic', description: 'desc', config: {} }
      vi.mocked(api.get).mockResolvedValue({ data: mockGame } as never)

      const result = await gameApi.getGameById('1')

      expect(api.get).toHaveBeenCalledWith('/games/1')
      expect(result).toEqual(mockGame)
    })
  })

  describe('getGamesByCategory', () => {
    it('should call api.get with /games/category/:category and return data', async () => {
      const mockGames = [{ id: '1', name: 'Test Game', category: 'logic', description: 'desc', config: {} }]
      vi.mocked(api.get).mockResolvedValue({ data: mockGames } as never)

      const result = await gameApi.getGamesByCategory('logic')

      expect(api.get).toHaveBeenCalledWith('/games/category/logic')
      expect(result).toEqual(mockGames)
    })
  })
})

describe('scoreApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('submitScore', () => {
    it('should call api.post with /scores and return data', async () => {
      const mockScore = { id: '1', userId: 'u1', gameId: 'g1', score: 100, difficulty: 'easy', duration: 60, createdAt: '2025-01-01' }
      vi.mocked(api.post).mockResolvedValue({ data: mockScore } as never)

      const result = await scoreApi.submitScore({ gameId: 'g1', score: 100, difficulty: 'easy', duration: 60 })

      expect(api.post).toHaveBeenCalledWith('/scores', { gameId: 'g1', score: 100, difficulty: 'easy', duration: 60 })
      expect(result).toEqual(mockScore)
    })
  })

  describe('getUserScores', () => {
    it('should call api.get with /scores/me and return data', async () => {
      const mockScores = [{ id: '1', userId: 'u1', gameId: 'g1', score: 100, difficulty: 'easy', duration: 60, createdAt: '2025-01-01' }]
      vi.mocked(api.get).mockResolvedValue({ data: mockScores } as never)

      const result = await scoreApi.getUserScores()

      expect(api.get).toHaveBeenCalledWith('/scores/me')
      expect(result).toEqual(mockScores)
    })
  })

  describe('getUserScoresByGame', () => {
    it('should call api.get with /scores/me/:gameId and return data', async () => {
      const mockScores = [{ id: '1', userId: 'u1', gameId: 'g1', score: 100, difficulty: 'easy', duration: 60, createdAt: '2025-01-01' }]
      vi.mocked(api.get).mockResolvedValue({ data: mockScores } as never)

      const result = await scoreApi.getUserScoresByGame('g1')

      expect(api.get).toHaveBeenCalledWith('/scores/me/g1')
      expect(result).toEqual(mockScores)
    })
  })

  describe('getBestScores', () => {
    it('should call api.get with /scores/best and return data', async () => {
      const mockBest = [{ gameId: 'g1', difficulty: 'easy', bestScore: 200 }]
      vi.mocked(api.get).mockResolvedValue({ data: mockBest } as never)

      const result = await scoreApi.getBestScores()

      expect(api.get).toHaveBeenCalledWith('/scores/best')
      expect(result).toEqual(mockBest)
    })
  })

  describe('getRanking', () => {
    it('should call api.get with /scores/ranking/:gameId and return data', async () => {
      const mockRanking = [{ rank: 1, user: { id: 'u1', displayName: 'Test' }, bestScore: 100 }]
      vi.mocked(api.get).mockResolvedValue({ data: mockRanking } as never)

      const result = await scoreApi.getRanking('g1')

      expect(api.get).toHaveBeenCalledWith('/scores/ranking/g1')
      expect(result).toEqual(mockRanking)
    })
  })

  describe('getStats', () => {
    it('should call api.get with /scores/stats and return data', async () => {
      const mockStats = { totalGamesPlayed: 10, totalDuration: 300, averageScore: 50, categoryAverages: [], bestScores: [] }
      vi.mocked(api.get).mockResolvedValue({ data: mockStats } as never)

      const result = await scoreApi.getStats()

      expect(api.get).toHaveBeenCalledWith('/scores/stats')
      expect(result).toEqual(mockStats)
    })
  })
})
