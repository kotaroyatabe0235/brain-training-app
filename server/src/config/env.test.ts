import { describe, it, expect } from 'vitest'
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

describe('env schema validation', () => {
  it('should parse valid environment variables', () => {
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

  it('should use default values for optional fields', () => {
    const result = envSchema.parse({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      JWT_SECRET: 'test-secret-key',
    })

    expect(result.PORT).toBe(3001)
    expect(result.JWT_EXPIRES_IN).toBe('7d')
    expect(result.NODE_ENV).toBe('development')
  })

  it('should throw error when DATABASE_URL is missing', () => {
    expect(() =>
      envSchema.parse({
        JWT_SECRET: 'test-secret-key',
      }),
    ).toThrow()
  })

  it('should throw error when JWT_SECRET is missing', () => {
    expect(() =>
      envSchema.parse({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      }),
    ).toThrow()
  })

  it('should coerce PORT to number', () => {
    const result = envSchema.parse({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      JWT_SECRET: 'test-secret-key',
      PORT: '8080',
    })

    expect(result.PORT).toBe(8080)
    expect(typeof result.PORT).toBe('number')
  })

  it('should accept valid NODE_ENV values', () => {
    for (const env of ['development', 'production', 'test']) {
      const result = envSchema.parse({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        JWT_SECRET: 'test-secret-key',
        NODE_ENV: env,
      })
      expect(result.NODE_ENV).toBe(env)
    }
  })

  it('should reject invalid NODE_ENV values', () => {
    expect(() =>
      envSchema.parse({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        JWT_SECRET: 'test-secret-key',
        NODE_ENV: 'invalid',
      }),
    ).toThrow()
  })
})
