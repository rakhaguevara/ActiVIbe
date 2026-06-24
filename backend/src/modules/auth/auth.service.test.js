import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../../config/prisma.js'
import { registerUser, loginUser, getUserFromAccessToken, logoutUser } from './auth.service.js'
import { hashToken } from '../../utils/hash.js'

beforeEach(async () => {
  await prisma.refreshToken.deleteMany()
  await prisma.otpRequest.deleteMany()
  await prisma.user.deleteMany()
})

describe('registerUser', () => {
  it('creates a verified user and issues tokens', async () => {
    const result = await registerUser({
      firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123',
    })

    expect(result.user.name).toBe('Casey Smith')
    expect(result.user.email).toBe('casey@example.com')
    expect(result.accessToken).toBeTruthy()
    expect(result.refreshToken).toBeTruthy()

    const stored = await prisma.user.findUnique({ where: { email: 'casey@example.com' } })
    expect(stored.isVerified).toBe(true)
    expect(stored.password).not.toBe('password123')
  })

  it('throws a 409 AppError when the email is already registered', async () => {
    await registerUser({ firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })

    await expect(
      registerUser({ firstName: 'Other', lastName: 'Person', email: 'casey@example.com', password: 'password456' })
    ).rejects.toMatchObject({ statusCode: 409 })
  })
})

describe('loginUser', () => {
  it('returns tokens for correct credentials', async () => {
    await registerUser({ firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })

    const result = await loginUser({ email: 'casey@example.com', password: 'password123' })

    expect(result.user.email).toBe('casey@example.com')
    expect(result.accessToken).toBeTruthy()
  })

  it('throws a 401 AppError for a wrong password', async () => {
    await registerUser({ firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123' })

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
    const { user, accessToken } = await registerUser({
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
    const { refreshToken } = await registerUser({
      firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123',
    })

    await logoutUser(refreshToken)

    const stored = await prisma.refreshToken.findFirst({ where: { tokenHash: hashToken(refreshToken) } })
    expect(stored.revokedAt).not.toBeNull()
  })
})
