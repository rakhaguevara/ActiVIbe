import { sanitizeSlot } from '../utils/sessionSlot.js'

export function sessionSlot(req, res, next) {
  req.sessionSlot = sanitizeSlot(req.get('x-session-slot'))
  next()
}
