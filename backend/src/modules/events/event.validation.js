const EVENT_STATUSES = ['draft', 'pending_approval']
const MOTIVATION_VALUES = ['CAREER', 'SOCIAL', 'VALUES', 'SKILL_GROWTH']
const DAY_TYPE_VALUES = ['WEEKDAY', 'WEEKEND', 'BOTH']
const EVENT_MODE_VALUES = ['ONLINE', 'OFFLINE']
const ENTITY_TYPE_VALUES = ['INDIVIDU', 'PT', 'CV', 'YAYASAN', 'ORGANISASI']
const LEGAL_DOC_TYPE_VALUES = ['NIB', 'AKTA', 'SK_KEMENKUMHAM', 'NPWP']
const MAX_GALLERY_IMAGES = 6

// Harus persis sama dengan frontend/src/lib/organizerDeclarationItems.ts —
// tidak ada package bersama di monorepo ini, jadi disinkronkan manual.
export const ORGANIZER_DECLARATION_KEYS = [
  'infoAccurate',
  'documentsValid',
  'fullResponsibility',
  'compliesWithLaw',
  'notFictionalEvent',
  'noProhibitedContent',
  'permitsObtained',
  'publicationOnlyAck',
  'organizerLiabilityAck',
  'platformModerationAck',
  'agreesToTerms',
]

function isUploadedFile(value) {
  return value && typeof value === 'object' && typeof value.url === 'string' && value.url.trim()
}

// Business rule 1 ("surat lengkap"): reuse persis aturan dokumen wajib yang
// sudah ada di blok pending_approval di bawah, tapi sbg fungsi murni yang
// bisa dipakai baik utk request body baru (createEvent) MAUPUN event lama yg
// sudah tersimpan di DB (bentuk berbeda — lihat pemanggilnya di
// event.service.js assertNoPicConflict, yang membungkus kolom Event jadi
// shape { url } yang sama). Dipisah dari validateCreateEvent supaya tidak
// duplikasi aturan "dokumen apa aja yang wajib".
export function isEventDocumentSetComplete({ eventMode, onBehalfOfInstitution, organizationEntityType, documents, legalDocumentsCount }) {
  const docs = documents ?? {}
  if (!isUploadedFile(docs.proposal)) return false
  if (!isUploadedFile(docs.rundown)) return false
  if (!isUploadedFile(docs.poster)) return false
  if (!isUploadedFile(docs.responsibilityLetter)) return false
  if ((eventMode ?? 'OFFLINE') === 'OFFLINE' && !isUploadedFile(docs.locationPermit)) return false
  if (onBehalfOfInstitution === true && !isUploadedFile(docs.assignmentLetter)) return false
  if ((organizationEntityType ?? 'INDIVIDU') !== 'INDIVIDU' && (legalDocumentsCount ?? 0) < 1) return false
  return true
}

function isStringIdArray(value) {
  return Array.isArray(value) && value.every((v) => typeof v === 'string' && v.trim())
}

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
  const {
    title,
    description,
    location,
    quota,
    startDate,
    endDate,
    status,
    impactMetricLabel,
    roles,
    category,
    skillIds,
    interestIds,
    motivationTags,
    dayType,
    eventMode,
    mapLink,
    organizationEntityType,
    onBehalfOfInstitution,
    documents,
    legalDocuments,
    galleryImages,
    declarationChecklist,
    picName,
    picContact,
    picEmail,
  } = body

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
  // Business rule 2: organizer cuma bisa membuat event dari hari ini ke depan
  // — startDate/endDate arrive sbg 'YYYY-MM-DD' (format <input type="date">),
  // jadi perbandingan string leksikografis aman dipakai di sini (sama pola
  // dgn TODAY di ImpactTab.tsx frontend).
  const todayStr = new Date().toISOString().slice(0, 10)
  if (startDate < todayStr) {
    return { valid: false, message: 'Tanggal mulai tidak boleh sebelum hari ini' }
  }
  if (endDate < startDate) {
    return { valid: false, message: 'Tanggal selesai tidak boleh sebelum tanggal mulai' }
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
  // Kategori/skill/interest/motivationTags/dayType semuanya opsional — event
  // yang tidak diisi tag-nya tetap valid, cuma matching score-nya netral
  // (lihat matchScore.js overlap()).
  if (category !== undefined && typeof category !== 'string') {
    return { valid: false, message: 'Kategori tidak valid' }
  }
  if (skillIds !== undefined && !isStringIdArray(skillIds)) {
    return { valid: false, message: 'skillIds harus berupa array id' }
  }
  if (interestIds !== undefined && !isStringIdArray(interestIds)) {
    return { valid: false, message: 'interestIds harus berupa array id' }
  }
  if (motivationTags !== undefined) {
    if (!Array.isArray(motivationTags) || motivationTags.some((m) => !MOTIVATION_VALUES.includes(m))) {
      return { valid: false, message: 'motivationTags tidak valid' }
    }
  }
  if (dayType !== undefined && dayType !== null && !DAY_TYPE_VALUES.includes(dayType)) {
    return { valid: false, message: 'dayType tidak valid' }
  }

  // --- Enhancement: verifikasi organizer, dokumen pendukung, galeri, peta lokasi ---
  // Sanity check tipe/enum berlaku di draft maupun pending_approval (murah, bukan
  // "wajib diisi"). Cek "wajib diisi sebelum publikasikan" ada di blok status
  // pending_approval di bawah — draft TETAP selenggah field2 lama (autosave WIP).
  if (eventMode !== undefined && !EVENT_MODE_VALUES.includes(eventMode)) {
    return { valid: false, message: 'eventMode tidak valid' }
  }
  if (mapLink !== undefined && mapLink !== null && typeof mapLink !== 'string') {
    return { valid: false, message: 'mapLink tidak valid' }
  }
  if (organizationEntityType !== undefined && !ENTITY_TYPE_VALUES.includes(organizationEntityType)) {
    return { valid: false, message: 'organizationEntityType tidak valid' }
  }
  if (onBehalfOfInstitution !== undefined && typeof onBehalfOfInstitution !== 'boolean') {
    return { valid: false, message: 'onBehalfOfInstitution harus boolean' }
  }
  if (galleryImages !== undefined) {
    if (!Array.isArray(galleryImages) || galleryImages.length > MAX_GALLERY_IMAGES || !galleryImages.every(isUploadedFile)) {
      return { valid: false, message: `Galeri maksimal ${MAX_GALLERY_IMAGES} gambar dan setiap gambar wajib punya url` }
    }
  }
  if (legalDocuments !== undefined) {
    if (
      !Array.isArray(legalDocuments) ||
      !legalDocuments.every((d) => d && LEGAL_DOC_TYPE_VALUES.includes(d.docType) && isUploadedFile(d))
    ) {
      return { valid: false, message: 'Format dokumen legal tidak valid' }
    }
  }

  if (status === 'pending_approval') {
    const docs = documents ?? {}
    if (!isUploadedFile(docs.proposal)) {
      return { valid: false, message: 'Proposal Kegiatan wajib diunggah sebelum dipublikasikan' }
    }
    if (!isUploadedFile(docs.rundown)) {
      return { valid: false, message: 'Rundown Acara wajib diunggah sebelum dipublikasikan' }
    }
    if (!isUploadedFile(docs.poster)) {
      return { valid: false, message: 'Poster Event wajib diunggah sebelum dipublikasikan' }
    }
    if (!isUploadedFile(docs.responsibilityLetter)) {
      return { valid: false, message: 'Surat Pernyataan Penanggung Jawab wajib diunggah sebelum dipublikasikan' }
    }
    if (!picName || typeof picName !== 'string' || !picName.trim()) {
      return { valid: false, message: 'Nama PIC/pengurus wajib diisi sebelum dipublikasikan' }
    }
    // Sub Organizer (kontak PIC reusable): WA & email wajib supaya bisa
    // dicantumkan di email tiket volunteer yang diterima (lihat mailer.js
    // sendEventTicketEmail) — sebelumnya picContact opsional & tidak ada picEmail.
    if (!picContact || typeof picContact !== 'string' || !picContact.trim()) {
      return { valid: false, message: 'Kontak WA PIC wajib diisi sebelum dipublikasikan' }
    }
    if (!picEmail || typeof picEmail !== 'string' || !/^\S+@\S+\.\S+$/.test(picEmail.trim())) {
      return { valid: false, message: 'Email PIC wajib diisi (format tidak valid) sebelum dipublikasikan' }
    }
    if ((eventMode ?? 'OFFLINE') === 'OFFLINE' && !isUploadedFile(docs.locationPermit)) {
      return { valid: false, message: 'Surat Izin Penggunaan Lokasi wajib diunggah untuk event offline' }
    }
    if (onBehalfOfInstitution === true && !isUploadedFile(docs.assignmentLetter)) {
      return { valid: false, message: 'Surat Penugasan wajib diunggah karena event atas nama instansi' }
    }
    if ((organizationEntityType ?? 'INDIVIDU') !== 'INDIVIDU' && (!Array.isArray(legalDocuments) || legalDocuments.length < 1)) {
      return { valid: false, message: 'Minimal satu Dokumen Legal Organisasi wajib diunggah' }
    }
    if (!Array.isArray(galleryImages) || galleryImages.length < 1) {
      return { valid: false, message: 'Minimal satu gambar dokumentasi event wajib diunggah' }
    }
    if (
      !declarationChecklist ||
      typeof declarationChecklist !== 'object' ||
      !ORGANIZER_DECLARATION_KEYS.every((key) => declarationChecklist[key] === true)
    ) {
      return { valid: false, message: 'Seluruh pernyataan organizer wajib dicentang sebelum dipublikasikan' }
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
  const { finalStatuses, impactValue, closeReport } = body
  if (!finalStatuses || typeof finalStatuses !== 'object' || Array.isArray(finalStatuses)) {
    return { valid: false, message: 'finalStatuses wajib berupa object { applicationId: status }' }
  }
  if (typeof impactValue !== 'number' || impactValue < 0) {
    return { valid: false, message: 'Nilai impact wajib berupa angka >= 0' }
  }
  // Business rule 1b: laporan penutupan kegiatan wajib diisi saat closeEvent —
  // jadi arsip resmi ActiVibe + sumber data yg diarsipkan ke Impact Passport
  // (lihat EventCloseReport di schema.prisma). Validasi field kategori-
  // spesifik (categoryMetrics) sengaja tidak di sini krn butuh event.category
  // yang cuma tersedia di service layer (lihat closeEvent di event.service.js).
  if (!closeReport || typeof closeReport !== 'object') {
    return { valid: false, message: 'Laporan penutupan kegiatan wajib diisi' }
  }
  if (!closeReport.narrativeSummary || typeof closeReport.narrativeSummary !== 'string' || !closeReport.narrativeSummary.trim()) {
    return { valid: false, message: 'Ringkasan naratif hasil kegiatan wajib diisi' }
  }
  if (typeof closeReport.volunteersPresentCount !== 'number' || closeReport.volunteersPresentCount < 0) {
    return { valid: false, message: 'Jumlah relawan hadir wajib berupa angka >= 0' }
  }
  if (typeof closeReport.totalContributionHours !== 'number' || closeReport.totalContributionHours < 0) {
    return { valid: false, message: 'Jam kerja wajib berupa angka >= 0' }
  }
  if (closeReport.photoUrls !== undefined && !Array.isArray(closeReport.photoUrls)) {
    return { valid: false, message: 'Format foto dokumentasi tidak valid' }
  }
  return { valid: true }
}

export function validateFeedback(body) {
  const { rating, comment } = body
  if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { valid: false, message: 'Rating wajib berupa bilangan bulat 1-5' }
  }
  if (comment !== undefined && comment !== null && typeof comment !== 'string') {
    return { valid: false, message: 'Komentar tidak valid' }
  }
  return { valid: true }
}
