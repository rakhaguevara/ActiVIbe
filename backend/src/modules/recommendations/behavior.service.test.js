import { describe, it, expect } from 'vitest'
import { behaviorBoost } from './behavior.service.js'

const lingkunganEvent = { category: 'Lingkungan', interests: ['Lingkungan', 'Konservasi Satwa'] }
const pendidikanEvent = { category: 'Pendidikan', interests: ['Edukasi Anak'] }

describe('behaviorBoost', () => {
  it('mengembalikan 0 kalau user belum punya riwayat buka/simpan (cold start)', () => {
    expect(behaviorBoost(lingkunganEvent, new Map())).toBe(0)
  })

  it('event yang kategorinya paling sering dibuka/disimpan dapat boost maksimal', () => {
    const affinity = new Map([['category:Lingkungan', 9]])
    expect(behaviorBoost(lingkunganEvent, affinity)).toBe(10)
  })

  it('event tanpa overlap kategori/minat sama sekali dapat boost 0', () => {
    const affinity = new Map([['category:Lingkungan', 9]])
    expect(behaviorBoost(pendidikanEvent, affinity)).toBe(0)
  })

  it('bookmark (bobot 3) menghasilkan boost lebih tinggi dari sekadar view (bobot 1) untuk kategori yang sama', () => {
    const viewOnlyAffinity = new Map([['category:Lingkungan', 1]])
    const bookmarkAffinity = new Map([['category:Lingkungan', 1], ['category:Pendidikan', 3]])
    const viewBoost = behaviorBoost(lingkunganEvent, viewOnlyAffinity)
    const bookmarkBoost = behaviorBoost(lingkunganEvent, bookmarkAffinity)
    expect(bookmarkBoost).toBeLessThan(viewBoost)
  })

  it('boost tidak pernah melebihi 10 walau overlap kategori+minat menumpuk', () => {
    const affinity = new Map([
      ['category:Lingkungan', 5],
      ['interest:Lingkungan', 5],
      ['interest:Konservasi Satwa', 5],
    ])
    expect(behaviorBoost(lingkunganEvent, affinity)).toBeLessThanOrEqual(10)
  })
})
