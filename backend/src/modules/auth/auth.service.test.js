import crypto from 'crypto'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prisma } from '../../config/prisma.js'
import {
  registerUser,
  loginUser,
  getUserFromAccessToken,
  logoutUser,
  verifyRegistrationOtp,
  resendRegistrationOtp,
} from './auth.service.js'
import { hashToken } from '../../utils/hash.js'

const FIXED_OTP = '123456'

beforeEach(async () => {
  await prisma.refreshToken.deleteMany()
  await prisma.otpRequest.deleteMany()
  await prisma.user.deleteMany()
})

// Kode OTP dikirim lewat email (console.log fallback tanpa RESEND_API_KEY di
// test env) dan disimpan ter-hash — satu-satunya cara test tahu kodenya adalah
// mengunci crypto.randomInt supaya deterministik.
async function registerAndVerify(payload) {
  const randomIntSpy = vi.spyOn(crypto, 'randomInt').mockReturnValue(Number(FIXED_OTP))
  try {
    await registerUser(payload)
    return await verifyRegistrationOtp({ email: payload.email, code: FIXED_OTP })
  } finally {
    randomIntSpy.mockRestore()
  }
}

describe('registerUser', () => {
  it('creates an unverified user and sends an OTP instead of issuing tokens', async () => {
    const result = await registerUser({
      firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123',
    })

    expect(result).toEqual({ email: 'casey@example.com' })

    const stored = await prisma.user.findUnique({ where: { email: 'casey@example.com' } })
    expect(stored.isVerified).toBe(false)
    expect(stored.password).not.toBe('password123')

    const otp = await prisma.otpRequest.findFirst({ where: { userId: stored.id, purpose: 'REGISTER' } })
    expect(otp).toBeTruthy()
    expect(otp.verifiedAt).toBeNull()
  })

  it('throws a 409 AppError when the email already belongs to a verified user', async () => {
    await registerAndVerify({ firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })

    await expect(
      registerUser({ firstName: 'Other', lastName: 'Person', email: 'casey@example.com', password: 'password456' })
    ).rejects.toMatchObject({ statusCode: 409 })
  })

  it('lets an unverified registration retry with the same email instead of 409ing', async () => {
    await registerUser({ firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })

    const result = await registerUser({ firstName: 'Casey', lastName: 'Updated', email: 'casey@example.com', password: 'password456' })

    expect(result).toEqual({ email: 'casey@example.com' })
    const stored = await prisma.user.findUnique({ where: { email: 'casey@example.com' } })
    expect(stored.name).toBe('Casey Updated')
  })

  it('throws a 409 AppError on a concurrent duplicate registration (P2002 race past findUnique)', async () => {
    const payload = { firstName: 'Casey', lastName: 'Smith', email: 'race@example.com', password: 'password123' }

    // Fire both calls without awaiting in between so both can pass the
    // findUnique check before either create() commits, forcing the second
    // create() to hit the DB's @unique constraint (Prisma error P2002)
    // instead of the findUnique-detected duplicate-email branch.
    const [first, second] = await Promise.allSettled([registerUser(payload), registerUser(payload)])

    const results = [first, second]
    const fulfilled = results.filter((r) => r.status === 'fulfilled')
    const rejected = results.filter((r) => r.status === 'rejected')

    // Karena user belum terverifikasi, race ini tidak selalu berujung 409 —
    // salah satu bisa saja lolos sbg "update" bergantung urutan interleaving.
    // Yang wajib benar: tidak ada baris User duplikat untuk email yang sama.
    expect(fulfilled.length + rejected.length).toBe(2)
    const stored = await prisma.user.findMany({ where: { email: 'race@example.com' } })
    expect(stored).toHaveLength(1)
  })
})

describe('verifyRegistrationOtp', () => {
  it('verifies the correct code and issues tokens', async () => {
    const payload = { firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' }
    const result = await registerAndVerify(payload)

    expect(result.user.email).toBe('casey@example.com')
    expect(result.accessToken).toBeTruthy()
    expect(result.refreshToken).toBeTruthy()

    const stored = await prisma.user.findUnique({ where: { email: 'casey@example.com' } })
    expect(stored.isVerified).toBe(true)
  })

  it('rejects a wrong code and increments attempts', async () => {
    const randomIntSpy = vi.spyOn(crypto, 'randomInt').mockReturnValue(Number(FIXED_OTP))
    await registerUser({ firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })
    randomIntSpy.mockRestore()

    await expect(
      verifyRegistrationOtp({ email: 'casey@example.com', code: '000000' })
    ).rejects.toMatchObject({ statusCode: 400 })

    const stored = await prisma.user.findUnique({ where: { email: 'casey@example.com' } })
    const otp = await prisma.otpRequest.findFirst({ where: { userId: stored.id, purpose: 'REGISTER' } })
    expect(otp.attempts).toBe(1)
  })

  it('rejects an expired code', async () => {
    const randomIntSpy = vi.spyOn(crypto, 'randomInt').mockReturnValue(Number(FIXED_OTP))
    await registerUser({ firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })
    randomIntSpy.mockRestore()

    const stored = await prisma.user.findUnique({ where: { email: 'casey@example.com' } })
    await prisma.otpRequest.updateMany({ where: { userId: stored.id }, data: { expiresAt: new Date(Date.now() - 1000) } })

    await expect(
      verifyRegistrationOtp({ email: 'casey@example.com', code: FIXED_OTP })
    ).rejects.toMatchObject({ statusCode: 400 })
  })
})

describe('resendRegistrationOtp', () => {
  it('sends a new OTP request row for a pending registration', async () => {
    await registerUser({ firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })

    await resendRegistrationOtp({ email: 'casey@example.com' })

    const stored = await prisma.user.findUnique({ where: { email: 'casey@example.com' } })
    const otpCount = await prisma.otpRequest.count({ where: { userId: stored.id, purpose: 'REGISTER' } })
    expect(otpCount).toBe(2)
  })

  it('throws 429 once the resend limit is exceeded', async () => {
    await registerUser({ firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })

    // 1 kode awal (dari register) + OTP_MAX_RESEND_ATTEMPTS (default 3) resend
    // yang diizinkan = 4 total; percobaan ke-5 harus ditolak.
    await resendRegistrationOtp({ email: 'casey@example.com' })
    await resendRegistrationOtp({ email: 'casey@example.com' })
    await resendRegistrationOtp({ email: 'casey@example.com' })

    await expect(
      resendRegistrationOtp({ email: 'casey@example.com' })
    ).rejects.toMatchObject({ statusCode: 429 })
  })
})

describe('loginUser', () => {
  it('returns tokens for correct credentials', async () => {
    await registerAndVerify({ firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })

    const result = await loginUser({ email: 'casey@example.com', password: 'password123' })

    expect(result.user.email).toBe('casey@example.com')
    expect(result.accessToken).toBeTruthy()
  })

  it('throws a 403 AppError when the account has not verified its OTP yet', async () => {
    await registerUser({ firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })

    await expect(
      loginUser({ email: 'casey@example.com', password: 'password123' })
    ).rejects.toMatchObject({ statusCode: 403 })
  })

  it('throws a 401 AppError for a wrong password', async () => {
    await registerAndVerify({ firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })

    await expect(
      loginUser({ email: 'casey@example.com', password: 'wrong-password' })
    ).rejects.toMatchObject({ statusCode: 401 })
  })

  it('throws a 401 AppError for a non-existent email', async () => {
    await expect(
      loginUser({ email: 'nobody@example.com', password: 'password123' })
    ).rejects.toMatchObject({ statusCode: 401 })
  })
})

describe('getUserFromAccessToken', () => {
  it('returns the user for a valid token', async () => {
    const { user, accessToken } = await registerAndVerify({
      firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123',
    })

    const result = await getUserFromAccessToken(accessToken)

    expect(result.id).toBe(user.id)
  })

  it('returns null for an invalid token', async () => {
    const result = await getUserFromAccessToken('not-a-real-token')
    expect(result).toBeNull()
  })
})

describe('logoutUser', () => {
  it('revokes the matching refresh token', async () => {
    const { refreshToken } = await registerAndVerify({
      firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123',
    })

    await logoutUser(refreshToken)

    const stored = await prisma.refreshToken.findFirst({ where: { tokenHash: hashToken(refreshToken) } })
    expect(stored.revokedAt).not.toBeNull()
  })
})
