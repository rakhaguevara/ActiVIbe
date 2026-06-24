import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../../app.js'
import { prisma } from '../../config/prisma.js'

beforeEach(async () => {
  await prisma.refreshToken.deleteMany()
  await prisma.otpRequest.deleteMany()
  await prisma.user.deleteMany()
})

describe('POST /auth/register', () => {
  it('creates a user and sets auth cookies', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe('casey@example.com')

    const cookies = res.headers['set-cookie']
    expect(cookies.some((c) => c.startsWith('accessToken='))).toBe(true)
    expect(cookies.some((c) => c.startsWith('refreshToken='))).toBe(true)
  })

  it('returns 409 for a duplicate email', async () => {
    await request(app)
      .post('/auth/register')
      .send({ firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })

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

describe('POST /auth/login', () => {
  it('logs in with correct credentials and sets cookies', async () => {
    await request(app)
      .post('/auth/register')
      .send({ firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'casey@example.com', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.headers['set-cookie'].some((c) => c.startsWith('accessToken='))).toBe(true)
  })

  it('returns 401 for a wrong password', async () => {
    await request(app)
      .post('/auth/register')
      .send({ firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })

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
    const registerRes = await request(app)
      .post('/auth/register')
      .send({ firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })

    const accessCookie = registerRes.headers['set-cookie'].find((c) => c.startsWith('accessToken='))
    const res = await request(app).get('/auth/me').set('Cookie', accessCookie)

    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe('casey@example.com')
  })
})

describe('POST /auth/logout', () => {
  it('revokes the refresh token and clears cookies', async () => {
    const registerRes = await request(app)
      .post('/auth/register')
      .send({ firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })

    const refreshCookie = registerRes.headers['set-cookie'].find((c) => c.startsWith('refreshToken='))
    const res = await request(app).post('/auth/logout').set('Cookie', refreshCookie)

    expect(res.status).toBe(200)
    const cleared = res.headers['set-cookie']
    expect(cleared.some((c) => c.startsWith('accessToken=;'))).toBe(true)
    expect(cleared.some((c) => c.startsWith('refreshToken=;'))).toBe(true)
  })
})
