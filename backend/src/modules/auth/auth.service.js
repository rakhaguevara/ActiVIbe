import crypto from 'crypto'
import bcrypt from 'bcryptjs'
// otplib v13 pakai functional API (bukan `authenticator` singleton dari v11/12
// yang dulu jadi standar contoh di dokumentasi lama) — generateSecret/generateURI
// sync, verify async (Promise<{valid, delta}>).
import { generateSecret as generateTotpSecret, generateURI as generateTotpUri, verify as verifyTotpToken } from 'otplib'
import QRCode from 'qrcode'
import { Prisma } from '@prisma/client'
import { prisma } from '../../config/prisma.js'
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from '../../utils/jwt.js'
import { hashToken } from '../../utils/hash.js'
import { generateOtpCode } from '../../utils/otp.js'
import { AppError } from '../../utils/AppError.js'
import { sendOtpEmail, sendPasswordResetOtpEmail } from '../../utils/mailer.js'
import { env } from '../../config/env.js'

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000
const OTP_MAX_VERIFY_ATTEMPTS = 5
const TWO_FACTOR_APP_NAME = 'ActiVibe'

function toPublicUser(user) {
  // twoFactorEnabled diturunkan dari twoFactorEnabledAt (bukan diserialize
  // apa adanya) — SecuritySettingsView cuma butuh tahu on/off, tidak perlu
  // tahu kapan persisnya diaktifkan.
  return { id: user.id, name: user.name, email: user.email, role: user.role, twoFactorEnabled: Boolean(user.twoFactorEnabledAt) }
}

// meta ({userAgent, ipAddress}, keduanya opsional) diisi dari req.headers/req.ip
// di controller layer — dipakai UI "Kelola Sesi" (Security settings) supaya
// organizer/user bisa melihat & mencabut sesi individual dari device lain.
async function issueTokens(user, meta = {}) {
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
      userAgent: meta.userAgent ?? null,
      ipAddress: meta.ipAddress ?? null,
      lastUsedAt: new Date(),
    },
  })

  return { accessToken, refreshToken }
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

export async function verifyRegistrationOtp({ email, code }, meta = {}) {
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

  const tokens = await issueTokens(user, meta)
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
    // code dipakai frontend (OtpVerifyForm.tsx) buat memunculkan tombol
    // "Lewati verifikasi" — lihat bypassRegistrationOtp di bawah.
    throw new AppError(429, 'Batas permintaan ulang kode OTP tercapai', 'OTP_RESEND_LIMIT_REACHED')
  }

  await issueRegistrationOtp(user)
}

// Jalan keluar kalau email OTP registrasi memang tidak pernah sampai (mailer
// fail-soft — lihat mailer.js sendOtpEmail, tidak pernah throw ke titik ini
// — jadi "gagal" nyaris selalu berarti "diam-diam tidak terkirim" sampai
// resend mentok limit, bukan error HTTP). Sengaja DIGATE ke kondisi yang sama
// dgn resendRegistrationOtp (sentCount sudah mentok limit) — supaya user tidak
// bisa langsung skip tanpa pernah mencoba resend, tapi begitu limit resend
// habis (satu-satunya sinyal konkret "OTP macet" yang tersedia hari ini),
// verifikasi email dianggap best-effort selesai. isVerified tetap di-set true
// (alur onboarding lanjut normal) tapi otpBypassedAt dicatat sbg audit trail
// eksplisit (beda dari verifikasi kode asli) — bukan dihapus diam-diam.
export async function bypassRegistrationOtp({ email }, meta = {}) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.isVerified) {
    throw new AppError(400, 'Tidak ada registrasi yang menunggu verifikasi untuk email ini')
  }

  const otp = await prisma.otpRequest.findFirst({
    where: { userId: user.id, purpose: 'REGISTER', verifiedAt: null },
    orderBy: { createdAt: 'desc' },
  })
  if (!otp) {
    throw new AppError(400, 'Tidak ada permintaan OTP untuk email ini')
  }

  const sentCount = await prisma.otpRequest.count({ where: { userId: user.id, purpose: 'REGISTER' } })
  if (sentCount < 1 + env.OTP_MAX_RESEND_ATTEMPTS) {
    throw new AppError(403, 'Coba kirim ulang kode dulu sebelum melewati verifikasi')
  }

  await prisma.$transaction([
    prisma.otpRequest.update({ where: { id: otp.id }, data: { verifiedAt: new Date() } }),
    prisma.user.update({ where: { id: user.id }, data: { isVerified: true, otpBypassedAt: new Date() } }),
  ])

  const tokens = await issueTokens(user, meta)
  return { user: toPublicUser({ ...user, isVerified: true }), ...tokens }
}

// Form "Lupa password?" di AuthModal — sengaja TIDAK mengungkap apakah email
// terdaftar (beda dari resendRegistrationOtp yang eksplisit bilang "tidak ada
// registrasi..."): selalu resolve tanpa error, OTP betulan cuma dikirim kalau
// user ada & sudah verified. Controller membalas sukses generik apa pun hasilnya.
export async function requestPasswordResetOtp({ email }) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.isVerified) return

  const code = generateOtpCode()
  await prisma.otpRequest.create({
    data: {
      userId: user.id,
      code: hashToken(code),
      purpose: 'PASSWORD_RESET',
      expiresAt: new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000),
    },
  })
  await sendPasswordResetOtpEmail(user.email, { name: user.name, code, expiryMinutes: env.OTP_EXPIRY_MINUTES })
}

// Verifikasi kode + ganti password sekaligus (satu langkah — beda dari alur
// aktivasi organisasi yang 2 endpoint terpisah krn ada token link email di
// antaranya). Begitu kode cocok, semua RefreshToken aktif user ini direvoke
// (password berubah = sesi lama di device lain seharusnya tidak lanjut valid)
// lalu sesi baru diterbitkan di device yang baru saja reset (auto-login,
// konsisten dgn verifyRegistrationOtp).
export async function resetPasswordWithOtp({ email, code, newPassword }, meta = {}) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new AppError(400, 'Kode OTP tidak valid')
  }

  const otp = await prisma.otpRequest.findFirst({
    where: { userId: user.id, purpose: 'PASSWORD_RESET', verifiedAt: null },
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

  const hashedPassword = await bcrypt.hash(newPassword, 10)
  await prisma.$transaction([
    prisma.otpRequest.update({ where: { id: otp.id }, data: { verifiedAt: new Date() } }),
    prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } }),
    prisma.refreshToken.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } }),
  ])

  const tokens = await issueTokens(user, meta)
  return { user: toPublicUser(user), ...tokens }
}

// 2FA (TOTP, opsional — lihat beginTwoFactorEnroll/confirmTwoFactorEnroll di
// bawah): kalau user.twoFactorEnabledAt terisi, loginUser TIDAK langsung
// menerbitkan sesi — mengembalikan sinyal { requiresTwoFactor, userId } dulu,
// sesi baru betulan terbit lewat verifyTwoFactorLogin() setelah kode TOTP
// dicek. User TANPA 2FA (mayoritas) tidak kena langkah tambahan ini sama
// sekali — behavior loginnya persis sama seperti sebelum 2FA ada.
export async function loginUser({ email, password }, meta = {}) {
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

  if (user.twoFactorEnabledAt) {
    return { requiresTwoFactor: true, userId: user.id }
  }

  const tokens = await issueTokens(user, meta)
  return { user: toPublicUser(user), ...tokens }
}

// Langkah ke-2 login kalau 2FA aktif — dipanggil dgn userId dari respons
// requiresTwoFactor di atas (bukan email/password lagi, sudah dibuktikan di
// loginUser). Kode TOTP diverifikasi terhadap secret yang tersimpan, baru
// sesi (tokens) betulan diterbitkan di sini.
export async function verifyTwoFactorLogin({ userId, code }, meta = {}) {
  if (!userId || !code) {
    throw new AppError(400, 'Kode verifikasi wajib diisi')
  }
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.twoFactorSecret || !user.twoFactorEnabledAt) {
    throw new AppError(400, 'Verifikasi 2FA tidak valid')
  }

  if (!(await verifyTotpCode(user.twoFactorSecret, code))) {
    throw new AppError(400, 'Kode verifikasi salah')
  }

  const tokens = await issueTokens(user, meta)
  return { user: toPublicUser(user), ...tokens }
}

// Dipanggil dari SecuritySettingsView "Update Password" (organizer) — beda
// dari resetPasswordWithOtp (alur "lupa password" via OTP email, tidak butuh
// password lama): di sini user MASIH punya sesi aktif & tahu password lama.
// Sesi LAIN (device lain) direvoke (password ganti = harus login ulang di
// sana), tapi sesi yang lagi dipakai request ini (currentRefreshTokenHash)
// sengaja TIDAK ikut dicabut — supaya organizer tidak ke-logout sendiri
// begitu selesai ganti password.
export async function changePassword(userId, currentRefreshTokenHash, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw new AppError(404, 'User tidak ditemukan')
  }

  const matches = await bcrypt.compare(currentPassword ?? '', user.password)
  if (!matches) {
    throw new AppError(400, 'Password saat ini salah')
  }
  if (!newPassword || newPassword.length < 8) {
    throw new AppError(400, 'Password baru minimal 8 karakter')
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } }),
    prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
        ...(currentRefreshTokenHash ? { tokenHash: { not: currentRefreshTokenHash } } : {}),
      },
      data: { revokedAt: new Date() },
    }),
    prisma.auditLog.create({
      data: { actorId: userId, action: 'Mengubah password', targetType: 'User', targetId: userId },
    }),
  ])
}

// "Manage Sessions" (Security settings) — cuma sesi yang masih valid (belum
// direvoke/kadaluarsa) yang ditampilkan. tokenHash sendiri TIDAK ikut
// diserialize ke client (leak risk), cuma dipakai internal utk flag isCurrent.
export async function listSessions(userId, currentTokenHash) {
  const sessions = await prisma.refreshToken.findMany({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  })
  return sessions.map((session) => ({
    id: session.id,
    userAgent: session.userAgent ?? undefined,
    ipAddress: session.ipAddress ?? undefined,
    createdAt: session.createdAt,
    lastUsedAt: session.lastUsedAt ?? session.createdAt,
    isCurrent: currentTokenHash != null && session.tokenHash === currentTokenHash,
  }))
}

export async function revokeSession(userId, sessionId) {
  const session = await prisma.refreshToken.findUnique({ where: { id: sessionId } })
  if (!session || session.userId !== userId) {
    throw new AppError(404, 'Sesi tidak ditemukan')
  }
  if (session.revokedAt) return

  await prisma.$transaction([
    prisma.refreshToken.update({ where: { id: sessionId }, data: { revokedAt: new Date() } }),
    prisma.auditLog.create({
      data: { actorId: userId, action: 'Mencabut sesi login', targetType: 'RefreshToken', targetId: sessionId },
    }),
  ])
}

export async function revokeOtherSessions(userId, currentTokenHash) {
  await prisma.$transaction([
    prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
        ...(currentTokenHash ? { tokenHash: { not: currentTokenHash } } : {}),
      },
      data: { revokedAt: new Date() },
    }),
    prisma.auditLog.create({
      data: { actorId: userId, action: 'Mencabut semua sesi login lain', targetType: 'User', targetId: userId },
    }),
  ])
}

// otplib v13 verify() adalah async & bisa melempar utk input yang benar2
// malformed — dibungkus jadi satu helper boolean supaya semua titik pemanggil
// (login step-2, confirm enroll, disable) konsisten fail-closed.
async function verifyTotpCode(secret, code) {
  if (!secret || !code) return false
  try {
    const result = await verifyTotpToken({ secret, token: String(code) })
    return Boolean(result?.valid)
  } catch {
    return false
  }
}

// Langkah 1 dari 2 enroll 2FA — secret BELUM disimpan ke User.twoFactorSecret
// di sini (biar enroll yang ditinggal begitu saja/tidak pernah dikonfirmasi
// tidak "separuh aktif"). Frontend mengirim balik secret yang sama di
// confirmTwoFactorEnroll setelah user membuktikan bisa generate kode yang
// benar dari authenticator app-nya.
export async function beginTwoFactorEnroll(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw new AppError(404, 'User tidak ditemukan')
  }
  if (user.twoFactorEnabledAt) {
    throw new AppError(400, '2FA sudah aktif untuk akun ini')
  }

  const secret = generateTotpSecret()
  const otpauthUrl = generateTotpUri({ issuer: TWO_FACTOR_APP_NAME, label: user.email ?? user.id, secret })
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl)

  return { secret, otpauthUrl, qrDataUrl }
}

// Langkah 2 — secret dikirim ulang dari frontend (state hasil enroll, server
// tidak menyimpan apapun di antara langkah 1 & 2, pola sama alur set-password
// organisasi) bareng kode TOTP pertama dari authenticator app user.
export async function confirmTwoFactorEnroll(userId, { secret, code }) {
  if (!secret || !code) {
    throw new AppError(400, 'Kode dan secret wajib diisi')
  }
  if (!(await verifyTotpCode(secret, code))) {
    throw new AppError(400, 'Kode verifikasi salah')
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret, twoFactorEnabledAt: new Date() },
    }),
    prisma.auditLog.create({
      data: { actorId: userId, action: 'Mengaktifkan 2FA', targetType: 'User', targetId: userId },
    }),
  ])
}

export async function disableTwoFactor(userId, { code }) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.twoFactorSecret || !user.twoFactorEnabledAt) {
    throw new AppError(400, '2FA belum aktif untuk akun ini')
  }
  if (!(await verifyTotpCode(user.twoFactorSecret, code))) {
    throw new AppError(400, 'Kode verifikasi salah')
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { twoFactorSecret: null, twoFactorEnabledAt: null } }),
    prisma.auditLog.create({
      data: { actorId: userId, action: 'Menonaktifkan 2FA', targetType: 'User', targetId: userId },
    }),
  ])
}

// Refresh token rotation: setiap kali dipakai, token lama langsung direvoke
// dan pasangan baru diterbitkan (issueTokens bikin baris RefreshToken baru) —
// supaya satu refresh token cuma bisa dipakai sekali (replay lama otomatis
// gagal krn revokedAt sudah terisi).
export async function refreshUserSession(refreshToken, meta = {}) {
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

  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date(), lastUsedAt: new Date() } })

  const tokens = await issueTokens(user, meta)
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
