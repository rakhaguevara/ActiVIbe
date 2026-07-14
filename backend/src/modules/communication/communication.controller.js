import { sendBroadcast, listBroadcasts, getBroadcastQuota } from './communication.service.js'

export async function postBroadcast(req, res, next) {
  try {
    const { eventId, title, message, targetSegment } = req.body
    const broadcast = await sendBroadcast(req.user.id, { eventId, title, message, targetSegment })
    return res.status(201).json({ broadcast })
  } catch (err) {
    next(err)
  }
}

export async function getBroadcasts(req, res, next) {
  try {
    const { eventId, from, to } = req.query
    const broadcasts = await listBroadcasts(req.user.id, { eventId, from, to })
    return res.json({ broadcasts })
  } catch (err) {
    next(err)
  }
}

export async function getQuota(req, res, next) {
  try {
    const quota = await getBroadcastQuota(req.user.id)
    return res.json({ quota })
  } catch (err) {
    next(err)
  }
}
