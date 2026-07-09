import { describe, it, expect } from 'vitest'
import { validateCreateEvent, isEventDocumentSetComplete } from './event.validation.js'

const uploaded = { url: 'https://example.com/file.pdf', fileName: 'file.pdf' }

function baseDraftBody(overrides = {}) {
  return {
    title: 'Kegiatan Uji',
    description: 'Deskripsi kegiatan uji',
    location: 'Yogyakarta',
    quota: 10,
    startDate: '2099-01-01',
    endDate: '2099-01-02',
    status: 'draft',
    impactMetricLabel: 'Jumlah bibit ditanam',
    ...overrides,
  }
}

describe('validateCreateEvent — Business rule 2 (tanggal)', () => {
  it('menolak startDate sebelum hari ini', () => {
    const result = validateCreateEvent(baseDraftBody({ startDate: '2000-01-01', endDate: '2000-01-02' }))
    expect(result.valid).toBe(false)
    expect(result.message).toMatch(/tanggal mulai/i)
  })

  it('menolak endDate sebelum startDate', () => {
    const result = validateCreateEvent(baseDraftBody({ startDate: '2099-01-05', endDate: '2099-01-01' }))
    expect(result.valid).toBe(false)
    expect(result.message).toMatch(/tanggal selesai/i)
  })

  it('menerima startDate hari ini dan endDate >= startDate', () => {
    const todayStr = new Date().toISOString().slice(0, 10)
    const result = validateCreateEvent(baseDraftBody({ startDate: todayStr, endDate: todayStr }))
    expect(result.valid).toBe(true)
  })
})

describe('validateCreateEvent — Business rule 1 (PIC wajib saat pending_approval)', () => {
  function pendingApprovalBody(overrides = {}) {
    return baseDraftBody({
      status: 'pending_approval',
      eventMode: 'ONLINE',
      picName: 'Budi Santoso',
      picContact: '081234567890',
      picEmail: 'budi.santoso@example.com',
      documents: {
        proposal: uploaded,
        rundown: uploaded,
        poster: uploaded,
        responsibilityLetter: uploaded,
      },
      galleryImages: [uploaded],
      declarationChecklist: {
        infoAccurate: true,
        documentsValid: true,
        fullResponsibility: true,
        compliesWithLaw: true,
        notFictionalEvent: true,
        noProhibitedContent: true,
        permitsObtained: true,
        publicationOnlyAck: true,
        organizerLiabilityAck: true,
        platformModerationAck: true,
        agreesToTerms: true,
      },
      ...overrides,
    })
  }

  it('menolak submit tanpa picName', () => {
    const result = validateCreateEvent(pendingApprovalBody({ picName: undefined }))
    expect(result.valid).toBe(false)
    expect(result.message).toMatch(/pic\/pengurus/i)
  })

  it('menolak picName kosong/whitespace', () => {
    const result = validateCreateEvent(pendingApprovalBody({ picName: '   ' }))
    expect(result.valid).toBe(false)
    expect(result.message).toMatch(/pic\/pengurus/i)
  })

  it('menerima submit lengkap dengan picName terisi', () => {
    const result = validateCreateEvent(pendingApprovalBody())
    expect(result.valid).toBe(true)
  })

  it('menolak submit tanpa picContact (WA)', () => {
    const result = validateCreateEvent(pendingApprovalBody({ picContact: undefined }))
    expect(result.valid).toBe(false)
    expect(result.message).toMatch(/kontak wa pic/i)
  })

  it('menolak submit tanpa picEmail', () => {
    const result = validateCreateEvent(pendingApprovalBody({ picEmail: undefined }))
    expect(result.valid).toBe(false)
    expect(result.message).toMatch(/email pic/i)
  })

  it('menolak picEmail dengan format tidak valid', () => {
    const result = validateCreateEvent(pendingApprovalBody({ picEmail: 'bukan-email' }))
    expect(result.valid).toBe(false)
    expect(result.message).toMatch(/email pic/i)
  })

  it('draft tidak wajib mengisi picName', () => {
    const result = validateCreateEvent(baseDraftBody())
    expect(result.valid).toBe(true)
  })
})

describe('isEventDocumentSetComplete', () => {
  const complete = {
    eventMode: 'ONLINE',
    onBehalfOfInstitution: false,
    organizationEntityType: 'INDIVIDU',
    documents: {
      proposal: uploaded,
      rundown: uploaded,
      poster: uploaded,
      responsibilityLetter: uploaded,
    },
    legalDocumentsCount: 0,
  }

  it('lengkap untuk event ONLINE individu dengan 4 dokumen inti', () => {
    expect(isEventDocumentSetComplete(complete)).toBe(true)
  })

  it('tidak lengkap kalau salah satu dokumen inti hilang', () => {
    expect(isEventDocumentSetComplete({ ...complete, documents: { ...complete.documents, proposal: null } })).toBe(false)
  })

  it('wajib locationPermit untuk event OFFLINE', () => {
    expect(isEventDocumentSetComplete({ ...complete, eventMode: 'OFFLINE' })).toBe(false)
    expect(
      isEventDocumentSetComplete({
        ...complete,
        eventMode: 'OFFLINE',
        documents: { ...complete.documents, locationPermit: uploaded },
      }),
    ).toBe(true)
  })

  it('wajib assignmentLetter kalau onBehalfOfInstitution true', () => {
    expect(isEventDocumentSetComplete({ ...complete, onBehalfOfInstitution: true })).toBe(false)
    expect(
      isEventDocumentSetComplete({
        ...complete,
        onBehalfOfInstitution: true,
        documents: { ...complete.documents, assignmentLetter: uploaded },
      }),
    ).toBe(true)
  })

  it('wajib minimal 1 dokumen legal kalau organizationEntityType bukan INDIVIDU', () => {
    expect(isEventDocumentSetComplete({ ...complete, organizationEntityType: 'YAYASAN' })).toBe(false)
    expect(isEventDocumentSetComplete({ ...complete, organizationEntityType: 'YAYASAN', legalDocumentsCount: 1 })).toBe(true)
  })
})
