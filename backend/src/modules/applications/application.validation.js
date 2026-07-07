const WHATSAPP_RE = /^(\+62|62|0)8[1-9][0-9]{6,11}$/
const AVAILABILITY_OPTIONS = ['weekday', 'weekend']

export function validateApplyInput(body) {
  const { eventId, whatsapp, motivation, availability } = body

  if (!eventId || typeof eventId !== 'string') {
    return { valid: false, message: 'eventId tidak valid' }
  }

  if (!whatsapp || !WHATSAPP_RE.test(whatsapp.trim())) {
    return { valid: false, message: 'Nomor WhatsApp tidak valid (contoh: 08123456789)' }
  }

  if (!motivation || typeof motivation !== 'string' || motivation.trim().length < 20) {
    return { valid: false, message: 'Motivasi harus minimal 20 karakter' }
  }

  if (motivation.trim().length > 1000) {
    return { valid: false, message: 'Motivasi maksimal 1000 karakter' }
  }

  if (
    !Array.isArray(availability) ||
    availability.length === 0 ||
    !availability.every((v) => AVAILABILITY_OPTIONS.includes(v))
  ) {
    return { valid: false, message: 'Pilih minimal satu ketersediaan (weekday / weekend)' }
  }

  return { valid: true }
}

const APPLICANT_STATUSES = [
  'applied', 'under_review', 'accepted', 'rejected', 'waitlisted',
  'checked_in', 'completed', 'no_show', 'cancelled_by_organizer', 'cancelled_by_volunteer',
]

export function validateUpdateStatus(body) {
  if (!APPLICANT_STATUSES.includes(body.status)) {
    return { valid: false, message: 'Status tidak valid' }
  }
  return { valid: true }
}

export function validateAddNote(body) {
  if (!body.note || typeof body.note !== 'string' || !body.note.trim()) {
    return { valid: false, message: 'Catatan tidak boleh kosong' }
  }
  return { valid: true }
}

export function validateAssign(body) {
  if (!body.eventRoleId || typeof body.eventRoleId !== 'string') {
    return { valid: false, message: 'eventRoleId wajib diisi' }
  }
  if (!body.eventShiftId || typeof body.eventShiftId !== 'string') {
    return { valid: false, message: 'eventShiftId wajib diisi' }
  }
  return { valid: true }
}

export function validateCheckIn(body) {
  if (!['qr', 'manual'].includes(body.method)) {
    return { valid: false, message: 'method harus qr atau manual' }
  }
  return { valid: true }
}
