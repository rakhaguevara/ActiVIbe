import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'
import { prisma } from '../../config/prisma.js'
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from '../../utils/jwt.js'
import { hashToken } from '../../utils/hash.js'
import { AppError } from '../../utils/AppError.js'
import { sendOtpEmail } from '../../utils/mailer.js'
import { env } from '../../config/env.js'

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000
const OTP_MAX_VERIFY_ATTEMPTS = 5

function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

async function issueTokens(user) {
  const accessToken = signAccessToken({ userId: user.id, role: user.role })
  // jti makes every refresh token unique even if issued for the same user
  // within the same second — without it, jwt.sign's 1s-resolution `iat`
  // makes two tokens signed in the same second byte-identical, which
  // collides with RefreshToken.tokenHash's @unique constraint.
  const refreshToken = signRefreshToken({ userId: user.id, jti: crypto.randomUUID() })

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  })

  return { accessToken, refreshToken }
}

function generateOtpCode() {
  return String(crypto.randomInt(100000, 1000000))
}

// Dipakai register (kode pertama) & resendRegistrationOtp (kirim ulang) —
// satu tempat supaya expiry/hash/pengiriman selalu konsisten.
async function issueRegistrationOtp(user) {
  const code = generateOtpCode()
  await prisma.otpRequest.create({
    data: {
      userId: user.id,
      code: hashToken(code),
      purpose: 'REGISTER',
      expiresAt: new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000),
    },
  })
  await sendOtpEmail(user.email, { name: user.name, code, expiryMinutes: env.OTP_EXPIRY_MINUTES })
}

// FR-002/003: registrasi tidak lagi langsung membuat sesi — user dibuat
// isVerified:false, kode OTP dikirim ke email, sesi (tokens/cookies) baru
// terbit setelah verifyRegistrationOtp() berhasil (lihat auth.controller.js).
export async function registerUser({ firstName, lastName, email, password, role }) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing && existing.isVerified) {
    throw new AppError(409, 'Email sudah terdaftar')
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const name = `${firstName} ${lastName}`.trim()
  let user
  try {
    // Sudah pernah daftar tapi belum verifikasi OTP — perbarui data & kirim
    // ulang kode, jangan 409 (supaya user yang menutup tab sebelum verifikasi
    // bisa mencoba daftar ulang dengan email yang sama).
    if (existing) {
      user = await prisma.user.update({
        where: { id: existing.id },
        data: { name, password: hashedPassword, ...(role ? { role } : {}) },
      })
    } else {
      user = await prisma.user.create({
        data: { name, email, password: hashedPassword, isVerified: false, ...(role ? { role } : {}) },
      })
    }
  } catch (error) {
    // Race condition: another request created the same email between our
    // findUnique check above and this create. The DB's @unique constraint
    // on User.email rejects the insert with Prisma error code P2002 — map
    // it to the same 409 the findUnique check would have produced.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError(409, 'Email sudah terdaftar')
    }
    throw error
  }

  await issueRegistrationOtp(user)
  return { email: user.email }
}

export async function verifyRegistrationOtp({ email, code }) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.isVerified) {
    throw new AppError(400, 'Kode OTP tidak valid')
  }

  const otp = await prisma.otpRequest.findFirst({
    where: { userId: user.id, purpose: 'REGISTER', verifiedAt: null },
    orderBy: { createdAt: 'desc' },
  })
  if (!otp || otp.expiresAt < new Date()) {
    throw new AppError(400, 'Kode OTP sudah kedaluwarsa, minta kode baru')
  }
  if (otp.attempts >= OTP_MAX_VERIFY_ATTEMPTS) {
    throw new AppError(429, 'Terlalu banyak percobaan salah, minta kode baru')
  }
  if (hashToken(code) !== otp.code) {
    await prisma.otpRequest.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } })
    throw new AppError(400, 'Kode OTP salah')
  }

  await prisma.$transaction([
    prisma.otpRequest.update({ where: { id: otp.id }, data: { verifiedAt: new Date() } }),
    prisma.user.update({ where: { id: user.id }, data: { isVerified: true } }),
  ])

  const tokens = await issueTokens(user)
  return { user: toPublicUser({ ...user, isVerified: true }), ...tokens }
}

// FR-003: maks OTP_MAX_RESEND_ATTEMPTS kali kirim ulang (di luar kode pertama
// saat register) — dihitung dari total baris OtpRequest yang pernah dibuat
// utk user+purpose ini, bukan counter terpisah.
export async function resendRegistrationOtp({ email }) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.isVerified) {
    throw new AppError(400, 'Tidak ada registrasi yang menunggu verifikasi untuk email ini')
  }

  const sentCount = await prisma.otpRequest.count({ where: { userId: user.id, purpose: 'REGISTER' } })
  if (sentCount >= 1 + env.OTP_MAX_RESEND_ATTEMPTS) {
    throw new AppError(429, 'Batas permintaan ulang kode OTP tercapai')
  }

  await issueRegistrationOtp(user)
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new AppError(401, 'Email atau password salah')
  }

  const passwordMatches = await bcrypt.compare(password, user.password)
  if (!passwordMatches) {
    throw new AppError(401, 'Email atau password salah')
  }

  // Cek status SETELAH password cocok — supaya orang yang tidak tahu password
  // tidak bisa dipakai buat mengetes/enumerasi akun mana yang ditangguhkan.
  if (!user.isVerified) {
    throw new AppError(403, 'Akun belum diverifikasi. Cek email untuk kode OTP registrasi.')
  }
  if (user.status === 'SUSPENDED') {
    throw new AppError(403, 'Akun Anda telah ditangguhkan. Hubungi admin untuk informasi lebih lanjut.')
  }
  if (user.status === 'INACTIVE') {
    throw new AppError(403, 'Akun Anda tidak aktif. Hubungi admin untuk mengaktifkan kembali.')
  }

  const tokens = await issueTokens(user)
  return { user: toPublicUser(user), ...tokens }
}

// Refresh token rotation: setiap kali dipakai, token lama langsung direvoke
// dan pasangan baru diterbitkan (issueTokens bikin baris RefreshToken baru) —
// supaya satu refresh token cuma bisa dipakai sekali (replay lama otomatis
// gagal krn revokedAt sudah terisi).
export async function refreshUserSession(refreshToken) {
  if (!refreshToken) {
    throw new AppError(401, 'Tidak ada sesi aktif')
  }

  let payload
  try {
    payload = verifyRefreshToken(refreshToken)
  } catch {
    throw new AppError(401, 'Sesi tidak valid, silakan login ulang')
  }

  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(refreshToken) } })
  if (!stored || stored.revokedAt || stored.expiresAt < new Date() || stored.userId !== payload.userId) {
    throw new AppError(401, 'Sesi tidak valid, silakan login ulang')
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } })
  if (!user) {
    throw new AppError(401, 'Sesi tidak valid, silakan login ulang')
  }
  if (user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
    throw new AppError(403, 'Akun Anda tidak aktif, hubungi admin')
  }

  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } })

  const tokens = await issueTokens(user)
  return { user: toPublicUser(user), ...tokens }
}

export async function getUserFromAccessToken(accessToken) {
  let payload
  try {
    payload = verifyAccessToken(accessToken)
  } catch {
    return null
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } })
  if (!user) return null

  return toPublicUser(user)
}

export async function logoutUser(refreshToken) {
  if (!refreshToken) return

  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(refreshToken), revokedAt: null },
    data: { revokedAt: new Date() },
  })
}
