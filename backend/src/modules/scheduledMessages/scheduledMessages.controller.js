import {
  listScheduledMessages,
  createScheduledMessage,
  cancelScheduledMessage,
  sendScheduledMessageNow,
} from './scheduledMessages.service.js'

export async function list(req, res, next) {
  try {
    const scheduledMessages = await listScheduledMessages(req.user.id)
    return res.json({ scheduledMessages })
  } catch (err) {
    next(err)
  }
}

export async function create(req, res, next) {
  try {
    const { eventId, title, message, targetSegment, sendAt } = req.body
    const scheduledMessage = await createScheduledMessage(req.user.id, { eventId, title, message, targetSegment, sendAt })
    return res.status(201).json({ scheduledMessage })
  } catch (err) {
    next(err)
  }
}

export async function cancel(req, res, next) {
  try {
    const scheduledMessage = await cancelScheduledMessage(req.user.id, req.params.id)
    return res.json({ scheduledMessage })
  } catch (err) {
    next(err)
  }
}

export async function sendNow(req, res, next) {
  try {
    const scheduledMessage = await sendScheduledMessageNow(req.user.id, req.params.id)
    return res.json({ scheduledMessage })
  } catch (err) {
    next(err)
  }
}
