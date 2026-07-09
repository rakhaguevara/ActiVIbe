import { Router } from 'express'
import {
  list,
  getOne,
  register,
  getSetPasswordInfo,
  requestSetPasswordOtp,
  setPassword,
} from './organization.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.js'

const router = Router()

// Publik untuk volunteer (butuh login, tapi bukan role-restricted) — dipakai
// FindOrganizationPage.
router.get('/', requireAuth, list)

// Form self-service "Daftarkan Organisasimu" — TANPA requireAuth, siapapun
// boleh submit (login state tidak lagi relevan, lihat organization.service.js
// registerOrganization). Didaftarkan sebelum '/:id' supaya tidak ketangkep
// sbg param id.
router.post('/register', register)

// 2 langkah alur "Set Password" dari email (lihat SetOrganizationPasswordPage
// di frontend) — sengaja TANPA requireAuth, token (+OTP di langkah 2) sendiri
// jadi bukti kepemilikan.
router.get('/set-password/info', getSetPasswordInfo)
router.post('/set-password/request-otp', requestSetPasswordOtp)
router.post('/set-password', setPassword)

router.get('/:id', requireAuth, getOne)

export default router
