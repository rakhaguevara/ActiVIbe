import {
  listUsers,
  updateUserStatus,
  updateUserPassword,
  deleteUser,
  listEvents,
  approveEvent,
  rejectEvent,
  deleteEvent,
  listParticipation,
  getParticipationByCategory,
  listActivityLog,
  getOverviewStats,
  getRegionDistribution,
  buildDashboardSummary,
  listPrematureClosures,
  sendOrganizerWarning,
  getRevenueSummary,
  listSubscriptions,
  adminSetSubscriptionTier,
  listCertificateTemplates,
  createCertificateTemplate,
  setActiveCertificateTemplate,
  deleteCertificateTemplate,
} from './admin.service.js'
import { chat as chatWithAdminAi, generateCampaignIdeas } from './adminAi.service.js'
import { buildAdminKnowledgeContext } from './adminKnowledge.service.js'

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
    const [summary, knowledge] = await Promise.all([
      buildDashboardSummary(),
      buildAdminKnowledgeContext(req.body.messages),
    ])
    const result = await chatWithAdminAi(summary, req.body.messages, knowledge)
    return res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function postCampaignIdeas(req, res, next) {
  try {
    const summary = await buildDashboardSummary()
    const result = await generateCampaignIdeas(summary)
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

export async function removeUser(req, res, next) {
  try {
    await deleteUser(req.user.id, req.params.id)
    return res.status(204).send()
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

export async function getParticipationCategories(req, res, next) {
  try {
    const categories = await getParticipationByCategory()
    return res.json({ categories })
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

export async function getRevenue(req, res, next) {
  try {
    const revenue = await getRevenueSummary()
    return res.json({ revenue })
  } catch (err) {
    next(err)
  }
}

export async function getSubscriptions(req, res, next) {
  try {
    const subscriptions = await listSubscriptions()
    return res.json({ subscriptions })
  } catch (err) {
    next(err)
  }
}

export async function patchSubscriptionTier(req, res, next) {
  try {
    const subscription = await adminSetSubscriptionTier(req.user.id, req.params.userId, req.body.tier)
    return res.json({ subscription })
  } catch (err) {
    next(err)
  }
}

export async function getCertificateTemplates(req, res, next) {
  try {
    const templates = await listCertificateTemplates()
    return res.json({ templates })
  } catch (err) {
    next(err)
  }
}

export async function postCertificateTemplate(req, res, next) {
  try {
    const template = await createCertificateTemplate(req.user.id, { name: req.body.name, file: req.file })
    return res.status(201).json({ template })
  } catch (err) {
    next(err)
  }
}

export async function patchCertificateTemplateActive(req, res, next) {
  try {
    await setActiveCertificateTemplate(req.user.id, req.params.id)
    return res.status(204).send()
  } catch (err) {
    next(err)
  }
}

export async function deleteCertificateTemplateRoute(req, res, next) {
  try {
    await deleteCertificateTemplate(req.user.id, req.params.id)
    return res.status(204).send()
  } catch (err) {
    next(err)
  }
}
