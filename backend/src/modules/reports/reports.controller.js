import { getReportsOverview, getEventBreakdown, getGlobalSearch } from './reports.service.js'

export async function overview(req, res, next) {
  try {
    const { from, to } = req.query
    const report = await getReportsOverview(req.user.id, { from, to })
    return res.json(report)
  } catch (err) {
    next(err)
  }
}

export async function eventBreakdown(req, res, next) {
  try {
    const { from, to } = req.query
    const rows = await getEventBreakdown(req.user.id, { from, to })
    return res.json({ rows })
  } catch (err) {
    next(err)
  }
}

export async function search(req, res, next) {
  try {
    const result = await getGlobalSearch(req.user.id, req.query.q)
    return res.json(result)
  } catch (err) {
    next(err)
  }
}
