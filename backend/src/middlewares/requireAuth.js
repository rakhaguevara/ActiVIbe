import { getUserFromAccessToken } from '../modules/auth/auth.service.js'

export async function requireAuth(req, res, next) {
  const accessToken = req.cookies?.accessToken
  if (!accessToken) {
    return res.status(401).json({ error: { message: 'Tidak ada sesi aktif' } })
  }

  const user = await getUserFromAccessToken(accessToken)
  if (!user) {
    return res.status(401).json({ error: { message: 'Sesi tidak valid' } })
  }

  req.user = user
  next()
}
