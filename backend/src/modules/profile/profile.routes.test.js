import crypto from 'crypto'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'
import fs from 'fs'
import path from 'path'
import { app } from '../../app.js'
import { prisma } from '../../config/prisma.js'
import { CV_UPLOAD_DIR } from './cv.upload.js'

const FIXED_OTP = '123456'

let outdoorInterest
let designSkill

beforeEach(async () => {
  await prisma.userInterest.deleteMany()
  await prisma.userSkill.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.interest.deleteMany()
  await prisma.skill.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.otpRequest.deleteMany()
  await prisma.user.deleteMany()

  outdoorInterest = await prisma.interest.create({ data: { name: 'Outdoor', category: 'Lingkungan' } })
  designSkill = await prisma.skill.create({ data: { name: 'Desain', category: 'Kreatif' } })
})

// File CV yang ke-upload selama test disimpan sungguhan ke disk (multer diskStorage)
// — bersihkan supaya tidak menumpuk di backend/uploads/cv/ tiap kali test jalan.
afterEach(() => {
  for (const name of fs.readdirSync(CV_UPLOAD_DIR)) {
    if (name !== '.gitkeep') fs.rmSync(path.join(CV_UPLOAD_DIR, name), { force: true })
  }
})

async function registerAndGetCookie() {
  const randomIntSpy = vi.spyOn(crypto, 'randomInt').mockReturnValue(Number(FIXED_OTP))
  let res
  try {
    await request(app)
      .post('/auth/register')
      .send({ firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })
    res = await request(app)
      .post('/auth/verify-otp')
      .send({ email: 'casey@example.com', code: FIXED_OTP })
  } finally {
    randomIntSpy.mockRestore()
  }
  return res.headers['set-cookie'].find((c) => c.startsWith('accessToken='))
}

describe('GET /profile/me', () => {
  it('returns 401 without a session cookie', async () => {
    const res = await request(app).get('/profile/me')
    expect(res.status).toBe(401)
  })

  it('returns an empty profile when nothing has been saved yet', async () => {
    const cookie = await registerAndGetCookie()
    const res = await request(app).get('/profile/me').set('Cookie', cookie)

    expect(res.status).toBe(200)
    expect(res.body.profile.bio).toBeNull()
    expect(res.body.profile.availability).toBeNull()
    expect(res.body.profile.interests).toEqual([])
    expect(res.body.profile.skills).toEqual([])
  })
})

describe('PATCH /profile/me', () => {
  it('returns 400 for an empty payload', async () => {
    const cookie = await registerAndGetCookie()
    const res = await request(app).patch('/profile/me').set('Cookie', cookie).send({})
    expect(res.status).toBe(400)
  })

  it('partially saves one field at a time, like the onboarding chat flow', async () => {
    const cookie = await registerAndGetCookie()

    const first = await request(app)
      .patch('/profile/me')
      .set('Cookie', cookie)
      .send({ interestIds: [outdoorInterest.id] })
    expect(first.status).toBe(200)
    expect(first.body.profile.interests).toHaveLength(1)
    expect(first.body.profile.skills).toEqual([])

    const second = await request(app)
      .patch('/profile/me')
      .set('Cookie', cookie)
      .send({ skillIds: [designSkill.id], availability: 'WEEKEND' })
    expect(second.status).toBe(200)
    expect(second.body.profile.interests).toHaveLength(1)
    expect(second.body.profile.skills).toHaveLength(1)
    expect(second.body.profile.availability).toBe('WEEKEND')

    const third = await request(app)
      .patch('/profile/me')
      .set('Cookie', cookie)
      .send({ education: 'Teknik Informatika', motivation: 'CAREER' })
    expect(third.status).toBe(200)
    expect(third.body.profile.education).toBe('Teknik Informatika')
    expect(third.body.profile.motivation).toBe('CAREER')
    expect(third.body.profile.availability).toBe('WEEKEND')
  })

  it('returns 400 for an invalid motivation value', async () => {
    const cookie = await registerAndGetCookie()
    const res = await request(app).patch('/profile/me').set('Cookie', cookie).send({ motivation: 'FUN' })
    expect(res.status).toBe(400)
  })

  it('returns 400 when an interestId does not exist', async () => {
    const cookie = await registerAndGetCookie()
    const res = await request(app)
      .patch('/profile/me')
      .set('Cookie', cookie)
      .send({ interestIds: ['non-existent-id'] })
    expect(res.status).toBe(400)
  })

  it('replaces interests instead of appending on repeated saves', async () => {
    const cookie = await registerAndGetCookie()
    const indoorInterest = await prisma.interest.create({ data: { name: 'Indoor', category: 'Lingkungan' } })

    await request(app).patch('/profile/me').set('Cookie', cookie).send({ interestIds: [outdoorInterest.id] })
    const res = await request(app)
      .patch('/profile/me')
      .set('Cookie', cookie)
      .send({ interestIds: [indoorInterest.id] })

    expect(res.status).toBe(200)
    expect(res.body.profile.interests).toHaveLength(1)
    expect(res.body.profile.interests[0].id).toBe(indoorInterest.id)
  })

  it('creates a "Lainnya" interest from customInterests and links it to the user', async () => {
    const cookie = await registerAndGetCookie()

    const res = await request(app)
      .patch('/profile/me')
      .set('Cookie', cookie)
      .send({ interestIds: [outdoorInterest.id], customInterests: ['Panjat Tebing'] })

    expect(res.status).toBe(200)
    expect(res.body.profile.interests).toHaveLength(2)
    const created = res.body.profile.interests.find((i) => i.name === 'Panjat Tebing')
    expect(created).toBeDefined()
    expect(created.category).toBe('Lainnya')

    const stored = await prisma.interest.findUnique({ where: { name: 'Panjat Tebing' } })
    expect(stored).not.toBeNull()
  })

  it('reuses an existing interest when customInterests matches an existing name', async () => {
    const cookie = await registerAndGetCookie()

    const res = await request(app)
      .patch('/profile/me')
      .set('Cookie', cookie)
      .send({ customInterests: ['Outdoor'] })

    expect(res.status).toBe(200)
    expect(res.body.profile.interests).toHaveLength(1)
    expect(res.body.profile.interests[0].id).toBe(outdoorInterest.id)

    const count = await prisma.interest.count({ where: { name: 'Outdoor' } })
    expect(count).toBe(1)
  })

  it('returns 400 when customInterests exceeds the max item length', async () => {
    const cookie = await registerAndGetCookie()
    const res = await request(app)
      .patch('/profile/me')
      .set('Cookie', cookie)
      .send({ customInterests: ['x'.repeat(41)] })
    expect(res.status).toBe(400)
  })
})

describe('POST /profile/me/cv', () => {
  it('returns 401 without a session cookie', async () => {
    const res = await request(app).post('/profile/me/cv').attach('cv', Buffer.from('%PDF-1.4'), 'cv.pdf')
    expect(res.status).toBe(401)
  })

  it('uploads a valid PDF and stores it on disk', async () => {
    const cookie = await registerAndGetCookie()
    const res = await request(app)
      .post('/profile/me/cv')
      .set('Cookie', cookie)
      .attach('cv', Buffer.from('%PDF-1.4 fake cv content'), 'Riwayat-Hidup.pdf')

    expect(res.status).toBe(200)
    expect(res.body.profile.cvFileName).toBe('Riwayat-Hidup.pdf')
    expect(res.body.profile.cvUrl).toMatch(/^\/uploads\/cv\/.+\.pdf$/)

    const storedPath = path.join(CV_UPLOAD_DIR, path.basename(res.body.profile.cvUrl))
    expect(fs.existsSync(storedPath)).toBe(true)
  })

  it('replaces the previous file when a new CV is uploaded', async () => {
    const cookie = await registerAndGetCookie()
    const first = await request(app)
      .post('/profile/me/cv')
      .set('Cookie', cookie)
      .attach('cv', Buffer.from('%PDF-1.4 v1'), 'v1.pdf')
    const firstPath = path.join(CV_UPLOAD_DIR, path.basename(first.body.profile.cvUrl))

    const second = await request(app)
      .post('/profile/me/cv')
      .set('Cookie', cookie)
      .attach('cv', Buffer.from('%PDF-1.4 v2'), 'v2.pdf')

    expect(second.status).toBe(200)
    expect(second.body.profile.cvFileName).toBe('v2.pdf')
    expect(fs.existsSync(firstPath)).toBe(false)
  })

  it('returns 400 for a non-PDF file', async () => {
    const cookie = await registerAndGetCookie()
    const res = await request(app)
      .post('/profile/me/cv')
      .set('Cookie', cookie)
      .attach('cv', Buffer.from('not a pdf'), 'cv.txt')
    expect(res.status).toBe(400)
  })

  it('returns 400 when the file exceeds 5MB', async () => {
    const cookie = await registerAndGetCookie()
    const res = await request(app)
      .post('/profile/me/cv')
      .set('Cookie', cookie)
      .attach('cv', Buffer.alloc(6 * 1024 * 1024), 'big.pdf')
    expect(res.status).toBe(400)
  })
})

describe('DELETE /profile/me/cv', () => {
  it('clears the CV fields and removes the file from disk', async () => {
    const cookie = await registerAndGetCookie()
    const uploadRes = await request(app)
      .post('/profile/me/cv')
      .set('Cookie', cookie)
      .attach('cv', Buffer.from('%PDF-1.4'), 'cv.pdf')
    const storedPath = path.join(CV_UPLOAD_DIR, path.basename(uploadRes.body.profile.cvUrl))

    const res = await request(app).delete('/profile/me/cv').set('Cookie', cookie)

    expect(res.status).toBe(200)
    expect(res.body.profile.cvUrl).toBeNull()
    expect(res.body.profile.cvFileName).toBeNull()
    expect(fs.existsSync(storedPath)).toBe(false)
  })

  it('is a no-op when there is no CV yet', async () => {
    const cookie = await registerAndGetCookie()
    const res = await request(app).delete('/profile/me/cv').set('Cookie', cookie)
    expect(res.status).toBe(200)
    expect(res.body.profile.cvUrl).toBeNull()
  })
})

describe('GET /profile/interests', () => {
  it('returns 401 without a session cookie', async () => {
    const res = await request(app).get('/profile/interests')
    expect(res.status).toBe(401)
  })

  it('lists master interest data', async () => {
    const cookie = await registerAndGetCookie()
    const res = await request(app).get('/profile/interests').set('Cookie', cookie)
    expect(res.status).toBe(200)
    expect(res.body.interests).toHaveLength(1)
    expect(res.body.interests[0].name).toBe('Outdoor')
  })
})

describe('GET /profile/skills', () => {
  it('lists master skill data', async () => {
    const cookie = await registerAndGetCookie()
    const res = await request(app).get('/profile/skills').set('Cookie', cookie)
    expect(res.status).toBe(200)
    expect(res.body.skills).toHaveLength(1)
    expect(res.body.skills[0].name).toBe('Desain')
  })
})
