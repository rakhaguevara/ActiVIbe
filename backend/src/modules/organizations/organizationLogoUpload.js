import multer from 'multer'
import { randomUUID } from 'crypto'
import path from 'path'
import fs from 'fs'
import { AppError } from '../../utils/AppError.js'

export const ORG_LOGO_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'org-logos')
fs.mkdirSync(ORG_LOGO_UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, ORG_LOGO_UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${req.user.id}-${randomUUID()}${path.extname(file.originalname)}`),
})

const uploadOrgLogoMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!['image/png', 'image/jpeg'].includes(file.mimetype)) {
      cb(new Error('Logo harus berupa file PNG atau JPG'))
      return
    }
    cb(null, true)
  },
}).single('logo')

export function handleOrgLogoUpload(req, res, next) {
  uploadOrgLogoMiddleware(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError(400, 'Ukuran logo maksimal 5MB'))
      }
      return next(new AppError(400, err.message || 'Gagal mengunggah logo'))
    }
    next()
  })
}
