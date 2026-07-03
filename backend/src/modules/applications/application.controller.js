import {
  applyToEvent,
  getMyApplications,
  listApplicantsForEvent,
  updateApplicationStatus,
  addOrganizerNote,
  assignApplicant,
} from './application.service.js'

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

export async function listForEvent(req, res, next) {
  try {
    const applicants = await listApplicantsForEvent(req.user.id, req.params.eventId)
    return res.json({ applicants })
  } catch (err) {
    next(err)
  }
}

export async function updateStatus(req, res, next) {
  try {
    const applicant = await updateApplicationStatus(req.user.id, req.params.id, req.body.status)
    return res.json({ applicant })
  } catch (err) {
    next(err)
  }
}

export async function addNote(req, res, next) {
  try {
    const applicant = await addOrganizerNote(req.user.id, req.params.id, req.body.note)
    return res.status(201).json({ applicant })
  } catch (err) {
    next(err)
  }
}

export async function assign(req, res, next) {
  try {
    const { eventRoleId, eventShiftId } = req.body
    const applicant = await assignApplicant(req.user.id, req.params.id, eventRoleId, eventShiftId)
    return res.json({ applicant })
  } catch (err) {
    next(err)
  }
}
