import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../services/score.service.js', () => ({
  scoreService: {
    submitScore: vi.fn(),
    getUserScores: vi.fn(),
    getUserScoresByGame: vi.fn(),
    getRanking: vi.fn(),
    getStats: vi.fn(),
    getBestScores: vi.fn(),
  },
  ScoreError: class ScoreError extends Error {
    constructor(
      message: string,
      public statusCode: number,
    ) {
      super(message)
      this.name = 'ScoreError'
    }
  },
}))

vi.mock('../types/score.js', () => ({
  submitScoreSchema: {
    parse: vi.fn((data) => data),
  },
}))

const { scoreService } = await import('../services/score.service.js')
const { scoreController } = await import('../controllers/score.controller.js')
const { ScoreError } = await import('../services/score.service.js')

describe('scoreController', () => {
  let mockReq: any
  let mockRes: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockReq = { params: {}, body: {}, userId: undefined }
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }
  })

  describe('submitScore', () => {
    it('should return 401 if no userId', async () => {
      await scoreController.submitScore(mockReq, mockRes)
      expect(mockRes.status).toHaveBeenCalledWith(401)
    })

    it('should create score and return 201', async () => {
      mockReq.userId = 'u1'
      mockReq.body = { gameId: 'g1', score: 100, difficulty: 'normal', duration: 30 }
      const mockScore = { id: 's1', ...mockReq.body }
      vi.mocked(scoreService.submitScore).mockResolvedValue(mockScore as any)

      await scoreController.submitScore(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(201)
      expect(mockRes.json).toHaveBeenCalledWith(mockScore)
    })

    it('should return 404 for ScoreError', async () => {
      mockReq.userId = 'u1'
      mockReq.body = { gameId: 'g1', score: 100, difficulty: 'normal', duration: 30 }
      vi.mocked(scoreService.submitScore).mockRejectedValue(new ScoreError('game not found', 404))

      await scoreController.submitScore(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(404)
    })

    it('should return 400 for validation errors', async () => {
      mockReq.userId = 'u1'
      mockReq.body = {}
      vi.mocked(scoreService.submitScore).mockRejectedValue(new Error('validation'))

      await scoreController.submitScore(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(400)
    })

    it('should return 500 on unexpected error', async () => {
      mockReq.userId = 'u1'
      mockReq.body = { gameId: 'g1', score: 100, difficulty: 'normal', duration: 30 }
      vi.mocked(scoreService.submitScore).mockRejectedValue('string error')

      await scoreController.submitScore(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
    })
  })

  describe('getUserScores', () => {
    it('should return 401 if no userId', async () => {
      await scoreController.getUserScores(mockReq, mockRes)
      expect(mockRes.status).toHaveBeenCalledWith(401)
    })

    it('should return scores', async () => {
      mockReq.userId = 'u1'
      vi.mocked(scoreService.getUserScores).mockResolvedValue([{ id: 's1' }] as any)

      await scoreController.getUserScores(mockReq, mockRes)

      expect(mockRes.json).toHaveBeenCalledWith([{ id: 's1' }])
    })

    it('should return 500 on unexpected error', async () => {
      mockReq.userId = 'u1'
      vi.mocked(scoreService.getUserScores).mockRejectedValue(new Error('fail'))

      await scoreController.getUserScores(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
    })
  })

  describe('getUserScoresByGame', () => {
    it('should return 401 if no userId', async () => {
      await scoreController.getUserScoresByGame(mockReq, mockRes)
      expect(mockRes.status).toHaveBeenCalledWith(401)
    })

    it('should return scores for game', async () => {
      mockReq.userId = 'u1'
      mockReq.params.gameId = 'g1'
      vi.mocked(scoreService.getUserScoresByGame).mockResolvedValue([] as any)

      await scoreController.getUserScoresByGame(mockReq, mockRes)

      expect(mockRes.json).toHaveBeenCalledWith([])
    })

    it('should return 500 on unexpected error', async () => {
      mockReq.userId = 'u1'
      mockReq.params.gameId = 'g1'
      vi.mocked(scoreService.getUserScoresByGame).mockRejectedValue(new Error('fail'))

      await scoreController.getUserScoresByGame(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
    })
  })

  describe('getRanking', () => {
    it('should return ranking', async () => {
      mockReq.params.gameId = 'g1'
      vi.mocked(scoreService.getRanking).mockResolvedValue([] as any)

      await scoreController.getRanking(mockReq, mockRes)

      expect(mockRes.json).toHaveBeenCalledWith([])
    })

    it('should return 500 on unexpected error', async () => {
      vi.mocked(scoreService.getRanking).mockRejectedValue(new Error('fail'))

      await scoreController.getRanking(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
    })
  })

  describe('getStats', () => {
    it('should return 401 if no userId', async () => {
      await scoreController.getStats(mockReq, mockRes)
      expect(mockRes.status).toHaveBeenCalledWith(401)
    })

    it('should return stats', async () => {
      mockReq.userId = 'u1'
      vi.mocked(scoreService.getStats).mockResolvedValue({ totalGamesPlayed: 0 } as any)

      await scoreController.getStats(mockReq, mockRes)

      expect(mockRes.json).toHaveBeenCalledWith({ totalGamesPlayed: 0 })
    })

    it('should return 500 on unexpected error', async () => {
      mockReq.userId = 'u1'
      vi.mocked(scoreService.getStats).mockRejectedValue(new Error('fail'))

      await scoreController.getStats(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
    })
  })

  describe('getBestScores', () => {
    it('should return 401 if no userId', async () => {
      await scoreController.getBestScores(mockReq, mockRes)
      expect(mockRes.status).toHaveBeenCalledWith(401)
    })

    it('should return best scores', async () => {
      mockReq.userId = 'u1'
      vi.mocked(scoreService.getBestScores).mockResolvedValue([] as any)

      await scoreController.getBestScores(mockReq, mockRes)

      expect(mockRes.json).toHaveBeenCalledWith([])
    })

    it('should return 500 on unexpected error', async () => {
      mockReq.userId = 'u1'
      vi.mocked(scoreService.getBestScores).mockRejectedValue(new Error('fail'))

      await scoreController.getBestScores(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
    })
  })
})
