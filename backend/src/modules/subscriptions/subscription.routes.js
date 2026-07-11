import { Router } from 'express'
import { getPlans, getMe, postCheckout, postCancel } from './subscription.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.js'

const router = Router()

// Plans catalog publik (dipakai halaman pricing ActiVibe Plus yang bisa
// diakses logged-out) — TIDAK di-requireAuth, harus didaftarkan sebelum
// router.use(requireAuth) di bawah.
router.get('/plans', getPlans)

router.use(requireAuth)

router.get('/me', getMe)
router.post('/checkout', postCheckout)
router.post('/cancel', postCancel)

export default router
