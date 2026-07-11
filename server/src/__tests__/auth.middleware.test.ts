import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authenticate } from '../middleware/auth.js'
import { verifyToken, AuthError } from '../services/auth.service.js'

vi.mock('../services/auth.service.js', () => ({
  verifyToken: vi.fn(),
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

describe('authenticate middleware', () => {
  let mockReq: any
  let mockRes: any
  let mockNext: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockReq = { headers: {} }
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }
    mockNext = vi.fn()
  })

  it('should call next with userId for valid token', () => {
    mockReq.headers.authorization = 'Bearer valid-token'
    vi.mocked(verifyToken).mockReturnValue({ userId: '123' })

    authenticate(mockReq, mockRes, mockNext)

    expect(mockNext).toHaveBeenCalled()
    expect(mockReq.userId).toBe('123')
  })

  it('should return 401 for missing authorization header', () => {
    authenticate(mockReq, mockRes, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('should return 401 for invalid token format', () => {
    mockReq.headers.authorization = 'InvalidFormat'

    authenticate(mockReq, mockRes, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('should return 401 for expired/invalid token', () => {
    mockReq.headers.authorization = 'Bearer invalid-token'
    vi.mocked(verifyToken).mockImplementation(() => {
      throw new AuthError('認証に失敗しました', 401)
    })

    authenticate(mockReq, mockRes, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockNext).not.toHaveBeenCalled()
  })
})
