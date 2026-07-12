import { prisma } from '../config/prisma.js'
import type { SubmitScoreInput } from '../types/score.js'

export class ScoreError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message)
    this.name = 'ScoreError'
  }
}

export const scoreService = {
  async submitScore(userId: string, data: SubmitScoreInput) {
    const game = await prisma.game.findUnique({ where: { id: data.gameId } })
    if (!game) {
      throw new ScoreError('ゲームが見つかりません', 404)
    }

    const existing = await prisma.score.findUnique({
      where: {
        userId_gameId_difficulty: {
          userId,
          gameId: data.gameId,
          difficulty: data.difficulty,
        },
      },
    })

    if (existing) {
      if (data.score > existing.score) {
        const updated = await prisma.score.update({
          where: { id: existing.id },
          data: { score: data.score, duration: data.duration },
        })
        return updated
      }
      return existing
    }

    const score = await prisma.score.create({
      data: {
        userId,
        gameId: data.gameId,
        score: data.score,
        difficulty: data.difficulty,
        duration: data.duration,
      },
    })

    return score
  },

  async getUserScores(userId: string) {
    return prisma.score.findMany({
      where: { userId },
      include: { game: { select: { id: true, name: true, category: true } } },
      orderBy: { createdAt: 'desc' },
    })
  },

  async getUserScoresByGame(userId: string, gameId: string) {
    return prisma.score.findMany({
      where: { userId, gameId },
      include: { game: { select: { id: true, name: true, category: true } } },
      orderBy: { createdAt: 'desc' },
    })
  },

  async getRanking(gameId: string, limit = 10) {
    const scores = await prisma.score.groupBy({
      by: ['userId'],
      where: { gameId },
      _max: { score: true },
      orderBy: { _max: { score: 'desc' } },
      take: limit,
    })

    const rankings = await Promise.all(
      scores.map(async (entry, index) => {
        const user = await prisma.user.findUnique({
          where: { id: entry.userId },
          select: { id: true, displayName: true },
        })
        return {
          rank: index + 1,
          user,
          bestScore: entry._max.score,
        }
      })
    )

    return rankings
  },

  async getStats(userId: string) {
    const scores = await prisma.score.findMany({
      where: { userId },
      include: { game: { select: { id: true, name: true, category: true } } },
    })

    const totalGamesPlayed = scores.length
    const totalDuration = scores.reduce((sum, s) => sum + s.duration, 0)
    const averageScore = totalGamesPlayed > 0
      ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / totalGamesPlayed)
      : 0

    const categoryStats = scores.reduce((acc, s) => {
      const cat = s.game.category
      if (!acc[cat]) {
        acc[cat] = { totalScore: 0, count: 0 }
      }
      acc[cat].totalScore += s.score
      acc[cat].count += 1
      return acc
    }, {} as Record<string, { totalScore: number; count: number }>)

    const categoryAverages = Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      averageScore: Math.round(stats.totalScore / stats.count),
      gamesPlayed: stats.count,
    }))

    const bestScores = scores.reduce((acc, s) => {
      const key = `${s.gameId}-${s.difficulty}`
      if (!acc[key] || s.score > acc[key].score) {
        acc[key] = { gameId: s.gameId, gameName: s.game.name, category: s.game.category, difficulty: s.difficulty, score: s.score }
      }
      return acc
    }, {} as Record<string, { gameId: string; gameName: string; category: string; difficulty: string; score: number }>)

    return {
      totalGamesPlayed,
      totalDuration,
      averageScore,
      categoryAverages,
      bestScores: Object.values(bestScores),
    }
  },

  async getBestScores(userId: string) {
    const scores = await prisma.score.groupBy({
      by: ['gameId', 'difficulty'],
      where: { userId },
      _max: { score: true },
    })

    return scores.map((s) => ({
      gameId: s.gameId,
      difficulty: s.difficulty,
      bestScore: s._max.score,
    }))
  },
}
