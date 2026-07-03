export function requireRole(...roles) {
  return function (req, res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: { message: 'Tidak punya akses untuk aksi ini' } })
    }
    next()
  }
}
