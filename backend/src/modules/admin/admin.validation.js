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
