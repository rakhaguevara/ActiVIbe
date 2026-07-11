import { prisma } from '../../config/prisma.js'
import { AppError } from '../../utils/AppError.js'
import { getUserTier } from '../subscriptions/subscription.service.js'
import { LIMITS, startOfCurrentMonth } from '../subscriptions/plans.js'

// Communication Center broadcast — bagian "Compose Broadcast" di BroadcastView.tsx
// sebelumnya 100% mocked (tidak ada fetch/API sama sekali). Dibangun minimal di
// sini: cukup utk mengirim (menulis baris CommunicationLog, model sudah ada di
// schema tapi belum pernah ditulis) & menegakkan kuota freemium (FR baru
// ActiVibe Plus) — Scheduled/Templates/Log view lain SENGAJA tetap mock, di
// luar scope perubahan ini.
function serializeBroadcast(log) {
  return {
    id: log.id,
    eventId: log.eventId,
    eventTitle: log.event?.title ?? null,
    title: log.title,
    message: log.message,
    targetSegment: log.targetSegment,
    deliveryChannel: log.deliveryChannel,
    sentAt: log.sentAt,
    sentByName: log.sentBy?.name ?? null,
  }
}

async function countBroadcastsThisMonth(organizerId) {
  return prisma.communicationLog.count({
    where: { sentById: organizerId, sentAt: { gte: startOfCurrentMonth() } },
  })
}

export async function getBroadcastQuota(organizerId) {
  const tier = await getUserTier(organizerId)
  const limit = LIMITS[tier].broadcastPerMonth
  const used = await countBroadcastsThisMonth(organizerId)
  return { used, limit: limit === Infinity ? null : limit, tier }
}

async function assertOwnsEvent(organizerId, eventId) {
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true, organizerId: true, title: true } })
  if (!event || event.organizerId !== organizerId) {
    throw new AppError(404, 'Event tidak ditemukan')
  }
  return event
}

export async function sendBroadcast(organizerId, { eventId, title, message, targetSegment }) {
  if (!eventId || typeof eventId !== 'string') {
    throw new AppError(400, 'Target event wajib dipilih')
  }
  if (!title || typeof title !== 'string' || !title.trim()) {
    throw new AppError(400, 'Judul broadcast wajib diisi')
  }
  if (!message || typeof message !== 'string' || !message.trim()) {
    throw new AppError(400, 'Isi pesan wajib diisi')
  }

  await assertOwnsEvent(organizerId, eventId)

  const tier = await getUserTier(organizerId)
  const limit = LIMITS[tier].broadcastPerMonth
  if (limit !== Infinity) {
    const used = await countBroadcastsThisMonth(organizerId)
    if (used >= limit) {
      throw new AppError(
        403,
        `Kuota broadcast paket Free bulan ini sudah habis (maks ${limit}x/bulan) — sisanya kirim manual lewat WhatsApp, atau upgrade ke ActiVibe Plus Pro untuk broadcast tanpa batas.`,
      )
    }
  }

  const log = await prisma.communicationLog.create({
    data: {
      eventId,
      title: title.trim(),
      message: message.trim(),
      targetSegment: targetSegment?.trim() || 'Semua Volunteer Diterima',
      deliveryChannel: 'EMAIL',
      sentById: organizerId,
    },
    include: { event: { select: { title: true } }, sentBy: { select: { name: true } } },
  })

  return serializeBroadcast(log)
}

export async function listBroadcasts(organizerId) {
  const logs = await prisma.communicationLog.findMany({
    where: { sentById: organizerId },
    include: { event: { select: { title: true } }, sentBy: { select: { name: true } } },
    orderBy: { sentAt: 'desc' },
    take: 50,
  })
  return logs.map(serializeBroadcast)
}
