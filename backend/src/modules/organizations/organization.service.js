import { prisma } from '../../config/prisma.js'
import { AppError } from '../../utils/AppError.js'

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

export async function listOrganizations({ name, location, causeArea } = {}) {
  const where = {
    ...(name ? { name: { contains: name, mode: 'insensitive' } } : {}),
    ...(location ? { location: { contains: location, mode: 'insensitive' } } : {}),
    ...(causeArea ? { causeAreas: { has: causeArea } } : {}),
  }
  const orgs = await prisma.organization.findMany({ where, orderBy: { name: 'asc' } })
  return attachEventsCount(orgs)
}

export async function getOrganizationById(id) {
  const org = await prisma.organization.findUnique({ where: { id } })
  if (!org) {
    throw new AppError(404, 'Organisasi tidak ditemukan')
  }
  const [serialized] = await attachEventsCount([org])
  return serialized
}

// Dipanggil lazily dari event.service.js createEvent() — setiap organizer yang
// membuat event pertama kalinya otomatis punya Organization asli di baliknya,
// tanpa perlu UI "buat organisasi" terpisah (di luar scope push ini).
export async function ensureOrganizationForOwner(ownerId, defaults) {
  const existing = await prisma.organization.findUnique({ where: { ownerId } })
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
    },
  })
}
