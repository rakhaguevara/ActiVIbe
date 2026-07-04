import { getRecommendations } from './recommendation.service.js'

export async function getMyRecommendations(req, res, next) {
  try {
    const result = await getRecommendations(req.user.id)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}
