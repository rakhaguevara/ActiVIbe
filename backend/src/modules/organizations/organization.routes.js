import { Router } from 'express'
import { list, getOne } from './organization.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.js'

const router = Router()

// Publik untuk volunteer (butuh login, tapi bukan role-restricted) — dipakai
// FindOrganizationPage. Belum ada endpoint tulis: organizer belum punya UI
// "kelola organisasi" sendiri (di luar scope push ini, lihat ensureOrganizationForOwner).
router.get('/', requireAuth, list)
router.get('/:id', requireAuth, getOne)

export default router
