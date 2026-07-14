import { prisma } from '../../config/prisma.js'
import { AppError } from '../../utils/AppError.js'
import { ensureOrganizationForOwner } from '../organizations/organization.service.js'

function serializeSubOrganizer(subOrganizer) {
  return {
    id: subOrganizer.id,
    name: subOrganizer.name,
    email: subOrganizer.email,
    whatsapp: subOrganizer.whatsapp,
    title: subOrganizer.title ?? undefined,
  }
}

// Sama pola "ambil org pertama" yang dipakai ensureOrganizationForOwner
// (organization.service.js) — Sub Organizer scoped per Organization, dan
// satu organizer di-treat sbg satu Organization utama di seluruh app ini
// (belum ada UI "kelola organisasi saya" utk multi-org). Lazy-create org
// kalau organizer belum pernah bikin event sama sekali, supaya tetap bisa
// mulai isi Sub Organizer duluan sebelum bikin event pertama.
async function resolveOrganizationId(organizerId) {
  // deletedAt: null — organisasi yang sudah di-soft-delete tidak boleh
  // dianggap "organisasi aktif" organizer ini (lihat sweep di CLAUDE.md).
  const existing = await prisma.organization.findFirst({ where: { ownerId: organizerId, deletedAt: null }, orderBy: { createdAt: 'asc' } })
  if (existing) return existing.id

  const owner = await prisma.user.findUniqueOrThrow({ where: { id: organizerId } })
  const organization = await ensureOrganizationForOwner(organizerId, {
    name: owner.name,
    email: owner.email ?? '',
    phone: owner.phone ?? '',
  })
  return organization.id
}

function assertValidPayload({ name, email, whatsapp }) {
  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new AppError(400, 'Nama Sub Organizer wajib diisi')
  }
  if (!email || typeof email !== 'string' || !email.trim()) {
    throw new AppError(400, 'Email Sub Organizer wajib diisi')
  }
  if (!whatsapp || typeof whatsapp !== 'string' || !whatsapp.trim()) {
    throw new AppError(400, 'Nomor WhatsApp Sub Organizer wajib diisi')
  }
}

async function assertOwnsSubOrganizer(organizerId, id) {
  const organizationId = await resolveOrganizationId(organizerId)
  const subOrganizer = await prisma.subOrganizer.findUnique({ where: { id } })
  if (!subOrganizer || subOrganizer.organizationId !== organizationId) {
    throw new AppError(404, 'Sub Organizer tidak ditemukan')
  }
  return subOrganizer
}

export async function listSubOrganizers(organizerId) {
  const organizationId = await resolveOrganizationId(organizerId)
  const subOrganizers = await prisma.subOrganizer.findMany({
    where: { organizationId },
    orderBy: { name: 'asc' },
  })
  return subOrganizers.map(serializeSubOrganizer)
}

export async function createSubOrganizer(organizerId, payload) {
  assertValidPayload(payload)
  const organizationId = await resolveOrganizationId(organizerId)

  const subOrganizer = await prisma.subOrganizer.create({
    data: {
      organizationId,
      name: payload.name.trim(),
      email: payload.email.trim(),
      whatsapp: payload.whatsapp.trim(),
      title: payload.title?.trim() || null,
    },
  })
  return serializeSubOrganizer(subOrganizer)
}

export async function updateSubOrganizer(organizerId, id, payload) {
  await assertOwnsSubOrganizer(organizerId, id)
  assertValidPayload(payload)

  const updated = await prisma.subOrganizer.update({
    where: { id },
    data: {
      name: payload.name.trim(),
      email: payload.email.trim(),
      whatsapp: payload.whatsapp.trim(),
      title: payload.title?.trim() || null,
    },
  })
  return serializeSubOrganizer(updated)
}

export async function deleteSubOrganizer(organizerId, id) {
  await assertOwnsSubOrganizer(organizerId, id)
  await prisma.subOrganizer.delete({ where: { id } })
}

// Dipakai event.service.js createEvent() utk validasi picSubOrganizerId
// milik organisasi organizer yang sama sebelum di-snapshot ke Event.
export async function findOwnedSubOrganizer(organizerId, id) {
  return assertOwnsSubOrganizer(organizerId, id)
}
