import { describe, it, expect } from 'vitest'
import { submitScoreSchema } from '../types/score.js'

describe('submitScoreSchema', () => {
  const validInput = {
    gameId: 'game-123',
    score: 100,
    difficulty: 'normal' as const,
    duration: 60,
  }

  describe('valid input', () => {
    it('should accept valid input', () => {
      const result = submitScoreSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('should accept difficulty "easy"', () => {
      const result = submitScoreSchema.safeParse({ ...validInput, difficulty: 'easy' })
      expect(result.success).toBe(true)
    })

    it('should accept difficulty "hard"', () => {
      const result = submitScoreSchema.safeParse({ ...validInput, difficulty: 'hard' })
      expect(result.success).toBe(true)
    })

    it('should accept score of 0', () => {
      const result = submitScoreSchema.safeParse({ ...validInput, score: 0 })
      expect(result.success).toBe(true)
    })

    it('should accept duration of 0', () => {
      const result = submitScoreSchema.safeParse({ ...validInput, duration: 0 })
      expect(result.success).toBe(true)
    })
  })

  describe('invalid types', () => {
    it('should reject non-string gameId', () => {
      const result = submitScoreSchema.safeParse({ ...validInput, gameId: 123 })
      expect(result.success).toBe(false)
    })

    it('should reject non-number score', () => {
      const result = submitScoreSchema.safeParse({ ...validInput, score: 'abc' })
      expect(result.success).toBe(false)
    })

    it('should reject non-integer score', () => {
      const result = submitScoreSchema.safeParse({ ...validInput, score: 1.5 })
      expect(result.success).toBe(false)
    })

    it('should reject negative score', () => {
      const result = submitScoreSchema.safeParse({ ...validInput, score: -1 })
      expect(result.success).toBe(false)
    })

    it('should reject invalid difficulty', () => {
      const result = submitScoreSchema.safeParse({ ...validInput, difficulty: 'impossible' })
      expect(result.success).toBe(false)
    })

    it('should reject non-number duration', () => {
      const result = submitScoreSchema.safeParse({ ...validInput, duration: 'abc' })
      expect(result.success).toBe(false)
    })

    it('should reject non-integer duration', () => {
      const result = submitScoreSchema.safeParse({ ...validInput, duration: 1.5 })
      expect(result.success).toBe(false)
    })

    it('should reject negative duration', () => {
      const result = submitScoreSchema.safeParse({ ...validInput, duration: -1 })
      expect(result.success).toBe(false)
    })
  })

  describe('missing required fields', () => {
    it('should reject empty object', () => {
      const result = submitScoreSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it('should reject missing gameId', () => {
      const { gameId, ...rest } = validInput
      const result = submitScoreSchema.safeParse(rest)
      expect(result.success).toBe(false)
    })

    it('should reject missing score', () => {
      const { score, ...rest } = validInput
      const result = submitScoreSchema.safeParse(rest)
      expect(result.success).toBe(false)
    })

    it('should reject missing difficulty', () => {
      const { difficulty, ...rest } = validInput
      const result = submitScoreSchema.safeParse(rest)
      expect(result.success).toBe(false)
    })

    it('should reject missing duration', () => {
      const { duration, ...rest } = validInput
      const result = submitScoreSchema.safeParse(rest)
      expect(result.success).toBe(false)
    })
  })

  describe('boundary values', () => {
    it('should reject empty string gameId', () => {
      const result = submitScoreSchema.safeParse({ ...validInput, gameId: '' })
      expect(result.success).toBe(false)
    })

    it('should accept large score', () => {
      const result = submitScoreSchema.safeParse({ ...validInput, score: 999999 })
      expect(result.success).toBe(true)
    })

    it('should accept large duration', () => {
      const result = submitScoreSchema.safeParse({ ...validInput, duration: 999999 })
      expect(result.success).toBe(true)
    })
  })

  describe('error messages', () => {
    it('should fail for empty gameId', () => {
      const result = submitScoreSchema.safeParse({ ...validInput, gameId: '' })
      expect(result.success).toBe(false)
    })

    it('should fail for negative score', () => {
      const result = submitScoreSchema.safeParse({ ...validInput, score: -1 })
      expect(result.success).toBe(false)
    })

    it('should fail for invalid difficulty', () => {
      const result = submitScoreSchema.safeParse({ ...validInput, difficulty: 'expert' })
      expect(result.success).toBe(false)
    })
  })
})
