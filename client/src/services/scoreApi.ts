import api from './api'

export interface Score {
  id: string
  userId: string
  gameId: string
  score: number
  difficulty: 'easy' | 'normal' | 'hard'
  duration: number
  createdAt: string
  game?: {
    id: string
    name: string
    category: string
  }
}

export interface Game {
  id: string
  name: string
  category: string
  description: string
  config: Record<string, unknown>
}

export interface RankingEntry {
  rank: number
  user: { id: string; displayName: string } | null
  bestScore: number | null
}

export interface Stats {
  totalGamesPlayed: number
  totalDuration: number
  averageScore: number
  categoryAverages: Array<{
    category: string
    averageScore: number
    gamesPlayed: number
  }>
  bestScores: Array<{
    gameId: string
    gameName: string
    category: string
    difficulty: string
    score: number
  }>
}

export interface BestScore {
  gameId: string
  difficulty: string
  bestScore: number | null
}

export const gameApi = {
  async getAllGames(): Promise<Game[]> {
    const { data } = await api.get('/games')
    return data
  },

  async getGameById(id: string): Promise<Game> {
    const { data } = await api.get(`/games/${id}`)
    return data
  },

  async getGamesByCategory(category: string): Promise<Game[]> {
    const { data } = await api.get(`/games/category/${category}`)
    return data
  },
}

export const scoreApi = {
  async submitScore(score: {
    gameId: string
    score: number
    difficulty: 'easy' | 'normal' | 'hard'
    duration: number
  }): Promise<Score> {
    const { data } = await api.post('/scores', score)
    return data
  },

  async getUserScores(): Promise<Score[]> {
    const { data } = await api.get('/scores/me')
    return data
  },

  async getUserScoresByGame(gameId: string): Promise<Score[]> {
    const { data } = await api.get(`/scores/me/${gameId}`)
    return data
  },

  async getBestScores(): Promise<BestScore[]> {
    const { data } = await api.get('/scores/best')
    return data
  },

  async getRanking(gameId: string): Promise<RankingEntry[]> {
    const { data } = await api.get(`/scores/ranking/${gameId}`)
    return data
  },

  async getStats(): Promise<Stats> {
    const { data } = await api.get('/scores/stats')
    return data
  },
}
