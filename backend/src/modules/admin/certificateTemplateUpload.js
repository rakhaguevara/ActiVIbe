import multer from 'multer'
import { randomUUID } from 'crypto'
import path from 'path'
import fs from 'fs'
import { AppError } from '../../utils/AppError.js'

export const CERTIFICATE_TEMPLATE_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'certificate-templates')
fs.mkdirSync(CERTIFICATE_TEMPLATE_UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, CERTIFICATE_TEMPLATE_UPLOAD_DIR),
  // Nama file diacak — beda dari cv.upload.js, template ini bukan data
  // pribadi, tapi randomisasi tetap dipakai konsisten dgn upload lain di app.
  filename: (req, file, cb) => cb(null, `${randomUUID()}.pdf`),
})

const uploadCertificateTemplateMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new Error('Template sertifikat harus berupa file PDF'))
      return
    }
    cb(null, true)
  },
}).single('file')

export function handleCertificateTemplateUpload(req, res, next) {
  uploadCertificateTemplateMiddleware(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError(400, 'Ukuran template maksimal 10MB'))
      }
      return next(new AppError(400, err.message || 'Gagal mengunggah template'))
    }
    next()
  })
}
