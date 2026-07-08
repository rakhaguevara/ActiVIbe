import crypto from 'crypto'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { app } from '../../app.js'
import { prisma } from '../../config/prisma.js'

const FIXED_OTP = '123456'

beforeEach(async () => {
  await prisma.refreshToken.deleteMany()
  await prisma.otpRequest.deleteMany()
  await prisma.user.deleteMany()
})

async function registerAndVerifyViaHttp(payload) {
  const randomIntSpy = vi.spyOn(crypto, 'randomInt').mockReturnValue(Number(FIXED_OTP))
  try {
    await request(app).post('/auth/register').send(payload)
    return await request(app).post('/auth/verify-otp').send({ email: payload.email, code: FIXED_OTP })
  } finally {
    randomIntSpy.mockRestore()
  }
}

describe('POST /auth/register', () => {
  it('creates an unverified user and does not set auth cookies yet', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ otpRequired: true, email: 'casey@example.com' })
    expect(res.headers['set-cookie']).toBeUndefined()
  })

  it('returns 409 for a duplicate email that is already verified', async () => {
    await registerAndVerifyViaHttp({ firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })

    const res = await request(app)
      .post('/auth/register')
      .send({ firstName: 'Other', lastName: 'Person', email: 'casey@example.com', password: 'password456' })

    expect(res.status).toBe(409)
  })

  it('returns 400 for an invalid payload', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ firstName: '', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })

    expect(res.status).toBe(400)
  })
})

describe('POST /auth/verify-otp', () => {
  it('verifies the code and sets auth cookies', async () => {
    const res = await registerAndVerifyViaHttp({ firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe('casey@example.com')

    const cookies = res.headers['set-cookie']
    expect(cookies.some((c) => c.startsWith('accessToken='))).toBe(true)
    expect(cookies.some((c) => c.startsWith('refreshToken='))).toBe(true)
  })

  it('returns 400 for a wrong code', async () => {
    await request(app)
      .post('/auth/register')
      .send({ firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })

    const res = await request(app)
      .post('/auth/verify-otp')
      .send({ email: 'casey@example.com', code: '000000' })

    expect(res.status).toBe(400)
  })

  it('returns 400 for a malformed code', async () => {
    const res = await request(app)
      .post('/auth/verify-otp')
      .send({ email: 'casey@example.com', code: 'abc' })

    expect(res.status).toBe(400)
  })
})

describe('POST /auth/resend-otp', () => {
  it('accepts a resend request for a pending registration', async () => {
    await request(app)
      .post('/auth/register')
      .send({ firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })

    const res = await request(app).post('/auth/resend-otp').send({ email: 'casey@example.com' })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ success: true })
  })
})

describe('POST /auth/login', () => {
  it('logs in with correct credentials and sets cookies', async () => {
    await registerAndVerifyViaHttp({ firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'casey@example.com', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.headers['set-cookie'].some((c) => c.startsWith('accessToken='))).toBe(true)
  })

  it('returns 403 when the account has not verified its OTP yet', async () => {
    await request(app)
      .post('/auth/register')
      .send({ firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'casey@example.com', password: 'password123' })

    expect(res.status).toBe(403)
  })

  it('returns 401 for a wrong password', async () => {
    await registerAndVerifyViaHttp({ firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'casey@example.com', password: 'wrong' })

    expect(res.status).toBe(401)
  })
})

describe('GET /auth/me', () => {
  it('returns 401 without a session cookie', async () => {
    const res = await request(app).get('/auth/me')
    expect(res.status).toBe(401)
  })

  it('returns the user when a valid access cookie is sent', async () => {
    const verifyRes = await registerAndVerifyViaHttp({ firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })

    const accessCookie = verifyRes.headers['set-cookie'].find((c) => c.startsWith('accessToken='))
    const res = await request(app).get('/auth/me').set('Cookie', accessCookie)

    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe('casey@example.com')
  })
})

describe('POST /auth/logout', () => {
  it('revokes the refresh token and clears cookies', async () => {
    const verifyRes = await registerAndVerifyViaHttp({ firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })

    const refreshCookie = verifyRes.headers['set-cookie'].find((c) => c.startsWith('refreshToken='))
    const res = await request(app).post('/auth/logout').set('Cookie', refreshCookie)

    expect(res.status).toBe(200)
    const cleared = res.headers['set-cookie']
    expect(cleared.some((c) => c.startsWith('accessToken=;'))).toBe(true)
    expect(cleared.some((c) => c.startsWith('refreshToken=;'))).toBe(true)
  })
})
