import { describe, it, expect } from 'vitest'
import { hashToken } from './hash.js'

describe('hashToken', () => {
  it('produces the same hash for the same input', () => {
    expect(hashToken('same-value')).toBe(hashToken('same-value'))
  })

  it('produces different hashes for different input', () => {
    expect(hashToken('value-a')).not.toBe(hashToken('value-b'))
  })

  it('returns a 64-character hex string (sha256)', () => {
    expect(hashToken('anything')).toMatch(/^[a-f0-9]{64}$/)
  })
})
