import {
  listMessageTemplates,
  createMessageTemplate,
  updateMessageTemplate,
  duplicateMessageTemplate,
  deleteMessageTemplate,
} from './messageTemplates.service.js'

export async function list(req, res, next) {
  try {
    const templates = await listMessageTemplates(req.user.id)
    return res.json({ templates })
  } catch (err) {
    next(err)
  }
}

export async function create(req, res, next) {
  try {
    const { name, category, subject, body } = req.body
    const template = await createMessageTemplate(req.user.id, { name, category, subject, body })
    return res.status(201).json({ template })
  } catch (err) {
    next(err)
  }
}

export async function update(req, res, next) {
  try {
    const { name, category, subject, body } = req.body
    const template = await updateMessageTemplate(req.user.id, req.params.id, { name, category, subject, body })
    return res.json({ template })
  } catch (err) {
    next(err)
  }
}

export async function duplicate(req, res, next) {
  try {
    const template = await duplicateMessageTemplate(req.user.id, req.params.id)
    return res.status(201).json({ template })
  } catch (err) {
    next(err)
  }
}

export async function remove(req, res, next) {
  try {
    await deleteMessageTemplate(req.user.id, req.params.id)
    return res.status(204).send()
  } catch (err) {
    next(err)
  }
}
