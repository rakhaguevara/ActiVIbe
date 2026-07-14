import { Router } from 'express'
import {
  create,
  listMine,
  getOne,
  addRoleToEvent,
  addRequirementToEvent,
  close,
  getAttendance,
  patchCertificateProvider,
  submitFeedback,
  getFeedbackSummary,
  getTrafficSummary,
  archive,
  restore,
  closeEventRegistration,
  listPublic,
  listPopular,
  getPublic,
  trackView,
  addBookmark,
  removeBookmark,
  listBookmarks,
} from './event.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.js'
import { requireRole } from '../../middlewares/requireRole.js'
import { validateRequest } from '../../middlewares/validateRequest.js'
import {
  validateCreateEvent,
  validateAddRole,
  validateAddRequirement,
  validateCloseEvent,
  validateFeedback,
} from './event.validation.js'
import { resolveDocUploadHandler, handleGalleryUpload } from './eventUpload.js'
import { uploadEventDocument, uploadGalleryImage } from './eventUpload.controller.js'

const router = Router()

// Volunteer-facing (publik, login biasa) — HARUS didaftarkan sebelum
// router.use(requireRole('ORGANIZER')) di bawah, karena middleware level-router
// cuma berlaku utk route yang didaftarkan SETELAHNYA di router yang sama.
router.get('/public', listPublic)
// '/public/popular' HARUS didaftarkan sebelum '/public/:id' (Express match
// urutan pendaftaran, kalau tidak "popular" ketangkap jadi :id).
router.get('/public/popular', listPopular)
router.get('/public/:id', getPublic)
router.get('/bookmarks/me', requireAuth, listBookmarks)
router.post('/:id/view', requireAuth, trackView)
router.post('/:id/bookmark', requireAuth, addBookmark)
router.delete('/:id/bookmark', requireAuth, removeBookmark)
router.post('/:id/feedback', requireAuth, validateRequest(validateFeedback), submitFeedback)

router.use(requireAuth, requireRole('ORGANIZER'))

// Upload dokumen pendukung/galeri "orphan" (belum melekat ke Event manapun) —
// dipanggil saat organizer memilih file di form Buat Event, sebelum event-nya
// sendiri disubmit. Didaftarkan sebelum '/:id' supaya path 'uploads' tidak
// pernah ketangkap sbg :id.
router.post('/uploads/documents/:docType', resolveDocUploadHandler, uploadEventDocument)
router.post('/uploads/gallery', handleGalleryUpload, uploadGalleryImage)

router.post('/', validateRequest(validateCreateEvent), create)
router.get('/mine', listMine)
router.get('/traffic-summary', getTrafficSummary)
router.get('/:id', getOne)
router.post('/:id/roles', validateRequest(validateAddRole), addRoleToEvent)
router.post('/:id/requirements', validateRequest(validateAddRequirement), addRequirementToEvent)
router.post('/:id/close', validateRequest(validateCloseEvent), close)
router.get('/:id/attendance', getAttendance)
router.patch('/:id/certificate-provider', patchCertificateProvider)
router.get('/:id/feedback-summary', getFeedbackSummary)
router.post('/:id/archive', archive)
router.post('/:id/restore', restore)
router.post('/:id/close-registration', closeEventRegistration)

export default router
