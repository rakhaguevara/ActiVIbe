import { listKeys, createKey, revokeKey } from './apiKeys.service.js'

export async function list(req, res, next) {
  try {
    const apiKeys = await listKeys(req.user.id)
    return res.json({ apiKeys })
  } catch (err) {
    next(err)
  }
}

export async function create(req, res, next) {
  try {
    const { label } = req.body
    const apiKey = await createKey(req.user.id, { label })
    return res.status(201).json({ apiKey })
  } catch (err) {
    next(err)
  }
}

export async function revoke(req, res, next) {
  try {
    const apiKey = await revokeKey(req.user.id, req.params.id)
    return res.json({ apiKey })
  } catch (err) {
    next(err)
  }
}
