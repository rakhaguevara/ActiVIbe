import multer from 'multer'
import { randomUUID } from 'crypto'
import path from 'path'
import fs from 'fs'
import { AppError } from '../../utils/AppError.js'

export const ORG_BRANDING_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'org-branding')
fs.mkdirSync(ORG_BRANDING_UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, ORG_BRANDING_UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${req.user.id}-${randomUUID()}${path.extname(file.originalname)}`),
})

const uploadOrgBannerMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!['image/png', 'image/jpeg'].includes(file.mimetype)) {
      cb(new Error('Banner harus berupa file PNG atau JPG'))
      return
    }
    cb(null, true)
  },
}).single('banner')

export function handleOrgBannerUpload(req, res, next) {
  uploadOrgBannerMiddleware(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError(400, 'Ukuran banner maksimal 5MB'))
      }
      return next(new AppError(400, err.message || 'Gagal mengunggah banner'))
    }
    next()
  })
}
