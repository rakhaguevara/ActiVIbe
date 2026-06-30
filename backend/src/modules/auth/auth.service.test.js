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

    expect(fulfilled).toHaveLength(1)
    expect(rejected).toHaveLength(1)
    expect(rejected[0].reason).toMatchObject({ statusCode: 409, message: 'Email sudah terdaftar' })

    const stored = await prisma.user.findMany({ where: { email: 'race@example.com' } })
    expect(stored).toHaveLength(1)
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
