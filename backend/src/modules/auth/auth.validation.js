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
