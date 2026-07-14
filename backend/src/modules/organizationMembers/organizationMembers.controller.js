import {
  listMembers,
  inviteMember,
  resendInvite,
  updateMemberRole,
  removeMember,
  getInviteInfo,
  acceptInvite,
} from './organizationMembers.service.js'

export async function list(req, res, next) {
  try {
    const members = await listMembers(req.user.id)
    return res.json({ members })
  } catch (err) {
    next(err)
  }
}

export async function invite(req, res, next) {
  try {
    const { email, name, role } = req.body
    const member = await inviteMember(req.user.id, { email, name, role })
    return res.status(201).json({ member })
  } catch (err) {
    next(err)
  }
}

export async function resend(req, res, next) {
  try {
    const member = await resendInvite(req.user.id, req.params.id)
    return res.json({ member })
  } catch (err) {
    next(err)
  }
}

export async function updateRole(req, res, next) {
  try {
    const { role } = req.body
    const member = await updateMemberRole(req.user.id, req.params.id, role)
    return res.json({ member })
  } catch (err) {
    next(err)
  }
}

export async function remove(req, res, next) {
  try {
    await removeMember(req.user.id, req.params.id)
    return res.status(204).send()
  } catch (err) {
    next(err)
  }
}

// Publik (tanpa requireAuth) — dipanggil AcceptTeamInvitePage saat halaman
// dibuka, sebelum user submit apa pun.
export async function getInvite(req, res, next) {
  try {
    const { token } = req.params
    const info = await getInviteInfo(token)
    return res.json(info)
  } catch (err) {
    next(err)
  }
}

// Publik (tanpa requireAuth) — token sendiri jadi bukti kepemilikan undangan,
// sama pola dgn set-password organisasi.
export async function accept(req, res, next) {
  try {
    const { token } = req.params
    const { password } = req.body
    const result = await acceptInvite(token, { password })
    return res.json(result)
  } catch (err) {
    next(err)
  }
}
