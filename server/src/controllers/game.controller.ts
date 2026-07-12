import type { Request, Response } from 'express'
import { gameService, GameError } from '../services/game.service.js'

export const gameController = {
  async getAllGames(_req: Request, res: Response) {
    try {
      const games = await gameService.getAllGames()
      res.json(games)
    } catch (error) {
      if (error instanceof GameError) {
        res.status(error.statusCode).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'サーバーエラーが発生しました' })
      }
    }
  },

  async getGameById(req: Request, res: Response) {
    try {
      const game = await gameService.getGameById(req.params.id)
      res.json(game)
    } catch (error) {
      if (error instanceof GameError) {
        res.status(error.statusCode).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'サーバーエラーが発生しました' })
      }
    }
  },

  async getGamesByCategory(req: Request, res: Response) {
    try {
      const games = await gameService.getGamesByCategory(req.params.category)
      res.json(games)
    } catch (error) {
      if (error instanceof GameError) {
        res.status(error.statusCode).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'サーバーエラーが発生しました' })
      }
    }
  },
}
