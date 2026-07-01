const AVAILABILITY_VALUES = ['WEEKDAY', 'WEEKEND', 'BOTH']
const MOTIVATION_VALUES = ['CAREER', 'SOCIAL', 'VALUES', 'SKILL_GROWTH']
const MAX_BIO_LENGTH = 500
const MAX_EDUCATION_LENGTH = 200

function isStringIdArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string' && item.length > 0)
}

export function validateProfileUpdateInput(body) {
  const { bio, location, avatarUrl, availability, education, motivation, interestIds, skillIds } = body

  const hasAnyField =
    bio !== undefined ||
    location !== undefined ||
    avatarUrl !== undefined ||
    availability !== undefined ||
    education !== undefined ||
    motivation !== undefined ||
    interestIds !== undefined ||
    skillIds !== undefined

  if (!hasAnyField) {
    return { valid: false, message: 'Tidak ada data profil yang dikirim' }
  }

  if (bio !== undefined && (typeof bio !== 'string' || bio.length > MAX_BIO_LENGTH)) {
    return { valid: false, message: `Bio harus berupa teks maksimal ${MAX_BIO_LENGTH} karakter` }
  }

  if (location !== undefined && typeof location !== 'string') {
    return { valid: false, message: 'Lokasi harus berupa teks' }
  }

  if (avatarUrl !== undefined && typeof avatarUrl !== 'string') {
    return { valid: false, message: 'Avatar URL harus berupa teks' }
  }

  if (availability !== undefined && !AVAILABILITY_VALUES.includes(availability)) {
    return { valid: false, message: 'Ketersediaan harus salah satu dari WEEKDAY, WEEKEND, BOTH' }
  }

  if (education !== undefined && (typeof education !== 'string' || education.length > MAX_EDUCATION_LENGTH)) {
    return { valid: false, message: `Jurusan/pendidikan harus berupa teks maksimal ${MAX_EDUCATION_LENGTH} karakter` }
  }

  if (motivation !== undefined && !MOTIVATION_VALUES.includes(motivation)) {
    return { valid: false, message: 'Motivasi harus salah satu dari CAREER, SOCIAL, VALUES, SKILL_GROWTH' }
  }

  if (interestIds !== undefined && !isStringIdArray(interestIds)) {
    return { valid: false, message: 'interestIds harus berupa array id' }
  }

  if (skillIds !== undefined && !isStringIdArray(skillIds)) {
    return { valid: false, message: 'skillIds harus berupa array id' }
  }

  return { valid: true }
}
