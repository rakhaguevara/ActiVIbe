import { getSettings, updateGeneralSettings, updateNotificationSettings, updateWebhookUrl } from './organizationSettings.service.js'

export async function get(req, res, next) {
  try {
    const settings = await getSettings(req.user.id)
    return res.json({ settings })
  } catch (err) {
    next(err)
  }
}

export async function patchGeneral(req, res, next) {
  try {
    const settings = await updateGeneralSettings(req.user.id, req.body)
    return res.json({ settings })
  } catch (err) {
    next(err)
  }
}

export async function patchNotifications(req, res, next) {
  try {
    const settings = await updateNotificationSettings(req.user.id, req.body)
    return res.json({ settings })
  } catch (err) {
    next(err)
  }
}

export async function patchWebhook(req, res, next) {
  try {
    const settings = await updateWebhookUrl(req.user.id, req.body)
    return res.json({ settings })
  } catch (err) {
    next(err)
  }
}
