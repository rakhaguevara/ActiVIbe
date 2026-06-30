# Aktivasi Register & Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Register & Login actually work end-to-end — new Express backend connected to the already-migrated PostgreSQL database, wired to the existing (currently inert) `AuthModal.tsx` — plus a catch-all 404 page that doubles as the post-login placeholder destination.

**Architecture:** Express REST API (`backend/src/`) issuing JWT access/refresh tokens as httpOnly cookies, backed by Prisma against `activivibe_db`. React frontend gets a `lib/api.ts` fetch wrapper + `AuthContext` that calls this API and exposes `user`/`login`/`register`/`logout` to `AuthModal` and `Navbar`.

**Tech Stack:** Express, Prisma (already migrated), bcryptjs, jsonwebtoken, cookie-parser, cors, express-rate-limit, Vitest + supertest (backend tests — new to this repo). No new frontend test framework (none exists yet; frontend changes are verified manually per the spec's Definition of Done).

## Global Constraints

- OTP verification is skipped this round — `register` sets `isVerified: true` immediately. (Source: spec §Scope & Keputusan Kunci)
- Tokens are httpOnly cookies, never returned in JSON body, never stored in frontend localStorage. (Source: spec §Scope & Keputusan Kunci, §3)
- Signup form's `location` field stays in the UI but is never read/sent/stored by the backend. (Source: spec §Scope & Keputusan Kunci)
- Successful register/login navigates to `/dashboard`, which is intentionally **not** registered as a route — it falls through to the catch-all 404 page. (Source: spec §Scope & Keputusan Kunci, §5)
- Password minimum 8 characters, no complexity rule. (Source: spec §1 Validasi)
- Use `bcryptjs`, not `bcrypt` (avoids native build tools on Windows). (Source: spec §1)
- Refresh tokens are stored in `RefreshToken.tokenHash` as a SHA-256 hash, never the raw token. (Source: prior schema design, spec §3)
- CORS origin is the explicit `FRONTEND_URL` env var with `credentials: true` — never a wildcard. (Source: spec §3, README backend §7)
- Never run `git commit`/`git push` without explicit user request in the main session (`CLAUDE.md`). The chosen execution skill's own commit mechanism (see "Execution Handoff" at the end of this plan) is the documented exception.

---

## Task 1: Backend project setup & test infrastructure

**Files:**
- Modify: `backend/package.json`
- Modify: `backend/.env`
- Create: `backend/.env.test`
- Create: `backend/vitest.config.js`
- Create: `backend/tests/setup.js`
- Create: `backend/tests/smoke.test.js`
- Create: `backend/src/config/env.js`
- Create: `backend/src/config/prisma.js`

**Interfaces:**
- Produces: `env` object exported from `backend/src/config/env.js` with keys `DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN, PORT, FRONTEND_URL, NODE_ENV`.
- Produces: `prisma` (a `PrismaClient` instance) exported from `backend/src/config/prisma.js`.

- [ ] **Step 1: Install backend dependencies**

```bash
cd backend
npm install express cors cookie-parser bcryptjs jsonwebtoken express-rate-limit dotenv
npm install -D nodemon vitest supertest
```

- [ ] **Step 2: Update `backend/package.json` scripts and module type**

Edit `backend/package.json` so it reads exactly:

```json
{
  "name": "activivibe-backend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "ActiVibe backend API service",
  "main": "src/server.js",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "test": "vitest run",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^6.9.0",
    "bcryptjs": "^2.4.3",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-rate-limit": "^7.4.0",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "nodemon": "^3.1.4",
    "prisma": "^6.9.0",
    "supertest": "^7.0.0",
    "vitest": "^2.1.1"
  }
}
```

(`npm install` in Step 1 already wrote the real resolved versions — this step just adds `"type": "module"` and the `dev`/`start`/`test` scripts; keep whatever exact versions npm actually installed instead of retyping them if they differ slightly.)

- [ ] **Step 3: Generate JWT secrets and fill `backend/.env`**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Take the two printed values and edit `backend/.env`, replacing the empty strings:

```
JWT_ACCESS_SECRET="<first generated value>"
JWT_REFRESH_SECRET="<second generated value>"
```

Leave every other line in `backend/.env` untouched.

- [ ] **Step 4: Create `backend/.env.test`**

Open `backend/.env` and copy the password segment out of its `DATABASE_URL` (the text between `activivibe_user:` and `@localhost`). Create `backend/.env.test`:

```
DATABASE_URL="postgresql://activivibe_user:<same password as backend/.env>@localhost:5432/activivibe_db_test"
JWT_ACCESS_SECRET="test-access-secret-do-not-use-in-production"
JWT_REFRESH_SECRET="test-refresh-secret-do-not-use-in-production"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=4001
NODE_ENV="test"
FRONTEND_URL="http://localhost:5173"
```

- [ ] **Step 5: Create the `activivibe_db_test` database**

The PostgreSQL superuser password is at `D:\tmp\pg_superuser_pw.txt` (from the earlier local install). Run in PowerShell:

```powershell
$superPw = Get-Content "D:\tmp\pg_superuser_pw.txt" -Raw
$psql = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
$env:PGPASSWORD = $superPw
& $psql -U postgres -h localhost -p 5432 -d postgres -c "CREATE DATABASE activivibe_db_test OWNER activivibe_user;"
```

Expected output: `CREATE DATABASE`

- [ ] **Step 6: Push the schema to the test database**

```powershell
cd backend
$env:DATABASE_URL = "postgresql://activivibe_user:<same password as backend/.env>@localhost:5432/activivibe_db_test"
npx prisma db push
Remove-Item Env:\DATABASE_URL
```

Expected output ends with: `Your database is now in sync with your schema.`

- [ ] **Step 7: Create `backend/vitest.config.js`**

```js
import { defineConfig } from 'vitest/config'

// fileParallelism: false — every integration test file shares the same
// activivibe_db_test database and wipes tables in beforeEach; running test
// files in parallel workers would race on that cleanup.
export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.js'],
    fileParallelism: false,
  },
})
```

- [ ] **Step 8: Create `backend/tests/setup.js`**

```js
import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.resolve(__dirname, '../.env.test'), override: true })
```

- [ ] **Step 9: Write the failing smoke test**

Create `backend/tests/smoke.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { prisma } from '../src/config/prisma.js'

describe('test database connectivity', () => {
  it('connects to the test database and finds an empty User table', async () => {
    await prisma.user.deleteMany()
    const count = await prisma.user.count()
    expect(count).toBe(0)
  })
})
```

- [ ] **Step 10: Run the test, verify it fails**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../src/config/prisma.js'` (the file doesn't exist yet).

- [ ] **Step 11: Implement `backend/src/config/env.js`**

```js
import { config } from 'dotenv'

config()

const REQUIRED_KEYS = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_ACCESS_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN',
  'PORT',
  'FRONTEND_URL',
]

for (const key of REQUIRED_KEYS) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
  PORT: process.env.PORT,
  FRONTEND_URL: process.env.FRONTEND_URL,
  NODE_ENV: process.env.NODE_ENV || 'development',
}
```

- [ ] **Step 12: Implement `backend/src/config/prisma.js`**

```js
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()
```

- [ ] **Step 13: Run the test again, verify it passes**

```bash
npm test
```

Expected: PASS — 1 test file, 1 test passed.

- [ ] **Step 14: Commit**

```bash
git add backend/package.json backend/package-lock.json backend/.env.test backend/vitest.config.js backend/tests/setup.js backend/tests/smoke.test.js backend/src/config/env.js backend/src/config/prisma.js
git commit -m "chore(backend): set up Express deps, env config, and Vitest test database"
```

(`backend/.env` is gitignored — nothing to add there.)

---

## Task 2: Core utils — JWT, token hashing, AppError

**Files:**
- Create: `backend/src/utils/jwt.js`
- Create: `backend/src/utils/jwt.test.js`
- Create: `backend/src/utils/hash.js`
- Create: `backend/src/utils/hash.test.js`
- Create: `backend/src/utils/AppError.js`
- Create: `backend/src/utils/AppError.test.js`

**Interfaces:**
- Consumes: `env` from `backend/src/config/env.js` (Task 1).
- Produces: `signAccessToken(payload)`, `verifyAccessToken(token)`, `signRefreshToken(payload)`, `verifyRefreshToken(token)` from `jwt.js`.
- Produces: `hashToken(token): string` (sha256 hex) from `hash.js`.
- Produces: `class AppError extends Error` with constructor `(statusCode, message)` and instance property `statusCode`, from `AppError.js`.

- [ ] **Step 1: Write the failing tests for `jwt.js`**

Create `backend/src/utils/jwt.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken } from './jwt.js'

describe('jwt utils', () => {
  it('signs and verifies an access token round-trip', () => {
    const token = signAccessToken({ userId: 'abc123', role: 'VOLUNTEER' })
    const payload = verifyAccessToken(token)
    expect(payload.userId).toBe('abc123')
    expect(payload.role).toBe('VOLUNTEER')
  })

  it('signs and verifies a refresh token round-trip', () => {
    const token = signRefreshToken({ userId: 'abc123' })
    const payload = verifyRefreshToken(token)
    expect(payload.userId).toBe('abc123')
  })

  it('throws when verifying an access token with the refresh secret', () => {
    const token = signAccessToken({ userId: 'abc123', role: 'VOLUNTEER' })
    expect(() => verifyRefreshToken(token)).toThrow()
  })
})
```

- [ ] **Step 2: Run it, verify it fails**

```bash
npm test -- jwt.test.js
```

Expected: FAIL — `Cannot find module './jwt.js'`.

- [ ] **Step 3: Implement `backend/src/utils/jwt.js`**

```js
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN })
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN })
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET)
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET)
}
```

- [ ] **Step 4: Run it, verify it passes**

```bash
npm test -- jwt.test.js
```

Expected: PASS — 3 tests passed.

- [ ] **Step 5: Write the failing tests for `hash.js`**

Create `backend/src/utils/hash.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { hashToken } from './hash.js'

describe('hashToken', () => {
  it('produces the same hash for the same input', () => {
    expect(hashToken('same-value')).toBe(hashToken('same-value'))
  })

  it('produces different hashes for different input', () => {
    expect(hashToken('value-a')).not.toBe(hashToken('value-b'))
  })

  it('returns a 64-character hex string (sha256)', () => {
    expect(hashToken('anything')).toMatch(/^[a-f0-9]{64}$/)
  })
})
```

- [ ] **Step 6: Run it, verify it fails**

```bash
npm test -- hash.test.js
```

Expected: FAIL — `Cannot find module './hash.js'`.

- [ ] **Step 7: Implement `backend/src/utils/hash.js`**

```js
import crypto from 'crypto'

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}
```

- [ ] **Step 8: Run it, verify it passes**

```bash
npm test -- hash.test.js
```

Expected: PASS — 3 tests passed.

- [ ] **Step 9: Write the failing test for `AppError.js`**

Create `backend/src/utils/AppError.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { AppError } from './AppError.js'

describe('AppError', () => {
  it('carries a statusCode and message', () => {
    const err = new AppError(409, 'Email sudah terdaftar')
    expect(err).toBeInstanceOf(Error)
    expect(err.statusCode).toBe(409)
    expect(err.message).toBe('Email sudah terdaftar')
  })
})
```

- [ ] **Step 10: Run it, verify it fails**

```bash
npm test -- AppError.test.js
```

Expected: FAIL — `Cannot find module './AppError.js'`.

- [ ] **Step 11: Implement `backend/src/utils/AppError.js`**

```js
export class AppError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode
  }
}
```

- [ ] **Step 12: Run it, verify it passes**

```bash
npm test -- AppError.test.js
```

Expected: PASS — 1 test passed.

- [ ] **Step 13: Commit**

```bash
git add backend/src/utils
git commit -m "feat(backend): add JWT, token hashing, and AppError utilities"
```

---

## Task 3: Auth input validation

**Files:**
- Create: `backend/src/modules/auth/auth.validation.js`
- Create: `backend/src/modules/auth/auth.validation.test.js`

**Interfaces:**
- Produces: `validateRegisterInput(body): { valid: boolean, message?: string }`, `validateLoginInput(body): { valid: boolean, message?: string }`.

- [ ] **Step 1: Write the failing tests**

Create `backend/src/modules/auth/auth.validation.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { validateRegisterInput, validateLoginInput } from './auth.validation.js'

describe('validateRegisterInput', () => {
  it('accepts a valid payload', () => {
    const result = validateRegisterInput({
      firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'password123',
    })
    expect(result.valid).toBe(true)
  })

  it('rejects a missing firstName', () => {
    const result = validateRegisterInput({
      firstName: '', lastName: 'Smith', email: 'casey@example.com', password: 'password123',
    })
    expect(result.valid).toBe(false)
  })

  it('rejects a missing lastName', () => {
    const result = validateRegisterInput({
      firstName: 'Casey', lastName: '', email: 'casey@example.com', password: 'password123',
    })
    expect(result.valid).toBe(false)
  })

  it('rejects an invalid email', () => {
    const result = validateRegisterInput({
      firstName: 'Casey', lastName: 'Smith', email: 'not-an-email', password: 'password123',
    })
    expect(result.valid).toBe(false)
  })

  it('rejects a password shorter than 8 characters', () => {
    const result = validateRegisterInput({
      firstName: 'Casey', lastName: 'Smith', email: 'casey@example.com', password: 'short',
    })
    expect(result.valid).toBe(false)
  })
})

describe('validateLoginInput', () => {
  it('accepts a valid payload', () => {
    const result = validateLoginInput({ email: 'casey@example.com', password: 'anything' })
    expect(result.valid).toBe(true)
  })

  it('rejects an invalid email', () => {
    const result = validateLoginInput({ email: 'nope', password: 'anything' })
    expect(result.valid).toBe(false)
  })

  it('rejects a missing password', () => {
    const result = validateLoginInput({ email: 'casey@example.com', password: '' })
    expect(result.valid).toBe(false)
  })
})
```

- [ ] **Step 2: Run it, verify it fails**

```bash
npm test -- auth.validation.test.js
```

Expected: FAIL — `Cannot find module './auth.validation.js'`.

- [ ] **Step 3: Implement `backend/src/modules/auth/auth.validation.js`**

```js
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateRegisterInput(body) {
  const { firstName, lastName, email, password } = body

  if (!firstName || typeof firstName !== 'string' || !firstName.trim()) {
    return { valid: false, message: 'Nama depan wajib diisi' }
  }
  if (!lastName || typeof lastName !== 'string' || !lastName.trim()) {
    return { valid: false, message: 'Nama belakang wajib diisi' }
  }
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    return { valid: false, message: 'Email tidak valid' }
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return { valid: false, message: 'Password minimal 8 karakter' }
  }

  return { valid: true }
}

export function validateLoginInput(body) {
  const { email, password } = body

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    return { valid: false, message: 'Email tidak valid' }
  }
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password wajib diisi' }
  }

  return { valid: true }
}
```

- [ ] **Step 4: Run it, verify it passes**

```bash
npm test -- auth.validation.test.js
```

Expected: PASS — 8 tests passed.

- [ ] **Step 5: Commit**

```bash
git add backend/src/modules/auth/auth.validation.js backend/src/modules/auth/auth.validation.test.js
git commit -m "feat(backend): add register/login input validation"
```

---

## Task 4: Auth service (business logic against the database)

**Files:**
- Create: `backend/src/modules/auth/auth.service.js`
- Create: `backend/src/modules/auth/auth.service.test.js`

**Interfaces:**
- Consumes: `prisma` (Task 1), `signAccessToken`/`signRefreshToken`/`verifyAccessToken` (Task 2 `jwt.js`), `hashToken` (Task 2 `hash.js`), `AppError` (Task 2).
- Produces: `registerUser({ firstName, lastName, email, password }): Promise<{ user, accessToken, refreshToken }>`, `loginUser({ email, password }): Promise<{ user, accessToken, refreshToken }>`, `getUserFromAccessToken(accessToken): Promise<PublicUser | null>`, `logoutUser(refreshToken): Promise<void>`, where `PublicUser = { id, name, email, role }`.

- [ ] **Step 1: Write the failing tests**

Create `backend/src/modules/auth/auth.service.test.js`:

```js
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
```

- [ ] **Step 2: Run it, verify it fails**

```bash
npm test -- auth.service.test.js
```

Expected: FAIL — `Cannot find module './auth.service.js'`.

- [ ] **Step 3: Implement `backend/src/modules/auth/auth.service.js`**

```js
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
```

- [ ] **Step 4: Run it, verify it passes**

```bash
npm test -- auth.service.test.js
```

Expected: PASS — 7 tests passed.

- [ ] **Step 5: Commit**

```bash
git add backend/src/modules/auth/auth.service.js backend/src/modules/auth/auth.service.test.js
git commit -m "feat(backend): add register/login/me/logout business logic"
```

---

## Task 5: Express wiring — middlewares, controller, routes, app

**Files:**
- Create: `backend/src/middlewares/errorHandler.js`
- Create: `backend/src/middlewares/rateLimiter.js`
- Create: `backend/src/middlewares/validateRequest.js`
- Create: `backend/src/modules/auth/auth.controller.js`
- Create: `backend/src/modules/auth/auth.routes.js`
- Create: `backend/src/modules/auth/auth.routes.test.js`
- Create: `backend/src/app.js`
- Create: `backend/src/server.js`

**Interfaces:**
- Consumes: `registerUser, loginUser, getUserFromAccessToken, logoutUser` (Task 4), `validateRegisterInput, validateLoginInput` (Task 3), `AppError` (Task 2), `env` (Task 1).
- Produces: `app` (an Express app instance) exported from `backend/src/app.js`, mounted with `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`.

- [ ] **Step 1: Implement the middlewares**

Create `backend/src/middlewares/errorHandler.js`:

```js
import { AppError } from '../utils/AppError.js'

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: { message: err.message } })
  }

  console.error(err)
  return res.status(500).json({ error: { message: 'Internal server error' } })
}
```

Create `backend/src/middlewares/rateLimiter.js`:

```js
import rateLimit from 'express-rate-limit'

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})
```

Create `backend/src/middlewares/validateRequest.js`:

```js
export function validateRequest(validatorFn) {
  return (req, res, next) => {
    const result = validatorFn(req.body)
    if (!result.valid) {
      return res.status(400).json({ error: { message: result.message } })
    }
    next()
  }
}
```

- [ ] **Step 2: Implement `backend/src/modules/auth/auth.controller.js`**

```js
import { registerUser, loginUser, getUserFromAccessToken, logoutUser } from './auth.service.js'
import { env } from '../../config/env.js'

const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000

function setAuthCookies(res, { accessToken, refreshToken }) {
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
  }

  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: ACCESS_COOKIE_MAX_AGE })
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: REFRESH_COOKIE_MAX_AGE })
}

export async function register(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await registerUser(req.body)
    setAuthCookies(res, { accessToken, refreshToken })
    res.status(200).json({ user })
  } catch (err) {
    next(err)
  }
}

export async function login(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await loginUser(req.body)
    setAuthCookies(res, { accessToken, refreshToken })
    res.status(200).json({ user })
  } catch (err) {
    next(err)
  }
}

export async function me(req, res, next) {
  try {
    const accessToken = req.cookies?.accessToken
    if (!accessToken) {
      return res.status(401).json({ error: { message: 'Tidak ada sesi aktif' } })
    }

    const user = await getUserFromAccessToken(accessToken)
    if (!user) {
      return res.status(401).json({ error: { message: 'Sesi tidak valid' } })
    }

    res.status(200).json({ user })
  } catch (err) {
    next(err)
  }
}

export async function logout(req, res, next) {
  try {
    await logoutUser(req.cookies?.refreshToken)
    res.clearCookie('accessToken', { path: '/' })
    res.clearCookie('refreshToken', { path: '/' })
    res.status(200).json({ success: true })
  } catch (err) {
    next(err)
  }
}
```

- [ ] **Step 3: Implement `backend/src/modules/auth/auth.routes.js`**

```js
import { Router } from 'express'
import { register, login, me, logout } from './auth.controller.js'
import { validateRequest } from '../../middlewares/validateRequest.js'
import { authLimiter } from '../../middlewares/rateLimiter.js'
import { validateRegisterInput, validateLoginInput } from './auth.validation.js'

const router = Router()

router.post('/register', authLimiter, validateRequest(validateRegisterInput), register)
router.post('/login', authLimiter, validateRequest(validateLoginInput), login)
router.get('/me', me)
router.post('/logout', logout)

export default router
```

- [ ] **Step 4: Implement `backend/src/app.js`**

```js
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from './config/env.js'
import authRoutes from './modules/auth/auth.routes.js'
import { errorHandler } from './middlewares/errorHandler.js'

export const app = express()

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }))
app.use(cookieParser())
app.use(express.json())

app.use('/auth', authRoutes)

app.use(errorHandler)
```

- [ ] **Step 5: Implement `backend/src/server.js`**

```js
import { app } from './app.js'
import { env } from './config/env.js'

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`)
})
```

- [ ] **Step 6: Write the failing integration tests**

Create `backend/src/modules/auth/auth.routes.test.js`:

```js
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
```

- [ ] **Step 7: Run it, verify it passes**

```bash
npm test
```

Expected: PASS — all test files (smoke, jwt, hash, AppError, auth.validation, auth.service, auth.routes) green.

- [ ] **Step 8: Manual smoke check against the real dev database**

```bash
npm run dev
```

In another terminal running **Git Bash** (the quoting below is bash-style; PowerShell needs different escaping):

```bash
curl -i -X POST http://localhost:4000/auth/register -H "Content-Type: application/json" -d '{"firstName":"Manual","lastName":"Test","email":"manual-test@example.com","password":"password123"}'
```

Expected: `HTTP/1.1 200 OK`, `Set-Cookie: accessToken=...` and `Set-Cookie: refreshToken=...` headers present, body contains `"email":"manual-test@example.com"`.

Then open Prisma Studio (`npm run db:studio`) and confirm the `manual-test@example.com` row exists in `User` with `isVerified: true`. Delete that test row afterwards so it doesn't linger in the real dev database. Stop the `npm run dev` process (Ctrl+C).

- [ ] **Step 9: Commit**

```bash
git add backend/src
git commit -m "feat(backend): wire Express app with register/login/me/logout endpoints"
```

---

## Task 6: Frontend API client & AuthContext

**Files:**
- Create: `frontend/.env`
- Create: `frontend/.gitignore`
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/src/contexts/AuthContext.tsx`
- Modify: `frontend/src/App.tsx`

**Interfaces:**
- Produces (from `lib/api.ts`): `interface AuthUser { id: string; name: string; email: string | null; role: 'VOLUNTEER' | 'ORGANIZER' | 'ADMIN' }`, `interface RegisterPayload { firstName: string; lastName: string; email: string; password: string }`, `interface LoginPayload { email: string; password: string }`, `registerRequest(payload: RegisterPayload): Promise<{ user: AuthUser }>`, `loginRequest(payload: LoginPayload): Promise<{ user: AuthUser }>`, `meRequest(): Promise<{ user: AuthUser }>`, `logoutRequest(): Promise<void>`.
- Produces (from `contexts/AuthContext.tsx`): `AuthProvider` (component), `useAuth(): { user: AuthUser | null; isLoading: boolean; register(payload): Promise<AuthUser>; login(payload): Promise<AuthUser>; logout(): Promise<void> }`.
- Consumes: backend running at `http://localhost:4000` (Task 5) for manual verification.

This task has no automated tests — the frontend has no test framework yet (confirmed during brainstorming: introducing one is out of scope for this plan, frontend changes are verified manually per the spec's Definition of Done). Each step below is verified manually as stated.

- [ ] **Step 1: Create `frontend/.env` and `frontend/.gitignore`**

The repo's root `.gitignore` does not ignore `.env` files, and `frontend/` has no `.gitignore` of its own yet (unlike `backend/`, which already ignores its `.env`). Create `frontend/.gitignore`:

```
.env
```

Create `frontend/.env`:

```
VITE_API_URL=http://localhost:4000
```

- [ ] **Step 2: Create `frontend/src/lib/api.ts`**

```ts
const API_URL = import.meta.env.VITE_API_URL

export interface AuthUser {
  id: string
  name: string
  email: string | null
  role: 'VOLUNTEER' | 'ORGANIZER' | 'ADMIN'
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

async function parseResponse(res: Response) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Terjadi kesalahan, coba lagi.')
  }
  return data
}

export async function registerRequest(payload: RegisterPayload): Promise<{ user: AuthUser }> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  return parseResponse(res)
}

export async function loginRequest(payload: LoginPayload): Promise<{ user: AuthUser }> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  return parseResponse(res)
}

export async function meRequest(): Promise<{ user: AuthUser }> {
  const res = await fetch(`${API_URL}/auth/me`, {
    credentials: 'include',
  })
  return parseResponse(res)
}

export async function logoutRequest(): Promise<void> {
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })
  await parseResponse(res)
}
```

- [ ] **Step 3: Create `frontend/src/contexts/AuthContext.tsx`**

```tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  registerRequest,
  loginRequest,
  meRequest,
  logoutRequest,
  type AuthUser,
  type RegisterPayload,
  type LoginPayload,
} from '../lib/api'

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  register: (payload: RegisterPayload) => Promise<AuthUser>
  login: (payload: LoginPayload) => Promise<AuthUser>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    meRequest()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  const register = async (payload: RegisterPayload) => {
    const { user } = await registerRequest(payload)
    setUser(user)
    return user
  }

  const login = async (payload: LoginPayload) => {
    const { user } = await loginRequest(payload)
    setUser(user)
    return user
  }

  const logout = async () => {
    await logoutRequest()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
```

- [ ] **Step 4: Wrap the app in `AuthProvider`**

Modify `frontend/src/App.tsx` to exactly:

```tsx
import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import Navbar from './components/Navbar'
import AuthModal, { type AuthMode } from './components/AuthModal'
import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)

  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar
          onLoginClick={() => setAuthMode('login')}
          onSignupClick={() => setAuthMode('signup')}
        />
        <AppRoutes onSignupClick={() => setAuthMode('signup')} />

        {authMode && (
          <AuthModal
            mode={authMode}
            onClose={() => setAuthMode(null)}
            onModeChange={setAuthMode}
          />
        )}
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
```

- [ ] **Step 5: Manual verification**

With the backend running (`npm run dev` in `backend/`), run `npm run dev` in `frontend/`. Open the browser devtools Network tab, load the app — confirm a request to `http://localhost:4000/auth/me` fires on page load and returns `401` (no session yet). No visible UI change at this point (expected — `AuthModal`/`Navbar` aren't wired yet, that's Tasks 8 and 9).

- [ ] **Step 6: Commit**

```bash
git add frontend/.gitignore frontend/src/lib frontend/src/contexts frontend/src/App.tsx
git commit -m "feat(frontend): add API client and AuthContext"
```

(`frontend/.env` is gitignored — nothing to add there, same as `backend/.env`.)

---

## Task 7: 404 page & catch-all route

**Files:**
- Create: `frontend/src/pages/NotFoundPage.tsx`
- Create: `frontend/src/pages/NotFoundPage.css`
- Modify: `frontend/src/routes/AppRoutes.tsx`

**Interfaces:**
- Produces: `NotFoundPage` component (default export), no props.

- [ ] **Step 1: Create `frontend/src/pages/NotFoundPage.tsx`**

```tsx
import { Link } from 'react-router-dom'
import './NotFoundPage.css'

export default function NotFoundPage() {
  return (
    <main className="not-found-page">
      <p className="not-found-page__code">404</p>
      <h1 className="not-found-page__title">Halaman tidak ditemukan</h1>
      <Link to="/" className="not-found-page__link">Kembali ke beranda</Link>
    </main>
  )
}
```

- [ ] **Step 2: Create `frontend/src/pages/NotFoundPage.css`**

```css
.not-found-page {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-top: 72px;
  padding: var(--space-section-gap) var(--space-lg);
  gap: var(--space-xs);
}

.not-found-page__code {
  font-family: var(--font-display);
  font-size: var(--text-display-lg);
  color: var(--color-primary);
  margin: 0;
}

.not-found-page__title {
  font-family: var(--font-display);
  font-size: var(--text-display-sm);
  color: var(--color-text-heading);
  margin: 0;
}

.not-found-page__link {
  margin-top: var(--space-sm);
  font-family: var(--font-body);
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
}

.not-found-page__link:hover {
  text-decoration: underline;
}
```

- [ ] **Step 3: Add the catch-all route to `frontend/src/routes/AppRoutes.tsx`**

Replace the entire file content with:

```tsx
import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import AboutPage from '../pages/AboutPage'
import NotFoundPage from '../pages/NotFoundPage'

interface AppRoutesProps {
  onSignupClick: () => void
}

export default function AppRoutes({ onSignupClick }: AppRoutesProps) {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tentang-kami" element={<AboutPage onSignupClick={onSignupClick} />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
```

- [ ] **Step 4: Manual verification**

Run `npm run dev` in `frontend/`, navigate to `http://localhost:5173/some-random-path`. Expected: the 404 page renders (heading "404", text "Halaman tidak ditemukan", a working link back to `/`). Also visit `http://localhost:5173/dashboard` directly — expected: same 404 page (proves the intentional non-route from the spec works).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/NotFoundPage.tsx frontend/src/pages/NotFoundPage.css frontend/src/routes/AppRoutes.tsx
git commit -m "feat(frontend): add 404 catch-all page"
```

---

## Task 8: Wire AuthModal to the API

**Files:**
- Modify: `frontend/src/components/AuthModal.tsx`
- Modify: `frontend/src/components/AuthModal.css`

**Interfaces:**
- Consumes: `useAuth()` (Task 6), `useNavigate` from `react-router-dom`.

- [ ] **Step 1: Modify `frontend/src/components/AuthModal.tsx`**

Add these imports at the top (alongside the existing ones):

```tsx
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
```

Inside the component, replace the existing `handleSubmit` and add new state, right after the existing `canScrollDown` state declaration:

```tsx
const [error, setError] = useState<string | null>(null)
const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')
const navigate = useNavigate()
const { login, register } = useAuth()
```

Add a `useEffect` that clears error/status whenever the mode is switched (place it after the existing scroll-hint `useEffect`):

```tsx
useEffect(() => {
  setError(null)
  setStatus('idle')
}, [mode])
```

Replace the existing `handleSubmit` function body:

```tsx
const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setError(null)
  setStatus('submitting')

  const formData = new FormData(e.currentTarget)

  try {
    if (isLogin) {
      await login({
        email: String(formData.get('email')),
        password: String(formData.get('password')),
      })
    } else {
      await register({
        firstName: String(formData.get('firstName')),
        lastName: String(formData.get('lastName')),
        email: String(formData.get('email')),
        password: String(formData.get('password')),
      })
    }

    setStatus('success')
    setTimeout(() => {
      onClose()
      navigate('/dashboard')
    }, 1200)
  } catch (err) {
    setStatus('idle')
    setError(err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi.')
  }
}
```

Replace the `<form className="auth-modal__form" onSubmit={handleSubmit}>...</form>` block (everything from the `<form>` opening tag to its closing `</form>`) with:

```tsx
{status === 'success' ? (
  <p className="auth-modal__success">
    {isLogin ? 'Berhasil masuk!' : 'Berhasil daftar!'}
  </p>
) : (
  <form className="auth-modal__form" onSubmit={handleSubmit}>
    {!isLogin && (
      <div className="auth-modal__row">
        <div className="auth-modal__field">
          <label htmlFor="firstName">Nama Depan</label>
          <input id="firstName" name="firstName" type="text" placeholder="Casey" required />
        </div>
        <div className="auth-modal__field">
          <label htmlFor="lastName">Nama Belakang</label>
          <input id="lastName" name="lastName" type="text" placeholder="Smith" required />
        </div>
      </div>
    )}

    <div className="auth-modal__field">
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" placeholder="casey.smith@example.com" required />
    </div>

    <div className="auth-modal__field">
      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" placeholder="••••••••" required />
    </div>

    {!isLogin && (
      <div className="auth-modal__field">
        <label htmlFor="location">Lokasi</label>
        <input id="location" name="location" type="text" placeholder="Yogyakarta, Indonesia" required />
      </div>
    )}

    {error && <p className="auth-modal__error">{error}</p>}

    {isLogin ? (
      <a href="#" className="auth-modal__forgot">Lupa password?</a>
    ) : (
      <label className="auth-modal__checkbox">
        <input type="checkbox" required />
        <span>Saya bukan robot</span>
      </label>
    )}

    <button type="submit" className="auth-modal__submit" disabled={status === 'submitting'}>
      {status === 'submitting' ? 'Memproses...' : (isLogin ? 'Masuk' : 'Daftar')}
    </button>
  </form>
)}
```

(The `location` field is unchanged — still rendered, still `required` — it is simply never read out of `formData` in `handleSubmit`, per the spec's decision to leave it in the UI but ignore it server-side.)

- [ ] **Step 2: Add error/success styles to `frontend/src/components/AuthModal.css`**

Add these rules near the existing `.auth-modal__forgot`/`.auth-modal__checkbox` rules:

```css
.auth-modal__error {
  margin: 0;
  font-size: var(--text-body-sm);
  color: var(--color-danger);
}

.auth-modal__success {
  margin: var(--space-lg) 0;
  text-align: center;
  font-family: var(--font-body);
  font-size: var(--text-body-lg);
  font-weight: 600;
  color: var(--color-success);
}
```

- [ ] **Step 3: Manual verification**

With both `backend` (`npm run dev`, port 4000) and `frontend` (`npm run dev`, port 5173) running:

1. Open the signup modal, fill in a new email + password ≥ 8 chars, submit. Expected: button shows "Memproses...", then "Berhasil daftar!" message, then after ~1.2s the modal closes and the URL becomes `/dashboard` showing the 404 page.
2. Open the signup modal again, use the **same** email. Expected: inline red error "Email sudah terdaftar", modal stays open.
3. Open the login modal with that email but a wrong password. Expected: inline red error "Email atau password salah".
4. Open the login modal with the correct password. Expected: "Berhasil masuk!" then redirect to `/dashboard` (404 page).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/AuthModal.tsx frontend/src/components/AuthModal.css
git commit -m "feat(frontend): wire AuthModal to register/login API"
```

---

## Task 9: Wire Navbar to auth state

**Files:**
- Modify: `frontend/src/components/Navbar.tsx`
- Modify: `frontend/src/components/Navbar.css`

**Interfaces:**
- Consumes: `useAuth()` (Task 6), `useNavigate` from `react-router-dom`.

- [ ] **Step 1: Modify `frontend/src/components/Navbar.tsx`**

Change the import line `import { Link } from 'react-router-dom'` to:

```tsx
import { Link, useNavigate } from 'react-router-dom'
```

Add this import alongside the existing ones:

```tsx
import { useAuth } from '../contexts/AuthContext'
```

Inside the component, the existing code already has this sequence: the two `useEffect` hooks, then `const closeMenu = () => setIsMenuOpen(false)`, then the `return`. Add the auth wiring **right after** the `closeMenu` line (so it can reference `closeMenu` without a use-before-define issue):

```tsx
const { user, logout } = useAuth()
const navigate = useNavigate()

const handleLogout = async () => {
  await logout()
  closeMenu()
  navigate('/')
}
```

Replace the existing desktop `<div className="navbar__auth">...</div>` block with:

```tsx
<div className="navbar__auth">
  {user ? (
    <>
      <span className="navbar__user-name">{user.name.split(' ')[0]}</span>
      <button type="button" className="navbar__login" onClick={handleLogout}>
        Logout
      </button>
    </>
  ) : (
    <>
      <button type="button" className="navbar__login" onClick={onLoginClick}>
        Masuk
      </button>
      <button type="button" className="navbar__signup" onClick={onSignupClick}>
        Daftar
      </button>
    </>
  )}
</div>
```

Replace the existing mobile menu auth buttons (the `<button className="navbar__mobile-login">...</button>` and `<button className="navbar__mobile-cta">...</button>` pair inside `navbar__mobile-menu`) with:

```tsx
{user ? (
  <button
    type="button"
    className="navbar__mobile-login"
    onClick={handleLogout}
  >
    Logout
  </button>
) : (
  <>
    <button
      type="button"
      className="navbar__mobile-login"
      onClick={() => { closeMenu(); onLoginClick() }}
    >
      Masuk
    </button>
    <button
      type="button"
      className="navbar__mobile-cta"
      onClick={() => { closeMenu(); onSignupClick() }}
    >
      Daftar
    </button>
  </>
)}
```

- [ ] **Step 2: Add `.navbar__user-name` style to `frontend/src/components/Navbar.css`**

Add this rule near the existing `.navbar__login` rule:

```css
.navbar__user-name {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-heading);
  padding: 8px 4px;
}
```

- [ ] **Step 3: Manual verification**

With both servers running, log in (or register) through the modal. Expected: once redirected to `/dashboard` (404 page), the Navbar now shows the user's first name + a "Logout" button instead of "Masuk"/"Daftar". Click "Logout" — expected: Navbar reverts to "Masuk"/"Daftar", URL goes to `/`. Resize the browser to mobile width and repeat — the hamburger menu should show the same logged-in/logged-out state.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/Navbar.tsx frontend/src/components/Navbar.css
git commit -m "feat(frontend): show logged-in state and logout in Navbar"
```

---

## Task 10: End-to-end manual verification

No new files — this task runs the spec's Definition of Done checklist against the fully wired system and fixes anything that doesn't hold up.

- [ ] **Step 1: Fresh boot**

Stop any running dev servers. Start `npm run dev` in `backend/`, then `npm run dev` in `frontend/`.

- [ ] **Step 2: Register → DB → redirect → Navbar**

In the browser: open signup modal, register with a new email. Expected, in order: success message → modal closes → URL is `/dashboard` showing the 404 page → Navbar shows the new user's first name + Logout.

Open Prisma Studio (`npm run db:studio` in `backend/`) and confirm: a `User` row exists with that email, `isVerified: true`, and `password` is a bcrypt hash (starts with `$2`), not the plaintext password.

- [ ] **Step 3: Session persists across reload**

Refresh the browser page. Expected: Navbar still shows the user's name + Logout (proves `GET /auth/me` + the cookie are working), not a flash back to "Masuk"/"Daftar".

- [ ] **Step 4: Logout revokes the refresh token**

Click Logout. In Prisma Studio, find the `RefreshToken` row for that user and confirm `revokedAt` is now set (not `null`).

- [ ] **Step 5: Wrong password**

Open the login modal, use the registered email with an incorrect password. Expected: inline error "Email atau password salah", no redirect, modal stays open.

- [ ] **Step 6: Duplicate email on register**

Open the signup modal, use the same email again. Expected: inline error "Email sudah terdaftar".

- [ ] **Step 7: Unmatched URL still shows 404**

Navigate to `http://localhost:5173/this-route-does-not-exist`. Expected: the same 404 page as `/dashboard`.

If any step fails, fix the relevant task's code before considering this plan complete — do not move on with a known-broken step.

---

## Execution Handoff

After this plan is saved, the next step is to choose how to execute it:

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — execute tasks in the current session using `executing-plans`, batch execution with checkpoints.
