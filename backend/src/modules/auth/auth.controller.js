import { registerUser, loginUser, getUserFromAccessToken, logoutUser } from './auth.service.js'
import { env } from '../../config/env.js'

const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000

function setAuthCookies(res, { accessToken, refreshToken }) {
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
  }

  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: ACCESS_COOKIE_MAX_AGE })
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: REFRESH_COOKIE_MAX_AGE })
}

export async function register(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await registerUser(req.body)
    setAuthCookies(res, { accessToken, refreshToken })
    res.status(200).json({ user })
  } catch (err) {
    next(err)
  }
}

export async function login(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await loginUser(req.body)
    setAuthCookies(res, { accessToken, refreshToken })
    res.status(200).json({ user })
  } catch (err) {
    next(err)
  }
}

export async function me(req, res, next) {
  try {
    const accessToken = req.cookies?.accessToken
    if (!accessToken) {
      return res.status(401).json({ error: { message: 'Tidak ada sesi aktif' } })
    }

    const user = await getUserFromAccessToken(accessToken)
    if (!user) {
      return res.status(401).json({ error: { message: 'Sesi tidak valid' } })
    }

    res.status(200).json({ user })
  } catch (err) {
    next(err)
  }
}

export async function logout(req, res, next) {
  try {
    await logoutUser(req.cookies?.refreshToken)
    res.clearCookie('accessToken', { path: '/' })
    res.clearCookie('refreshToken', { path: '/' })
    res.status(200).json({ success: true })
  } catch (err) {
    next(err)
  }
}
