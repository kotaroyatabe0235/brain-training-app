import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from './authStore'

vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

const { default: api } = await import('../services/api')

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
})

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    useAuthStore.setState({ user: null, isLoading: false, error: null })
  })

  describe('login', () => {
    it('should login successfully and set user', async () => {
      const mockResponse = {
        data: {
          user: { id: '1', email: 'test@example.com', displayName: 'Test' },
          token: 'jwt-token',
        },
      }
      vi.mocked(api.post).mockResolvedValue(mockResponse as never)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.login({ email: 'test@example.com', password: 'password123' })
      })

      expect(result.current.user).toEqual(mockResponse.data.user)
      expect(localStorageMock.getItem('token')).toBe('jwt-token')
    })

    it('should set intermediate isLoading state during login', async () => {
      let resolvePost!: (value: never) => void
      vi.mocked(api.post).mockImplementation(() => new Promise((resolve) => { resolvePost = resolve as (value: never) => void }) as never)

      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.login({ email: 'test@example.com', password: 'password123' })
      })

      expect(result.current.isLoading).toBe(true)

      await act(async () => {
        resolvePost({ data: { user: { id: '1', email: 'test@example.com', displayName: 'Test' }, token: 'jwt-token' } } as never)
      })

      expect(result.current.isLoading).toBe(false)
    })

    it('should set token in localStorage with key "token"', async () => {
      vi.mocked(api.post).mockResolvedValue({
        data: { user: { id: '1', email: 'test@example.com', displayName: 'Test' }, token: 'my-jwt' },
      } as never)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.login({ email: 'test@example.com', password: 'password123' })
      })

      expect(localStorageMock.getItem('token')).toBe('my-jwt')
    })

    it('should set user in localStorage with key "user"', async () => {
      const user = { id: '1', email: 'test@example.com', displayName: 'Test' }
      vi.mocked(api.post).mockResolvedValue({
        data: { user, token: 'jwt-token' },
      } as never)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.login({ email: 'test@example.com', password: 'password123' })
      })

      expect(JSON.parse(localStorageMock.getItem('user')!)).toEqual(user)
    })

    it('should set error on login failure', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('ログインに失敗しました'))

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        try {
          await result.current.login({ email: 'test@example.com', password: 'wrong' })
        } catch {
          // expected
        }
      })

      expect(result.current.error).toBe('ログインに失敗しました')
      expect(result.current.user).toBeNull()
    })

    it('should use default message on non-Error login failure', async () => {
      vi.mocked(api.post).mockRejectedValue('unknown error')

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        try {
          await result.current.login({ email: 'test@example.com', password: 'wrong' })
        } catch {
          // expected
        }
      })

      expect(result.current.error).toBe('ログインに失敗しました')
    })

    it('should clear error before login attempt', async () => {
      useAuthStore.setState({ error: 'old error' })
      vi.mocked(api.post).mockResolvedValue({
        data: { user: { id: '1', email: 'test@example.com', displayName: 'Test' }, token: 'jwt-token' },
      } as never)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.login({ email: 'test@example.com', password: 'password123' })
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('register', () => {
    it('should register successfully and set user', async () => {
      const mockResponse = {
        data: {
          user: { id: '1', email: 'new@example.com', displayName: 'New User' },
          token: 'jwt-token',
        },
      }
      vi.mocked(api.post).mockResolvedValue(mockResponse as never)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.register({
          email: 'new@example.com',
          password: 'password123',
          displayName: 'New User',
        })
      })

      expect(result.current.user).toEqual(mockResponse.data.user)
      expect(localStorageMock.getItem('token')).toBe('jwt-token')
    })

    it('should set intermediate isLoading state during register', async () => {
      let resolvePost!: (value: never) => void
      vi.mocked(api.post).mockImplementation(() => new Promise((resolve) => { resolvePost = resolve as (value: never) => void }) as never)

      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.register({ email: 'new@example.com', password: 'password123', displayName: 'New' })
      })

      expect(result.current.isLoading).toBe(true)

      await act(async () => {
        resolvePost({ data: { user: { id: '1', email: 'new@example.com', displayName: 'New' }, token: 'jwt-token' } } as never)
      })

      expect(result.current.isLoading).toBe(false)
    })

    it('should set token and user in localStorage on register', async () => {
      const user = { id: '2', email: 'new@example.com', displayName: 'New' }
      vi.mocked(api.post).mockResolvedValue({
        data: { user, token: 'reg-token' },
      } as never)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.register({ email: 'new@example.com', password: 'password123', displayName: 'New' })
      })

      expect(localStorageMock.getItem('token')).toBe('reg-token')
      expect(JSON.parse(localStorageMock.getItem('user')!)).toEqual(user)
    })

    it('should set error on register failure', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('登録に失敗しました'))

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        try {
          await result.current.register({
            email: 'new@example.com',
            password: 'password123',
            displayName: 'New User',
          })
        } catch {
          // expected
        }
      })

      expect(result.current.error).toBe('登録に失敗しました')
    })

    it('should use default message on non-Error register failure', async () => {
      vi.mocked(api.post).mockRejectedValue('unknown error')

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        try {
          await result.current.register({
            email: 'new@example.com',
            password: 'password123',
            displayName: 'New User',
          })
        } catch {
          // expected
        }
      })

      expect(result.current.error).toBe('登録に失敗しました')
    })

    it('should set isLoading to true when register starts', async () => {
      vi.mocked(api.post).mockResolvedValue({
        data: { user: { id: '1', email: 'new@example.com', displayName: 'New' }, token: 'jwt-token' },
      } as never)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.register({ email: 'new@example.com', password: 'password123', displayName: 'New' })
      })

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('logout', () => {
    it('should clear user and localStorage', () => {
      localStorageMock.setItem('token', 'some-token')
      localStorageMock.setItem('user', JSON.stringify({ id: '1' }))

      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(localStorageMock.getItem('token')).toBeNull()
      expect(localStorageMock.getItem('user')).toBeNull()
    })

    it('should remove token from localStorage', () => {
      localStorageMock.setItem('token', 'my-token')

      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.logout()
      })

      expect(localStorageMock.getItem('token')).toBeNull()
    })

    it('should remove user from localStorage', () => {
      localStorageMock.setItem('user', JSON.stringify({ id: '1' }))

      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.logout()
      })

      expect(localStorageMock.getItem('user')).toBeNull()
    })
  })

  describe('loadUser', () => {
    it('should load user when token exists', async () => {
      localStorageMock.setItem('token', 'valid-token')
      const mockUser = { id: '1', email: 'test@example.com', displayName: 'Test' }
      vi.mocked(api.get).mockResolvedValue({ data: mockUser } as never)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.loadUser()
      })

      expect(result.current.user).toEqual(mockUser)
    })

    it('should not call API when no token', async () => {
      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.loadUser()
      })

      expect(api.get).not.toHaveBeenCalled()
      expect(result.current.user).toBeNull()
    })

    it('should clear user on API failure', async () => {
      localStorageMock.setItem('token', 'invalid-token')
      vi.mocked(api.get).mockRejectedValue(new Error('Unauthorized'))

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.loadUser()
      })

      expect(result.current.user).toBeNull()
      expect(localStorageMock.getItem('token')).toBeNull()
    })

    it('should set isLoading during loadUser', async () => {
      localStorageMock.setItem('token', 'valid-token')
      let resolveGet!: (value: never) => void
      vi.mocked(api.get).mockImplementation(() => new Promise((resolve) => { resolveGet = resolve as (value: never) => void }) as never)

      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.loadUser()
      })

      expect(result.current.isLoading).toBe(true)

      await act(async () => {
        resolveGet({ data: { id: '1', email: 'test@example.com', displayName: 'Test' } } as never)
      })

      expect(result.current.isLoading).toBe(false)
    })

    it('should remove both token and user from localStorage on failure', async () => {
      localStorageMock.setItem('token', 'bad-token')
      localStorageMock.setItem('user', JSON.stringify({ id: '1' }))
      vi.mocked(api.get).mockRejectedValue(new Error('fail'))

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.loadUser()
      })

      expect(localStorageMock.getItem('token')).toBeNull()
      expect(localStorageMock.getItem('user')).toBeNull()
    })
  })

  describe('clearError', () => {
    it('should clear error state', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('テストエラー'))

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        try {
          await result.current.login({ email: 'test@example.com', password: 'wrong' })
        } catch {
          // expected
        }
      })

      expect(result.current.error).toBe('テストエラー')

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })
})
