import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'
import { prisma } from '../../config/prisma.js'
import { signAccessToken, signRefreshToken, verifyAccessToken } from '../../utils/jwt.js'
import { hashToken } from '../../utils/hash.js'
import { AppError } from '../../utils/AppError.js'

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

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

export async function registerUser({ firstName, lastName, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new AppError(409, 'Email sudah terdaftar')
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  let user
  try {
    user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`.trim(),
        email,
        password: hashedPassword,
        isVerified: true,
      },
    })
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

  const tokens = await issueTokens(user)
  return { user: toPublicUser(user), ...tokens }
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
