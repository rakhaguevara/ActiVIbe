import { prisma } from '../../config/prisma.js'

export async function applyToEvent({ userId, eventId, whatsapp, motivation, availability }) {
  try {
    const application = await prisma.application.create({
      data: { userId, eventId, whatsapp, motivation, availability },
      select: {
        id: true,
        eventId: true,
        status: true,
        appliedAt: true,
      },
    })
    return application
  } catch (err) {
    // P2002 = unique constraint violation (sudah pernah mendaftar)
    if (err?.code === 'P2002') {
      const conflict = new Error('Kamu sudah mendaftar ke kegiatan ini.')
      conflict.statusCode = 409
      throw conflict
    }
    // P2003 = foreign key violation (eventId tidak ada di tabel Event)
    if (err?.code === 'P2003') {
      const notFound = new Error('Kegiatan tidak ditemukan.')
      notFound.statusCode = 404
      throw notFound
    }
    throw err
  }
}

export async function getMyApplications(userId) {
  const applications = await prisma.application.findMany({
    where: { userId },
    select: { eventId: true, status: true, appliedAt: true },
    orderBy: { appliedAt: 'desc' },
  })
  return applications
}
