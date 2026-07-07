import { AppError } from '../../utils/AppError.js'
import { subdirFor } from './eventUpload.js'

// Upload "orphan" — Event belum tentu sudah ada (organizer masih isi form),
// jadi endpoint ini cuma menyimpan file & mengembalikan URL-nya. URL itu baru
// dilekatkan ke Event saat POST /events (JSON) yang sebenarnya di-submit.
export async function uploadEventDocument(req, res, next) {
  try {
    if (!req.file) {
      throw new AppError(400, 'Pilih file terlebih dahulu')
    }
    const subdir = subdirFor(req.params.docType)
    res.status(201).json({ url: `/uploads/event-documents/${subdir}/${req.file.filename}`, fileName: req.file.originalname })
  } catch (err) {
    next(err)
  }
}

export async function uploadGalleryImage(req, res, next) {
  try {
    if (!req.file) {
      throw new AppError(400, 'Pilih gambar terlebih dahulu')
    }
    res.status(201).json({ url: `/uploads/event-gallery/${req.file.filename}`, fileName: req.file.originalname })
  } catch (err) {
    next(err)
  }
}
