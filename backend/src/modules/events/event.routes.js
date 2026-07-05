import { Router } from 'express'
import {
  create,
  listMine,
  getOne,
  addRoleToEvent,
  addRequirementToEvent,
  close,
  listPublic,
  getPublic,
  trackView,
  addBookmark,
  removeBookmark,
  listBookmarks,
} from './event.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.js'
import { requireRole } from '../../middlewares/requireRole.js'
import { validateRequest } from '../../middlewares/validateRequest.js'
import { validateCreateEvent, validateAddRole, validateAddRequirement, validateCloseEvent } from './event.validation.js'

const router = Router()

// Volunteer-facing (publik, login biasa) — HARUS didaftarkan sebelum
// router.use(requireRole('ORGANIZER')) di bawah, karena middleware level-router
// cuma berlaku utk route yang didaftarkan SETELAHNYA di router yang sama.
router.get('/public', requireAuth, listPublic)
router.get('/public/:id', requireAuth, getPublic)
router.get('/bookmarks/me', requireAuth, listBookmarks)
router.post('/:id/view', requireAuth, trackView)
router.post('/:id/bookmark', requireAuth, addBookmark)
router.delete('/:id/bookmark', requireAuth, removeBookmark)

router.use(requireAuth, requireRole('ORGANIZER'))

router.post('/', validateRequest(validateCreateEvent), create)
router.get('/mine', listMine)
router.get('/:id', getOne)
router.post('/:id/roles', validateRequest(validateAddRole), addRoleToEvent)
router.post('/:id/requirements', validateRequest(validateAddRequirement), addRequirementToEvent)
router.post('/:id/close', validateRequest(validateCloseEvent), close)

export default router
