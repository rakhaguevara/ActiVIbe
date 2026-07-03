import {
  createEvent,
  listMyEvents,
  getEventForOrganizer,
  addRole,
  addRequirement,
  closeEvent,
} from './event.service.js'

export async function create(req, res, next) {
  try {
    const event = await createEvent(req.user.id, req.body)
    return res.status(201).json({ event })
  } catch (err) {
    next(err)
  }
}

export async function listMine(req, res, next) {
  try {
    const events = await listMyEvents(req.user.id)
    return res.json({ events })
  } catch (err) {
    next(err)
  }
}

export async function getOne(req, res, next) {
  try {
    const event = await getEventForOrganizer(req.user.id, req.params.id)
    return res.json({ event })
  } catch (err) {
    next(err)
  }
}

export async function addRoleToEvent(req, res, next) {
  try {
    const role = await addRole(req.user.id, req.params.id, req.body)
    return res.status(201).json({ role })
  } catch (err) {
    next(err)
  }
}

export async function addRequirementToEvent(req, res, next) {
  try {
    const requirement = await addRequirement(req.user.id, req.params.id, req.body)
    return res.status(201).json({ requirement })
  } catch (err) {
    next(err)
  }
}

export async function close(req, res, next) {
  try {
    const event = await closeEvent(req.user.id, req.params.id, req.body)
    return res.json({ event })
  } catch (err) {
    next(err)
  }
}
