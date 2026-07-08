import { Router } from 'express'
import { list, getOne, register, activate } from './organization.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.js'

const router = Router()

// Publik untuk volunteer (butuh login, tapi bukan role-restricted) — dipakai
// FindOrganizationPage.
router.get('/', requireAuth, list)

// Form self-service "Daftarkan Organisasimu" — login role apapun boleh submit
// (lihat organization.service.js registerOrganization). Didaftarkan sebelum
// '/:id' supaya tidak ketangkep sbg param id.
router.post('/register', requireAuth, register)

// Link aktivasi dari email — sengaja TANPA requireAuth, token di query string
// sendiri yang jadi bukti kepemilikan (dibuka lewat klik di email, bukan fetch
// dari SPA yang sudah login).
router.get('/activate', activate)

router.get('/:id', requireAuth, getOne)

export default router
