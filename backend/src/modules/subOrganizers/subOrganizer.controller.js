import {
  listSubOrganizers,
  createSubOrganizer,
  updateSubOrganizer,
  deleteSubOrganizer,
} from './subOrganizer.service.js'

export async function list(req, res, next) {
  try {
    const subOrganizers = await listSubOrganizers(req.user.id)
    return res.json({ subOrganizers })
  } catch (err) {
    next(err)
  }
}

export async function create(req, res, next) {
  try {
    const { name, email, whatsapp, title } = req.body
    const subOrganizer = await createSubOrganizer(req.user.id, { name, email, whatsapp, title })
    return res.status(201).json({ subOrganizer })
  } catch (err) {
    next(err)
  }
}

export async function update(req, res, next) {
  try {
    const { name, email, whatsapp, title } = req.body
    const subOrganizer = await updateSubOrganizer(req.user.id, req.params.id, { name, email, whatsapp, title })
    return res.json({ subOrganizer })
  } catch (err) {
    next(err)
  }
}

export async function remove(req, res, next) {
  try {
    await deleteSubOrganizer(req.user.id, req.params.id)
    return res.status(204).send()
  } catch (err) {
    next(err)
  }
}
