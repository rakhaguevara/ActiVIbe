import { prisma } from '../../config/prisma.js'
import { AppError } from '../../utils/AppError.js'
import { ensureOrganizationForOwner } from '../organizations/organization.service.js'

function serializeTemplate(template) {
  return {
    id: template.id,
    name: template.name,
    category: template.category ?? undefined,
    subject: template.subject ?? undefined,
    body: template.body,
    createdByName: template.createdBy?.name ?? null,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  }
}

// Sama pola "ambil org pertama" yang dipakai subOrganizer.service.js —
// satu organizer di-treat sbg satu Organization utama, lazy-create kalau
// organizer belum pernah bikin event sama sekali.
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

function assertValidPayload({ name, body }) {
  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new AppError(400, 'Nama template wajib diisi')
  }
  if (!body || typeof body !== 'string' || !body.trim()) {
    throw new AppError(400, 'Isi pesan template wajib diisi')
  }
}

async function assertOwnsTemplate(organizerId, id) {
  const organizationId = await resolveOrganizationId(organizerId)
  const template = await prisma.messageTemplate.findUnique({ where: { id } })
  if (!template || template.organizationId !== organizationId) {
    throw new AppError(404, 'Template tidak ditemukan')
  }
  return template
}

export async function listMessageTemplates(organizerId) {
  const organizationId = await resolveOrganizationId(organizerId)
  const templates = await prisma.messageTemplate.findMany({
    where: { organizationId },
    include: { createdBy: { select: { name: true } } },
    orderBy: { updatedAt: 'desc' },
  })
  return templates.map(serializeTemplate)
}

export async function createMessageTemplate(organizerId, payload) {
  assertValidPayload(payload)
  const organizationId = await resolveOrganizationId(organizerId)

  const template = await prisma.messageTemplate.create({
    data: {
      organizationId,
      name: payload.name.trim(),
      category: payload.category?.trim() || null,
      subject: payload.subject?.trim() || null,
      body: payload.body.trim(),
      createdById: organizerId,
    },
    include: { createdBy: { select: { name: true } } },
  })
  return serializeTemplate(template)
}

export async function updateMessageTemplate(organizerId, id, payload) {
  await assertOwnsTemplate(organizerId, id)
  assertValidPayload(payload)

  const updated = await prisma.messageTemplate.update({
    where: { id },
    data: {
      name: payload.name.trim(),
      category: payload.category?.trim() || null,
      subject: payload.subject?.trim() || null,
      body: payload.body.trim(),
    },
    include: { createdBy: { select: { name: true } } },
  })
  return serializeTemplate(updated)
}

export async function duplicateMessageTemplate(organizerId, id) {
  const template = await assertOwnsTemplate(organizerId, id)

  const duplicated = await prisma.messageTemplate.create({
    data: {
      organizationId: template.organizationId,
      name: `${template.name} (Salinan)`,
      category: template.category,
      subject: template.subject,
      body: template.body,
      createdById: organizerId,
    },
    include: { createdBy: { select: { name: true } } },
  })
  return serializeTemplate(duplicated)
}

export async function deleteMessageTemplate(organizerId, id) {
  await assertOwnsTemplate(organizerId, id)
  await prisma.messageTemplate.delete({ where: { id } })
}
