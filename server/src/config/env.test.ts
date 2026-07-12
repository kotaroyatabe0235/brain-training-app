import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'

const originalEnv = process.env

beforeAll(() => {
  process.env = {
    ...originalEnv,
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
    JWT_SECRET: 'test-secret-key',
  }
})

afterAll(() => {
  process.env = originalEnv
})

vi.mock('dotenv', () => ({
  default: { config: vi.fn() },
}))

describe('env schema validation', () => {
  it('should parse valid environment variables', async () => {
    const { envSchema } = await import('../config/env.js')

    const result = envSchema.parse({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      JWT_SECRET: 'test-secret-key',
      PORT: '3001',
      NODE_ENV: 'test',
    })

    expect(result.DATABASE_URL).toBe('postgresql://user:pass@localhost:5432/db')
    expect(result.JWT_SECRET).toBe('test-secret-key')
    expect(result.PORT).toBe(3001)
    expect(result.NODE_ENV).toBe('test')
  })

  it('should use default values for optional fields', async () => {
    const { envSchema } = await import('../config/env.js')

    const result = envSchema.parse({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      JWT_SECRET: 'test-secret-key',
    })

    expect(result.PORT).toBe(3001)
    expect(result.JWT_EXPIRES_IN).toBe('7d')
    expect(result.NODE_ENV).toBe('development')
  })

  it('should throw error when DATABASE_URL is missing', async () => {
    const { envSchema } = await import('../config/env.js')

    expect(() =>
      envSchema.parse({
        JWT_SECRET: 'test-secret-key',
      }),
    ).toThrow()
  })

  it('should throw error when JWT_SECRET is missing', async () => {
    const { envSchema } = await import('../config/env.js')

    expect(() =>
      envSchema.parse({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      }),
    ).toThrow()
  })

  it('should coerce PORT to number', async () => {
    const { envSchema } = await import('../config/env.js')

    const result = envSchema.parse({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      JWT_SECRET: 'test-secret-key',
      PORT: '8080',
    })

    expect(result.PORT).toBe(8080)
    expect(typeof result.PORT).toBe('number')
  })

  it('should accept valid NODE_ENV values', async () => {
    const { envSchema } = await import('../config/env.js')

    for (const envVal of ['development', 'production', 'test']) {
      const result = envSchema.parse({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        JWT_SECRET: 'test-secret-key',
        NODE_ENV: envVal,
      })
      expect(result.NODE_ENV).toBe(envVal)
    }
  })

  it('should reject invalid NODE_ENV values', async () => {
    const { envSchema } = await import('../config/env.js')

    expect(() =>
      envSchema.parse({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        JWT_SECRET: 'test-secret-key',
        NODE_ENV: 'invalid',
      }),
    ).toThrow()
  })

  it('should default JWT_EXPIRES_IN to 7d', async () => {
    const { envSchema } = await import('../config/env.js')

    const result = envSchema.parse({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      JWT_SECRET: 'test-secret-key',
    })

    expect(result.JWT_EXPIRES_IN).toBe('7d')
  })

  it('should default NODE_ENV to development', async () => {
    const { envSchema } = await import('../config/env.js')

    const result = envSchema.parse({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      JWT_SECRET: 'test-secret-key',
    })

    expect(result.NODE_ENV).toBe('development')
  })

  it('should default PORT to 3001', async () => {
    const { envSchema } = await import('../config/env.js')

    const result = envSchema.parse({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      JWT_SECRET: 'test-secret-key',
    })

    expect(result.PORT).toBe(3001)
  })
})
