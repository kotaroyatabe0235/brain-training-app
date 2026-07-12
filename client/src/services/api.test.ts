import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from './api'

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

describe('api interceptors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  describe('api defaults', () => {
    it('should have correct baseURL', () => {
      expect(api.defaults.baseURL).toBe('http://localhost:3001/api')
    })

    it('should have correct Content-Type header', () => {
      expect(api.defaults.headers['Content-Type']).toBe('application/json')
    })
  })

  describe('request interceptor', () => {
    it('should attach Authorization header when token exists', async () => {
      localStorageMock.setItem('token', 'test-token')

      const config = {
        headers: {} as Record<string, string>,
        url: '/test',
      }

      const interceptor = (api.interceptors.request as any).handlers[0]
      const result = interceptor.fulfilled(config)

      expect(result.headers.Authorization).toBe('Bearer test-token')
    })

    it('should not attach Authorization header when no token', async () => {
      const config = {
        headers: {} as Record<string, string>,
        url: '/test',
      }

      const interceptor = (api.interceptors.request as any).handlers[0]
      const result = interceptor.fulfilled(config)

      expect(result.headers.Authorization).toBeUndefined()
    })

    it('should use Bearer prefix in Authorization header', async () => {
      localStorageMock.setItem('token', 'my-token')

      const config = {
        headers: {} as Record<string, string>,
        url: '/test',
      }

      const interceptor = (api.interceptors.request as any).handlers[0]
      const result = interceptor.fulfilled(config)

      expect(result.headers.Authorization).toContain('Bearer ')
      expect(result.headers.Authorization).toBe('Bearer my-token')
    })
  })

  describe('response interceptor', () => {
    it('should pass through successful responses', async () => {
      const response = { data: 'success', status: 200 }
      const interceptor = (api.interceptors.response as any).handlers[0]
      const result = interceptor.fulfilled(response)

      expect(result).toBe(response)
    })

    it('should clear localStorage and redirect on 401', async () => {
      localStorageMock.setItem('token', 'expired-token')
      localStorageMock.setItem('user', '{"id":"1"}')

      const originalHref = window.location.href
      Object.defineProperty(window, 'location', {
        value: { ...window.location, href: originalHref },
        writable: true,
      })

      const error = {
        response: { status: 401 },
      }

      const interceptor = (api.interceptors.response as any).handlers[0]

      try {
        await interceptor.rejected(error)
      } catch {
        // expected to throw
      }

      expect(localStorageMock.getItem('token')).toBeNull()
      expect(localStorageMock.getItem('user')).toBeNull()
    })

    it('should redirect to /login on 401', async () => {
      const mockHref = vi.fn()
      Object.defineProperty(window, 'location', {
        value: { href: '', set href(v: string) { mockHref(v) } },
        writable: true,
      })

      const error = {
        response: { status: 401 },
      }

      const interceptor = (api.interceptors.response as any).handlers[0]

      try {
        await interceptor.rejected(error)
      } catch {
        // expected
      }

      expect(mockHref).toHaveBeenCalledWith('/login')
    })

    it('should not redirect on non-401 errors', async () => {
      localStorageMock.setItem('token', 'some-token')

      const error = {
        response: { status: 500 },
      }

      const interceptor = (api.interceptors.response as any).handlers[0]

      try {
        await interceptor.rejected(error)
      } catch {
        // expected to throw
      }

      expect(localStorageMock.getItem('token')).toBe('some-token')
    })

    it('should remove token from localStorage on 401', async () => {
      localStorageMock.setItem('token', 'expired')

      const error = { response: { status: 401 } }
      const interceptor = (api.interceptors.response as any).handlers[0]

      try {
        await interceptor.rejected(error)
      } catch {}

      expect(localStorageMock.getItem('token')).toBeNull()
    })

    it('should remove user from localStorage on 401', async () => {
      localStorageMock.setItem('user', JSON.stringify({ id: '1' }))

      const error = { response: { status: 401 } }
      const interceptor = (api.interceptors.response as any).handlers[0]

      try {
        await interceptor.rejected(error)
      } catch {}

      expect(localStorageMock.getItem('user')).toBeNull()
    })

    it('should reject the promise on error', async () => {
      const error = { response: { status: 500 } }
      const interceptor = (api.interceptors.response as any).handlers[0]

      await expect(interceptor.rejected(error)).rejects.toBe(error)
    })

    it('should handle error without response', async () => {
      const error = { message: 'Network Error' }

      const interceptor = (api.interceptors.response as any).handlers[0]

      await expect(interceptor.rejected(error)).rejects.toBe(error)
    })
  })
})
