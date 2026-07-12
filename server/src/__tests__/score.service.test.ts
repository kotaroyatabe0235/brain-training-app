import { describe, it, expect, vi, beforeEach } from 'vitest'
import { scoreService, ScoreError } from '../services/score.service.js'

vi.mock('../config/prisma.js', () => ({
  prisma: {
    game: {
      findUnique: vi.fn(),
    },
    score: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}))

const { prisma } = await import('../config/prisma.js')

describe('scoreService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('submitScore', () => {
    const validInput = { gameId: 'g1', score: 100, difficulty: 'normal', duration: 30 }

    it('should create new score if none exists', async () => {
      vi.mocked(prisma.game.findUnique).mockResolvedValue({ id: 'g1' } as any)
      vi.mocked(prisma.score.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.score.create).mockResolvedValue({ id: 's1', userId: 'u1', ...validInput } as any)

      const result = await scoreService.submitScore('u1', validInput)

      expect(result).toEqual({ id: 's1', userId: 'u1', ...validInput })
      expect(prisma.score.create).toHaveBeenCalled()
    })

    it('should update score if new score is higher', async () => {
      vi.mocked(prisma.game.findUnique).mockResolvedValue({ id: 'g1' } as any)
      vi.mocked(prisma.score.findUnique).mockResolvedValue({ id: 's1', score: 50 } as any)
      vi.mocked(prisma.score.update).mockResolvedValue({ id: 's1', score: 100 } as any)

      const result = await scoreService.submitScore('u1', validInput)

      expect(result).toEqual({ id: 's1', score: 100 })
      expect(prisma.score.update).toHaveBeenCalled()
    })

    it('should return existing score if not higher', async () => {
      vi.mocked(prisma.game.findUnique).mockResolvedValue({ id: 'g1' } as any)
      const existing = { id: 's1', score: 200 }
      vi.mocked(prisma.score.findUnique).mockResolvedValue(existing as any)

      const result = await scoreService.submitScore('u1', validInput)

      expect(result).toEqual(existing)
      expect(prisma.score.update).not.toHaveBeenCalled()
    })

    it('should throw if game not found', async () => {
      vi.mocked(prisma.game.findUnique).mockResolvedValue(null)

      await expect(scoreService.submitScore('u1', validInput)).rejects.toThrow(ScoreError)
    })
  })

  describe('getUserScores', () => {
    it('should return user scores with game info', async () => {
      const mockScores = [{ id: 's1', score: 100, game: { id: 'g1', name: 'Game', category: 'memory' } }]
      vi.mocked(prisma.score.findMany).mockResolvedValue(mockScores as any)

      const result = await scoreService.getUserScores('u1')

      expect(result).toEqual(mockScores)
    })
  })

  describe('getUserScoresByGame', () => {
    it('should return scores for a specific game', async () => {
      const mockScores = [{ id: 's1', score: 100, game: { id: 'g1', name: 'Game', category: 'memory' } }]
      vi.mocked(prisma.score.findMany).mockResolvedValue(mockScores as any)

      const result = await scoreService.getUserScoresByGame('u1', 'g1')

      expect(result).toEqual(mockScores)
      expect(prisma.score.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'u1', gameId: 'g1' } })
      )
    })
  })

  describe('getRanking', () => {
    it('should return ranking with user info', async () => {
      const mockGroupBy = [{ userId: 'u1', _max: { score: 100 } }]
      vi.mocked(prisma.score.groupBy).mockResolvedValue(mockGroupBy as any)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'u1', displayName: 'Test' } as any)

      const result = await scoreService.getRanking('g1')

      expect(result).toEqual([{ rank: 1, user: { id: 'u1', displayName: 'Test' }, bestScore: 100 }])
    })

    it('should handle empty ranking', async () => {
      vi.mocked(prisma.score.groupBy).mockResolvedValue([])

      const result = await scoreService.getRanking('g1')

      expect(result).toEqual([])
    })
  })

  describe('getStats', () => {
    it('should compute stats correctly', async () => {
      const mockScores = [
        { score: 100, duration: 30, gameId: 'g1', difficulty: 'normal', game: { id: 'g1', name: 'Game1', category: 'memory' } },
        { score: 200, duration: 60, gameId: 'g1', difficulty: 'hard', game: { id: 'g1', name: 'Game1', category: 'memory' } },
      ]
      vi.mocked(prisma.score.findMany).mockResolvedValue(mockScores as any)

      const result = await scoreService.getStats('u1')

      expect(result.totalGamesPlayed).toBe(2)
      expect(result.totalDuration).toBe(90)
      expect(result.averageScore).toBe(150)
      expect(result.categoryAverages).toHaveLength(1)
      expect(result.categoryAverages[0].category).toBe('memory')
      expect(result.bestScores).toHaveLength(2)
    })

    it('should handle zero scores', async () => {
      vi.mocked(prisma.score.findMany).mockResolvedValue([])

      const result = await scoreService.getStats('u1')

      expect(result.totalGamesPlayed).toBe(0)
      expect(result.averageScore).toBe(0)
      expect(result.categoryAverages).toHaveLength(0)
      expect(result.bestScores).toHaveLength(0)
    })
  })

  describe('getBestScores', () => {
    it('should return best scores grouped by game and difficulty', async () => {
      const mockGroupBy = [
        { gameId: 'g1', difficulty: 'normal', _max: { score: 100 } },
        { gameId: 'g1', difficulty: 'hard', _max: { score: 200 } },
      ]
      vi.mocked(prisma.score.groupBy).mockResolvedValue(mockGroupBy as any)

      const result = await scoreService.getBestScores('u1')

      expect(result).toEqual([
        { gameId: 'g1', difficulty: 'normal', bestScore: 100 },
        { gameId: 'g1', difficulty: 'hard', bestScore: 200 },
      ])
    })
  })

  describe('ScoreError', () => {
    it('should have correct properties', () => {
      const error = new ScoreError('test', 400)
      expect(error.message).toBe('test')
      expect(error.statusCode).toBe(400)
      expect(error.name).toBe('ScoreError')
    })
  })
})
