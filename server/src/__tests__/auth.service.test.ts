import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService, AuthError } from '../services/auth.service.js'

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

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const { prisma } = await import('../config/prisma.js')
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        createdAt: new Date(),
      }

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser as never)

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
      })

      expect(result.user).toEqual(mockUser)
      expect(result.token).toBeDefined()
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          passwordHash: expect.any(String),
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

      await expect(
        authService.register({
          email: 'existing@example.com',
          password: 'password123',
          displayName: 'Test User',
        }),
      ).rejects.toThrow(AuthError)
    })
  })

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const { prisma } = await import('../config/prisma.js')
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        passwordHash: '$2a$12$hashedpassword',
        displayName: 'Test User',
        createdAt: new Date(),
      }

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.user).toBeDefined()
      expect(result.token).toBeDefined()
    })

    it('should throw AuthError for non-existent user', async () => {
      const { prisma } = await import('../config/prisma.js')
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(AuthError)
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

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(AuthError)
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

      await expect(authService.getProfile('nonexistent')).rejects.toThrow(AuthError)
    })
  })
})
