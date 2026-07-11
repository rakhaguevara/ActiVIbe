import { prisma } from '../../config/prisma.js'

const ACTIVE_EVENT_STATUSES = ['PUBLISHED', 'ONGOING']
const EXPECTED_ATTENDANCE_STATUSES = ['accepted', 'checked_in', 'completed', 'no_show']
const ATTENDED_STATUSES = ['checked_in', 'completed']
const MONTH_LABELS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

// Sama teknik dgn passport.service.js (durasi event dlm jam) — diduplikasi
// lokal krn cuma beberapa baris, pola sama dgn monthKey di organizerOverview.service.js.
function eventHours(startDate, endDate) {
  const ms = new Date(endDate).getTime() - new Date(startDate).getTime()
  return ms / (1000 * 60 * 60)
}

function formatShiftLabel(shift) {
  if (!shift) return null
  const date = shift.shiftDate.toISOString().slice(0, 10)
  const start = shift.startTime.toISOString().slice(11, 16)
  const end = shift.endTime.toISOString().slice(11, 16)
  return `${date} (${start} - ${end})`
}

function initialsFromName(name) {
  return (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function monthKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}`
}

async function loadOrganizerEvents(organizerId) {
  return prisma.event.findMany({
    where: { organizerId },
    select: { id: true, title: true, status: true, category: true, location: true, startDate: true, endDate: true },
  })
}

async function loadApplications(eventIds) {
  if (eventIds.length === 0) return []
  return prisma.application.findMany({
    where: { eventId: { in: eventIds } },
    include: {
      user: { include: { userSkills: { include: { skill: true } }, profile: true } },
      assignments: { orderBy: { assignedAt: 'desc' }, take: 1, include: { eventRole: true, eventShift: true } },
      requirementStatuses: true,
      certificate: true,
      attendanceLogs: { orderBy: { checkedInAt: 'desc' }, take: 1 },
    },
    orderBy: { appliedAt: 'desc' },
  })
}

// Satu baris Application per event -> dikelompokkan jadi satu "volunteer"
// (userId) yang bisa punya banyak applications lintas event organizer ini.
function buildVolunteers(applications, eventsById) {
  const byUser = new Map()

  for (const app of applications) {
    const event = eventsById.get(app.eventId)
    if (!event) continue

    if (!byUser.has(app.userId)) {
      byUser.set(app.userId, {
        id: app.userId,
        name: app.user.name,
        email: app.user.email ?? '',
        phone: app.user.phone ?? null,
        location: app.user.profile?.location ?? null,
        bio: app.user.profile?.bio ?? null,
        skillSet: new Set(),
        applications: [],
      })
    }

    const vol = byUser.get(app.userId)
    for (const us of app.user.userSkills ?? []) vol.skillSet.add(us.skill.name)

    const latestAssignment = app.assignments?.[0]
    const requirementStatuses = app.requirementStatuses ?? []
    const requirementsTotal = requirementStatuses.length
    const requirementsCompleted = requirementStatuses.filter((r) => r.status === 'COMPLETED').length
    const latestAttendance = app.attendanceLogs?.[0]

    vol.applications.push({
      applicationId: app.id,
      eventId: app.eventId,
      eventTitle: event.title,
      eventLocation: event.location,
      eventStatus: event.status.toLowerCase(),
      status: app.status.toLowerCase(),
      appliedAt: app.appliedAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
      assignedRoleName: latestAssignment?.eventRole?.roleName ?? null,
      assignedShiftLabel: formatShiftLabel(latestAssignment?.eventShift ?? null),
      assignedShiftStart: latestAssignment?.eventShift?.startTime?.toISOString() ?? null,
      requirementsCompleted,
      requirementsTotal,
      checkedInAt: latestAttendance?.checkedInAt?.toISOString() ?? null,
      certificateIssued: Boolean(app.certificate),
      hoursForThisEvent: Math.round(eventHours(event.startDate, event.endDate) * 10) / 10,
    })
  }

  return Array.from(byUser.values()).map((v) => {
    const completedApps = v.applications.filter((a) => a.status === 'completed')
    const noShowApps = v.applications.filter((a) => a.status === 'no_show')
    const expectedApps = v.applications.filter((a) => EXPECTED_ATTENDANCE_STATUSES.includes(a.status))
    const attendedApps = v.applications.filter((a) => ATTENDED_STATUSES.includes(a.status))
    const hoursCompleted = completedApps.reduce((sum, a) => sum + a.hoursForThisEvent, 0)
    const attendanceRatePercent =
      expectedApps.length > 0 ? Math.round((attendedApps.length / expectedApps.length) * 100) : null
    // Proxy deterministik (bukan rating asli — tidak ada konsep organizer
    // menilai volunteer di schema) — pola sama spt formula poin Impact Passport.
    const ratingProxy = attendanceRatePercent != null ? Math.min(5, Math.max(1, Math.round(attendanceRatePercent / 20))) : null
    const lastActivityAt = v.applications.reduce(
      (latest, a) => (!latest || a.updatedAt > latest ? a.updatedAt : latest),
      null,
    )

    return {
      id: v.id,
      name: v.name,
      email: v.email,
      phone: v.phone,
      avatarInitials: initialsFromName(v.name),
      location: v.location,
      bio: v.bio,
      skills: Array.from(v.skillSet),
      eventsJoined: v.applications.length,
      hoursCompleted: Math.round(hoursCompleted * 10) / 10,
      attendanceRatePercent,
      ratingProxy,
      returningVolunteer: completedApps.length >= 2,
      noShowCount: noShowApps.length,
      lastActivityAt,
      applications: v.applications,
    }
  })
}

function computeKpis(volunteers) {
  const totalVolunteers = volunteers.length
  const currentlyActive = volunteers.filter((v) =>
    v.applications.some((a) => ['accepted', 'checked_in'].includes(a.status) && ACTIVE_EVENT_STATUSES.map((s) => s.toLowerCase()).includes(a.eventStatus)),
  ).length
  const completedEventParticipations = volunteers.reduce(
    (sum, v) => sum + v.applications.filter((a) => a.status === 'completed').length,
    0,
  )
  const withAttendance = volunteers.filter((v) => v.attendanceRatePercent !== null)
  const averageAttendancePercent =
    withAttendance.length > 0
      ? Math.round(withAttendance.reduce((sum, v) => sum + v.attendanceRatePercent, 0) / withAttendance.length)
      : null
  // Ganti "Top Rated Volunteers" — pakai ambang yang sama dgn badge "Veteran
  // Volunteer" di CompletedVolunteersView (hours > 200) supaya angka KPI dan
  // badge di tabel konsisten.
  const veteranVolunteers = volunteers.filter((v) => v.hoursCompleted > 200).length
  const returningCount = volunteers.filter((v) => v.returningVolunteer).length
  const returningVolunteersPercent = totalVolunteers > 0 ? Math.round((returningCount / totalVolunteers) * 100) : null

  return {
    totalVolunteers,
    currentlyActive,
    completedEventParticipations,
    averageAttendancePercent,
    veteranVolunteers,
    returningVolunteersPercent,
  }
}

function computeSkillDistribution(volunteers) {
  const counts = new Map()
  for (const v of volunteers) {
    for (const skill of v.skills) {
      counts.set(skill, (counts.get(skill) ?? 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

async function getRecentActivity(organizerId, eventIds) {
  const [auditLogs, attendanceLogs, certificates] = await Promise.all([
    prisma.auditLog.findMany({ where: { actorId: organizerId }, orderBy: { createdAt: 'desc' }, take: 6 }),
    eventIds.length
      ? prisma.attendanceLog.findMany({
          where: { application: { eventId: { in: eventIds } } },
          include: { application: { include: { user: { select: { name: true } } } } },
          orderBy: { checkedInAt: 'desc' },
          take: 6,
        })
      : [],
    eventIds.length
      ? prisma.certificate.findMany({
          where: { eventId: { in: eventIds } },
          include: { application: { include: { user: { select: { name: true } } } } },
          orderBy: { issuedAt: 'desc' },
          take: 6,
        })
      : [],
  ])

  const items = [
    ...auditLogs.map((l) => ({
      id: `audit-${l.id}`,
      text: `${l.targetLabel ?? 'Volunteer'} — ${l.action}`,
      timestamp: l.createdAt,
    })),
    ...attendanceLogs.map((l) => ({
      id: `attendance-${l.id}`,
      text: `${l.application.user.name} checked in`,
      timestamp: l.checkedInAt,
    })),
    ...certificates.map((c) => ({
      id: `cert-${c.id}`,
      text: `${c.application.user.name} received a certificate`,
      timestamp: c.issuedAt,
    })),
  ]

  return items
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 6)
    .map((i) => ({ id: i.id, text: i.text, timestamp: i.timestamp.toISOString() }))
}

async function getNoShowTrend(eventIds) {
  const now = new Date()
  const months = []
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ key: monthKey(d), label: MONTH_LABELS_ID[d.getMonth()] })
  }
  if (eventIds.length === 0) {
    return { months: months.map((m) => m.label), counts: months.map(() => 0) }
  }

  const rangeStart = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  const noShows = await prisma.application.findMany({
    where: { eventId: { in: eventIds }, status: 'NO_SHOW', updatedAt: { gte: rangeStart } },
    select: { updatedAt: true },
  })

  const byMonth = new Map(months.map((m) => [m.key, 0]))
  for (const app of noShows) {
    const key = monthKey(app.updatedAt)
    if (byMonth.has(key)) byMonth.set(key, byMonth.get(key) + 1)
  }

  return { months: months.map((m) => m.label), counts: months.map((m) => byMonth.get(m.key)) }
}

// "AI Recommendations" — deterministik, rule-based (bukan panggilan AI),
// arah kebalikan FR-005 (volunteer -> event, bukan event -> volunteer):
// overlap skill/interest volunteer thd kebutuhan event mendatang organizer
// ini sendiri, dari pool volunteer yang sudah pernah mendaftar ke organizer
// ini. Kosong kalau tidak ada event mendatang atau tidak ada overlap sama
// sekali — TIDAK pernah diisi placeholder karangan (lihat prinsip FR-005
// "Belum ada Match Score AI").
async function computeRecommendations(events, volunteers) {
  const now = new Date()
  const upcomingEvents = events.filter((e) => ACTIVE_EVENT_STATUSES.includes(e.status) && new Date(e.startDate) >= now)
  if (upcomingEvents.length === 0 || volunteers.length === 0) return []

  const eventIds = upcomingEvents.map((e) => e.id)
  const eventsWithTags = await prisma.event.findMany({
    where: { id: { in: eventIds } },
    select: {
      id: true,
      title: true,
      eventSkills: { include: { skill: true } },
      eventInterests: { include: { interest: true } },
    },
  })

  const recommendations = []
  for (const event of eventsWithTags) {
    const neededTags = new Set([
      ...event.eventSkills.map((es) => es.skill.name.toLowerCase()),
      ...event.eventInterests.map((ei) => ei.interest.name.toLowerCase()),
    ])
    if (neededTags.size === 0) continue

    for (const vol of volunteers) {
      const alreadyInvolved = vol.applications.some(
        (a) => a.eventId === event.id && ['accepted', 'checked_in', 'completed'].includes(a.status),
      )
      if (alreadyInvolved) continue

      const volTags = new Set(vol.skills.map((s) => s.toLowerCase()))
      const matched = Array.from(neededTags).filter((t) => volTags.has(t))
      if (matched.length === 0) continue

      const matchPercent = Math.round((matched.length / neededTags.size) * 100)
      recommendations.push({
        volunteerId: vol.id,
        volunteerName: vol.name,
        eventId: event.id,
        eventTitle: event.title,
        matchPercent,
        reasoning: `${vol.name} cocok dengan kebutuhan ${matched.slice(0, 2).join(', ')} pada ${event.title}.`,
      })
    }
  }

  return recommendations.sort((a, b) => b.matchPercent - a.matchPercent).slice(0, 4)
}

export async function getOrganizerVolunteers(organizerId) {
  const events = await loadOrganizerEvents(organizerId)
  const eventIds = events.map((e) => e.id)
  const eventsById = new Map(events.map((e) => [e.id, e]))

  const applications = await loadApplications(eventIds)
  const volunteers = buildVolunteers(applications, eventsById)

  const [recentActivity, noShowTrend, recommendations] = await Promise.all([
    getRecentActivity(organizerId, eventIds),
    getNoShowTrend(eventIds),
    computeRecommendations(events, volunteers),
  ])

  return {
    volunteers,
    kpis: computeKpis(volunteers),
    skillDistribution: computeSkillDistribution(volunteers),
    recentActivity,
    noShowTrend,
    recommendations,
  }
}
