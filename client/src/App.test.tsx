import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'
import { useAuthStore } from './stores/authStore'

vi.mock('./stores/authStore', () => ({
  useAuthStore: vi.fn(),
}))

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true })
  localStorageMock.clear()
  window.history.pushState({}, '', '/login')
})

describe('App routing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  it('should render LoginPage on /login', () => {
    window.history.pushState({}, '', '/login')
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isLoading: false,
      login: vi.fn(),
      clearError: vi.fn(),
    } as any)

    render(<App />)

    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('メールアドレス')).toBeInTheDocument()
  })

  it('should render RegisterPage on /register', () => {
    window.history.pushState({}, '', '/register')
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isLoading: false,
      register: vi.fn(),
      clearError: vi.fn(),
    } as any)

    render(<App />)

    expect(screen.getByRole('button', { name: '登録' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('表示名')).toBeInTheDocument()
  })

  it('should redirect unauthenticated user from / to /login', () => {
    window.history.pushState({}, '', '/')
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isLoading: false,
      loadUser: vi.fn(),
    } as any)

    render(<App />)

    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument()
  })

  it('should render HomePage for authenticated user on /', () => {
    window.history.pushState({}, '', '/')
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: '1', email: 'test@example.com', displayName: 'テストユーザー' },
      isLoading: false,
      loadUser: vi.fn(),
    } as any)

    render(<App />)

    expect(screen.getByText('Brain Training App')).toBeInTheDocument()
  })

  it('should redirect unknown routes to /', () => {
    window.history.pushState({}, '', '/unknown')
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isLoading: false,
      loadUser: vi.fn(),
    } as any)

    render(<App />)

    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument()
  })
})
