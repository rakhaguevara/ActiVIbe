import { config } from 'dotenv'

config()

const REQUIRED_KEYS = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_ACCESS_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN',
  'PORT',
  'FRONTEND_URL',
]

for (const key of REQUIRED_KEYS) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
  PORT: process.env.PORT,
  FRONTEND_URL: process.env.FRONTEND_URL,
  NODE_ENV: process.env.NODE_ENV || 'development',
  // AI Personalisasi (FR-005) — semuanya opsional; kalau tidak ada key sama
  // sekali, sistem rekomendasi otomatis jalan pakai fallback rule-based.
  // AI_PROVIDER: "claude" | "openai" | "gemini" | "auto" (default auto =
  // provider pertama yang key-nya terisi, urutan claude → openai → gemini).
  AI_PROVIDER: process.env.AI_PROVIDER || 'auto',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  CLAUDE_MODEL: process.env.CLAUDE_MODEL || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || '',
  // Portal volunteer (tempat form "Daftarkan Organisasimu" & halaman
  // set-password live) — dipakai membangun link atur password di email
  // "Daftarkan Organisasimu" (lihat organization.service.js registerOrganization).
  // RESEND_API_KEY kosong = fallback log link ke console (lihat utils/mailer.js),
  // bukan error. Default ke origin pertama di FRONTEND_URL (urutan volunteer,
  // organizer, admin — lihat komentar allowedOrigins di app.js).
  VOLUNTEER_PORTAL_URL: process.env.VOLUNTEER_PORTAL_URL || process.env.FRONTEND_URL.split(',')[0].trim(),
  // Portal organizer (tempat AcceptTeamInvitePage live, lihat
  // organizationMembers.service.js inviteMember) — dipakai membangun link
  // undangan tim di email. Beda dari VOLUNTEER_PORTAL_URL di atas: tidak
  // diturunkan dari FRONTEND_URL (urutan originnya tidak dijamin match portal
  // organizer), fallback ke port dev default organizer (lihat
  // frontend/.env.organizer & frontend/src/config/portalUrls.ts).
  ORGANIZER_PORTAL_URL: process.env.ORGANIZER_PORTAL_URL || 'http://localhost:5176',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'ActiVibe <no-reply@activibe.id>',
  // OTP registrasi (FR-002/003) — expiry & batas resend, dipakai auth.service.js
  OTP_EXPIRY_MINUTES: Number(process.env.OTP_EXPIRY_MINUTES) || 5,
  OTP_MAX_RESEND_ATTEMPTS: Number(process.env.OTP_MAX_RESEND_ATTEMPTS) || 3,
}
