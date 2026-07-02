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
