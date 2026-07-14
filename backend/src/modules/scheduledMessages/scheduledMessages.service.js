import { prisma } from '../../config/prisma.js'
import { AppError } from '../../utils/AppError.js'
import { ensureOrganizationForOwner } from '../organizations/organization.service.js'
import { dispatchMessage } from '../communication/communication.service.js'

function serializeScheduledMessage(row) {
  return {
    id: row.id,
    eventId: row.eventId,
    eventTitle: row.event?.title ?? null,
    title: row.title,
    message: row.message,
    targetSegment: row.targetSegment,
    sendAt: row.sendAt,
    status: row.status,
    sentCommunicationLogId: row.sentCommunicationLogId,
    createdByName: row.createdBy?.name ?? null,
    createdAt: row.createdAt,
  }
}

// Sama pola "ambil org pertama" yang dipakai messageTemplates/subOrganizer
// service.js.
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

async function assertOwnsScheduledMessage(organizerId, id) {
  const organizationId = await resolveOrganizationId(organizerId)
  const row = await prisma.scheduledMessage.findUnique({ where: { id } })
  if (!row || row.organizationId !== organizationId) {
    throw new AppError(404, 'Pesan terjadwal tidak ditemukan')
  }
  return row
}

export async function listScheduledMessages(organizerId) {
  const organizationId = await resolveOrganizationId(organizerId)
  const rows = await prisma.scheduledMessage.findMany({
    where: { organizationId },
    include: { event: { select: { title: true } }, createdBy: { select: { name: true } } },
    orderBy: { sendAt: 'asc' },
  })
  return rows.map(serializeScheduledMessage)
}

export async function createScheduledMessage(organizerId, { eventId, title, message, targetSegment, sendAt }) {
  if (!eventId || typeof eventId !== 'string') {
    throw new AppError(400, 'Target event wajib dipilih')
  }
  if (!title || typeof title !== 'string' || !title.trim()) {
    throw new AppError(400, 'Judul pesan wajib diisi')
  }
  if (!message || typeof message !== 'string' || !message.trim()) {
    throw new AppError(400, 'Isi pesan wajib diisi')
  }
  if (!sendAt) {
    throw new AppError(400, 'Waktu pengiriman wajib diisi')
  }
  const sendAtDate = new Date(sendAt)
  if (Number.isNaN(sendAtDate.getTime())) {
    throw new AppError(400, 'Waktu pengiriman tidak valid')
  }
  if (sendAtDate.getTime() <= Date.now()) {
    throw new AppError(400, 'Waktu pengiriman harus di masa depan')
  }

  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true, organizerId: true } })
  if (!event || event.organizerId !== organizerId) {
    throw new AppError(404, 'Event tidak ditemukan')
  }

  const organizationId = await resolveOrganizationId(organizerId)
  const resolvedSegment = targetSegment?.trim() || 'Semua Volunteer Diterima'

  const row = await prisma.scheduledMessage.create({
    data: {
      organizationId,
      eventId,
      title: title.trim(),
      message: message.trim(),
      targetSegment: resolvedSegment,
      sendAt: sendAtDate,
      createdById: organizerId,
    },
    include: { event: { select: { title: true } }, createdBy: { select: { name: true } } },
  })
  return serializeScheduledMessage(row)
}

export async function cancelScheduledMessage(organizerId, id) {
  const row = await assertOwnsScheduledMessage(organizerId, id)
  if (row.status !== 'SCHEDULED') {
    throw new AppError(400, 'Cuma pesan berstatus Scheduled yang bisa dibatalkan')
  }
  const updated = await prisma.scheduledMessage.update({
    where: { id },
    data: { status: 'CANCELLED' },
    include: { event: { select: { title: true } }, createdBy: { select: { name: true } } },
  })
  return serializeScheduledMessage(updated)
}

// Dipakai baik tombol "Send Now" (organizer, sinkron dgn respons HTTP) maupun
// poller (unattended, lihat startScheduledMessagePoller di bawah) — makanya
// dipisah dari sendNow() yang butuh assertOwnsScheduledMessage/pengecekan
// status SCHEDULED dulu sebelum manggil ini.
export async function dispatchScheduledMessage(scheduledMessage) {
  try {
    const log = await dispatchMessage({
      eventId: scheduledMessage.eventId,
      title: scheduledMessage.title,
      message: scheduledMessage.message,
      targetSegment: scheduledMessage.targetSegment,
      sentById: scheduledMessage.createdById,
    })
    await prisma.scheduledMessage.update({
      where: { id: scheduledMessage.id },
      data: { status: 'SENT', sentCommunicationLogId: log.id },
    })
  } catch (err) {
    // Dipanggil unattended dari poller — tidak boleh melempar lebih jauh
    // (bakal bikin poller berhenti / unhandled rejection), cukup tandai
    // FAILED supaya organizer bisa lihat di ScheduledMessagesView & retry manual.
    console.error(`[scheduledMessages] Gagal dispatch pesan terjadwal ${scheduledMessage.id}:`, err.message ?? err)
    await prisma.scheduledMessage.update({
      where: { id: scheduledMessage.id },
      data: { status: 'FAILED' },
    }).catch(() => {})
  }
}

export async function sendScheduledMessageNow(organizerId, id) {
  const row = await assertOwnsScheduledMessage(organizerId, id)
  if (row.status !== 'SCHEDULED') {
    throw new AppError(400, 'Cuma pesan berstatus Scheduled yang bisa dikirim sekarang')
  }
  await dispatchScheduledMessage(row)
  const updated = await prisma.scheduledMessage.findUnique({
    where: { id },
    include: { event: { select: { title: true } }, createdBy: { select: { name: true } } },
  })
  return serializeScheduledMessage(updated)
}

// setInterval, BUKAN node-cron — repo ini belum punya precedent dependency
// cron sama sekali, aplikasinya single-instance (satu proses Node, bukan
// horizontal-scaled), jadi polling sederhana tiap 60 detik sudah cukup utk
// dispatch nyata tanpa menambah dependency baru yang tidak proporsional dgn
// kebutuhan (lihat juga komentar model ScheduledMessage di schema.prisma).
export function startScheduledMessagePoller() {
  const POLL_INTERVAL_MS = 60_000
  setInterval(async () => {
    try {
      const due = await prisma.scheduledMessage.findMany({
        where: { status: 'SCHEDULED', sendAt: { lte: new Date() } },
      })
      for (const row of due) {
        await dispatchScheduledMessage(row)
      }
    } catch (err) {
      console.error('[scheduledMessages] Poller gagal jalan:', err.message ?? err)
    }
  }, POLL_INTERVAL_MS)
  console.log('[scheduledMessages] Poller pesan terjadwal aktif (interval 60 detik).')
}
