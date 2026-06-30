import { describe, it, expect } from 'vitest'
import { prisma } from '../src/config/prisma.js'

describe('test database connectivity', () => {
  it('connects to the test database and finds an empty User table', async () => {
    await prisma.user.deleteMany()
    const count = await prisma.user.count()
    expect(count).toBe(0)
  })
})
