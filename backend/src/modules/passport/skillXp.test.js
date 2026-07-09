import { describe, it, expect } from 'vitest'
import { deriveSkillXp } from './skillXp.js'

describe('deriveSkillXp', () => {
  it('level 1 dengan xp 0 kalau belum pernah ikut event ber-skill ini', () => {
    expect(deriveSkillXp(0)).toEqual({ xp: 0, xpTarget: 300, level: 1 })
  })

  it('xp bertambah 100 per event, belum naik level sebelum melewati kelipatan 300', () => {
    expect(deriveSkillXp(1)).toEqual({ xp: 100, xpTarget: 300, level: 1 })
    expect(deriveSkillXp(2)).toEqual({ xp: 200, xpTarget: 300, level: 1 })
  })

  it('naik level begitu xpTotal mencapai kelipatan XP_PER_LEVEL', () => {
    expect(deriveSkillXp(3)).toEqual({ xp: 0, xpTarget: 300, level: 2 })
    expect(deriveSkillXp(4)).toEqual({ xp: 100, xpTarget: 300, level: 2 })
  })

  it('tidak pernah negatif walau input negatif (defensive)', () => {
    expect(deriveSkillXp(-5)).toEqual({ xp: 0, xpTarget: 300, level: 1 })
  })
})
