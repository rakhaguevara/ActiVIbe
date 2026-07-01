import { prisma } from '../../config/prisma.js'
import { AppError } from '../../utils/AppError.js'

function toProfileResponse(userId, profile, userInterests, userSkills) {
  return {
    userId,
    bio: profile?.bio ?? null,
    location: profile?.location ?? null,
    avatarUrl: profile?.avatarUrl ?? null,
    availability: profile?.availability ?? null,
    education: profile?.education ?? null,
    motivation: profile?.motivation ?? null,
    interests: userInterests.map((ui) => ui.interest),
    skills: userSkills.map((us) => us.skill),
  }
}

export async function getProfile(userId) {
  const [profile, userInterests, userSkills] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.userInterest.findMany({ where: { userId }, include: { interest: true } }),
    prisma.userSkill.findMany({ where: { userId }, include: { skill: true } }),
  ])

  return toProfileResponse(userId, profile, userInterests, userSkills)
}

// Partial update: hanya field yang ada di `data` yang disentuh. Ini
// mendukung alur Conversational Onboarding Agent (FR-023) yang menyimpan
// jawaban satu per satu (minat, lalu skill, lalu ketersediaan) tanpa
// menunggu semua pertanyaan terjawab — lihat PRD workflow 5.1.
export async function updateProfile(userId, data) {
  const { bio, location, avatarUrl, availability, education, motivation, interestIds, skillIds } = data

  if (interestIds) {
    const count = await prisma.interest.count({ where: { id: { in: interestIds } } })
    if (count !== interestIds.length) {
      throw new AppError(400, 'Salah satu minat tidak ditemukan')
    }
  }

  if (skillIds) {
    const count = await prisma.skill.count({ where: { id: { in: skillIds } } })
    if (count !== skillIds.length) {
      throw new AppError(400, 'Salah satu skill tidak ditemukan')
    }
  }

  const profileFields = {}
  if (bio !== undefined) profileFields.bio = bio
  if (location !== undefined) profileFields.location = location
  if (avatarUrl !== undefined) profileFields.avatarUrl = avatarUrl
  if (availability !== undefined) profileFields.availability = availability
  if (education !== undefined) profileFields.education = education
  if (motivation !== undefined) profileFields.motivation = motivation

  await prisma.$transaction(async (tx) => {
    if (Object.keys(profileFields).length > 0) {
      await tx.profile.upsert({
        where: { userId },
        create: { userId, ...profileFields },
        update: profileFields,
      })
    }

    if (interestIds) {
      await tx.userInterest.deleteMany({ where: { userId } })
      await tx.userInterest.createMany({
        data: interestIds.map((interestId) => ({ userId, interestId })),
      })
    }

    if (skillIds) {
      await tx.userSkill.deleteMany({ where: { userId } })
      await tx.userSkill.createMany({
        data: skillIds.map((skillId) => ({ userId, skillId })),
      })
    }
  })

  return getProfile(userId)
}
