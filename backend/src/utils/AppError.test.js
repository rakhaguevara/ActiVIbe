import { describe, it, expect } from 'vitest'
import { AppError } from './AppError.js'

describe('AppError', () => {
  it('carries a statusCode and message', () => {
    const err = new AppError(409, 'Email sudah terdaftar')
    expect(err).toBeInstanceOf(Error)
    expect(err.statusCode).toBe(409)
    expect(err.message).toBe('Email sudah terdaftar')
  })
})
