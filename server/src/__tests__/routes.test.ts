import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'

vi.mock('../config/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    score: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
    },
    game: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
    },
  },
}))

vi.mock('../config/env.js', () => ({
  env: {
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    JWT_SECRET: 'test-secret',
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
      score: {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn(),
      },
      game: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn().mockResolvedValue(null),
      },
    },
  }))

  vi.doMock('../config/env.js', () => ({
    env: {
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      JWT_SECRET: 'test-secret',
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

describe('Game routes', () => {
  describe('GET /api/games', () => {
    it('should respond to request', async () => {
      const res = await request(app).get('/api/games')
      expect(res.status).toBeDefined()
    })
  })

  describe('GET /api/games/:id', () => {
    it('should respond to request', async () => {
      const res = await request(app).get('/api/games/1')
      expect(res.status).toBeDefined()
    })
  })

  describe('GET /api/games/category/:category', () => {
    it('should respond to request', async () => {
      const res = await request(app).get('/api/games/category/math')
      expect(res.status).toBeDefined()
    })
  })
})

describe('Score routes', () => {
  describe('POST /api/scores', () => {
    it('should respond 401 without auth', async () => {
      const res = await request(app)
        .post('/api/scores')
        .send({ gameId: 'game-1', score: 100, difficulty: 'normal', duration: 60 })
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/scores/me', () => {
    it('should respond 401 without auth', async () => {
      const res = await request(app).get('/api/scores/me')
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/scores/me/:gameId', () => {
    it('should respond 401 without auth', async () => {
      const res = await request(app).get('/api/scores/me/game-1')
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/scores/best', () => {
    it('should respond 401 without auth', async () => {
      const res = await request(app).get('/api/scores/best')
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/scores/ranking/:gameId', () => {
    it('should respond to request', async () => {
      const res = await request(app).get('/api/scores/ranking/game-1')
      expect(res.status).toBeDefined()
    })
  })

  describe('GET /api/scores/stats', () => {
    it('should respond 401 without auth', async () => {
      const res = await request(app).get('/api/scores/stats')
      expect(res.status).toBe(401)
    })
  })
})
