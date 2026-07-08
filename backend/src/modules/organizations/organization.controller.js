import { listOrganizations, getOrganizationById, registerOrganization, activateOrganization } from './organization.service.js'
import { env } from '../../config/env.js'

export async function list(req, res, next) {
  try {
    const { name, location, causeArea } = req.query
    const organizations = await listOrganizations({ name, location, causeArea })
    return res.json({ organizations })
  } catch (err) {
    next(err)
  }
}

export async function getOne(req, res, next) {
  try {
    const organization = await getOrganizationById(req.params.id)
    return res.json({ organization })
  } catch (err) {
    next(err)
  }
}

export async function register(req, res, next) {
  try {
    const { name, shortProfile, location, address, website, email, phone, causeAreas } = req.body
    if (!name || !shortProfile || !location || !email || !phone) {
      return res.status(400).json({ error: { message: 'Nama, profil singkat, lokasi, email, dan telepon wajib diisi' } })
    }
    const organization = await registerOrganization(req.user.id, {
      name,
      shortProfile,
      location,
      address,
      website,
      email,
      phone,
      causeAreas,
    })
    return res.status(201).json({ organizationId: organization.id })
  } catch (err) {
    next(err)
  }
}

// Link dari email — tanpa requireAuth, jadi tidak ada req.user/AppError JSON
// handler yang relevan di sini; redirect ke portal organizer baik sukses
// maupun gagal, bedakan lewat query param.
export async function activate(req, res) {
  try {
    await activateOrganization(String(req.query.token ?? ''))
    return res.redirect(`${env.ORGANIZER_PORTAL_URL}/organizer?activated=1`)
  } catch (err) {
    return res.redirect(`${env.ORGANIZER_PORTAL_URL}/?activation-error=1`)
  }
}
