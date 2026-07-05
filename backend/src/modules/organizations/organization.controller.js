import { listOrganizations, getOrganizationById } from './organization.service.js'

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
