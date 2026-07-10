const USER_STATUSES = ['active', 'suspended', 'inactive']

export function validateUserStatus(body) {
  if (!USER_STATUSES.includes(body.status)) {
    return { valid: false, message: 'Status tidak valid' }
  }
  return { valid: true }
}

export function validateEventReject(body) {
  if (!body.reviewNote || typeof body.reviewNote !== 'string' || !body.reviewNote.trim()) {
    return { valid: false, message: 'Alasan penolakan wajib diisi' }
  }
  return { valid: true }
}

export function validateOrganizerWarning(body) {
  if (!body.message || typeof body.message !== 'string' || !body.message.trim()) {
    return { valid: false, message: 'Pesan peringatan wajib diisi' }
  }
  if (body.message.trim().length > 500) {
    return { valid: false, message: 'Pesan peringatan maksimal 500 karakter' }
  }
  return { valid: true }
}
