import { create } from 'zustand'
import api from '../services/api'
import type { User, LoginCredentials, RegisterData } from '../types/auth'

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  loadUser: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.post('/auth/login', credentials)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      set({ user: data.user, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ログインに失敗しました'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.post('/auth/register', data)
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      set({ user: response.data.user, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : '登録に失敗しました'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null })
  },

  loadUser: async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    set({ isLoading: true })
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data, isLoading: false })
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      set({ user: null, isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
