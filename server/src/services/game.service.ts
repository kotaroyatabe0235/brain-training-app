import { prisma } from '../config/prisma.js'

export class GameError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message)
    this.name = 'GameError'
  }
}

export const gameService = {
  async getAllGames() {
    return prisma.game.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        config: true,
      },
      orderBy: { name: 'asc' },
    })
  },

  async getGameById(id: string) {
    const game = await prisma.game.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        config: true,
      },
    })

    if (!game) {
      throw new GameError('ゲームが見つかりません', 404)
    }

    return game
  },

  async getGamesByCategory(category: string) {
    return prisma.game.findMany({
      where: { category: category as never },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        config: true,
      },
      orderBy: { name: 'asc' },
    })
  },
}
