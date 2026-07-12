import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../services/auth.service.js', () => ({
  authService: {
    register: vi.fn(),
    login: vi.fn(),
    getProfile: vi.fn(),
  },
  AuthError: class AuthError extends Error {
    constructor(
      message: string,
      public statusCode: number,
    ) {
      super(message)
      this.name = 'AuthError'
    }
  },
}))

const { authService } = await import('../services/auth.service.js')
const { authController } = await import('../controllers/auth.controller.js')
const { AuthError } = await import('../services/auth.service.js')

describe('authController', () => {
  let mockReq: any
  let mockRes: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockReq = { body: {}, userId: undefined }
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }
  })

  describe('register', () => {
    it('should register user and return 201', async () => {
      const mockResult = {
        user: { id: '123', email: 'test@example.com', displayName: 'Test', createdAt: new Date() },
        token: 'jwt-token',
      }
      vi.mocked(authService.register).mockResolvedValue(mockResult as never)
      mockReq.body = { email: 'test@example.com', password: 'password123', displayName: 'Test' }

      await authController.register(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(201)
      expect(mockRes.json).toHaveBeenCalledWith(mockResult)
    })

    it('should return 400 for Zod validation error', async () => {
      mockReq.body = { email: 'invalid' }

      await authController.register(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(400)
    })

    it('should return 409 for duplicate email (AuthError)', async () => {
      vi.mocked(authService.register).mockRejectedValue(
        new AuthError('このメールアドレスは既に使用されています', 409),
      )
      mockReq.body = { email: 'existing@example.com', password: 'password123', displayName: 'Test' }

      await authController.register(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(409)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'このメールアドレスは既に使用されています',
      })
    })

    it('should return 400 for non-AuthError Error from service', async () => {
      vi.mocked(authService.register).mockRejectedValue(new Error('service error'))
      mockReq.body = { email: 'test@example.com', password: 'password123', displayName: 'Test' }

      await authController.register(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'service error' })
    })

    it('should return 500 for non-Error exception', async () => {
      vi.mocked(authService.register).mockRejectedValue('string error')
      mockReq.body = { email: 'test@example.com', password: 'password123', displayName: 'Test' }

      await authController.register(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'サーバーエラーが発生しました' })
    })
  })

  describe('login', () => {
    it('should login and return token', async () => {
      const mockResult = {
        user: { id: '123', email: 'test@example.com', displayName: 'Test' },
        token: 'jwt-token',
      }
      vi.mocked(authService.login).mockResolvedValue(mockResult as never)
      mockReq.body = { email: 'test@example.com', password: 'password123' }

      await authController.login(mockReq, mockRes)

      expect(mockRes.json).toHaveBeenCalledWith(mockResult)
    })

    it('should return 401 for invalid credentials (AuthError)', async () => {
      vi.mocked(authService.login).mockRejectedValue(
        new AuthError('メールアドレスまたはパスワードが正しくありません', 401),
      )
      mockReq.body = { email: 'test@example.com', password: 'password123' }

      await authController.login(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'メールアドレスまたはパスワードが正しくありません',
      })
    })

    it('should return 400 for Zod validation error', async () => {
      mockReq.body = { email: 'invalid-email' }

      await authController.login(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(400)
    })

    it('should return 400 for non-AuthError Error from service', async () => {
      vi.mocked(authService.login).mockRejectedValue(new Error('service error'))
      mockReq.body = { email: 'test@example.com', password: 'password123' }

      await authController.login(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'service error' })
    })

    it('should return 500 for non-Error exception', async () => {
      vi.mocked(authService.login).mockRejectedValue(42)
      mockReq.body = { email: 'test@example.com', password: 'password123' }

      await authController.login(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'サーバーエラーが発生しました' })
    })
  })

  describe('getProfile', () => {
    it('should return profile for authenticated user', async () => {
      const mockProfile = { id: '123', email: 'test@example.com', displayName: 'Test' }
      vi.mocked(authService.getProfile).mockResolvedValue(mockProfile as never)
      mockReq.userId = '123'

      await authController.getProfile(mockReq, mockRes)

      expect(mockRes.json).toHaveBeenCalledWith(mockProfile)
    })

    it('should return 401 for unauthenticated request', async () => {
      mockReq.userId = undefined

      await authController.getProfile(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith({ error: '認証が必要です' })
    })

    it('should return 404 for non-existent user (AuthError)', async () => {
      vi.mocked(authService.getProfile).mockRejectedValue(
        new AuthError('ユーザーが見つかりません', 404),
      )
      mockReq.userId = 'nonexistent'

      await authController.getProfile(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(404)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'ユーザーが見つかりません' })
    })

    it('should return 500 for non-Error exception', async () => {
      vi.mocked(authService.getProfile).mockRejectedValue('unexpected')
      mockReq.userId = '123'

      await authController.getProfile(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'サーバーエラーが発生しました' })
    })

    it('should return 400 for non-AuthError Error from service', async () => {
      vi.mocked(authService.getProfile).mockRejectedValue(new Error('something broke'))
      mockReq.userId = '123'

      await authController.getProfile(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'サーバーエラーが発生しました' })
    })
  })
})
