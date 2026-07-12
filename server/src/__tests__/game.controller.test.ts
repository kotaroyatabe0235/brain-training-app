import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../services/game.service.js', () => ({
  gameService: {
    getAllGames: vi.fn(),
    getGameById: vi.fn(),
    getGamesByCategory: vi.fn(),
  },
  GameError: class GameError extends Error {
    constructor(
      message: string,
      public statusCode: number,
    ) {
      super(message)
      this.name = 'GameError'
    }
  },
}))

const { gameService } = await import('../services/game.service.js')
const { gameController } = await import('../controllers/game.controller.js')

describe('gameController', () => {
  let mockReq: any
  let mockRes: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockReq = { params: {}, body: {} }
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }
  })

  describe('getAllGames', () => {
    it('should return games with 200', async () => {
      const mockGames = [{ id: 'g1', name: 'Game' }]
      vi.mocked(gameService.getAllGames).mockResolvedValue(mockGames as any)

      await gameController.getAllGames(mockReq, mockRes)

      expect(mockRes.json).toHaveBeenCalledWith(mockGames)
    })

    it('should return 500 on unexpected error', async () => {
      vi.mocked(gameService.getAllGames).mockRejectedValue(new Error('fail'))

      await gameController.getAllGames(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'サーバーエラーが発生しました' })
    })
  })

  describe('getGameById', () => {
    it('should return game with 200', async () => {
      mockReq.params.id = 'g1'
      vi.mocked(gameService.getGameById).mockResolvedValue({ id: 'g1' } as any)

      await gameController.getGameById(mockReq, mockRes)

      expect(mockRes.json).toHaveBeenCalledWith({ id: 'g1' })
    })

    it('should return 404 for GameError', async () => {
      mockReq.params.id = 'nonexistent'
      vi.mocked(gameService.getGameById).mockRejectedValue(new (await import('../services/game.service.js')).GameError('not found', 404))

      await gameController.getGameById(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(404)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'not found' })
    })

    it('should return 500 on unexpected error', async () => {
      vi.mocked(gameService.getGameById).mockRejectedValue(new Error('fail'))

      await gameController.getGameById(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'サーバーエラーが発生しました' })
    })
  })

  describe('getGamesByCategory', () => {
    it('should return games with 200', async () => {
      mockReq.params.category = 'memory'
      vi.mocked(gameService.getGamesByCategory).mockResolvedValue([] as any)

      await gameController.getGamesByCategory(mockReq, mockRes)

      expect(mockRes.json).toHaveBeenCalledWith([])
    })

    it('should return 500 on unexpected error', async () => {
      vi.mocked(gameService.getGamesByCategory).mockRejectedValue(new Error('fail'))

      await gameController.getGamesByCategory(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'サーバーエラーが発生しました' })
    })
  })
})
