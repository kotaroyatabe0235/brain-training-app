import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'

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
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    JWT_SECRET: 'test-secret-for-integration',
    JWT_EXPIRES_IN: '7d',
    PORT: 3001,
    NODE_ENV: 'test',
  },
}))

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('$2a$12$hashedpassword'),
    compare: vi.fn(),
  },
}))

const { prisma } = await import('../config/prisma.js')
const bcrypt = (await import('bcryptjs')).default

let app: typeof import('../app.js').default

beforeEach(async () => {
  vi.clearAllMocks()
  vi.resetModules()

  vi.doMock('../config/prisma.js', () => ({
    prisma: {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    },
  }))

  vi.doMock('../config/env.js', () => ({
    env: {
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      JWT_SECRET: 'test-secret-for-integration',
      JWT_EXPIRES_IN: '7d',
      PORT: 3001,
      NODE_ENV: 'test',
    },
  }))

  vi.doMock('bcryptjs', () => ({
    default: {
      hash: vi.fn().mockResolvedValue('$2a$12$hashedpassword'),
      compare: vi.fn(),
    },
  }))

  const appModule = await import('../app.js')
  app = appModule.default
})

describe('POST /api/auth/register', () => {
  it('should register a new user and return 201', async () => {
    const { prisma: freshPrisma } = await import('../config/prisma.js')
    const mockUser = {
      id: 'user-1',
      email: 'newuser@example.com',
      displayName: 'New User',
      createdAt: new Date('2025-01-01'),
    }

    vi.mocked(freshPrisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(freshPrisma.user.create).mockResolvedValue(mockUser as never)

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'newuser@example.com',
        password: 'password123',
        displayName: 'New User',
      })

    expect(res.status).toBe(201)
    expect(res.body.user).toEqual({
      id: 'user-1',
      email: 'newuser@example.com',
      displayName: 'New User',
      createdAt: '2025-01-01T00:00:00.000Z',
    })
    expect(res.body.token).toBeDefined()
  })

  it('should return 409 for duplicate email', async () => {
    const { prisma: freshPrisma } = await import('../config/prisma.js')
    vi.mocked(freshPrisma.user.findUnique).mockResolvedValue({ id: 'existing' } as never)

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'existing@example.com',
        password: 'password123',
        displayName: 'Existing User',
      })

    expect(res.status).toBe(409)
    expect(res.body.error).toBe('このメールアドレスは既に使用されています')
  })

  it('should return 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'not-an-email',
        password: 'password123',
        displayName: 'Test User',
      })

    expect(res.status).toBe(400)
  })

  it('should return 400 for short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'short',
        displayName: 'Test User',
      })

    expect(res.status).toBe(400)
  })

  it('should return 400 for missing displayName', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        displayName: '',
      })

    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  it('should login successfully and return token', async () => {
    const { prisma: freshPrisma } = await import('../config/prisma.js')
    const bcryptModule = await import('bcryptjs')
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: '$2a$12$hashedpassword',
      displayName: 'Test User',
      createdAt: new Date('2025-01-01'),
    }

    vi.mocked(freshPrisma.user.findUnique).mockResolvedValue(mockUser as never)
    vi.mocked(bcryptModule.default.compare).mockResolvedValue(true as never)

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })

    expect(res.status).toBe(200)
    expect(res.body.user).toBeDefined()
    expect(res.body.token).toBeDefined()
  })

  it('should return 401 for non-existent user', async () => {
    const { prisma: freshPrisma } = await import('../config/prisma.js')
    vi.mocked(freshPrisma.user.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123',
      })

    expect(res.status).toBe(401)
  })

  it('should return 401 for wrong password', async () => {
    const { prisma: freshPrisma } = await import('../config/prisma.js')
    const bcryptModule = await import('bcryptjs')
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: '$2a$12$hashedpassword',
      displayName: 'Test User',
      createdAt: new Date('2025-01-01'),
    }

    vi.mocked(freshPrisma.user.findUnique).mockResolvedValue(mockUser as never)
    vi.mocked(bcryptModule.default.compare).mockResolvedValue(false as never)

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword',
      })

    expect(res.status).toBe(401)
  })

  it('should return 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalid-email',
        password: 'password123',
      })

    expect(res.status).toBe(400)
  })
})

describe('GET /api/auth/me', () => {
  it('should return user profile with valid token', async () => {
    const { prisma: freshPrisma } = await import('../config/prisma.js')
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      displayName: 'Test User',
      avatarUrl: null,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    }

    vi.mocked(freshPrisma.user.findUnique).mockResolvedValue(mockUser as never)

    const jwt = await import('jsonwebtoken')
    const token = jwt.default.sign({ userId: 'user-1' }, 'test-secret-for-integration', {
      expiresIn: '1h',
    })

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe('user-1')
  })

  it('should return 401 without authorization header', async () => {
    const res = await request(app).get('/api/auth/me')

    expect(res.status).toBe(401)
  })

  it('should return 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token')

    expect(res.status).toBe(401)
  })

  it('should return 401 with malformed authorization header', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'InvalidFormat')

    expect(res.status).toBe(401)
  })
})

describe('POST /api/auth/register - boundary values', () => {
  it('should return 400 for 7-char password (below min 8)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: '1234567',
        displayName: 'Test User',
      })

    expect(res.status).toBe(400)
  })

  it('should return 201 for 8-char password (at min 8)', async () => {
    const { prisma: freshPrisma } = await import('../config/prisma.js')
    vi.mocked(freshPrisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(freshPrisma.user.create).mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      displayName: 'Test User',
      createdAt: new Date('2025-01-01'),
    } as never)

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: '12345678',
        displayName: 'Test User',
      })

    expect(res.status).toBe(201)
  })

  it('should return 400 for 51-char displayName (above max 50)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        displayName: 'a'.repeat(51),
      })

    expect(res.status).toBe(400)
  })

  it('should return 201 for 50-char displayName (at max 50)', async () => {
    const { prisma: freshPrisma } = await import('../config/prisma.js')
    vi.mocked(freshPrisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(freshPrisma.user.create).mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      displayName: 'a'.repeat(50),
      createdAt: new Date('2025-01-01'),
    } as never)

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        displayName: 'a'.repeat(50),
      })

    expect(res.status).toBe(201)
  })

  it('should return 400 for empty password (below min 1)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: '',
        displayName: 'Test User',
      })

    expect(res.status).toBe(400)
  })

  it('should return 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'not-an-email',
        password: 'password123',
        displayName: 'Test User',
      })

    expect(res.status).toBe(400)
  })

  it('should return 400 for empty displayName (below min 1)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        displayName: '',
      })

    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login - boundary values', () => {
  it('should return 400 for empty login password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: '',
      })

    expect(res.status).toBe(400)
  })

  it('should return 400 for invalid login email format', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalid-email',
        password: 'password123',
      })

    expect(res.status).toBe(400)
  })
})

describe('GET /health', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/health')

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.timestamp).toBeDefined()
  })
})
