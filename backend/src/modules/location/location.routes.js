import { Router } from 'express'
import { provinces, regencies, districts, villages } from './location.controller.js'

const router = Router()

// GET /locations/provinces
router.get('/provinces', provinces)

// GET /locations/regencies/:provinceId
router.get('/regencies/:provinceId', regencies)

// GET /locations/districts/:regencyId
router.get('/districts/:regencyId', districts)

// GET /locations/villages/:districtId
router.get('/villages/:districtId', villages)

export default router
