import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../../app.js'
import { prisma } from '../../config/prisma.js'

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

async function registerAndGetCookie() {
  const res = await request(app)
    .post('/auth/register')
    .send({ firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })
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
