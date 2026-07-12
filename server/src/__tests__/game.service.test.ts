import { describe, it, expect, vi, beforeEach } from 'vitest'
import { gameService, GameError } from '../services/game.service.js'

vi.mock('../config/prisma.js', () => ({
  prisma: {
    game: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

const { prisma } = await import('../config/prisma.js')

describe('gameService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllGames', () => {
    it('should return all games ordered by name', async () => {
      const mockGames = [
        { id: 'g1', name: 'Game A', category: 'memory', description: 'desc', config: {} },
        { id: 'g2', name: 'Game B', category: 'logic', description: 'desc', config: {} },
      ]
      vi.mocked(prisma.game.findMany).mockResolvedValue(mockGames as any)

      const result = await gameService.getAllGames()

      expect(result).toEqual(mockGames)
      expect(prisma.game.findMany).toHaveBeenCalledWith({
        select: { id: true, name: true, category: true, description: true, config: true },
        orderBy: { name: 'asc' },
      })
    })
  })

  describe('getGameById', () => {
    it('should return a game by id', async () => {
      const mockGame = { id: 'g1', name: 'Game A', category: 'memory', description: 'desc', config: {} }
      vi.mocked(prisma.game.findUnique).mockResolvedValue(mockGame as any)

      const result = await gameService.getGameById('g1')

      expect(result).toEqual(mockGame)
    })

    it('should throw GameError if game not found', async () => {
      vi.mocked(prisma.game.findUnique).mockResolvedValue(null)

      await expect(gameService.getGameById('nonexistent')).rejects.toThrow(GameError)
      await expect(gameService.getGameById('nonexistent')).rejects.toThrow('ゲームが見つかりません')
    })
  })

  describe('getGamesByCategory', () => {
    it('should return games filtered by category', async () => {
      const mockGames = [
        { id: 'g1', name: 'Card Match', category: 'memory', description: 'desc', config: {} },
      ]
      vi.mocked(prisma.game.findMany).mockResolvedValue(mockGames as any)

      const result = await gameService.getGamesByCategory('memory')

      expect(result).toEqual(mockGames)
      expect(prisma.game.findMany).toHaveBeenCalledWith({
        where: { category: 'memory' },
        select: { id: true, name: true, category: true, description: true, config: true },
        orderBy: { name: 'asc' },
      })
    })
  })

  describe('GameError', () => {
    it('should have correct properties', () => {
      const error = new GameError('test', 404)
      expect(error.message).toBe('test')
      expect(error.statusCode).toBe(404)
      expect(error.name).toBe('GameError')
    })
  })
})
