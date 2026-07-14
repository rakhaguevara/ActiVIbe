import {
  getCertificateQueue,
  generateCertificate,
  generateCertificatesBulk,
  regenerateCertificate,
  listGeneratedCertificates,
  listCertificateVersions,
  listFailedCandidates,
  getActiveTemplateInfo,
} from './certificate.service.js'

export async function getQueue(req, res, next) {
  try {
    const queue = await getCertificateQueue(req.user.id, { eventId: req.query.eventId })
    return res.json({ queue })
  } catch (err) {
    next(err)
  }
}

export async function generate(req, res, next) {
  try {
    const certificate = await generateCertificate(req.user.id, req.body.applicationId)
    return res.status(201).json({ certificate })
  } catch (err) {
    next(err)
  }
}

export async function generateBulk(req, res, next) {
  try {
    const result = await generateCertificatesBulk(req.user.id, req.body.applicationIds ?? [])
    return res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function regenerate(req, res, next) {
  try {
    const certificate = await regenerateCertificate(req.user.id, req.params.certificateId, req.body.note)
    return res.json({ certificate })
  } catch (err) {
    next(err)
  }
}

export async function getGenerated(req, res, next) {
  try {
    const certificates = await listGeneratedCertificates(req.user.id, { eventId: req.query.eventId })
    return res.json({ certificates })
  } catch (err) {
    next(err)
  }
}

export async function getVersions(req, res, next) {
  try {
    const versions = await listCertificateVersions(req.user.id, req.params.certificateId)
    return res.json({ versions })
  } catch (err) {
    next(err)
  }
}

export async function getFailed(req, res, next) {
  try {
    const failed = await listFailedCandidates(req.user.id, { eventId: req.query.eventId })
    return res.json({ failed })
  } catch (err) {
    next(err)
  }
}

export async function getActiveTemplate(req, res, next) {
  try {
    const template = await getActiveTemplateInfo()
    return res.json({ template })
  } catch (err) {
    next(err)
  }
}
