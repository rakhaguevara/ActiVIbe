import crypto from 'crypto'
import { prisma } from '../../config/prisma.js'
import { AppError } from '../../utils/AppError.js'
import { hashToken } from '../../utils/hash.js'
import { ensureOrganizationForOwner } from '../organizations/organization.service.js'

// Tidak pernah mengembalikan keyHash ke client — cuma keyPrefix (mis.
// "act_ab12cd34...") supaya organizer bisa membedakan key tanpa melihat ulang
// plaintext-nya (yang cuma ditampilkan sekali saat createKey()).
function serializeKey(key) {
  return {
    id: key.id,
    label: key.label,
    keyPrefix: key.keyPrefix,
    lastUsedAt: key.lastUsedAt ?? undefined,
    revokedAt: key.revokedAt ?? undefined,
    createdAt: key.createdAt,
  }
}

// Sama pola "ambil org pertama" yang dipakai subOrganizer/organizationSettings
// service.js — deletedAt: null supaya organisasi yang sudah di-soft-delete
// tidak pernah dianggap "organisasi aktif" milik organizer ini.
async function resolveOrganizationId(organizerId) {
  const existing = await prisma.organization.findFirst({
    where: { ownerId: organizerId, deletedAt: null },
    orderBy: { createdAt: 'asc' },
  })
  if (existing) return existing.id

  const owner = await prisma.user.findUniqueOrThrow({ where: { id: organizerId } })
  const organization = await ensureOrganizationForOwner(organizerId, {
    name: owner.name,
    email: owner.email ?? '',
    phone: owner.phone ?? '',
  })
  return organization.id
}

export async function listKeys(organizerId) {
  const organizationId = await resolveOrganizationId(organizerId)
  const keys = await prisma.apiKey.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
  })
  return keys.map(serializeKey)
}

// Plaintext key ('act_' + 64 hex char acak dari 32 byte) HANYA pernah
// dikembalikan di titik ini — setelahnya cuma keyPrefix (12 karakter pertama)
// yang tersimpan/ditampilkan, sisanya cuma ada sbg hash (keyHash, sama utility
// hashToken yang dipakai RefreshToken/token aktivasi organisasi).
export async function createKey(organizerId, { label }) {
  if (!label || typeof label !== 'string' || !label.trim()) {
    throw new AppError(400, 'Label API key wajib diisi')
  }
  const organizationId = await resolveOrganizationId(organizerId)

  const plaintextKey = `act_${crypto.randomBytes(32).toString('hex')}`
  const keyPrefix = plaintextKey.slice(0, 12)
  const keyHash = hashToken(plaintextKey)

  const key = await prisma.$transaction(async (tx) => {
    const created = await tx.apiKey.create({
      data: {
        organizationId,
        label: label.trim(),
        keyPrefix,
        keyHash,
        createdById: organizerId,
      },
    })
    await tx.auditLog.create({
      data: {
        actorId: organizerId,
        action: 'Membuat API key',
        targetType: 'ApiKey',
        targetId: created.id,
        targetLabel: created.label,
      },
    })
    return created
  })

  return { ...serializeKey(key), plaintextKey }
}

async function assertOwnsKey(organizerId, id) {
  const organizationId = await resolveOrganizationId(organizerId)
  const key = await prisma.apiKey.findUnique({ where: { id } })
  if (!key || key.organizationId !== organizationId) {
    throw new AppError(404, 'API key tidak ditemukan')
  }
  return key
}

export async function revokeKey(organizerId, id) {
  const key = await assertOwnsKey(organizerId, id)
  if (key.revokedAt) return serializeKey(key)

  const updated = await prisma.$transaction(async (tx) => {
    const revoked = await tx.apiKey.update({ where: { id }, data: { revokedAt: new Date() } })
    await tx.auditLog.create({
      data: {
        actorId: organizerId,
        action: 'Mencabut API key',
        targetType: 'ApiKey',
        targetId: revoked.id,
        targetLabel: revoked.label,
      },
    })
    return revoked
  })
  return serializeKey(updated)
}
