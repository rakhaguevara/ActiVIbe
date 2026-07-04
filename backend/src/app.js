import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import { env } from './config/env.js'
import authRoutes from './modules/auth/auth.routes.js'
import profileRoutes from './modules/profile/profile.routes.js'
import applicationRoutes from './modules/applications/application.routes.js'
import eventRoutes from './modules/events/event.routes.js'
import recommendationRoutes from './modules/recommendations/recommendation.routes.js'
import { errorHandler } from './middlewares/errorHandler.js'

export const app = express()

// FRONTEND_URL may list multiple origins separated by commas (one per portal:
// volunteer/organizer/admin each run on their own port), so allowlist-check
// instead of passing the raw string straight to cors().
const allowedOrigins = env.FRONTEND_URL.split(',').map((origin) => origin.trim())
const isDevLocalhostOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || (env.NODE_ENV === 'development' && isDevLocalhostOrigin(origin))) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  }),
)
app.use(cookieParser())
app.use(express.json())

// File CV yang diupload user (lihat modules/profile/cv.upload.js) — path publiknya
// disimpan sebagai Profile.cvUrl dalam bentuk `/uploads/cv/<nama-acak>.pdf`.
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)
app.use('/applications', applicationRoutes)
app.use('/events', eventRoutes)
app.use('/recommendations', recommendationRoutes)

app.use(errorHandler)
