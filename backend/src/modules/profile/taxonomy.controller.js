import { listInterests, listSkills } from './taxonomy.service.js'

export async function getInterests(req, res, next) {
  try {
    const interests = await listInterests()
    res.status(200).json({ interests })
  } catch (err) {
    next(err)
  }
}

export async function getSkills(req, res, next) {
  try {
    const skills = await listSkills()
    res.status(200).json({ skills })
  } catch (err) {
    next(err)
  }
}
