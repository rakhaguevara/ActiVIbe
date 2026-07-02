import { getProfile, updateProfile } from './profile.service.js'

export async function getMyProfile(req, res, next) {
  try {
    const profile = await getProfile(req.user.id)
    res.status(200).json({ profile })
  } catch (err) {
    next(err)
  }
}

export async function updateMyProfile(req, res, next) {
  try {
    const profile = await updateProfile(req.user.id, req.body)
    res.status(200).json({ profile })
  } catch (err) {
    next(err)
  }
}
