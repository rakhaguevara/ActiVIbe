import {
  listUsers,
  updateUserStatus,
  updateUserPassword,
  listEvents,
  approveEvent,
  rejectEvent,
  deleteEvent,
  listParticipation,
  listActivityLog,
  getOverviewStats,
  getRegionDistribution,
  buildDashboardSummary,
  listPrematureClosures,
  sendOrganizerWarning,
} from './admin.service.js'
import { chat as chatWithAdminAi } from './adminAi.service.js'

export async function overview(req, res, next) {
  try {
    const stats = await getOverviewStats()
    return res.json(stats)
  } catch (err) {
    next(err)
  }
}

export async function getOverviewRegions(req, res, next) {
  try {
    const data = await getRegionDistribution()
    return res.json(data)
  } catch (err) {
    next(err)
  }
}

export async function postAiChat(req, res, next) {
  try {
    const summary = await buildDashboardSummary()
    const result = await chatWithAdminAi(summary, req.body.messages)
    return res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function getUsers(req, res, next) {
  try {
    const users = await listUsers(req.query.role)
    return res.json({ users })
  } catch (err) {
    next(err)
  }
}

export async function patchUserStatus(req, res, next) {
  try {
    const user = await updateUserStatus(req.user.id, req.params.id, req.body.status)
    return res.json({ user })
  } catch (err) {
    next(err)
  }
}

export async function patchUserPassword(req, res, next) {
  try {
    const user = await updateUserPassword(req.user.id, req.params.id, req.body.password)
    return res.json({ user })
  } catch (err) {
    next(err)
  }
}

export async function getEvents(req, res, next) {
  try {
    const events = await listEvents(req.query.status)
    return res.json({ events })
  } catch (err) {
    next(err)
  }
}

export async function approve(req, res, next) {
  try {
    const event = await approveEvent(req.user.id, req.params.id, req.body.reviewNote)
    return res.json({ event })
  } catch (err) {
    next(err)
  }
}

export async function reject(req, res, next) {
  try {
    const event = await rejectEvent(req.user.id, req.params.id, req.body.reviewNote)
    return res.json({ event })
  } catch (err) {
    next(err)
  }
}

export async function remove(req, res, next) {
  try {
    await deleteEvent(req.user.id, req.params.id)
    return res.status(204).send()
  } catch (err) {
    next(err)
  }
}

export async function getParticipation(req, res, next) {
  try {
    const records = await listParticipation(req.query.from, req.query.to)
    return res.json({ records })
  } catch (err) {
    next(err)
  }
}

export async function getActivityLog(req, res, next) {
  try {
    const entries = await listActivityLog()
    return res.json({ entries })
  } catch (err) {
    next(err)
  }
}

export async function getPrematureClosures(req, res, next) {
  try {
    const events = await listPrematureClosures()
    return res.json({ events })
  } catch (err) {
    next(err)
  }
}

export async function postOrganizerWarning(req, res, next) {
  try {
    const event = await sendOrganizerWarning(req.user.id, req.params.eventId, req.body.message)
    return res.json({ event })
  } catch (err) {
    next(err)
  }
}
