import { describe, it, expect } from 'vitest'
import { validateRegisterInput, validateLoginInput } from './auth.validation.js'

describe('validateRegisterInput', () => {
  it('accepts a valid payload', () => {
    const result = validateRegisterInput({
      firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123',
    })
    expect(result.valid).toBe(true)
  })

  it('rejects a missing firstName', () => {
    const result = validateRegisterInput({
      firstName: '', lastName: 'Smith', email: 'casey@example.com', password: 'password123',
    })
    expect(result.valid).toBe(false)
  })

  it('rejects a missing lastName', () => {
    const result = validateRegisterInput({
      firstName: 'Casey', lastName: '', email: 'casey@example.com', password: 'password123',
    })
    expect(result.valid).toBe(false)
  })

  it('rejects an invalid email', () => {
    const result = validateRegisterInput({
      firstName: 'Casey', lastName: 'Smith', email: 'not-an-email', password: 'password123',
    })
    expect(result.valid).toBe(false)
  })

  it('rejects a password shorter than 8 characters', () => {
    const result = validateRegisterInput({
      firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'short',
    })
    expect(result.valid).toBe(false)
  })
})

describe('validateLoginInput', () => {
  it('accepts a valid payload', () => {
    const result = validateLoginInput({ email: 'casey@example.com', password: 'anything' })
    expect(result.valid).toBe(true)
  })

  it('rejects an invalid email', () => {
    const result = validateLoginInput({ email: 'nope', password: 'anything' })
    expect(result.valid).toBe(false)
  })

  it('rejects a missing password', () => {
    const result = validateLoginInput({ email: 'casey@example.com', password: '' })
    expect(result.valid).toBe(false)
  })
})
