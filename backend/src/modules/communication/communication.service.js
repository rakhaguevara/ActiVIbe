import { prisma } from '../../config/prisma.js'
import { AppError } from '../../utils/AppError.js'
import { sendBroadcastEmail } from '../../utils/mailer.js'
import { getUserTier } from '../subscriptions/subscription.service.js'
import { LIMITS, startOfCurrentMonth } from '../subscriptions/plans.js'

// Communication Center broadcast (FR-041) — bagian "Compose Broadcast" di
// BroadcastView.tsx sebelumnya 100% mocked (tidak ada fetch/API sama sekali),
// lalu sempat dibangun minimal (kirim = cuma menulis baris CommunicationLog,
// tidak ada email beneran terkirim). Sekarang benar2 mengirim email ke
// volunteer yang cocok dgn target segment lewat sendBroadcastEmail() —
// Scheduled/Templates/Log view lain TETAP mock, di luar scope perubahan ini
// (PRD Section O2.5 sendiri bilang mulai dari versi dasar dulu; role/shift/
// requirement-belum-lengkap sbg target segment tambahan juga di luar scope).
function serializeBroadcast(log) {
  return {
    id: log.id,
    eventId: log.eventId,
    eventTitle: log.event?.title ?? null,
    title: log.title,
    message: log.message,
    targetSegment: log.targetSegment,
    deliveryChannel: log.deliveryChannel,
    recipientCount: log.recipientCount,
    sentAt: log.sentAt,
    sentByName: log.sentBy?.name ?? null,
  }
}

// "Semua Volunteer Diterima" = volunteer yang benar2 akan/sudah berpartisipasi
// (bukan sekadar APPLIED) — status set yang sama dipakai femaleAcceptedCountByEventId
// di event.service.js utk alasan yang sama (kekurangan overlap dgn niat asli
// "sudah beraktivitas", bukan sekadar mendaftar).
const ACTIVE_PARTICIPANT_STATUSES = ['ACCEPTED', 'CHECKED_IN', 'COMPLETED']

// targetSegment disimpan sbg label bebas (lihat komentar model di schema.prisma),
// bukan enum — cocokkan berdasar substring supaya frontend tidak perlu kirim
// value/key terpisah dari label yang sudah ditampilkan.
async function resolveRecipients(eventId, targetSegment) {
  const isAcceptedOnly = /diterima/i.test(targetSegment ?? '')
  const applications = await prisma.application.findMany({
    where: {
      eventId,
      ...(isAcceptedOnly ? { status: { in: ACTIVE_PARTICIPANT_STATUSES } } : {}),
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  })
  return applications
    .map((app) => app.user)
    .filter((user) => Boolean(user.email))
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
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, organizerId: true, title: true, organizer: { select: { name: true } } },
  })
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

  const event = await assertOwnsEvent(organizerId, eventId)

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

  const trimmedTitle = title.trim()
  const trimmedMessage = message.trim()
  const resolvedSegment = targetSegment?.trim() || 'Semua Volunteer Diterima'

  const recipients = await resolveRecipients(eventId, resolvedSegment)
  if (recipients.length === 0) {
    throw new AppError(400, 'Tidak ada volunteer yang cocok dengan target peserta ini untuk event tersebut.')
  }

  const organizerName = event.organizer?.name ?? 'Penyelenggara'
  // Fail-soft per penerima (sama prinsip dgn semua fungsi mailer.js lain) —
  // satu email gagal terkirim tidak boleh menggagalkan broadcast ke penerima
  // lainnya, jadi dikirim paralel & tidak menunggu/melempar per-kegagalan.
  await Promise.allSettled(
    recipients.map((recipient) =>
      sendBroadcastEmail(recipient.email, {
        volunteerName: recipient.name,
        eventTitle: event.title,
        organizerName,
        broadcastTitle: trimmedTitle,
        message: trimmedMessage,
      }),
    ),
  )

  const log = await prisma.communicationLog.create({
    data: {
      eventId,
      title: trimmedTitle,
      message: trimmedMessage,
      targetSegment: resolvedSegment,
      deliveryChannel: 'EMAIL',
      recipientCount: recipients.length,
      sentById: organizerId,
    },
    include: { event: { select: { title: true } }, sentBy: { select: { name: true } } },
  })

  await prisma.auditLog.create({
    data: {
      actorId: organizerId,
      action: 'Mengirim broadcast',
      targetType: 'Event',
      targetId: eventId,
      targetLabel: event.title,
      metadata: { recipientCount: recipients.length, targetSegment: resolvedSegment },
    },
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
