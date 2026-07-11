import { getMySubscription, checkout, cancel, serializePlans } from './subscription.service.js'

export async function getPlans(req, res, next) {
  try {
    return res.json({ plans: serializePlans() })
  } catch (err) {
    next(err)
  }
}

export async function getMe(req, res, next) {
  try {
    const subscription = await getMySubscription(req.user.id, req.user.role)
    return res.json({ subscription })
  } catch (err) {
    next(err)
  }
}

export async function postCheckout(req, res, next) {
  try {
    const { tier } = req.body
    const subscription = await checkout(req.user.id, tier)
    return res.status(201).json({ subscription })
  } catch (err) {
    next(err)
  }
}

export async function postCancel(req, res, next) {
  try {
    const subscription = await cancel(req.user.id)
    return res.json({ subscription })
  } catch (err) {
    next(err)
  }
}
