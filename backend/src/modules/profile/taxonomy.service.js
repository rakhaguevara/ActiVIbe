import { prisma } from '../../config/prisma.js'

export async function listInterests() {
  return prisma.interest.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] })
}

export async function listSkills() {
  return prisma.skill.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] })
}
