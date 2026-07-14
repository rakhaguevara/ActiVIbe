import multer from 'multer'
import { randomUUID } from 'crypto'
import path from 'path'
import fs from 'fs'
import { AppError } from '../../utils/AppError.js'

// Direktori sama dengan banner/signature/email-header (uploads/org-branding) —
// aman krn multer disk storage pakai nama file acak (randomUUID), tidak ada
// tabrakan antar jenis aset.
export const ORG_BRANDING_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'org-branding')
fs.mkdirSync(ORG_BRANDING_UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, ORG_BRANDING_UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${req.user.id}-${randomUUID()}${path.extname(file.originalname)}`),
})

const uploadOrgStampMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!['image/png', 'image/jpeg'].includes(file.mimetype)) {
      cb(new Error('Stempel harus berupa file PNG atau JPG'))
      return
    }
    cb(null, true)
  },
}).single('stamp')

export function handleOrgStampUpload(req, res, next) {
  uploadOrgStampMiddleware(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError(400, 'Ukuran stempel maksimal 5MB'))
      }
      return next(new AppError(400, err.message || 'Gagal mengunggah stempel'))
    }
    next()
  })
}
