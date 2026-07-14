import { getOrganizerOverviewStats, buildOrganizerSummary, acknowledgeOrganizerWarning } from './organizerOverview.service.js'
import { chat as chatWithOrganizerAi, generateGrowthIdeas } from './organizerOverviewAi.service.js'
import { buildOrganizerKnowledgeContext } from './organizerKnowledge.service.js'

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
    const [summary, knowledge] = await Promise.all([
      buildOrganizerSummary(req.user.id),
      buildOrganizerKnowledgeContext(req.user.id, req.body.messages),
    ])
    const result = await chatWithOrganizerAi(summary, req.body.messages, knowledge)
    return res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function postGrowthIdeas(req, res, next) {
  try {
    const summary = await buildOrganizerSummary(req.user.id)
    const result = await generateGrowthIdeas(summary)
    return res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function acknowledgeWarning(req, res, next) {
  try {
    await acknowledgeOrganizerWarning(req.user.id, req.params.id)
    return res.status(204).send()
  } catch (err) {
    next(err)
  }
}
