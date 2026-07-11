import type { Request, Response } from 'express'
import { authService, AuthError } from '../services/auth.service.js'
import { registerSchema, loginSchema } from '../types/auth.js'
import type { AuthRequest } from '../middleware/auth.js'

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const data = registerSchema.parse(req.body)
      const result = await authService.register(data)
      res.status(201).json(result)
    } catch (error) {
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({ error: error.message })
      } else if (error instanceof Error) {
        res.status(400).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'サーバーエラーが発生しました' })
      }
    }
  },

  async login(req: Request, res: Response) {
    try {
      const data = loginSchema.parse(req.body)
      const result = await authService.login(data)
      res.json(result)
    } catch (error) {
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({ error: error.message })
      } else if (error instanceof Error) {
        res.status(400).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'サーバーエラーが発生しました' })
      }
    }
  },

  async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        res.status(401).json({ error: '認証が必要です' })
        return
      }

      const profile = await authService.getProfile(req.userId)
      res.json(profile)
    } catch (error) {
      if (error instanceof AuthError) {
        res.status(error.statusCode).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'サーバーエラーが発生しました' })
      }
    }
  },
}
