import crypto from 'crypto'
import path from 'path'
import { rm } from 'fs/promises'
import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'
import { prisma } from '../../config/prisma.js'
import { AppError } from '../../utils/AppError.js'
import { hashToken } from '../../utils/hash.js'
import { generateOtpCode } from '../../utils/otp.js'
import { sendOrganizationSetPasswordEmail, sendOrganizationActivationOtpEmail } from '../../utils/mailer.js'
import { env } from '../../config/env.js'
import { ORG_LOGO_UPLOAD_DIR } from './organizationLogoUpload.js'

const ACTIVATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000
const OTP_MAX_VERIFY_ATTEMPTS = 5

// Status event yang dihitung sbg "aktif/berjalan" utk eventsCount organisasi —
// sama dengan filter yang dipakai listing publik volunteer (lihat event.service.js).
const COUNTABLE_EVENT_STATUSES = ['PUBLISHED', 'ONGOING', 'COMPLETED']

// Belum ada data rating organisasi (belum ada fitur ulasan) — kembalikan 0
// (netral, jujur) daripada mengarang angka, sampai fitur rating dibangun.
function serializeOrganization(org, eventsCount) {
  return {
    id: org.id,
    name: org.name,
    logoUrl: org.logoUrl ?? undefined,
    shortProfile: org.shortProfile,
    location: org.location,
    address: org.address ?? '',
    website: org.website ?? undefined,
    email: org.email,
    phone: org.phone,
    causeAreas: org.causeAreas,
    isVerified: org.isVerified,
    joinedYear: org.createdAt.getFullYear(),
    eventsCount,
    rating: 0,
    mission: org.mission ?? '',
    aboutUs: org.aboutUs ?? '',
  }
}

async function attachEventsCount(orgs) {
  const counts = await prisma.event.groupBy({
    by: ['organizationId'],
    where: { organizationId: { in: orgs.map((o) => o.id) }, status: { in: COUNTABLE_EVENT_STATUSES } },
    _count: { _all: true },
  })
  const countByOrg = new Map(counts.map((c) => [c.organizationId, c._count._all]))
  return orgs.map((org) => serializeOrganization(org, countByOrg.get(org.id) ?? 0))
}

// Direktori publik cuma menampilkan organisasi yang sudah ACTIVE — organisasi
// PENDING_VERIFICATION (baru diajukan, belum klik link aktivasi email) belum
// pantas muncul di FindOrganizationPage.
export async function listOrganizations({ name, location, causeArea } = {}) {
  const where = {
    status: 'ACTIVE',
    ...(name ? { name: { contains: name, mode: 'insensitive' } } : {}),
    ...(location ? { location: { contains: location, mode: 'insensitive' } } : {}),
    ...(causeArea ? { causeAreas: { has: causeArea } } : {}),
  }
  const orgs = await prisma.organization.findMany({ where, orderBy: { name: 'asc' } })
  return attachEventsCount(orgs)
}

export async function getOrganizationById(id) {
  const org = await prisma.organization.findUnique({ where: { id } })
  if (!org || org.status !== 'ACTIVE') {
    throw new AppError(404, 'Organisasi tidak ditemukan')
  }
  const [serialized] = await attachEventsCount([org])
  return serialized
}

// Dipanggil lazily dari event.service.js createEvent() — setiap organizer yang
// membuat event pertama kalinya otomatis punya Organization asli di baliknya,
// tanpa perlu UI "buat organisasi" terpisah. Jalur ini terpisah dari
// registerOrganization() di bawah — langsung ACTIVE, tidak lewat aktivasi
// email, supaya organizer yang sudah dibuat lewat portal organizer terpisah
// tidak terhalang. ownerId TIDAK unique lagi (satu owner bisa >1 organisasi
// lewat registerOrganization), jadi ambil yang pertama dibuat kalau ada.
export async function ensureOrganizationForOwner(ownerId, defaults) {
  const existing = await prisma.organization.findFirst({ where: { ownerId }, orderBy: { createdAt: 'asc' } })
  if (existing) return existing

  return prisma.organization.create({
    data: {
      ownerId,
      name: defaults.name,
      shortProfile: defaults.shortProfile ?? `Organisasi yang dikelola oleh ${defaults.name}.`,
      location: defaults.location ?? 'Indonesia',
      email: defaults.email ?? '',
      phone: defaults.phone ?? '',
      causeAreas: defaults.causeAreas ?? [],
      status: 'ACTIVE',
    },
  })
}

// Dipakai BrandingView.tsx (organizer) — logo dipakai jadi watermark kecil di
// tiap sertifikat yang diterbitkan (lihat certificate.service.js). Organizer
// yang belum pernah bikin event (belum ada Organization sama sekali) tetap
// dapat baris via ensureOrganizationForOwner (sama persis titik masuk lazy-
// provision yang dipakai createEvent()), supaya halaman Branding tidak buntu.
export async function getMyOrganization(ownerId) {
  const user = await prisma.user.findUnique({ where: { id: ownerId } })
  const organization = await ensureOrganizationForOwner(ownerId, { name: user.name })
  const [serialized] = await attachEventsCount([organization])
  return serialized
}

async function deleteLogoFileIfExists(logoUrl) {
  if (!logoUrl) return
  await rm(path.join(ORG_LOGO_UPLOAD_DIR, path.basename(logoUrl)), { force: true }).catch(() => {})
}

export async function updateMyOrganizationLogo(ownerId, file) {
  if (!file) throw new AppError(400, 'Pilih file logo terlebih dahulu')
  const user = await prisma.user.findUnique({ where: { id: ownerId } })
  const organization = await ensureOrganizationForOwner(ownerId, { name: user.name })

  await deleteLogoFileIfExists(organization.logoUrl)
  const updated = await prisma.organization.update({
    where: { id: organization.id },
    data: { logoUrl: `/uploads/org-logos/${file.filename}` },
  })
  const [serialized] = await attachEventsCount([updated])
  return serialized
}

// Dipanggil dari registerOrganization() — SATU alur untuk semua pendaftar,
// tidak peduli sudah punya akun ActiVibe atau belum (login state tidak
// dicek/tidak relevan di sini sama sekali). Kalau email organisasi sudah
// terdaftar (User manapun, sudah/belum verified), user itu dijadikan owner
// tanpa disentuh (password/isVerified/role-nya tidak diubah di sini — cuma
// diubah nanti di verifyOrganizationActivationOtp() KALAU dia berhasil
// membuktikan pemilik email lewat OTP). Kalau belum ada User sama sekali,
// dibuat baru dengan password placeholder acak (tidak bisa dipakai login,
// lagipula isVerified masih false sampai OTP diverifikasi).
async function resolveOwner(payload) {
  const contactName = payload.contactName?.trim()
  if (!contactName) {
    throw new AppError(400, 'Nama penanggung jawab wajib diisi')
  }

  const email = payload.email.trim()
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return existing

  const placeholderPassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10)
  try {
    return await prisma.user.create({
      data: { name: contactName, email, password: placeholderPassword, isVerified: false },
    })
  } catch (error) {
    // Race condition: email yang sama dibuat request lain di antara findUnique
    // di atas dan create ini — bukan error bagi user, cukup ambil yang sudah
    // dibuat request lain itu (sama-sama valid jadi owner).
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return prisma.user.findUniqueOrThrow({ where: { email } })
    }
    throw error
  }
}

// Form self-service "Daftarkan Organisasimu" — beda dari ensureOrganizationForOwner:
// bisa dipanggil siapapun (tidak perlu login), org dibuat PENDING_VERIFICATION
// dulu, dan satu owner boleh punya banyak baris (tidak dicek existing seperti
// ensureOrganizationForOwner). SATU alur email untuk semua kasus: link "atur
// password" (lihat requestOrganizationActivationOtp/verifyOrganizationActivationOtp
// di bawah utk 2 langkah setelahnya).
export async function registerOrganization(payload) {
  const owner = await resolveOwner(payload)
  const token = crypto.randomBytes(32).toString('hex')

  const organization = await prisma.organization.create({
    data: {
      ownerId: owner.id,
      name: payload.name.trim(),
      shortProfile: payload.shortProfile.trim(),
      location: payload.location.trim(),
      address: payload.address?.trim() || null,
      website: payload.website?.trim() || null,
      email: payload.email.trim(),
      phone: payload.phone.trim(),
      causeAreas: payload.causeAreas ?? [],
      status: 'PENDING_VERIFICATION',
      activationTokenHash: hashToken(token),
      activationTokenExpiresAt: new Date(Date.now() + ACTIVATION_TOKEN_TTL_MS),
    },
  })

  // owner.isVerified = email ini sudah akun ActiVibe aktif (bukan sekadar
  // placeholder yang baru dibuat resolveOwner) — email set-password perlu
  // bilang eksplisit bahwa lanjut = mengganti password akun itu, bukan cuma
  // "aktivasi organisasi baru" (lihat sendOrganizationSetPasswordEmail).
  const setPasswordUrl = `${env.VOLUNTEER_PORTAL_URL}/set-password-organisasi?token=${token}`
  await sendOrganizationSetPasswordEmail(organization.email, {
    organizationName: organization.name,
    contactName: payload.contactName.trim(),
    setPasswordUrl,
    existingAccount: owner.isVerified,
  })

  return organization
}

// Dipanggil SetOrganizationPasswordPage saat halaman dibuka (sebelum user
// submit apa-apa) — read-only, TIDAK generate/kirim OTP (beda dari
// requestOrganizationActivationOtp di bawah). Dipakai utk menampilkan warning
// "email ini sudah terhubung ke akun ActiVibe yang aktif" SEBELUM user
// melanjutkan, supaya konfirmasi terjadi lebih awal daripada baru sadar
// setelah password akun lain keburu diganti.
export async function getOrganizationActivationInfo(token) {
  const organization = await findPendingOrganizationByToken(token)
  assertActivationTokenValid(organization)

  const owner = await prisma.user.findUnique({ where: { id: organization.ownerId } })
  if (!owner) {
    throw new AppError(400, 'Link tidak valid')
  }

  return { organizationName: organization.name, existingAccount: owner.isVerified }
}

function findPendingOrganizationByToken(token) {
  return prisma.organization.findUnique({ where: { activationTokenHash: hashToken(token) } })
}

function assertActivationTokenValid(organization) {
  if (!organization || organization.status === 'ACTIVE') {
    throw new AppError(400, 'Link tidak valid atau sudah dipakai')
  }
  if (organization.activationTokenExpiresAt && organization.activationTokenExpiresAt < new Date()) {
    throw new AppError(400, 'Link sudah kedaluwarsa')
  }
}

// Langkah 1 dari 2 di SetOrganizationPasswordPage (frontend): dipanggil begitu
// user submit password+konfirmasi (password itu sendiri baru DIVALIDASI, belum
// disimpan — lihat verifyOrganizationActivationOtp). Kirim kode OTP ke email
// organisasi sbg pembuktian pemilik email, sama seperti OTP registrasi biasa
// (auth.service.js) tapi pakai purpose terpisah (ORGANIZATION_ACTIVATION) &
// keyed ke owner organisasi ini, bukan ke sesi login.
export async function requestOrganizationActivationOtp(token) {
  const organization = await findPendingOrganizationByToken(token)
  assertActivationTokenValid(organization)

  const code = generateOtpCode()
  await prisma.otpRequest.create({
    data: {
      userId: organization.ownerId,
      code: hashToken(code),
      purpose: 'ORGANIZATION_ACTIVATION',
      expiresAt: new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000),
    },
  })
  await sendOrganizationActivationOtpEmail(organization.email, {
    organizationName: organization.name,
    code,
    expiryMinutes: env.OTP_EXPIRY_MINUTES,
  })

  return { organizationName: organization.name }
}

// Langkah 2: user submit kode OTP dari email + password (dikirim ulang dari
// state form, bukan disimpan di server sejak langkah 1) — begitu kode benar,
// password BARU disimpan (hash) + isVerified:true + role ORGANIZER + organisasi
// diaktifkan, semua dalam satu transaksi. Kalau owner sudah isVerified duluan
// (skenario: daftar >1 organisasi dgn email yg sama, atau emailnya memang
// akun ActiVibe existing) OTP tetap wajib dibuktikan dulu (email itu tetap
// bisa dipakai reset password akun manapun via alur ini — sengaja, krn sudah
// digate OTP), tapi passwordnya TETAP diganti sesuai yang baru diisi di sini.
export async function verifyOrganizationActivationOtp(token, password, code) {
  const organization = await findPendingOrganizationByToken(token)
  assertActivationTokenValid(organization)

  const owner = await prisma.user.findUnique({ where: { id: organization.ownerId } })
  if (!owner) {
    throw new AppError(400, 'Link tidak valid')
  }

  const otp = await prisma.otpRequest.findFirst({
    where: { userId: owner.id, purpose: 'ORGANIZATION_ACTIVATION', verifiedAt: null },
    orderBy: { createdAt: 'desc' },
  })
  if (!otp || otp.expiresAt < new Date()) {
    throw new AppError(400, 'Kode OTP sudah kedaluwarsa, minta kode baru')
  }
  if (otp.attempts >= OTP_MAX_VERIFY_ATTEMPTS) {
    throw new AppError(429, 'Terlalu banyak percobaan salah, minta kode baru')
  }
  if (hashToken(code) !== otp.code) {
    await prisma.otpRequest.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } })
    throw new AppError(400, 'Kode OTP salah')
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  await prisma.$transaction([
    prisma.otpRequest.update({ where: { id: otp.id }, data: { verifiedAt: new Date() } }),
    prisma.user.update({
      where: { id: owner.id },
      data: {
        password: hashedPassword,
        isVerified: true,
        ...(owner.role !== 'ORGANIZER' ? { role: 'ORGANIZER' } : {}),
      },
    }),
    prisma.organization.update({
      where: { id: organization.id },
      data: { status: 'ACTIVE', activationTokenHash: null, activationTokenExpiresAt: null },
    }),
  ])

  return { organizationName: organization.name, email: owner.email }
}
