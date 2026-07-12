import { describe, it, expect } from 'vitest'
import { registerSchema, loginSchema } from '../types/auth.js'

describe('registerSchema', () => {
  const validInput = {
    email: 'test@example.com',
    password: 'password123',
    displayName: 'Test User',
  }

  describe('valid input', () => {
    it('should accept valid input', () => {
      const result = registerSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('should accept password with exactly 8 characters', () => {
      const result = registerSchema.safeParse({ ...validInput, password: '12345678' })
      expect(result.success).toBe(true)
    })

    it('should accept displayName with exactly 1 character', () => {
      const result = registerSchema.safeParse({ ...validInput, displayName: 'A' })
      expect(result.success).toBe(true)
    })

    it('should accept displayName with exactly 50 characters', () => {
      const result = registerSchema.safeParse({ ...validInput, displayName: 'A'.repeat(50) })
      expect(result.success).toBe(true)
    })
  })

  describe('invalid types', () => {
    it('should reject non-string email', () => {
      const result = registerSchema.safeParse({ ...validInput, email: 123 })
      expect(result.success).toBe(false)
    })

    it('should reject non-string password', () => {
      const result = registerSchema.safeParse({ ...validInput, password: 123 })
      expect(result.success).toBe(false)
    })

    it('should reject non-string displayName', () => {
      const result = registerSchema.safeParse({ ...validInput, displayName: 123 })
      expect(result.success).toBe(false)
    })
  })

  describe('email validation', () => {
    it('should reject invalid email format', () => {
      const result = registerSchema.safeParse({ ...validInput, email: 'not-an-email' })
      expect(result.success).toBe(false)
    })

    it('should reject email without @', () => {
      const result = registerSchema.safeParse({ ...validInput, email: 'testexample.com' })
      expect(result.success).toBe(false)
    })

    it('should reject email without domain', () => {
      const result = registerSchema.safeParse({ ...validInput, email: 'test@' })
      expect(result.success).toBe(false)
    })
  })

  describe('password validation', () => {
    it('should reject password shorter than 8 characters', () => {
      const result = registerSchema.safeParse({ ...validInput, password: '1234567' })
      expect(result.success).toBe(false)
    })

    it('should reject empty password', () => {
      const result = registerSchema.safeParse({ ...validInput, password: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('displayName validation', () => {
    it('should reject empty displayName', () => {
      const result = registerSchema.safeParse({ ...validInput, displayName: '' })
      expect(result.success).toBe(false)
    })

    it('should reject displayName longer than 50 characters', () => {
      const result = registerSchema.safeParse({ ...validInput, displayName: 'A'.repeat(51) })
      expect(result.success).toBe(false)
    })
  })

  describe('missing required fields', () => {
    it('should reject empty object', () => {
      const result = registerSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it('should reject missing email', () => {
      const { email, ...rest } = validInput
      const result = registerSchema.safeParse(rest)
      expect(result.success).toBe(false)
    })

    it('should reject missing password', () => {
      const { password, ...rest } = validInput
      const result = registerSchema.safeParse(rest)
      expect(result.success).toBe(false)
    })

    it('should reject missing displayName', () => {
      const { displayName, ...rest } = validInput
      const result = registerSchema.safeParse(rest)
      expect(result.success).toBe(false)
    })
  })

  describe('error messages', () => {
    it('should have correct email error message', () => {
      const result = registerSchema.safeParse({ ...validInput, email: 'invalid' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('有効なメールアドレスを入力してください')
      }
    })

    it('should have correct password error message', () => {
      const result = registerSchema.safeParse({ ...validInput, password: 'short' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('パスワードは8文字以上で入力してください')
      }
    })

    it('should have correct displayName error message for empty', () => {
      const result = registerSchema.safeParse({ ...validInput, displayName: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('表示名を入力してください')
      }
    })
  })
})

describe('loginSchema', () => {
  const validInput = {
    email: 'test@example.com',
    password: 'password123',
  }

  describe('valid input', () => {
    it('should accept valid input', () => {
      const result = loginSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('should accept password with exactly 1 character', () => {
      const result = loginSchema.safeParse({ ...validInput, password: 'a' })
      expect(result.success).toBe(true)
    })
  })

  describe('invalid types', () => {
    it('should reject non-string email', () => {
      const result = loginSchema.safeParse({ ...validInput, email: 123 })
      expect(result.success).toBe(false)
    })

    it('should reject non-string password', () => {
      const result = loginSchema.safeParse({ ...validInput, password: 123 })
      expect(result.success).toBe(false)
    })
  })

  describe('email validation', () => {
    it('should reject invalid email format', () => {
      const result = loginSchema.safeParse({ ...validInput, email: 'not-an-email' })
      expect(result.success).toBe(false)
    })
  })

  describe('password validation', () => {
    it('should reject empty password', () => {
      const result = loginSchema.safeParse({ ...validInput, password: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('missing required fields', () => {
    it('should reject empty object', () => {
      const result = loginSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it('should reject missing email', () => {
      const { email, ...rest } = validInput
      const result = loginSchema.safeParse(rest)
      expect(result.success).toBe(false)
    })

    it('should reject missing password', () => {
      const { password, ...rest } = validInput
      const result = loginSchema.safeParse(rest)
      expect(result.success).toBe(false)
    })
  })

  describe('error messages', () => {
    it('should have correct email error message', () => {
      const result = loginSchema.safeParse({ ...validInput, email: 'invalid' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('有効なメールアドレスを入力してください')
      }
    })

    it('should have correct password error message', () => {
      const result = loginSchema.safeParse({ ...validInput, password: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('パスワードを入力してください')
      }
    })
  })
})
