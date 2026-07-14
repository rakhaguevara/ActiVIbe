import { prisma } from '../../config/prisma.js'
import { AppError } from '../../utils/AppError.js'
import { ensureOrganizationForOwner } from '../organizations/organization.service.js'

function serializeSettings(settings) {
  return {
    id: settings.id,
    organizationId: settings.organizationId,
    language: settings.language,
    country: settings.country ?? undefined,
    timezone: settings.timezone,
    currency: settings.currency,
    dateFormat: settings.dateFormat,
    timeFormat: settings.timeFormat,
    weekStart: settings.weekStart,
    units: settings.units ?? undefined,
    defaultEventDurationHours: settings.defaultEventDurationHours ?? undefined,
    notifyEmailNewApplicant: settings.notifyEmailNewApplicant,
    notifyEmailEventReminder: settings.notifyEmailEventReminder,
    notifyEmailBroadcastReceipts: settings.notifyEmailBroadcastReceipts,
    notifyEmailWeeklyDigest: settings.notifyEmailWeeklyDigest,
    notificationFrequency: settings.notificationFrequency,
    webhookUrl: settings.webhookUrl ?? undefined,
    updatedAt: settings.updatedAt,
  }
}

// Sama pola "ambil org pertama" yang dipakai subOrganizer/messageTemplates/
// scheduledMessages service.js — satu organizer di-treat sbg satu Organization
// utama. deletedAt: null supaya organisasi yang sudah di-soft-delete lewat
// Settings > Security tidak pernah lagi dianggap "organisasi aktif" milik
// organizer ini (lihat CLAUDE.md soal sweep deletedAt).
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

// 1:1 dgn Organization — auto-create baris dgn default schema kalau belum ada
// (upsert), supaya organizer tidak perlu "inisialisasi" settings secara eksplisit
// sebelum GeneralSettingsView/NotificationSettingsView/ApiSettingsView bisa dipakai.
export async function getSettings(organizerId) {
  const organizationId = await resolveOrganizationId(organizerId)
  const settings = await prisma.organizationSettings.upsert({
    where: { organizationId },
    create: { organizationId },
    update: {},
  })
  return serializeSettings(settings)
}

const GENERAL_FIELDS = [
  'language',
  'country',
  'timezone',
  'currency',
  'dateFormat',
  'timeFormat',
  'weekStart',
  'units',
  'defaultEventDurationHours',
]

export async function updateGeneralSettings(organizerId, payload) {
  const organizationId = await resolveOrganizationId(organizerId)

  const data = {}
  for (const field of GENERAL_FIELDS) {
    if (payload[field] === undefined) continue
    if (field === 'defaultEventDurationHours') {
      const value = payload[field]
      if (value === null || value === '') {
        data[field] = null
      } else {
        const parsed = Number(value)
        if (!Number.isFinite(parsed) || parsed <= 0) {
          throw new AppError(400, 'Durasi event default harus angka positif')
        }
        data[field] = Math.round(parsed)
      }
      continue
    }
    data[field] = payload[field] === '' ? null : payload[field]
  }

  const settings = await prisma.organizationSettings.upsert({
    where: { organizationId },
    create: { organizationId, ...data },
    update: data,
  })
  return serializeSettings(settings)
}

const NOTIFICATION_BOOLEAN_FIELDS = [
  'notifyEmailNewApplicant',
  'notifyEmailEventReminder',
  'notifyEmailBroadcastReceipts',
  'notifyEmailWeeklyDigest',
]
const VALID_NOTIFICATION_FREQUENCIES = ['INSTANT', 'DAILY', 'WEEKLY']

export async function updateNotificationSettings(organizerId, payload) {
  const organizationId = await resolveOrganizationId(organizerId)

  const data = {}
  for (const field of NOTIFICATION_BOOLEAN_FIELDS) {
    if (payload[field] === undefined) continue
    data[field] = Boolean(payload[field])
  }
  if (payload.notificationFrequency !== undefined) {
    if (!VALID_NOTIFICATION_FREQUENCIES.includes(payload.notificationFrequency)) {
      throw new AppError(400, 'Frekuensi notifikasi tidak valid')
    }
    data.notificationFrequency = payload.notificationFrequency
  }

  const settings = await prisma.organizationSettings.upsert({
    where: { organizationId },
    create: { organizationId, ...data },
    update: data,
  })
  return serializeSettings(settings)
}

export async function updateWebhookUrl(organizerId, { webhookUrl }) {
  const organizationId = await resolveOrganizationId(organizerId)

  let normalized = null
  if (webhookUrl !== undefined && webhookUrl !== null && webhookUrl !== '') {
    try {
      const parsed = new URL(webhookUrl)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error('protocol')
      }
    } catch {
      throw new AppError(400, 'Webhook URL harus URL yang valid (diawali http:// atau https://)')
    }
    normalized = webhookUrl
  }

  const settings = await prisma.organizationSettings.upsert({
    where: { organizationId },
    create: { organizationId, webhookUrl: normalized },
    update: { webhookUrl: normalized },
  })
  return serializeSettings(settings)
}
