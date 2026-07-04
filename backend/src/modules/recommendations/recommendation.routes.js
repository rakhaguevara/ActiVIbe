import { Router } from 'express'
import { getMyRecommendations } from './recommendation.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.js'

const router = Router()

// FR-005: daftar rekomendasi kegiatan personal + Predictive Match Score.
// Panggilan Claude bisa makan beberapa detik — frontend sebaiknya menampilkan
// skeleton/loading state, bukan blocking render dashboard.
router.get('/', requireAuth, getMyRecommendations)

export default router
