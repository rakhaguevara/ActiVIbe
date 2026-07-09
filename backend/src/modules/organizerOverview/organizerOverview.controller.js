import { getOrganizerOverviewStats, buildOrganizerSummary } from './organizerOverview.service.js'
import { chat as chatWithOrganizerAi } from './organizerOverviewAi.service.js'

export async function overview(req, res, next) {
  try {
    const stats = await getOrganizerOverviewStats(req.user.id)
    return res.json(stats)
  } catch (err) {
    next(err)
  }
}

export async function postAiChat(req, res, next) {
  try {
    const summary = await buildOrganizerSummary(req.user.id)
    const result = await chatWithOrganizerAi(summary, req.body.messages)
    return res.json(result)
  } catch (err) {
    next(err)
  }
}
