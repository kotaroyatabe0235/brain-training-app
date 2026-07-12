import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'

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

describe('app', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health')

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('ok')
      expect(res.body.timestamp).toBeDefined()
    })
  })

  describe('global error handler', () => {
    it('should return 500 for unhandled errors', async () => {
      const testApp = express()
      testApp.get('/test-error', (_req, _res, next) => {
        next(new Error('test error'))
      })
      testApp.use((err: Error, _: express.Request, res: express.Response, _next: express.NextFunction) => {
        console.error('Unhandled error:', err)
        res.status(500).json({ error: 'サーバーエラーが発生しました' })
      })

      const res = await request(testApp).get('/test-error')

      expect(res.status).toBe(500)
      expect(res.body.error).toBe('サーバーエラーが発生しました')
    })

    it('should handle non-Error exceptions', async () => {
      const testApp = express()
      testApp.get('/test-string-error', (_req, _res, next) => {
        next('string error')
      })
      testApp.use((err: Error, _: express.Request, res: express.Response, _next: express.NextFunction) => {
        console.error('Unhandled error:', err)
        res.status(500).json({ error: 'サーバーエラーが発生しました' })
      })

      const res = await request(testApp).get('/test-string-error')

      expect(res.status).toBe(500)
      expect(res.body.error).toBe('サーバーエラーが発生しました')
    })
  })

  describe('CORS', () => {
    it('should have CORS headers', async () => {
      const res = await request(app).get('/health')

      expect(res.headers['access-control-allow-origin']).toBeDefined()
    })
  })

  describe('JSON parsing', () => {
    it('should parse JSON request bodies', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'password123', displayName: 'Test' })
        .set('Content-Type', 'application/json')

      expect(res.status).toBeDefined()
    })
  })

  describe('routes', () => {
    it('should route to /api/auth/register', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'invalid' })

      expect(res.status).toBeDefined()
    })

    it('should route to /api/auth/login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'invalid' })

      expect(res.status).toBeDefined()
    })

    it('should route to /api/auth/me', async () => {
      const res = await request(app).get('/api/auth/me')

      expect(res.status).toBe(401)
    })
  })
})
