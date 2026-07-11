import type { Request, Response, NextFunction } from 'express'
import { verifyToken, AuthError } from '../services/auth.service.js'

export interface AuthRequest extends Request {
  userId?: string
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthError('認証トークンがありません', 401)
    }

    const token = authHeader.split(' ')[1]
    const { userId } = verifyToken(token)

    req.userId = userId
    next()
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({ error: error.message })
    } else {
      res.status(401).json({ error: '認証に失敗しました' })
    }
  }
}
