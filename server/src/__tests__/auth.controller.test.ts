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

    it('should return 400 for invalid data', async () => {
      vi.mocked(authService.register).mockRejectedValue(new Error('Invalid data'))
      mockReq.body = { email: 'invalid' }

      await authController.register(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(400)
    })

    it('should return 409 for duplicate email', async () => {
      vi.mocked(authService.register).mockRejectedValue(new AuthError('Email exists', 409))
      mockReq.body = { email: 'existing@example.com', password: 'password123', displayName: 'Test' }

      await authController.register(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(409)
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

    it('should return 401 for invalid credentials', async () => {
      vi.mocked(authService.login).mockRejectedValue(new AuthError('Invalid credentials', 401))
      mockReq.body = { email: 'test@example.com', password: 'password123' }

      await authController.login(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(401)
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
    })
  })
})
