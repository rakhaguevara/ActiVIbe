import crypto from 'crypto'
import { prisma } from '../../config/prisma.js'
import { AppError } from '../../utils/AppError.js'
import { hashToken } from '../../utils/hash.js'
import { sendOrganizationActivationEmail } from '../../utils/mailer.js'
import { env } from '../../config/env.js'

const ACTIVATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000

// Status event yang dihitung sbg "aktif/berjalan" utk eventsCount organisasi —
// sama dengan filter yang dipakai listing publik volunteer (lihat event.service.js).
const COUNTABLE_EVENT_STATUSES = ['PUBLISHED', 'ONGOING', 'COMPLETED']

// Belum ada data rating organisasi (belum ada fitur ulasan) — kembalikan 0
// (netral, jujur) daripada mengarang angka, sampai fitur rating dibangun.
function serializeOrganization(org, eventsCount) {
  return {
    id: org.id,
    name: org.name,
    logoUrl: org.logoUrl ?? undefined,
    shortProfile: org.shortProfile,
    location: org.location,
    address: org.address ?? '',
    website: org.website ?? undefined,
    email: org.email,
    phone: org.phone,
    causeAreas: org.causeAreas,
    isVerified: org.isVerified,
    joinedYear: org.createdAt.getFullYear(),
    eventsCount,
    rating: 0,
    mission: org.mission ?? '',
    aboutUs: org.aboutUs ?? '',
  }
}

async function attachEventsCount(orgs) {
  const counts = await prisma.event.groupBy({
    by: ['organizationId'],
    where: { organizationId: { in: orgs.map((o) => o.id) }, status: { in: COUNTABLE_EVENT_STATUSES } },
    _count: { _all: true },
  })
  const countByOrg = new Map(counts.map((c) => [c.organizationId, c._count._all]))
  return orgs.map((org) => serializeOrganization(org, countByOrg.get(org.id) ?? 0))
}

// Direktori publik cuma menampilkan organisasi yang sudah ACTIVE — organisasi
// PENDING_VERIFICATION (baru diajukan, belum klik link aktivasi email) belum
// pantas muncul di FindOrganizationPage.
export async function listOrganizations({ name, location, causeArea } = {}) {
  const where = {
    status: 'ACTIVE',
    ...(name ? { name: { contains: name, mode: 'insensitive' } } : {}),
    ...(location ? { location: { contains: location, mode: 'insensitive' } } : {}),
    ...(causeArea ? { causeAreas: { has: causeArea } } : {}),
  }
  const orgs = await prisma.organization.findMany({ where, orderBy: { name: 'asc' } })
  return attachEventsCount(orgs)
}

export async function getOrganizationById(id) {
  const org = await prisma.organization.findUnique({ where: { id } })
  if (!org || org.status !== 'ACTIVE') {
    throw new AppError(404, 'Organisasi tidak ditemukan')
  }
  const [serialized] = await attachEventsCount([org])
  return serialized
}

// Dipanggil lazily dari event.service.js createEvent() — setiap organizer yang
// membuat event pertama kalinya otomatis punya Organization asli di baliknya,
// tanpa perlu UI "buat organisasi" terpisah. Jalur ini terpisah dari
// registerOrganization() di bawah — langsung ACTIVE, tidak lewat aktivasi
// email, supaya organizer yang sudah dibuat lewat portal organizer terpisah
// tidak terhalang. ownerId TIDAK unique lagi (satu owner bisa >1 organisasi
// lewat registerOrganization), jadi ambil yang pertama dibuat kalau ada.
export async function ensureOrganizationForOwner(ownerId, defaults) {
  const existing = await prisma.organization.findFirst({ where: { ownerId }, orderBy: { createdAt: 'asc' } })
  if (existing) return existing

  return prisma.organization.create({
    data: {
      ownerId,
      name: defaults.name,
      shortProfile: defaults.shortProfile ?? `Organisasi yang dikelola oleh ${defaults.name}.`,
      location: defaults.location ?? 'Indonesia',
      email: defaults.email ?? '',
      phone: defaults.phone ?? '',
      causeAreas: defaults.causeAreas ?? [],
      status: 'ACTIVE',
    },
  })
}

// Form self-service "Daftarkan Organisasimu" — beda dari ensureOrganizationForOwner:
// bisa dipanggil siapapun yang login (bukan cuma role ORGANIZER), org dibuat
// PENDING_VERIFICATION dulu, dan satu owner boleh punya banyak baris (tidak
// dicek existing seperti ensureOrganizationForOwner).
export async function registerOrganization(ownerId, payload) {
  const token = crypto.randomBytes(32).toString('hex')

  const organization = await prisma.organization.create({
    data: {
      ownerId,
      name: payload.name.trim(),
      shortProfile: payload.shortProfile.trim(),
      location: payload.location.trim(),
      address: payload.address?.trim() || null,
      website: payload.website?.trim() || null,
      email: payload.email.trim(),
      phone: payload.phone.trim(),
      causeAreas: payload.causeAreas ?? [],
      status: 'PENDING_VERIFICATION',
      activationTokenHash: hashToken(token),
      activationTokenExpiresAt: new Date(Date.now() + ACTIVATION_TOKEN_TTL_MS),
    },
  })

  const activationUrl = `${env.BACKEND_URL}/organizations/activate?token=${token}`
  await sendOrganizationActivationEmail(organization.email, {
    organizationName: organization.name,
    activationUrl,
  })

  return organization
}

// Dipanggil dari GET /organizations/activate?token=... (link di email, tanpa
// requireAuth — token itu sendiri buktinya). Menaikkan role owner ke
// ORGANIZER kalau belum, supaya begitu ini jalan, owner langsung bisa akses
// dashboard organizer (requireRole('ORGANIZER') re-fetch role dari DB tiap
// request lewat getUserFromAccessToken, jadi tidak perlu login ulang).
export async function activateOrganization(token) {
  const organization = await prisma.organization.findUnique({
    where: { activationTokenHash: hashToken(token) },
  })

  if (!organization || organization.status === 'ACTIVE') {
    throw new AppError(400, 'Link aktivasi tidak valid atau sudah dipakai')
  }
  if (organization.activationTokenExpiresAt && organization.activationTokenExpiresAt < new Date()) {
    throw new AppError(400, 'Link aktivasi sudah kedaluwarsa')
  }

  await prisma.$transaction([
    prisma.organization.update({
      where: { id: organization.id },
      data: { status: 'ACTIVE', activationTokenHash: null, activationTokenExpiresAt: null },
    }),
    prisma.user.updateMany({
      where: { id: organization.ownerId, role: { not: 'ORGANIZER' } },
      data: { role: 'ORGANIZER' },
    }),
  ])

  return organization
}
