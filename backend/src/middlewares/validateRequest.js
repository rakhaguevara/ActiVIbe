export function validateRequest(validatorFn) {
  return (req, res, next) => {
    const result = validatorFn(req.body)
    if (!result.valid) {
      return res.status(400).json({ error: { message: result.message } })
    }
    next()
  }
}
