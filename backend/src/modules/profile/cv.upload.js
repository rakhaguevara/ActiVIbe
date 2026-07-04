import multer from 'multer'
import { randomUUID } from 'crypto'
import path from 'path'
import fs from 'fs'
import { AppError } from '../../utils/AppError.js'

export const CV_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'cv')
fs.mkdirSync(CV_UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, CV_UPLOAD_DIR),
  // Nama file diacak (bukan nama asli) supaya path publiknya tidak gampang
  // ditebak — CV berisi data pribadi. Nama asli tetap disimpan terpisah
  // sebagai Profile.cvFileName buat ditampilkan di UI.
  filename: (req, file, cb) => cb(null, `${req.user.id}-${randomUUID()}.pdf`),
})

const uploadCvMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new Error('CV harus berupa file PDF'))
      return
    }
    cb(null, true)
  },
}).single('cv')

// Bungkus multer manual (bukan pakai sebagai middleware langsung) supaya error-nya
// (MulterError ukuran file, atau Error custom dari fileFilter) bisa diterjemahkan
// jadi AppError berbahasa Indonesia yang konsisten dgn error response lain,
// bukan lolos apa adanya ke errorHandler generik (yang akan balas 500).
export function handleCvUpload(req, res, next) {
  uploadCvMiddleware(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError(400, 'Ukuran CV maksimal 5MB'))
      }
      return next(new AppError(400, err.message || 'Gagal mengunggah CV'))
    }
    next()
  })
}
