import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@prisma/client', () => ({
  PrismaClient: class MockPrismaClient {
    $connect = vi.fn()
  },
}))

describe('prisma config', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllGlobals()
  })

  it('should create a PrismaClient instance', async () => {
    const { prisma } = await import('../config/prisma.js')
    expect(prisma).toBeDefined()
  })

  it('should store instance in globalThis in non-production', async () => {
    const { prisma: prisma1 } = await import('../config/prisma.js')
    const { prisma: prisma2 } = await import('../config/prisma.js')
    expect(prisma1).toBe(prisma2)
  })
})
