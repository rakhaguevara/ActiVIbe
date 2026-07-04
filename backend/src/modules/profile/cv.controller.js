import { saveCv, removeCv } from './profile.service.js'
import { AppError } from '../../utils/AppError.js'

export async function uploadCv(req, res, next) {
  try {
    if (!req.file) {
      throw new AppError(400, 'Pilih file CV terlebih dahulu')
    }
    const profile = await saveCv(req.user.id, req.file)
    res.status(200).json({ profile })
  } catch (err) {
    next(err)
  }
}

export async function deleteCv(req, res, next) {
  try {
    const profile = await removeCv(req.user.id)
    res.status(200).json({ profile })
  } catch (err) {
    next(err)
  }
}
