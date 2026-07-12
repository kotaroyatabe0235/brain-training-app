import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService, AuthError, verifyToken } from '../services/auth.service.js'

vi.mock('../config/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('../config/env.js', () => ({
  env: {
    JWT_SECRET: 'test-secret',
    JWT_EXPIRES_IN: '7d',
  },
}))

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('$2a$12$hashedpassword'),
    compare: vi.fn().mockResolvedValue(true),
  },
}))

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('mock-jwt-token'),
    verify: vi.fn(),
  },
}))

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const { prisma } = await import('../config/prisma.js')
      const bcrypt = (await import('bcryptjs')).default
      const jwt = (await import('jsonwebtoken')).default
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        createdAt: new Date(),
      }

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser as never)
      vi.mocked(jwt.sign).mockReturnValue('mock-jwt-token')

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
      })

      expect(result.user).toEqual(mockUser)
      expect(result.token).toBe('mock-jwt-token')
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12)
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: '123' },
        'test-secret',
        { expiresIn: '7d' },
      )
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          passwordHash: '$2a$12$hashedpassword',
          displayName: 'Test User',
        },
        select: {
          id: true,
          email: true,
          displayName: true,
          createdAt: true,
        },
      })
    })

    it('should throw AuthError for duplicate email', async () => {
      const { prisma } = await import('../config/prisma.js')
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: '123' } as never)

      try {
        await authService.register({
          email: 'existing@example.com',
          password: 'password123',
          displayName: 'Test User',
        })
        expect.fail('Should have thrown AuthError')
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError)
        expect((error as AuthError).message).toBe('このメールアドレスは既に使用されています')
        expect((error as AuthError).statusCode).toBe(409)
      }
    })

    it('should create user with correct prisma select fields', async () => {
      const { prisma } = await import('../config/prisma.js')
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: '456',
        email: 'new@example.com',
        displayName: 'New',
        createdAt: new Date(),
      } as never)

      await authService.register({
        email: 'new@example.com',
        password: 'password123',
        displayName: 'New',
      })

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          select: {
            id: true,
            email: true,
            displayName: true,
            createdAt: true,
          },
        }),
      )
    })
  })

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const { prisma } = await import('../config/prisma.js')
      const jwt = (await import('jsonwebtoken')).default
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        passwordHash: '$2a$12$hashedpassword',
        displayName: 'Test User',
        createdAt: new Date(),
      }

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(jwt.sign).mockReturnValue('mock-jwt-token')

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.user).toBeDefined()
      expect(result.user.id).toBe('123')
      expect(result.user.email).toBe('test@example.com')
      expect(result.user.displayName).toBe('Test User')
      expect(result.token).toBe('mock-jwt-token')
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: '123' },
        'test-secret',
        { expiresIn: '7d' },
      )
    })

    it('should throw AuthError for non-existent user', async () => {
      const { prisma } = await import('../config/prisma.js')
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      try {
        await authService.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        expect.fail('Should have thrown AuthError')
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError)
        expect((error as AuthError).message).toBe(
          'メールアドレスまたはパスワードが正しくありません',
        )
        expect((error as AuthError).statusCode).toBe(401)
      }
    })

    it('should throw AuthError for invalid password', async () => {
      const { prisma } = await import('../config/prisma.js')
      const bcrypt = await import('bcryptjs')
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        passwordHash: '$2a$12$wrongpassword',
        displayName: 'Test User',
        createdAt: new Date(),
      }

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(bcrypt.default.compare).mockResolvedValue(false as never)

      try {
        await authService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        expect.fail('Should have thrown AuthError')
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError)
        expect((error as AuthError).message).toBe(
          'メールアドレスまたはパスワードが正しくありません',
        )
        expect((error as AuthError).statusCode).toBe(401)
      }
    })

    it('should call bcrypt.compare with correct arguments', async () => {
      const { prisma } = await import('../config/prisma.js')
      const bcrypt = await import('bcryptjs')
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        passwordHash: '$2a$12$hashedpassword',
        displayName: 'Test User',
        createdAt: new Date(),
      }

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
      vi.mocked(bcrypt.default.compare).mockResolvedValue(true as never)

      await authService.login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(bcrypt.default.compare).toHaveBeenCalledWith(
        'password123',
        '$2a$12$hashedpassword',
      )
    })

    it('should find user by email', async () => {
      const { prisma } = await import('../config/prisma.js')
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        passwordHash: '$2a$12$hashedpassword',
        displayName: 'Test User',
        createdAt: new Date(),
      }

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

      await authService.login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      })
    })
  })

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const { prisma } = await import('../config/prisma.js')
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

      const result = await authService.getProfile('123')
      expect(result).toEqual(mockUser)
    })

    it('should throw AuthError for non-existent user', async () => {
      const { prisma } = await import('../config/prisma.js')
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      try {
        await authService.getProfile('nonexistent')
        expect.fail('Should have thrown AuthError')
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError)
        expect((error as AuthError).message).toBe('ユーザーが見つかりません')
        expect((error as AuthError).statusCode).toBe(404)
      }
    })

    it('should find user by id with correct select fields', async () => {
      const { prisma } = await import('../config/prisma.js')
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: '123',
        email: 'test@example.com',
        displayName: 'Test',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never)

      await authService.getProfile('123')

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
        select: {
          id: true,
          email: true,
          displayName: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    })
  })

  describe('verifyToken', () => {
    it('should return decoded userId for valid token', async () => {
      const jwt = await import('jsonwebtoken')
      vi.mocked(jwt.default.verify).mockReturnValue({ userId: '123' } as never)

      const result = verifyToken('valid-token')
      expect(result).toEqual({ userId: '123' })
      expect(jwt.default.verify).toHaveBeenCalledWith('valid-token', 'test-secret')
    })

    it('should throw AuthError for expired token', async () => {
      const jwt = await import('jsonwebtoken')
      vi.mocked(jwt.default.verify).mockImplementation(() => {
        throw new Error('jwt expired')
      })

      try {
        verifyToken('expired-token')
        expect.fail('Should have thrown AuthError')
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError)
        expect((error as AuthError).message).toBe('認証に失敗しました')
        expect((error as AuthError).statusCode).toBe(401)
      }
    })

    it('should throw AuthError for malformed token', async () => {
      const jwt = await import('jsonwebtoken')
      vi.mocked(jwt.default.verify).mockImplementation(() => {
        throw new Error('jwt malformed')
      })

      try {
        verifyToken('malformed-token')
        expect.fail('Should have thrown AuthError')
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError)
        expect((error as AuthError).message).toBe('認証に失敗しました')
        expect((error as AuthError).statusCode).toBe(401)
      }
    })

    it('should throw AuthError for invalid signature', async () => {
      const jwt = await import('jsonwebtoken')
      vi.mocked(jwt.default.verify).mockImplementation(() => {
        throw new Error('invalid signature')
      })

      try {
        verifyToken('bad-token')
        expect.fail('Should have thrown AuthError')
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError)
        expect((error as AuthError).message).toBe('認証に失敗しました')
        expect((error as AuthError).statusCode).toBe(401)
      }
    })
  })
})
