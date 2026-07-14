import { AppError } from '../utils/AppError.js'

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: { message: err.message, ...(err.code ? { code: err.code } : {}) } })
  }

  console.error(err)
  return res.status(500).json({ error: { message: 'Internal server error' } })
}
