import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '../../config/prisma.js'
import { AppError } from '../../utils/AppError.js'
import { hashToken } from '../../utils/hash.js'
import { sendOrganizationMemberInviteEmail } from '../../utils/mailer.js'
import { env } from '../../config/env.js'
import { ensureOrganizationForOwner } from '../organizations/organization.service.js'

// Sama besaran dgn pola token lain di repo (activation token organisasi pakai
// 24 jam) tapi lebih longgar krn undangan tim biasanya tidak dibuka sesegera
// itu (bukan flow "sedang di depan layar" spt aktivasi organisasi sendiri).
const INVITE_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

const VALID_ROLES = ['OWNER', 'ADMINISTRATOR', 'COORDINATOR']
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Tidak leak inviteTokenHash ke client sama sekali.
function serializeMember(member) {
  return {
    id: member.id,
    email: member.email,
    name: member.name,
    role: member.role,
    status: member.status,
    joinedAt: member.joinedAt ?? undefined,
    createdAt: member.createdAt,
  }
}

// Pola sama persis resolveOrganizationId di subOrganizer.service.js — satu
// organizer di-treat sbg satu Organization utama (belum ada UI "kelola
// organisasi saya" utk multi-org). Lazy-create org kalau organizer belum
// pernah bikin event/organisasi sama sekali.
async function resolveOrganizationId(organizerId) {
  // deletedAt: null — organisasi yang sudah di-soft-delete tidak boleh
  // dianggap "organisasi aktif" organizer ini (lihat sweep di CLAUDE.md).
  const existing = await prisma.organization.findFirst({ where: { ownerId: organizerId, deletedAt: null }, orderBy: { createdAt: 'asc' } })
  if (existing) return existing.id

  const owner = await prisma.user.findUniqueOrThrow({ where: { id: organizerId } })
  const organization = await ensureOrganizationForOwner(organizerId, {
    name: owner.name,
    email: owner.email ?? '',
    phone: owner.phone ?? '',
  })
  return organization.id
}

async function assertOwnsMember(organizerId, id) {
  const organizationId = await resolveOrganizationId(organizerId)
  const member = await prisma.organizationMember.findUnique({ where: { id } })
  if (!member || member.organizationId !== organizationId) {
    throw new AppError(404, 'Anggota tim tidak ditemukan')
  }
  return member
}

function assertValidRole(role) {
  if (!VALID_ROLES.includes(role)) {
    throw new AppError(400, 'Role anggota tim tidak valid')
  }
}

function buildInviteUrl(token) {
  return `${env.ORGANIZER_PORTAL_URL}/accept-invite?token=${token}`
}

export async function listMembers(organizerId) {
  const organizationId = await resolveOrganizationId(organizerId)
  const members = await prisma.organizationMember.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'asc' },
  })
  return members.map(serializeMember)
}

// Kalau email ini sudah pernah diundang (status INVITED) & belum accept,
// undangan lama di-reuse (token diregenerasi) alih-alih ditolak 409 — supaya
// organizer bisa "invite lagi" begitu saja kalau volunteer/calon anggota
// kehilangan email pertama. 409 cuma utk email yang SUDAH jadi anggota aktif.
export async function inviteMember(organizerId, { email, name, role }) {
  const trimmedEmail = email?.trim().toLowerCase()
  const trimmedName = name?.trim()
  if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
    throw new AppError(400, 'Email tidak valid')
  }
  if (!trimmedName) {
    throw new AppError(400, 'Nama anggota tim wajib diisi')
  }
  assertValidRole(role)

  const organizationId = await resolveOrganizationId(organizerId)
  const [organization, inviter] = await Promise.all([
    prisma.organization.findUniqueOrThrow({ where: { id: organizationId } }),
    prisma.user.findUniqueOrThrow({ where: { id: organizerId } }),
  ])

  const existing = await prisma.organizationMember.findUnique({
    where: { organizationId_email: { organizationId, email: trimmedEmail } },
  })
  if (existing && existing.status === 'ACTIVE') {
    throw new AppError(409, 'Email ini sudah jadi anggota aktif organisasi')
  }

  const token = crypto.randomUUID()
  const data = {
    organizationId,
    email: trimmedEmail,
    name: trimmedName,
    role,
    status: 'INVITED',
    inviteTokenHash: hashToken(token),
    inviteTokenExpiresAt: new Date(Date.now() + INVITE_TOKEN_TTL_MS),
    invitedById: organizerId,
  }

  const member = existing
    ? await prisma.organizationMember.update({ where: { id: existing.id }, data })
    : await prisma.organizationMember.create({ data })

  await sendOrganizationMemberInviteEmail(trimmedEmail, {
    inviterName: inviter.name,
    organizationName: organization.name,
    role,
    inviteUrl: buildInviteUrl(token),
  })

  await prisma.auditLog.create({
    data: {
      actorId: organizerId,
      action: 'Mengundang anggota tim',
      targetType: 'OrganizationMember',
      targetId: member.id,
      targetLabel: member.email,
    },
  })

  return serializeMember(member)
}

export async function resendInvite(organizerId, id) {
  const member = await assertOwnsMember(organizerId, id)
  if (member.status !== 'INVITED') {
    throw new AppError(400, 'Anggota ini sudah aktif, tidak perlu mengirim ulang undangan')
  }

  const [organization, inviter] = await Promise.all([
    prisma.organization.findUniqueOrThrow({ where: { id: member.organizationId } }),
    prisma.user.findUniqueOrThrow({ where: { id: organizerId } }),
  ])

  const token = crypto.randomUUID()
  const updated = await prisma.organizationMember.update({
    where: { id: member.id },
    data: {
      inviteTokenHash: hashToken(token),
      inviteTokenExpiresAt: new Date(Date.now() + INVITE_TOKEN_TTL_MS),
    },
  })

  await sendOrganizationMemberInviteEmail(member.email, {
    inviterName: inviter.name,
    organizationName: organization.name,
    role: member.role,
    inviteUrl: buildInviteUrl(token),
  })

  return serializeMember(updated)
}

// Owner dianggap ditetapkan di titik pembuatan organisasi secara konseptual
// (bukan role yang bisa dipindah-pindah lewat endpoint ini) — daripada
// membangun guard "minimal 1 owner tersisa" yang rumit utk kasus yang belum
// pernah kejadian nyata (belum ada UI yang bikin member OWNER kedua), lebih
// aman total menolak perubahan role anggota yang sudah OWNER.
export async function updateMemberRole(organizerId, id, role) {
  assertValidRole(role)
  const member = await assertOwnsMember(organizerId, id)
  if (member.role === 'OWNER') {
    throw new AppError(400, 'Role Owner tidak bisa diubah lewat sini')
  }

  const updated = await prisma.organizationMember.update({ where: { id: member.id }, data: { role } })
  return serializeMember(updated)
}

export async function removeMember(organizerId, id) {
  const member = await assertOwnsMember(organizerId, id)
  if (member.role === 'OWNER') {
    throw new AppError(400, 'Anggota dengan role Owner tidak bisa dihapus')
  }

  await prisma.organizationMember.delete({ where: { id: member.id } })

  await prisma.auditLog.create({
    data: {
      actorId: organizerId,
      action: 'Menghapus anggota tim',
      targetType: 'OrganizationMember',
      targetId: member.id,
      targetLabel: member.email,
    },
  })
}

// ============================================
// PUBLIC (no auth) — accept-invite flow, dipakai AcceptTeamInvitePage
// ============================================

function findMemberByToken(token) {
  return prisma.organizationMember.findUnique({ where: { inviteTokenHash: hashToken(token) } })
}

function assertInviteTokenValid(member) {
  if (!member || member.status === 'ACTIVE') {
    throw new AppError(404, 'Undangan tidak ditemukan atau sudah dipakai')
  }
  if (member.inviteTokenExpiresAt && member.inviteTokenExpiresAt < new Date()) {
    throw new AppError(400, 'Link undangan sudah kedaluwarsa, minta organizer mengirim ulang')
  }
}

// Dipanggil AcceptTeamInvitePage saat halaman dibuka — read-only, dipakai utk
// menampilkan nama organisasi & role sebelum user isi password.
export async function getInviteInfo(token) {
  const member = await findMemberByToken(token)
  assertInviteTokenValid(member)

  const organization = await prisma.organization.findUniqueOrThrow({ where: { id: member.organizationId } })
  return { organizationName: organization.name, role: member.role, email: member.email }
}

// Beda dari verifyOrganizationActivationOtp (organization.service.js): tidak
// ada langkah OTP terpisah di sini — pengiriman link undangan lewat email
// organisasi ITU SENDIRI sudah jadi pembuktian pemilik email (organizer yang
// mengundang sudah tahu & pilih email itu, bukan self-registrasi publik yang
// perlu OTP tambahan). Sengaja TIDAK auto-login (mirror keputusan
// verifyOrganizationActivationOtp) — cukup kembalikan info supaya frontend
// arahkan ke halaman login portal organizer.
export async function acceptInvite(token, { password }) {
  if (!password || typeof password !== 'string' || password.length < 8) {
    throw new AppError(400, 'Password minimal 8 karakter')
  }

  const member = await findMemberByToken(token)
  assertInviteTokenValid(member)

  const hashedPassword = await bcrypt.hash(password, 10)

  const result = await prisma.$transaction(async (tx) => {
    let user = await tx.user.findUnique({ where: { email: member.email } })
    if (user) {
      user = await tx.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          isVerified: true,
          // Mirror verifyOrganizationActivationOtp: naikkan ke ORGANIZER
          // kecuali sudah ORGANIZER (bukan hanya dari VOLUNTEER — konsisten
          // dgn alur aktivasi organisasi yang sudah ada).
          ...(user.role !== 'ORGANIZER' ? { role: 'ORGANIZER' } : {}),
        },
      })
    } else {
      user = await tx.user.create({
        data: {
          name: member.name,
          email: member.email,
          password: hashedPassword,
          isVerified: true,
          role: 'ORGANIZER',
        },
      })
    }

    const updatedMember = await tx.organizationMember.update({
      where: { id: member.id },
      data: {
        userId: user.id,
        status: 'ACTIVE',
        joinedAt: new Date(),
        inviteTokenHash: null,
        inviteTokenExpiresAt: null,
      },
    })

    return { user, member: updatedMember }
  })

  return { email: result.user.email, organizationId: result.member.organizationId }
}
