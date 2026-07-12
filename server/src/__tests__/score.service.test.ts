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

    it('should return existing score if scores are equal', async () => {
      vi.mocked(prisma.game.findUnique).mockResolvedValue({ id: 'g1' } as any)
      const existing = { id: 's1', score: 100 }
      vi.mocked(prisma.score.findUnique).mockResolvedValue(existing as any)

      const result = await scoreService.submitScore('u1', { ...validInput, score: 100 })

      expect(result).toEqual(existing)
      expect(prisma.score.update).not.toHaveBeenCalled()
      expect(prisma.score.create).not.toHaveBeenCalled()
    })

    it('should verify prisma.game.findUnique is called with correct gameId', async () => {
      vi.mocked(prisma.game.findUnique).mockResolvedValue({ id: 'g1' } as any)
      vi.mocked(prisma.score.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.score.create).mockResolvedValue({ id: 's1' } as any)

      await scoreService.submitScore('u1', validInput)

      expect(prisma.game.findUnique).toHaveBeenCalledWith({ where: { id: 'g1' } })
    })

    it('should verify prisma.score.findUnique is called with correct composite key', async () => {
      vi.mocked(prisma.game.findUnique).mockResolvedValue({ id: 'g1' } as any)
      vi.mocked(prisma.score.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.score.create).mockResolvedValue({ id: 's1' } as any)

      await scoreService.submitScore('u1', validInput)

      expect(prisma.score.findUnique).toHaveBeenCalledWith({
        where: {
          userId_gameId_difficulty: {
            userId: 'u1',
            gameId: 'g1',
            difficulty: 'normal',
          },
        },
      })
    })

    it('should verify prisma.score.create data includes all fields', async () => {
      vi.mocked(prisma.game.findUnique).mockResolvedValue({ id: 'g1' } as any)
      vi.mocked(prisma.score.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.score.create).mockResolvedValue({ id: 's1' } as any)

      await scoreService.submitScore('u1', validInput)

      expect(prisma.score.create).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          gameId: 'g1',
          score: 100,
          difficulty: 'normal',
          duration: 30,
        },
      })
    })
  })

  describe('getUserScores', () => {
    it('should return user scores with game info', async () => {
      const mockScores = [{ id: 's1', score: 100, game: { id: 'g1', name: 'Game', category: 'memory' } }]
      vi.mocked(prisma.score.findMany).mockResolvedValue(mockScores as any)

      const result = await scoreService.getUserScores('u1')

      expect(result).toEqual(mockScores)
    })

    it('should call findMany with correct where, include, orderBy', async () => {
      vi.mocked(prisma.score.findMany).mockResolvedValue([])

      await scoreService.getUserScores('u1')

      expect(prisma.score.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        include: { game: { select: { id: true, name: true, category: true } } },
        orderBy: { createdAt: 'desc' },
      })
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

    it('should call findMany with userId and gameId in where', async () => {
      vi.mocked(prisma.score.findMany).mockResolvedValue([])

      await scoreService.getUserScoresByGame('u1', 'g1')

      expect(prisma.score.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1', gameId: 'g1' },
        include: { game: { select: { id: true, name: true, category: true } } },
        orderBy: { createdAt: 'desc' },
      })
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

    it('should call groupBy with correct args', async () => {
      vi.mocked(prisma.score.groupBy).mockResolvedValue([])
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      await scoreService.getRanking('g1', 5)

      expect(prisma.score.groupBy).toHaveBeenCalledWith({
        by: ['userId'],
        where: { gameId: 'g1' },
        _max: { score: true },
        orderBy: { _max: { score: 'desc' } },
        take: 5,
      })
    })

    it('should return multiple ranked users', async () => {
      const mockGroupBy = [
        { userId: 'u1', _max: { score: 300 } },
        { userId: 'u2', _max: { score: 200 } },
        { userId: 'u3', _max: { score: 100 } },
      ]
      vi.mocked(prisma.score.groupBy).mockResolvedValue(mockGroupBy as any)
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({ id: 'u1', displayName: 'First' } as any)
        .mockResolvedValueOnce({ id: 'u2', displayName: 'Second' } as any)
        .mockResolvedValueOnce({ id: 'u3', displayName: 'Third' } as any)

      const result = await scoreService.getRanking('g1')

      expect(result).toEqual([
        { rank: 1, user: { id: 'u1', displayName: 'First' }, bestScore: 300 },
        { rank: 2, user: { id: 'u2', displayName: 'Second' }, bestScore: 200 },
        { rank: 3, user: { id: 'u3', displayName: 'Third' }, bestScore: 100 },
      ])
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

    it('should compute stats with multiple categories', async () => {
      const mockScores = [
        { score: 100, duration: 30, gameId: 'g1', difficulty: 'normal', game: { id: 'g1', name: 'Game1', category: 'memory' } },
        { score: 200, duration: 60, gameId: 'g2', difficulty: 'normal', game: { id: 'g2', name: 'Game2', category: 'logic' } },
      ]
      vi.mocked(prisma.score.findMany).mockResolvedValue(mockScores as any)

      const result = await scoreService.getStats('u1')

      expect(result.categoryAverages).toHaveLength(2)
      expect(result.categoryAverages.map((c) => c.category).sort()).toEqual(['logic', 'memory'])
      expect(result.categoryAverages.find((c) => c.category === 'memory').averageScore).toBe(100)
      expect(result.categoryAverages.find((c) => c.category === 'logic').averageScore).toBe(200)
    })

    it('should pick the best score for same game+difficulty', async () => {
      const mockScores = [
        { score: 100, duration: 30, gameId: 'g1', difficulty: 'normal', game: { id: 'g1', name: 'Game1', category: 'memory' } },
        { score: 250, duration: 45, gameId: 'g1', difficulty: 'normal', game: { id: 'g1', name: 'Game1', category: 'memory' } },
      ]
      vi.mocked(prisma.score.findMany).mockResolvedValue(mockScores as any)

      const result = await scoreService.getStats('u1')

      expect(result.bestScores).toHaveLength(1)
      expect(result.bestScores[0].score).toBe(250)
      expect(result.bestScores[0].gameId).toBe('g1')
      expect(result.bestScores[0].difficulty).toBe('normal')
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

    it('should verify groupBy is called with correct args', async () => {
      vi.mocked(prisma.score.groupBy).mockResolvedValue([])

      await scoreService.getBestScores('u1')

      expect(prisma.score.groupBy).toHaveBeenCalledWith({
        by: ['gameId', 'difficulty'],
        where: { userId: 'u1' },
        _max: { score: true },
      })
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
