import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../../config/prisma.js'
import { createEvent } from './event.service.js'

const uploaded = { url: 'https://example.com/file.pdf', fileName: 'file.pdf' }

const DECLARATION_CHECKLIST = {
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
}

beforeEach(async () => {
  await prisma.eventCloseReport.deleteMany()
  await prisma.event.deleteMany()
  await prisma.organization.deleteMany()
  await prisma.user.deleteMany()
})

async function createOrganizer(email) {
  return prisma.user.create({
    data: { name: 'Organizer Uji', email, password: 'hashed', role: 'ORGANIZER', isVerified: true },
  })
}

function pendingEventPayload(overrides = {}) {
  return {
    title: 'Kegiatan Uji',
    description: 'Deskripsi kegiatan uji',
    location: 'Yogyakarta',
    quota: 10,
    startDate: '2099-01-10',
    endDate: '2099-01-11',
    status: 'pending_approval',
    impactMetricLabel: 'Jumlah bibit ditanam',
    eventMode: 'ONLINE',
    picName: 'Budi Santoso',
    documents: {
      proposal: uploaded,
      rundown: uploaded,
      poster: uploaded,
      responsibilityLetter: uploaded,
    },
    galleryImages: [uploaded],
    declarationChecklist: DECLARATION_CHECKLIST,
    ...overrides,
  }
}

describe('createEvent — Business rule 1 (konflik PIC/dokumen pada tanggal yang sama)', () => {
  it('mengizinkan event kedua non-overlap tanggal dengan PIC yang sama', async () => {
    const organizer = await createOrganizer('organizer-a@example.com')
    await createEvent(organizer.id, pendingEventPayload())

    await expect(
      createEvent(organizer.id, pendingEventPayload({ startDate: '2099-02-10', endDate: '2099-02-11' })),
    ).resolves.toMatchObject({ picName: 'Budi Santoso' })
  })

  it('menolak event kedua overlap tanggal dengan PIC yang sama (409)', async () => {
    const organizer = await createOrganizer('organizer-b@example.com')
    await createEvent(organizer.id, pendingEventPayload())

    await expect(
      createEvent(organizer.id, pendingEventPayload({ title: 'Kegiatan Uji 2' })),
    ).rejects.toMatchObject({ statusCode: 409 })
  })

  it('mengizinkan event kedua overlap tanggal dengan PIC berbeda dan dokumen lengkap', async () => {
    const organizer = await createOrganizer('organizer-c@example.com')
    await createEvent(organizer.id, pendingEventPayload())

    await expect(
      createEvent(organizer.id, pendingEventPayload({ title: 'Kegiatan Uji 2', picName: 'Siti Aminah' })),
    ).resolves.toMatchObject({ picName: 'Siti Aminah' })
  })

  it('menolak event kedua overlap tanggal dengan PIC berbeda tapi dokumen event pertama belum lengkap', async () => {
    const organizer = await createOrganizer('organizer-d@example.com')
    // Event pertama disimpan sbg draft (dokumen boleh belum lengkap).
    await createEvent(
      organizer.id,
      pendingEventPayload({
        status: 'draft',
        documents: { proposal: uploaded },
        galleryImages: undefined,
        declarationChecklist: undefined,
      }),
    )

    await expect(
      createEvent(organizer.id, pendingEventPayload({ title: 'Kegiatan Uji 2', picName: 'Siti Aminah' })),
    ).rejects.toMatchObject({ statusCode: 409 })
  })

  it('tidak mengecek konflik untuk event yang disimpan sbg draft', async () => {
    const organizer = await createOrganizer('organizer-e@example.com')
    await createEvent(organizer.id, pendingEventPayload())

    await expect(
      createEvent(organizer.id, pendingEventPayload({ title: 'Kegiatan Uji 2', status: 'draft' })),
    ).resolves.toBeTruthy()
  })
})
