import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from './config/env.js'
import authRoutes from './modules/auth/auth.routes.js'
import profileRoutes from './modules/profile/profile.routes.js'
import { errorHandler } from './middlewares/errorHandler.js'

export const app = express()

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }))
app.use(cookieParser())
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/profile', profileRoutes)

app.use(errorHandler)
