import { describe, it, expect } from 'vitest'
import { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken } from './jwt.js'

describe('jwt utils', () => {
  it('signs and verifies an access token round-trip', () => {
    const token = signAccessToken({ userId: 'abc123', role: 'VOLUNTEER' })
    const payload = verifyAccessToken(token)
    expect(payload.userId).toBe('abc123')
    expect(payload.role).toBe('VOLUNTEER')
  })

  it('signs and verifies a refresh token round-trip', () => {
    const token = signRefreshToken({ userId: 'abc123' })
    const payload = verifyRefreshToken(token)
    expect(payload.userId).toBe('abc123')
  })

  it('throws when verifying an access token with the refresh secret', () => {
    const token = signAccessToken({ userId: 'abc123', role: 'VOLUNTEER' })
    expect(() => verifyRefreshToken(token)).toThrow()
  })
})
