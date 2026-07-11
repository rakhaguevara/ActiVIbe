import crypto from 'crypto'
import QRCode from 'qrcode'
import { prisma } from '../../config/prisma.js'
import { AppError } from '../../utils/AppError.js'
import { sendEventTicketEmail, sendApplicationPendingEmail, sendApplicationAutoCancelledEmail } from '../../utils/mailer.js'

function generateTicketCode() {
  return `AV-${crypto.randomBytes(5).toString('hex').toUpperCase()}`
}

async function fetchApplicationEmailContext(userId, eventId) {
  const [user, event] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
    prisma.event.findUnique({
      where: { id: eventId },
      select: {
        title: true,
        location: true,
        startDate: true,
        endDate: true,
        organizer: { select: { name: true } },
        picName: true,
        picContact: true,
        picEmail: true,
      },
    }),
  ])
  if (!user?.email || !event) return null
  return { user, event }
}

// Fire-and-forget — kegagalan kirim email tidak boleh menggagalkan
// pendaftaran/perubahan status yang sudah tersimpan (pola sama dgn fallback AI provider).
async function sendApplicationReceivedEmail(userId, application) {
  const ctx = await fetchApplicationEmailContext(userId, application.eventId)
  if (!ctx) return

  await sendApplicationPendingEmail(ctx.user.email, {
    volunteerName: ctx.user.name,
    eventTitle: ctx.event.title,
    eventLocation: ctx.event.location,
    startDate: ctx.event.startDate,
    endDate: ctx.event.endDate,
    organizerName: ctx.event.organizer.name,
  })
}

async function sendApplicationTicketEmail(userId, application, qrBuffer) {
  const ctx = await fetchApplicationEmailContext(userId, application.eventId)
  if (!ctx) return

  await sendEventTicketEmail(ctx.user.email, {
    volunteerName: ctx.user.name,
    eventTitle: ctx.event.title,
    eventLocation: ctx.event.location,
    startDate: ctx.event.startDate,
    endDate: ctx.event.endDate,
    organizerName: ctx.event.organizer.name,
    ticketCode: application.ticketCode,
    qrBuffer,
    coordinatorName: ctx.event.picName,
    coordinatorPhone: ctx.event.picContact,
    coordinatorEmail: ctx.event.picEmail,
  })
}

// FR-006/007: mendaftar hanya membuat Application berstatus APPLIED (belum
// ada ticketCode/QR) + email konfirmasi "sedang ditinjau". Tiket digital
// (kode + QR yg bisa discan panitia utk check-in, FR-044) baru diterbitkan
// saat organizer menerima aplikasi ini (lihat updateApplicationStatus).
export async function applyToEvent({ userId, eventId, whatsapp, motivation, availability }) {
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { registrationClosedAt: true } })
  if (event?.registrationClosedAt) {
    const closedErr = new Error('Pendaftaran untuk kegiatan ini sudah ditutup oleh penyelenggara.')
    closedErr.statusCode = 409
    throw closedErr
  }

  let application
  try {
    application = await prisma.application.create({
      data: { userId, eventId, whatsapp, motivation, availability },
      select: {
        id: true,
        eventId: true,
        status: true,
        appliedAt: true,
        ticketCode: true,
      },
    })
  } catch (err) {
    // P2002 = unique constraint violation (sudah pernah mendaftar)
    if (err?.code === 'P2002') {
      const conflict = new Error('Kamu sudah mendaftar ke kegiatan ini.')
      conflict.statusCode = 409
      throw conflict
    }
    // P2003 = foreign key violation (eventId tidak ada di tabel Event)
    if (err?.code === 'P2003') {
      const notFound = new Error('Kegiatan tidak ditemukan.')
      notFound.statusCode = 404
      throw notFound
    }
    throw err
  }

  sendApplicationReceivedEmail(userId, application).catch((err) =>
    console.error('[applyToEvent] gagal mengirim email konfirmasi pendaftaran:', err),
  )

  return application
}

// Event di-embed langsung (bukan cuma eventId) supaya frontend tidak perlu
// join manual ke sumber data lain utk menampilkan riwayat pendaftaran — join
// manual ke mockEvents sebelumnya diam-diam membuang aplikasi yang eventId-nya
// tidak ada di data mock (bug), lihat ApplicationHistoryPage.tsx.
export async function getMyApplications(userId) {
  const applications = await prisma.application.findMany({
    where: { userId },
    select: {
      eventId: true,
      status: true,
      appliedAt: true,
      // Ticket code diekspos ke volunteer sendiri di sini (beda dari email
      // yang cuma dikirim sekali saat ACCEPTED) — supaya presensi kehadiran
      // tidak bergantung pada volunteer masih punya akses ke email tsb /
      // menunggu resend. null selama belum ACCEPTED (lihat updateApplicationStatus).
      ticketCode: true,
      feedback: { select: { id: true } },
      // null selama organizer belum generate sertifikat (lihat
      // backend/src/modules/certificates/certificate.service.js) — "Unduh
      // Sertifikat" di ApplicationHistoryPage.tsx cuma muncul kalau ini ada.
      certificate: {
        select: {
          currentVersion: true,
          versions: { orderBy: { version: 'desc' }, take: 1, select: { participantNameSnapshot: true, organizationLogoUrlSnapshot: true, template: { select: { fileUrl: true } } } },
        },
      },
      event: {
        select: {
          id: true,
          title: true,
          location: true,
          category: true,
          startDate: true,
          endDate: true,
          organizer: { select: { name: true } },
        },
      },
    },
    orderBy: { appliedAt: 'desc' },
  })
  return applications.map((app) => ({
    eventId: app.eventId,
    status: app.status,
    appliedAt: app.appliedAt,
    hasFeedback: app.feedback !== null,
    ticketCode: app.ticketCode,
    certificate: app.certificate
      ? {
          version: app.certificate.currentVersion,
          templateUrl: app.certificate.versions[0]?.template.fileUrl ?? null,
          participantName: app.certificate.versions[0]?.participantNameSnapshot ?? null,
          organizationLogoUrl: app.certificate.versions[0]?.organizationLogoUrlSnapshot ?? null,
        }
      : null,
    event: {
      id: app.event.id,
      title: app.event.title,
      location: app.event.location,
      category: app.event.category ?? 'Umum',
      organizerName: app.event.organizer.name,
      startDate: app.event.startDate.toISOString().slice(0, 10),
      endDate: app.event.endDate.toISOString().slice(0, 10),
    },
  }))
}

// ============================================
// Organizer-facing: sisi lain dari Application yang sama — bukan modul baru,
// karena "applicant" di dashboard organizer ya baris Application ini juga,
// cuma dibaca/diubah dari perspektif organizer bukan volunteer.
// ============================================

const APPLICANT_INCLUDE = {
  user: {
    include: {
      userSkills: { include: { skill: true } },
      userInterests: { include: { interest: true } },
    },
  },
  assignments: { orderBy: { assignedAt: 'desc' }, take: 1 },
  organizerNotes: { orderBy: { createdAt: 'asc' } },
  requirementStatuses: true,
}

// matchScore/matchReasoning sengaja tidak ada — itu FR-005 (Predictive Match
// Score AI), belum dibangun. Daripada dipalsukan, frontend menampilkan
// "Belum ada Match Score AI" saat field ini undefined.
function serializeApplicant(app, previousEventsCompleted) {
  const latestAssignment = app.assignments?.[0]
  const requirementStatuses = app.requirementStatuses ?? []
  let requirementStatus = 'not_started'
  if (requirementStatuses.length > 0) {
    if (requirementStatuses.every((r) => r.status === 'COMPLETED')) {
      requirementStatus = 'completed'
    } else if (requirementStatuses.some((r) => r.status !== 'NOT_STARTED')) {
      requirementStatus = 'in_progress'
    }
  }

  return {
    id: app.id,
    eventId: app.eventId,
    volunteerName: app.user.name,
    email: app.user.email ?? '',
    skills: (app.user.userSkills ?? []).map((us) => us.skill.name),
    interests: (app.user.userInterests ?? []).map((ui) => ui.interest.name),
    availability: app.availability,
    previousEventsCompleted,
    status: app.status.toLowerCase(),
    assignedRoleId: latestAssignment?.eventRoleId,
    assignedShiftId: latestAssignment?.eventShiftId,
    requirementStatus,
    notes: (app.organizerNotes ?? []).map((n) => n.note),
    appliedAt: app.appliedAt.toISOString().slice(0, 10),
  }
}

async function getApplicantDetail(applicationId) {
  const app = await prisma.application.findUniqueOrThrow({
    where: { id: applicationId },
    include: APPLICANT_INCLUDE,
  })
  const previousEventsCompleted = await prisma.application.count({
    where: { userId: app.userId, status: 'COMPLETED' },
  })
  return serializeApplicant(app, previousEventsCompleted)
}

async function assertOwnsEvent(organizerId, eventId) {
  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event || event.organizerId !== organizerId) {
    throw new AppError(404, 'Event tidak ditemukan')
  }
}

async function assertOwnsApplication(organizerId, applicationId) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { event: true },
  })
  if (!application || application.event.organizerId !== organizerId) {
    throw new AppError(404, 'Pendaftar tidak ditemukan')
  }
  return application
}

// Dua rentang tanggal [s1,e1] dan [s2,e2] overlap kalau s1<=e2 DAN s2<=e1 —
// dipakai baik utk cek konflik (assertNoDateConflict) maupun cascade batal
// (cancelOverlappingPendingApplications) di bawah, satu definisi "bentrok".
const OVERLAPPING_EVENT_FILTER = (startDate, endDate) => ({
  startDate: { lte: endDate },
  endDate: { gte: startDate },
})

// Dipanggil SEBELUM transisi ke ACCEPTED — cegah race condition (organizer
// lain coba ACCEPT aplikasi yang jadwalnya sudah bentrok dgn event lain yang
// SUDAH ACCEPTED duluan, mis. organizer belum refresh halaman).
async function assertNoDateConflict(application) {
  const conflict = await prisma.application.findFirst({
    where: {
      userId: application.userId,
      id: { not: application.id },
      status: { in: ['ACCEPTED', 'CHECKED_IN', 'COMPLETED'] },
      event: OVERLAPPING_EVENT_FILTER(application.event.startDate, application.event.endDate),
    },
    include: { event: true },
  })
  if (conflict) {
    throw new AppError(409, `Volunteer ini sudah diterima di event lain yang jadwalnya bentrok ("${conflict.event.title}")`)
  }
}

// Dipanggil SETELAH transisi ke ACCEPTED commit — batalkan aplikasi PENDING
// lain milik volunteer yang sama ke event yang tanggalnya bentrok dgn event
// yang baru di-accept ini. WAITLISTED ikut dibatalkan (bukan cuma APPLIED/
// UNDER_REVIEW) krn volunteer ini sudah pasti ambil event lain. Status
// CANCELLED_DATE_CONFLICT sengaja bukan CANCELLED_BY_ORGANIZER — organizer
// event yang dibatalkan ini tidak pernah menolak, sistem yang membatalkan.
async function cancelOverlappingPendingApplications(acceptedApplication) {
  const toCancel = await prisma.application.findMany({
    where: {
      userId: acceptedApplication.userId,
      id: { not: acceptedApplication.id },
      status: { in: ['APPLIED', 'UNDER_REVIEW', 'WAITLISTED'] },
      event: OVERLAPPING_EVENT_FILTER(acceptedApplication.event.startDate, acceptedApplication.event.endDate),
    },
    include: { user: true, event: true },
  })
  if (toCancel.length === 0) return

  await prisma.application.updateMany({
    where: { id: { in: toCancel.map((a) => a.id) } },
    data: { status: 'CANCELLED_DATE_CONFLICT' },
  })

  for (const app of toCancel) {
    if (!app.user.email) continue
    sendApplicationAutoCancelledEmail(app.user.email, {
      volunteerName: app.user.name,
      cancelledEventTitle: app.event.title,
      acceptedEventTitle: acceptedApplication.event.title,
    }).catch((err) => console.error('[cancelOverlappingPendingApplications] gagal mengirim email:', err))
  }
}

export async function listApplicantsForEvent(organizerId, eventId) {
  await assertOwnsEvent(organizerId, eventId)

  const applications = await prisma.application.findMany({
    where: { eventId },
    include: APPLICANT_INCLUDE,
    orderBy: { appliedAt: 'desc' },
  })

  const userIds = applications.map((a) => a.userId)
  const completedCounts = await prisma.application.groupBy({
    by: ['userId'],
    where: { userId: { in: userIds }, status: 'COMPLETED' },
    _count: { _all: true },
  })
  const completedByUser = new Map(completedCounts.map((c) => [c.userId, c._count._all]))

  return applications.map((app) => serializeApplicant(app, completedByUser.get(app.userId) ?? 0))
}

// FR-006/007: tiket+QR (kode unik, dipakai checkInByTicketCode) baru terbit
// begitu volunteer diterima — bukan saat apply — supaya applicant yang
// ditolak/di-waitlist tidak pernah punya tiket check-in yang valid.
export async function updateApplicationStatus(organizerId, applicationId, status) {
  const application = await assertOwnsApplication(organizerId, applicationId)
  const normalizedStatus = status.toUpperCase()

  if (normalizedStatus === 'ACCEPTED') {
    await assertNoDateConflict(application)
  }

  const data = { status: normalizedStatus }

  const shouldIssueTicket = normalizedStatus === 'ACCEPTED' && !application.ticketCode
  if (shouldIssueTicket) {
    data.ticketCode = generateTicketCode()
  }

  await prisma.application.update({ where: { id: applicationId }, data })

  if (normalizedStatus === 'ACCEPTED') {
    await cancelOverlappingPendingApplications(application)
  }

  if (shouldIssueTicket) {
    QRCode.toBuffer(data.ticketCode, { type: 'png' })
      .then((qrBuffer) =>
        sendApplicationTicketEmail(application.userId, { eventId: application.eventId, ticketCode: data.ticketCode }, qrBuffer),
      )
      .catch((err) => console.error('[updateApplicationStatus] gagal mengirim email tiket:', err))
  }

  const detail = await getApplicantDetail(applicationId)

  // Dicatat utk "Recent Activity" dashboard organizer (FR-052) — hanya
  // transisi accept/reject yg dianggap "aktivitas penting" (bukan tiap
  // perubahan status kecil spt UNDER_REVIEW), sama spt admin cuma mencatat
  // approve/reject event, bukan tiap perubahan.
  if (normalizedStatus === 'ACCEPTED' || normalizedStatus === 'REJECTED') {
    await prisma.auditLog.create({
      data: {
        actorId: organizerId,
        action: normalizedStatus === 'ACCEPTED' ? 'Menerima pendaftar' : 'Menolak pendaftar',
        targetType: 'Application',
        targetId: applicationId,
        targetLabel: detail.volunteerName,
      },
    })
  }

  return detail
}

export async function addOrganizerNote(organizerId, applicationId, note) {
  await assertOwnsApplication(organizerId, applicationId)
  await prisma.organizerNote.create({
    data: { organizerId, applicationId, note: note.trim() },
  })
  return getApplicantDetail(applicationId)
}

export async function assignApplicant(organizerId, applicationId, eventRoleId, eventShiftId) {
  await assertOwnsApplication(organizerId, applicationId)
  await prisma.volunteerAssignment.upsert({
    where: { applicationId_eventShiftId: { applicationId, eventShiftId } },
    update: { eventRoleId, assignedById: organizerId },
    create: { applicationId, eventRoleId, eventShiftId, assignedById: organizerId },
  })
  return getApplicantDetail(applicationId)
}

// ============================================
// Attendance / check-in (FR-044-046) — pakai VolunteerAssignment sbg roster
// "expected" (siapa yang dijadwalkan di shift mana) dan AttendanceLog sbg
// bukti kehadiran nyata; Application.status tetap sumber kebenaran status
// (CHECKED_IN/NO_SHOW) krn dipakai luas di tempat lain (close event, dst).
// ============================================

async function assertOwnsAssignment(organizerId, assignmentId) {
  const assignment = await prisma.volunteerAssignment.findUnique({
    where: { id: assignmentId },
    include: { eventShift: { include: { eventRole: true } } },
  })
  if (!assignment || !assignment.eventShift?.eventRole) {
    throw new AppError(404, 'Assignment tidak ditemukan')
  }
  const event = await prisma.event.findUnique({ where: { id: assignment.eventShift.eventRole.eventId } })
  if (!event || event.organizerId !== organizerId) {
    throw new AppError(404, 'Assignment tidak ditemukan')
  }
  return { assignment, eventId: event.id }
}

export async function checkInAssignment(organizerId, assignmentId, method) {
  const { assignment, eventId } = await assertOwnsAssignment(organizerId, assignmentId)

  const [log] = await prisma.$transaction([
    prisma.attendanceLog.create({
      data: {
        applicationId: assignment.applicationId,
        eventRoleId: assignment.eventRoleId,
        eventShiftId: assignment.eventShiftId,
        method: method.toUpperCase(),
        checkedById: organizerId,
      },
    }),
    prisma.application.update({ where: { id: assignment.applicationId }, data: { status: 'CHECKED_IN' } }),
  ])

  return {
    id: assignment.id,
    applicantId: assignment.applicationId,
    eventId,
    shiftId: assignment.eventShiftId,
    status: 'checked_in',
    checkedInAt: log.checkedInAt.toISOString(),
    method: log.method.toLowerCase(),
  }
}

export async function markAssignmentNoShow(organizerId, assignmentId) {
  const { assignment, eventId } = await assertOwnsAssignment(organizerId, assignmentId)
  await prisma.application.update({ where: { id: assignment.applicationId }, data: { status: 'NO_SHOW' } })

  return {
    id: assignment.id,
    applicantId: assignment.applicationId,
    eventId,
    shiftId: assignment.eventShiftId,
    status: 'no_show',
  }
}

// Check-in langsung lewat kode tiket (FR-044) — beda dari checkInAssignment()
// di atas krn tidak butuh VolunteerAssignment (role/shift opsional per event,
// lihat event.service.js createEvent). Kalau applicant kebetulan sudah py
// assignment, eventRoleId/eventShiftId ikut dicatat di AttendanceLog; kalau
// tidak, keduanya null (kolom ini memang nullable).
export async function checkInByTicketCode(organizerId, ticketCode, method = 'QR') {
  const application = await prisma.application.findUnique({
    where: { ticketCode },
    include: {
      event: true,
      assignments: { orderBy: { assignedAt: 'desc' }, take: 1 },
    },
  })
  if (!application || application.event.organizerId !== organizerId) {
    throw new AppError(404, 'Tiket tidak ditemukan')
  }
  if (['CHECKED_IN', 'COMPLETED', 'NO_SHOW'].includes(application.status)) {
    throw new AppError(409, 'Volunteer ini sudah tercatat sebelumnya')
  }

  const latestAssignment = application.assignments[0]

  const [log] = await prisma.$transaction([
    prisma.attendanceLog.create({
      data: {
        applicationId: application.id,
        eventRoleId: latestAssignment?.eventRoleId ?? null,
        eventShiftId: latestAssignment?.eventShiftId ?? null,
        method: method.toUpperCase(),
        checkedById: organizerId,
      },
    }),
    prisma.application.update({ where: { id: application.id }, data: { status: 'CHECKED_IN' } }),
  ])

  return {
    applicationId: application.id,
    eventId: application.eventId,
    status: 'checked_in',
    checkedInAt: log.checkedInAt.toISOString(),
    method: log.method.toLowerCase(),
  }
}
