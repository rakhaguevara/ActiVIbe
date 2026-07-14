import { Router } from 'express'
import {
  list,
  getOne,
  getMine,
  postMyLogo,
  postMyBanner,
  postMySignature,
  postMyStamp,
  postMyEmailHeader,
  patchMyVisualIdentity,
  patchMyEmailIdentity,
  patchMyProfile,
  postMyBrandingTestEmail,
  register,
  getSetPasswordInfo,
  requestSetPasswordOtp,
  setPassword,
  postMyDeactivate,
  postMyReactivate,
  postMyTransfer,
  postMyDelete,
} from './organization.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.js'
import { requireRole } from '../../middlewares/requireRole.js'
import { handleOrgLogoUpload } from './organizationLogoUpload.js'
import { handleOrgBannerUpload } from './organizationBannerUpload.js'
import { handleOrgSignatureUpload } from './organizationSignatureUpload.js'
import { handleOrgStampUpload } from './organizationStampUpload.js'
import { handleOrgEmailHeaderUpload } from './organizationEmailHeaderUpload.js'

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
router.patch('/me/profile', requireAuth, requireRole('ORGANIZER'), patchMyProfile)
router.post('/me/logo', requireAuth, requireRole('ORGANIZER'), handleOrgLogoUpload, postMyLogo)

// Branding (BrandingView.tsx) — 4 aset gambar + warna + footer email + test
// email. Lihat cross-cutting decision #1 (docs plan): tidak ada endpoint
// "certificate theme" di sini — itu read-only dari GET /certificates/active-template
// (dikelola admin, satu template global).
router.post('/me/banner', requireAuth, requireRole('ORGANIZER'), handleOrgBannerUpload, postMyBanner)
router.post('/me/signature', requireAuth, requireRole('ORGANIZER'), handleOrgSignatureUpload, postMySignature)
router.post('/me/stamp', requireAuth, requireRole('ORGANIZER'), handleOrgStampUpload, postMyStamp)
router.post('/me/email-header', requireAuth, requireRole('ORGANIZER'), handleOrgEmailHeaderUpload, postMyEmailHeader)
router.patch('/me/visual-identity', requireAuth, requireRole('ORGANIZER'), patchMyVisualIdentity)
router.patch('/me/email-identity', requireAuth, requireRole('ORGANIZER'), patchMyEmailIdentity)
router.post('/me/branding/test-email', requireAuth, requireRole('ORGANIZER'), postMyBrandingTestEmail)

// Danger Zone (Settings > Security) — nonaktifkan/aktifkan/transfer/hapus
// (soft-delete) organisasi milik sendiri, semua password-gated di service layer.
router.post('/me/deactivate', requireAuth, requireRole('ORGANIZER'), postMyDeactivate)
router.post('/me/reactivate', requireAuth, requireRole('ORGANIZER'), postMyReactivate)
router.post('/me/transfer', requireAuth, requireRole('ORGANIZER'), postMyTransfer)
router.post('/me/delete', requireAuth, requireRole('ORGANIZER'), postMyDelete)

router.get('/:id', requireAuth, getOne)

export default router
