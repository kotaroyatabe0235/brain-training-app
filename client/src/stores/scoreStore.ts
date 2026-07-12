import { create } from 'zustand'
import { scoreApi, gameApi } from '../services/scoreApi'
import type { Score, Game, RankingEntry, Stats, BestScore } from '../services/scoreApi'

interface ScoreState {
  scores: Score[]
  games: Game[]
  bestScores: BestScore[]
  ranking: RankingEntry[]
  stats: Stats | null
  isLoading: boolean
  error: string | null

  submitScore: (score: { gameId: string; score: number; difficulty: 'easy' | 'normal' | 'hard'; duration: number }) => Promise<Score | null>
  fetchScores: () => Promise<void>
  fetchGames: () => Promise<void>
  fetchBestScores: () => Promise<void>
  fetchRanking: (gameId: string) => Promise<void>
  fetchStats: () => Promise<void>
  clearError: () => void
}

export const useScoreStore = create<ScoreState>((set) => ({
  scores: [],
  games: [],
  bestScores: [],
  ranking: [],
  stats: null,
  isLoading: false,
  error: null,

  submitScore: async (score) => {
    set({ isLoading: true, error: null })
    try {
      const result = await scoreApi.submitScore(score)
      set((state) => ({
        scores: [result, ...state.scores],
        isLoading: false,
      }))
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : 'スコアの投稿に失敗しました'
      set({ error: message, isLoading: false })
      return null
    }
  },

  fetchScores: async () => {
    set({ isLoading: true, error: null })
    try {
      const scores = await scoreApi.getUserScores()
      set({ scores, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'スコアの取得に失敗しました'
      set({ error: message, isLoading: false })
    }
  },

  fetchGames: async () => {
    set({ isLoading: true, error: null })
    try {
      const games = await gameApi.getAllGames()
      set({ games, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ゲーム一覧の取得に失敗しました'
      set({ error: message, isLoading: false })
    }
  },

  fetchBestScores: async () => {
    try {
      const bestScores = await scoreApi.getBestScores()
      set({ bestScores })
    } catch {
      // ベストスコア取得失敗は無視
    }
  },

  fetchRanking: async (gameId: string) => {
    set({ isLoading: true, error: null })
    try {
      const ranking = await scoreApi.getRanking(gameId)
      set({ ranking, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ランキングの取得に失敗しました'
      set({ error: message, isLoading: false })
    }
  },

  fetchStats: async () => {
    set({ isLoading: true, error: null })
    try {
      const stats = await scoreApi.getStats()
      set({ stats, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : '統計情報の取得に失敗しました'
      set({ error: message, isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
