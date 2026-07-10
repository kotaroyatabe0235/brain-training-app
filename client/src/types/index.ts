export interface User {
  id: string
  email: string
  displayName: string
  avatarUrl?: string
  createdAt: Date
  updatedAt: Date
}

export type GameCategory = 'memory' | 'calculation' | 'vocabulary' | 'logic' | 'reaction'

export type Difficulty = 'easy' | 'normal' | 'hard'

export interface Game {
  id: string
  name: string
  category: GameCategory
  description: string
  config: Record<string, unknown>
}

export interface Score {
  id: string
  userId: string
  gameId: string
  score: number
  difficulty: Difficulty
  duration: number
  createdAt: Date
}

export interface Badge {
  id: string
  name: string
  description: string
  criteria: Record<string, unknown>
}

export interface UserBadge {
  userId: string
  badgeId: string
  earnedAt: Date
}

export interface GameStats {
  totalGamesPlayed: number
  averageScore: number
  bestScore: number
  streak: number
}
