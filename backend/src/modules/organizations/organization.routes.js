import { Router } from 'express'
import {
  list,
  getOne,
  getMine,
  postMyLogo,
  register,
  getSetPasswordInfo,
  requestSetPasswordOtp,
  setPassword,
} from './organization.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.js'
import { requireRole } from '../../middlewares/requireRole.js'
import { handleOrgLogoUpload } from './organizationLogoUpload.js'

const router = Router()

// Publik untuk volunteer (butuh login, tapi bukan role-restricted) — dipakai
// FindOrganizationPage.
router.get('/', list)

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

// "Organisasi milik saya sendiri" (BrandingView.tsx, dst) — didaftarkan
// sebelum '/:id' supaya 'me' tidak ketangkep sbg param id.
router.get('/me', requireAuth, requireRole('ORGANIZER'), getMine)
router.post('/me/logo', requireAuth, requireRole('ORGANIZER'), handleOrgLogoUpload, postMyLogo)

router.get('/:id', requireAuth, getOne)

export default router
