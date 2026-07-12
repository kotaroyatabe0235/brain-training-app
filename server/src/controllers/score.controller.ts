import type { Response } from 'express'
import { scoreService, ScoreError } from '../services/score.service.js'
import { submitScoreSchema } from '../types/score.js'
import type { AuthRequest } from '../middleware/auth.js'

export const scoreController = {
  async submitScore(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        res.status(401).json({ error: '認証が必要です' })
        return
      }

      const data = submitScoreSchema.parse(req.body)
      const score = await scoreService.submitScore(req.userId, data)
      res.status(201).json(score)
    } catch (error) {
      if (error instanceof ScoreError) {
        res.status(error.statusCode).json({ error: error.message })
      } else if (error instanceof Error) {
        res.status(400).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'サーバーエラーが発生しました' })
      }
    }
  },

  async getUserScores(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        res.status(401).json({ error: '認証が必要です' })
        return
      }

      const scores = await scoreService.getUserScores(req.userId)
      res.json(scores)
    } catch (error) {
      if (error instanceof ScoreError) {
        res.status(error.statusCode).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'サーバーエラーが発生しました' })
      }
    }
  },

  async getUserScoresByGame(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        res.status(401).json({ error: '認証が必要です' })
        return
      }

      const scores = await scoreService.getUserScoresByGame(req.userId, req.params.gameId)
      res.json(scores)
    } catch (error) {
      if (error instanceof ScoreError) {
        res.status(error.statusCode).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'サーバーエラーが発生しました' })
      }
    }
  },

  async getRanking(req: AuthRequest, res: Response) {
    try {
      const ranking = await scoreService.getRanking(req.params.gameId)
      res.json(ranking)
    } catch (error) {
      if (error instanceof ScoreError) {
        res.status(error.statusCode).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'サーバーエラーが発生しました' })
      }
    }
  },

  async getStats(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        res.status(401).json({ error: '認証が必要です' })
        return
      }

      const stats = await scoreService.getStats(req.userId)
      res.json(stats)
    } catch (error) {
      if (error instanceof ScoreError) {
        res.status(error.statusCode).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'サーバーエラーが発生しました' })
      }
    }
  },

  async getBestScores(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        res.status(401).json({ error: '認証が必要です' })
        return
      }

      const bestScores = await scoreService.getBestScores(req.userId)
      res.json(bestScores)
    } catch (error) {
      if (error instanceof ScoreError) {
        res.status(error.statusCode).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'サーバーエラーが発生しました' })
      }
    }
  },
}
