import { getMyPassport } from './passport.service.js'

export async function myPassport(req, res, next) {
  try {
    const passport = await getMyPassport(req.user.id)
    return res.json({ passport })
  } catch (err) {
    next(err)
  }
}
