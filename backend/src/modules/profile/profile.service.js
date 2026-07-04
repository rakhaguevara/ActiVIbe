import path from 'path'
import { rm } from 'fs/promises'
import { prisma } from '../../config/prisma.js'
import { AppError } from '../../utils/AppError.js'
import { CV_UPLOAD_DIR } from './cv.upload.js'

function toProfileResponse(userId, profile, userInterests, userSkills) {
  return {
    userId,
    bio: profile?.bio ?? null,
    location: profile?.location ?? null,
    avatarUrl: profile?.avatarUrl ?? null,
    availability: profile?.availability ?? null,
    education: profile?.education ?? null,
    motivation: profile?.motivation ?? null,
    cvUrl: profile?.cvUrl ?? null,
    cvFileName: profile?.cvFileName ?? null,
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
  const { bio, location, avatarUrl, availability, education, motivation, interestIds, skillIds, customInterests } = data

  // Minat "Lainnya" yang diketik bebas (bukan dipilih dari taksonomi) —
  // di-upsert by name jadi Interest kategori "Lainnya" supaya user lain yang
  // ketik nama sama otomatis kepakai record yg sama (bukan duplikat), lalu
  // ikut digabung ke set minat final yang dipilih user ini.
  let finalInterestIds = interestIds
  if (customInterests && customInterests.length > 0) {
    const createdInterests = await Promise.all(
      customInterests.map((raw) =>
        prisma.interest.upsert({
          where: { name: raw.trim() },
          update: {},
          create: { name: raw.trim(), category: 'Lainnya' },
        }),
      ),
    )
    finalInterestIds = Array.from(new Set([...(interestIds ?? []), ...createdInterests.map((i) => i.id)]))
  }

  if (finalInterestIds) {
    const count = await prisma.interest.count({ where: { id: { in: finalInterestIds } } })
    if (count !== finalInterestIds.length) {
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

    if (finalInterestIds) {
      await tx.userInterest.deleteMany({ where: { userId } })
      await tx.userInterest.createMany({
        data: finalInterestIds.map((interestId) => ({ userId, interestId })),
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

// Best-effort: file lama mungkin sudah tidak ada (mis. sudah dihapus manual),
// jangan sampai itu menggagalkan replace/hapus CV yang baru.
async function deleteCvFileIfExists(cvUrl) {
  if (!cvUrl) return
  await rm(path.join(CV_UPLOAD_DIR, path.basename(cvUrl)), { force: true }).catch(() => {})
}

export async function saveCv(userId, file) {
  const existing = await prisma.profile.findUnique({ where: { userId } })
  await deleteCvFileIfExists(existing?.cvUrl)

  const cvFields = { cvUrl: `/uploads/cv/${file.filename}`, cvFileName: file.originalname }
  await prisma.profile.upsert({
    where: { userId },
    create: { userId, ...cvFields },
    update: cvFields,
  })

  return getProfile(userId)
}

export async function removeCv(userId) {
  const existing = await prisma.profile.findUnique({ where: { userId } })
  if (existing?.cvUrl) {
    await deleteCvFileIfExists(existing.cvUrl)
    await prisma.profile.update({ where: { userId }, data: { cvUrl: null, cvFileName: null } })
  }

  return getProfile(userId)
}
