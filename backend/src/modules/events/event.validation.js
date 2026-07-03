const EVENT_STATUSES = ['draft', 'pending_approval']

function validateShift(shift) {
  if (!shift.shiftDate || !shift.startTime || !shift.endTime) {
    return 'Setiap shift wajib punya tanggal, jam mulai, dan jam selesai'
  }
  if (!shift.quota || shift.quota < 1) {
    return 'Kuota shift minimal 1'
  }
  return null
}

function validateRole(role) {
  if (!role.roleName || typeof role.roleName !== 'string' || !role.roleName.trim()) {
    return 'Nama role wajib diisi'
  }
  if (!role.maxVolunteers || role.maxVolunteers < 1) {
    return 'Maks. volunteer per role minimal 1'
  }
  for (const shift of role.shifts ?? []) {
    const err = validateShift(shift)
    if (err) return err
  }
  return null
}

export function validateCreateEvent(body) {
  const { title, description, location, quota, startDate, endDate, status, impactMetricLabel, roles } = body

  if (!title || typeof title !== 'string' || !title.trim()) {
    return { valid: false, message: 'Judul kegiatan wajib diisi' }
  }
  if (!description || typeof description !== 'string' || !description.trim()) {
    return { valid: false, message: 'Deskripsi wajib diisi' }
  }
  if (!location || typeof location !== 'string' || !location.trim()) {
    return { valid: false, message: 'Lokasi wajib diisi' }
  }
  if (!quota || typeof quota !== 'number' || quota < 1) {
    return { valid: false, message: 'Kuota minimal 1' }
  }
  if (!startDate || !endDate) {
    return { valid: false, message: 'Tanggal mulai & selesai wajib diisi' }
  }
  if (!EVENT_STATUSES.includes(status)) {
    return { valid: false, message: 'Status tidak valid' }
  }
  if (!impactMetricLabel || typeof impactMetricLabel !== 'string' || !impactMetricLabel.trim()) {
    return { valid: false, message: 'Metrik dampak wajib diisi' }
  }
  if (roles !== undefined) {
    if (!Array.isArray(roles)) {
      return { valid: false, message: 'Format role tidak valid' }
    }
    for (const role of roles) {
      const err = validateRole(role)
      if (err) return { valid: false, message: err }
    }
  }

  return { valid: true }
}

export function validateAddRole(body) {
  const err = validateRole(body)
  if (err) return { valid: false, message: err }
  return { valid: true }
}

export function validateAddRequirement(body) {
  const { title, type } = body
  if (!title || typeof title !== 'string' || !title.trim()) {
    return { valid: false, message: 'Judul requirement wajib diisi' }
  }
  if (!['read_acknowledge', 'checklist', 'upload_proof'].includes(type)) {
    return { valid: false, message: 'Tipe requirement tidak valid' }
  }
  return { valid: true }
}

export function validateCloseEvent(body) {
  const { finalStatuses, impactValue } = body
  if (!finalStatuses || typeof finalStatuses !== 'object' || Array.isArray(finalStatuses)) {
    return { valid: false, message: 'finalStatuses wajib berupa object { applicationId: status }' }
  }
  if (typeof impactValue !== 'number' || impactValue < 0) {
    return { valid: false, message: 'Nilai impact wajib berupa angka >= 0' }
  }
  return { valid: true }
}
