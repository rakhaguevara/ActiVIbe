import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import { env } from './config/env.js'
import authRoutes from './modules/auth/auth.routes.js'
import profileRoutes from './modules/profile/profile.routes.js'
import applicationRoutes from './modules/applications/application.routes.js'
import eventRoutes from './modules/events/event.routes.js'
import organizationRoutes from './modules/organizations/organization.routes.js'
import subOrganizerRoutes from './modules/subOrganizers/subOrganizer.routes.js'
import recommendationRoutes from './modules/recommendations/recommendation.routes.js'
import adminRoutes from './modules/admin/admin.routes.js'
import locationRoutes from './modules/location/location.routes.js'
import passportRoutes from './modules/passport/passport.routes.js'
import organizerOverviewRoutes from './modules/organizerOverview/organizerOverview.routes.js'
import organizerVolunteersRoutes from './modules/organizerVolunteers/organizerVolunteers.routes.js'
import subscriptionRoutes from './modules/subscriptions/subscription.routes.js'
import communicationRoutes from './modules/communication/communication.routes.js'
import certificateRoutes from './modules/certificates/certificate.routes.js'
import { errorHandler } from './middlewares/errorHandler.js'
import { sessionSlot } from './middlewares/sessionSlot.js'

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
    allowedHeaders: ['Content-Type', 'X-Session-Slot'],
  }),
)
app.use(cookieParser())
app.use(sessionSlot)
app.use(express.json())

// File CV yang diupload user (lihat modules/profile/cv.upload.js) — path publiknya
// disimpan sebagai Profile.cvUrl dalam bentuk `/uploads/cv/<nama-acak>.pdf`.
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)
app.use('/applications', applicationRoutes)
app.use('/events', eventRoutes)
app.use('/organizations', organizationRoutes)
app.use('/sub-organizers', subOrganizerRoutes)
app.use('/recommendations', recommendationRoutes)
app.use('/admin', adminRoutes)
app.use('/locations', locationRoutes)
app.use('/passport', passportRoutes)
app.use('/organizer', organizerOverviewRoutes)
app.use('/organizer', organizerVolunteersRoutes)
app.use('/subscriptions', subscriptionRoutes)
app.use('/communication', communicationRoutes)
app.use('/certificates', certificateRoutes)

app.use(errorHandler)
