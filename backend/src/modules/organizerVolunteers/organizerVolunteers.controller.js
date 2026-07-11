import { getOrganizerVolunteers } from './organizerVolunteers.service.js'

export async function listVolunteers(req, res, next) {
  try {
    const data = await getOrganizerVolunteers(req.user.id)
    return res.json(data)
  } catch (err) {
    next(err)
  }
}
