import { applyToEvent, getMyApplications } from './application.service.js'

export async function apply(req, res, next) {
  try {
    const { eventId, whatsapp, motivation, availability } = req.body
    const application = await applyToEvent({
      userId: req.user.id,
      eventId,
      whatsapp: whatsapp.trim(),
      motivation: motivation.trim(),
      availability,
    })
    return res.status(201).json({ application })
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: { message: err.message } })
    }
    next(err)
  }
}

export async function myApplications(req, res, next) {
  try {
    const applications = await getMyApplications(req.user.id)
    return res.json({ applications })
  } catch (err) {
    next(err)
  }
}
