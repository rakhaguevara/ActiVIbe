import multer from 'multer'
import { randomUUID } from 'crypto'
import path from 'path'
import fs from 'fs'
import { AppError } from '../../utils/AppError.js'

const MIME = {
  pdfDoc: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  image: ['image/png', 'image/jpeg'],
}
MIME.pdfDocOrImage = [...MIME.pdfDoc, ...MIME.image]

// Aturan per jenis dokumen "Dokumen Pendukung" (lihat CreateEventPage enhancement) —
// docType di URL pakai kebab-case, subdir dipetakan ke folder fisik di uploads/.
export const DOCUMENT_RULES = {
  proposal: { mimeTypes: MIME.pdfDoc, maxSizeMB: 10, subdir: 'proposal' },
  rundown: { mimeTypes: MIME.pdfDoc, maxSizeMB: 10, subdir: 'rundown' },
  poster: { mimeTypes: MIME.image, maxSizeMB: 10, subdir: 'poster' },
  'responsibility-letter': { mimeTypes: MIME.pdfDoc, maxSizeMB: 10, subdir: 'responsibility-letter' },
  'location-permit': { mimeTypes: MIME.pdfDocOrImage, maxSizeMB: 10, subdir: 'location-permit' },
  'cooperation-letter': { mimeTypes: MIME.pdfDoc, maxSizeMB: 10, subdir: 'cooperation-letter' },
  'assignment-letter': { mimeTypes: MIME.pdfDoc, maxSizeMB: 10, subdir: 'assignment-letter' },
  'legal-nib': { mimeTypes: MIME.pdfDoc, maxSizeMB: 10, subdir: 'legal' },
  'legal-akta': { mimeTypes: MIME.pdfDoc, maxSizeMB: 10, subdir: 'legal' },
  'legal-sk-kemenkumham': { mimeTypes: MIME.pdfDoc, maxSizeMB: 10, subdir: 'legal' },
  'legal-npwp': { mimeTypes: MIME.pdfDoc, maxSizeMB: 10, subdir: 'legal' },
}

const EVENT_UPLOAD_ROOT = path.join(process.cwd(), 'uploads', 'event-documents')
const GALLERY_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'event-gallery')

// Bikin satu multer middleware siap pakai per aturan ({mimeTypes, maxSizeMB, subdir}) —
// pola yang sama dgn backend/src/modules/profile/cv.upload.js, cuma di-generalisir
// supaya tidak menduplikasi boilerplate multer utk tiap jenis dokumen.
function buildUploadHandler({ mimeTypes, maxSizeMB, subdir, fieldName, uploadDir }) {
  const dir = uploadDir ?? path.join(EVENT_UPLOAD_ROOT, subdir)
  fs.mkdirSync(dir, { recursive: true })

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    // Nama file diacak (bukan nama asli) — konsisten dgn cv.upload.js, path publik
    // jadi tidak gampang ditebak. Ekstensi asli dipertahankan (beda dari CV yang
    // selalu .pdf) karena jenis dokumen di sini bisa PDF/DOC/DOCX/PNG/JPG.
    filename: (req, file, cb) => cb(null, `${req.user.id}-${randomUUID()}${path.extname(file.originalname)}`),
  })

  const middleware = multer({
    storage,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!mimeTypes.includes(file.mimetype)) {
        cb(new Error('Format file tidak didukung'))
        return
      }
      cb(null, true)
    },
  }).single(fieldName ?? 'file')

  return function handleUpload(req, res, next) {
    middleware(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError(400, `Ukuran file maksimal ${maxSizeMB}MB`))
        }
        return next(new AppError(400, err.message || 'Gagal mengunggah file'))
      }
      next()
    })
  }
}

// Precomputed sekali per aturan saat module di-load (bukan per-request) — dipakai
// oleh resolveDocUploadHandler di route level.
const DOCUMENT_UPLOAD_HANDLERS = Object.fromEntries(
  Object.entries(DOCUMENT_RULES).map(([docType, rule]) => [docType, buildUploadHandler(rule)]),
)

export function resolveDocUploadHandler(req, res, next) {
  const handler = DOCUMENT_UPLOAD_HANDLERS[req.params.docType]
  if (!handler) {
    return next(new AppError(400, 'Tipe dokumen tidak dikenal'))
  }
  handler(req, res, next)
}

export const handleGalleryUpload = buildUploadHandler({
  mimeTypes: MIME.image,
  maxSizeMB: 5,
  uploadDir: GALLERY_UPLOAD_DIR,
})

export function subdirFor(docType) {
  return DOCUMENT_RULES[docType]?.subdir
}
