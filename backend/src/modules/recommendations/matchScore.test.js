import { describe, it, expect } from 'vitest'
import { computeMatchScore, rankEvents, WEIGHTS } from './matchScore.js'

const baseEvent = {
  id: 'evt-test',
  title: 'Event Uji',
  category: 'Lingkungan',
  location: 'Bantul, Yogyakarta',
  skills: ['Kerja Tim', 'Mengajar'],
  interests: ['Lingkungan', 'Komunitas'],
  motivationTags: ['VALUES'],
  dayType: 'WEEKEND',
}

const emptyProfile = {
  interests: [],
  skills: [],
  availability: null,
  motivation: null,
  location: null,
}

describe('computeMatchScore', () => {
  it('bobot komponen berjumlah 100%', () => {
    const total = Object.values(WEIGHTS).reduce((a, b) => a + b, 0)
    expect(total).toBeCloseTo(1)
  })

  it('profil kosong dinilai netral 50 (tidak dihukum)', () => {
    const { score, breakdown } = computeMatchScore(emptyProfile, baseEvent)
    expect(score).toBe(50)
    expect(breakdown.skill.score).toBe(50)
    expect(breakdown.interest.score).toBe(50)
    expect(breakdown.motivation.score).toBe(50)
  })

  it('profil yang cocok penuh dapat skor 100', () => {
    const profile = {
      interests: [{ name: 'Lingkungan' }, { name: 'Komunitas' }],
      skills: [{ name: 'Kerja Tim' }, { name: 'Mengajar' }],
      availability: 'WEEKEND',
      motivation: 'VALUES',
      location: 'Bantul',
    }
    const { score, breakdown } = computeMatchScore(profile, baseEvent)
    expect(score).toBe(100)
    expect(breakdown.skill.matched).toEqual(['Kerja Tim', 'Mengajar'])
    expect(breakdown.interest.matched).toEqual(['Lingkungan', 'Komunitas'])
  })

  it('pencocokan nama skill/minat case-insensitive', () => {
    const profile = { ...emptyProfile, skills: [{ name: 'kerja tim' }] }
    const { breakdown } = computeMatchScore(profile, baseEvent)
    expect(breakdown.skill.matched).toEqual(['Kerja Tim'])
    expect(breakdown.skill.score).toBe(50) // 1 dari 2 skill event
  })

  it('availability BOTH cocok dengan event weekday maupun weekend', () => {
    const profile = { ...emptyProfile, availability: 'BOTH' }
    const weekday = computeMatchScore(profile, { ...baseEvent, dayType: 'WEEKDAY' })
    const weekend = computeMatchScore(profile, { ...baseEvent, dayType: 'WEEKEND' })
    expect(weekday.breakdown.availability.score).toBe(100)
    expect(weekend.breakdown.availability.score).toBe(100)
  })

  it('availability yang bertolak belakang dinilai 0', () => {
    const profile = { ...emptyProfile, availability: 'WEEKDAY' }
    const { breakdown } = computeMatchScore(profile, { ...baseEvent, dayType: 'WEEKEND' })
    expect(breakdown.availability.score).toBe(0)
  })

  it('motivasi cocok = 100, tidak cocok = 0, belum diisi = netral', () => {
    const match = computeMatchScore({ ...emptyProfile, motivation: 'VALUES' }, baseEvent)
    const mismatch = computeMatchScore({ ...emptyProfile, motivation: 'CAREER' }, baseEvent)
    const unset = computeMatchScore(emptyProfile, baseEvent)
    expect(match.breakdown.motivation.score).toBe(100)
    expect(mismatch.breakdown.motivation.score).toBe(0)
    expect(unset.breakdown.motivation.score).toBe(50)
  })

  it('lokasi cocok lewat token kota yang sama (abaikan kata pendek)', () => {
    const profile = { ...emptyProfile, location: 'Kota Yogyakarta' }
    const { breakdown } = computeMatchScore(profile, {
      ...baseEvent,
      location: 'Sleman, Yogyakarta',
    })
    expect(breakdown.location.score).toBe(100)
  })
})

describe('rankEvents', () => {
  it('mengurutkan event dari skor tertinggi', () => {
    const profile = {
      ...emptyProfile,
      interests: [{ name: 'Lingkungan' }],
      availability: 'WEEKEND',
    }
    const events = [
      { ...baseEvent, id: 'cocok' },
      {
        ...baseEvent,
        id: 'kurang-cocok',
        interests: ['Teknologi'],
        dayType: 'WEEKDAY',
      },
    ]
    const ranked = rankEvents(profile, events)
    expect(ranked[0].event.id).toBe('cocok')
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score)
  })
})
