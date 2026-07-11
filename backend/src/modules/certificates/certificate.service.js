import { prisma } from '../../config/prisma.js'
import { AppError } from '../../utils/AppError.js'
import { getUserTier } from '../subscriptions/subscription.service.js'
import { LIMITS, startOfCurrentMonth } from '../subscriptions/plans.js'

// Kehadiran (bukan penyelesaian event penuh) sudah cukup utk berhak dapat
// sertifikat — organizer bisa menerbitkan begitu volunteer ditandai hadir,
// tanpa menunggu event ditutup, supaya volunteer yang "kabur"/no-show tidak
// pernah jadi eligible sama sekali.
const CERTIFICATE_ELIGIBLE_STATUSES = ['CHECKED_IN', 'COMPLETED']

async function findOwnedApplicationOrThrow(organizerId, applicationId) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      event: { select: { id: true, organizerId: true, title: true } },
      user: { select: { name: true } },
      certificate: true,
    },
  })
  if (!application || application.event.organizerId !== organizerId) {
    throw new AppError(404, 'Pendaftaran tidak ditemukan')
  }
  return application
}

async function getActiveTemplate() {
  return prisma.certificateTemplate.findFirst({ where: { isActive: true } })
}

async function getMyOrganizationLogoUrl(organizerId) {
  const organization = await prisma.organization.findFirst({
    where: { ownerId: organizerId },
    select: { logoUrl: true },
  })
  return organization?.logoUrl ?? null
}

// ActiVibe Plus — gating fitur sertifikat: FREE tidak bisa aktifkan sama
// sekali, PLUS_STARTER dibatasi 2 event/bulan (dihitung dari event DISTINCT
// yang sudah pernah generate sertifikat bulan ini — generate ulang di event
// yang sama tidak menghitung dua kali), PLUS_PRO unlimited. Dipindah dari
// event.service.js (lihat CLAUDE.md) — semantik tidak berubah.
async function assertCertificateQuota(organizerId, eventId) {
  const tier = await getUserTier(organizerId)
  const limit = LIMITS[tier].certificateEventsPerMonth

  if (limit === 0) {
    throw new AppError(403, 'Fitur sertifikat khusus pengguna ActiVibe Plus. Upgrade paket untuk mengaktifkan sertifikat peserta.')
  }
  if (limit === Infinity) return

  const distinctEvents = await prisma.certificate.findMany({
    where: { event: { organizerId }, issuedAt: { gte: startOfCurrentMonth() } },
    distinct: ['eventId'],
    select: { eventId: true },
  })
  const eventIds = new Set(distinctEvents.map((c) => c.eventId))
  if (!eventIds.has(eventId) && eventIds.size >= limit) {
    throw new AppError(
      403,
      `Kuota sertifikat paket ActiVibe Plus Starter (${limit} event/bulan) sudah habis. Upgrade ke ActiVibe Plus Pro untuk sertifikat tanpa batas.`,
    )
  }
}

export async function getCertificateQueue(organizerId) {
  const applications = await prisma.application.findMany({
    where: {
      event: { organizerId },
      status: { in: CERTIFICATE_ELIGIBLE_STATUSES },
      certificate: null,
    },
    include: {
      event: { select: { id: true, title: true } },
      user: { select: { name: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })
  return applications.map((a) => ({
    applicationId: a.id,
    eventId: a.event.id,
    eventTitle: a.event.title,
    volunteerName: a.user.name,
    status: a.status,
  }))
}

export async function generateCertificate(organizerId, applicationId) {
  const application = await findOwnedApplicationOrThrow(organizerId, applicationId)
  if (!CERTIFICATE_ELIGIBLE_STATUSES.includes(application.status)) {
    throw new AppError(400, 'Volunteer ini belum ditandai hadir (check-in), sertifikat belum bisa diterbitkan')
  }
  if (application.certificate) {
    throw new AppError(409, 'Sertifikat untuk pendaftaran ini sudah pernah diterbitkan')
  }
  const template = await getActiveTemplate()
  if (!template) {
    throw new AppError(400, 'Belum ada template sertifikat aktif — hubungi admin untuk mengaktifkan salah satu template.')
  }
  await assertCertificateQuota(organizerId, application.event.id)

  const organizationLogoUrl = await getMyOrganizationLogoUrl(organizerId)

  return prisma.$transaction(async (tx) => {
    const certificate = await tx.certificate.create({
      data: { applicationId: application.id, eventId: application.event.id, currentVersion: 1 },
    })
    await tx.certificateVersion.create({
      data: {
        certificateId: certificate.id,
        version: 1,
        templateId: template.id,
        participantNameSnapshot: application.user.name,
        eventTitleSnapshot: application.event.title,
        organizationLogoUrlSnapshot: organizationLogoUrl,
        issuedById: organizerId,
      },
    })
    await tx.event.update({ where: { id: application.event.id }, data: { certificateProvider: 'ACTIVIBE' } })
    return certificate
  })
}

export async function generateCertificatesBulk(organizerId, applicationIds) {
  let issued = 0
  let alreadyIssued = 0
  const failed = []
  for (const applicationId of applicationIds) {
    try {
      const application = await findOwnedApplicationOrThrow(organizerId, applicationId)
      if (application.certificate) {
        alreadyIssued += 1
        continue
      }
      await generateCertificate(organizerId, applicationId)
      issued += 1
    } catch (err) {
      failed.push({ applicationId, reason: err instanceof AppError ? err.message : 'Gagal menerbitkan sertifikat' })
    }
  }
  return { issued, alreadyIssued, failed }
}

// Regenerate TIDAK dicek kuota lagi (event-nya sudah terhitung saat
// penerbitan pertama) — cuma butuh template aktif + snapshot data terkini
// (mis. nama volunteer sudah dikoreksi di profil sejak versi sebelumnya).
export async function regenerateCertificate(organizerId, certificateId, note) {
  const certificate = await prisma.certificate.findUnique({
    where: { id: certificateId },
    include: {
      event: { select: { id: true, organizerId: true, title: true } },
      application: { include: { user: { select: { name: true } } } },
    },
  })
  if (!certificate || certificate.event.organizerId !== organizerId) {
    throw new AppError(404, 'Sertifikat tidak ditemukan')
  }
  const template = await getActiveTemplate()
  if (!template) {
    throw new AppError(400, 'Belum ada template sertifikat aktif — hubungi admin untuk mengaktifkan salah satu template.')
  }
  const organizationLogoUrl = await getMyOrganizationLogoUrl(organizerId)
  const nextVersion = certificate.currentVersion + 1

  return prisma.$transaction(async (tx) => {
    await tx.certificateVersion.create({
      data: {
        certificateId: certificate.id,
        version: nextVersion,
        templateId: template.id,
        participantNameSnapshot: certificate.application.user.name,
        eventTitleSnapshot: certificate.event.title,
        organizationLogoUrlSnapshot: organizationLogoUrl,
        issuedById: organizerId,
        note: note ?? null,
      },
    })
    return tx.certificate.update({ where: { id: certificate.id }, data: { currentVersion: nextVersion } })
  })
}

export async function listGeneratedCertificates(organizerId) {
  const certificates = await prisma.certificate.findMany({
    where: { event: { organizerId } },
    include: {
      event: { select: { id: true, title: true } },
      application: { include: { user: { select: { name: true } } } },
      versions: { orderBy: { version: 'desc' }, take: 1, include: { template: { select: { name: true } } } },
    },
    orderBy: { issuedAt: 'desc' },
  })
  return certificates.map((c) => ({
    id: c.id,
    applicationId: c.applicationId,
    eventId: c.event.id,
    eventTitle: c.event.title,
    volunteerName: c.application.user.name,
    issuedAt: c.issuedAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    currentVersion: c.currentVersion,
    templateName: c.versions[0]?.template.name ?? null,
    // fileUrl + snapshot data dari versi terbaru — dibutuhkan frontend utk
    // render ulang PDF-nya client-side (pdf-lib), bukan cuma ditampilkan.
    templateUrl: c.versions[0]?.template.fileUrl ?? null,
    participantName: c.versions[0]?.participantNameSnapshot ?? c.application.user.name,
    organizationLogoUrl: c.versions[0]?.organizationLogoUrlSnapshot ?? null,
  }))
}

export async function listCertificateVersions(organizerId, certificateId) {
  const certificate = await prisma.certificate.findUnique({
    where: { id: certificateId },
    include: { event: { select: { organizerId: true } } },
  })
  if (!certificate || certificate.event.organizerId !== organizerId) {
    throw new AppError(404, 'Sertifikat tidak ditemukan')
  }
  const versions = await prisma.certificateVersion.findMany({
    where: { certificateId },
    include: { template: { select: { name: true, fileUrl: true } } },
    orderBy: { version: 'desc' },
  })
  return versions.map((v) => ({
    version: v.version,
    templateName: v.template.name,
    templateUrl: v.template.fileUrl,
    participantName: v.participantNameSnapshot,
    eventTitle: v.eventTitleSnapshot,
    organizationLogoUrl: v.organizationLogoUrlSnapshot,
    issuedAt: v.issuedAt.toISOString(),
    note: v.note,
  }))
}

// "Failed" dihitung live dari kondisi nyata yang sedang menghalangi
// (bukan log historis) — supaya tab ini tidak pernah basi: begitu admin
// aktifkan template atau organizer upgrade paket, baris ini otomatis hilang
// tanpa perlu proses "resolve" manual.
export async function listFailedCandidates(organizerId) {
  const eligible = await getCertificateQueue(organizerId)
  if (eligible.length === 0) return []

  const template = await getActiveTemplate()
  if (!template) {
    return eligible.map((item) => ({ ...item, reason: 'no_active_template' }))
  }

  const tier = await getUserTier(organizerId)
  const limit = LIMITS[tier].certificateEventsPerMonth
  if (limit === 0) {
    return eligible.map((item) => ({ ...item, reason: 'quota_exceeded' }))
  }
  if (limit === Infinity) return []

  const distinctEvents = await prisma.certificate.findMany({
    where: { event: { organizerId }, issuedAt: { gte: startOfCurrentMonth() } },
    distinct: ['eventId'],
    select: { eventId: true },
  })
  const usedEventIds = new Set(distinctEvents.map((c) => c.eventId))
  const quotaFull = usedEventIds.size >= limit

  return eligible
    .filter((item) => quotaFull && !usedEventIds.has(item.eventId))
    .map((item) => ({ ...item, reason: 'quota_exceeded' }))
}
