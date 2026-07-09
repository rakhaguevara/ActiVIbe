import {
  listOrganizations,
  getOrganizationById,
  registerOrganization,
  getOrganizationActivationInfo,
  requestOrganizationActivationOtp,
  verifyOrganizationActivationOtp,
} from './organization.service.js'

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

// Tidak requireAuth: siapapun boleh submit, login ataupun belum (login state
// tidak relevan lagi sejak alurnya disatukan — lihat organization.service.js
// registerOrganization).
export async function register(req, res, next) {
  try {
    const { name, shortProfile, location, address, website, email, phone, causeAreas, contactName } = req.body
    if (!name || !shortProfile || !location || !email || !phone) {
      return res.status(400).json({ error: { message: 'Nama, profil singkat, lokasi, email, dan telepon wajib diisi' } })
    }

    const organization = await registerOrganization({
      name,
      shortProfile,
      location,
      address,
      website,
      email,
      phone,
      causeAreas,
      contactName,
    })
    return res.status(201).json({ organizationId: organization.id })
  } catch (err) {
    next(err)
  }
}

// Dipanggil SetOrganizationPasswordPage saat halaman dibuka — read-only,
// dipakai utk menampilkan warning "email ini sudah terhubung ke akun yang
// aktif" SEBELUM user submit password (lihat organization.service.js
// getOrganizationActivationInfo). Sengaja TANPA requireAuth, sama seperti
// endpoint set-password lain — token sendiri jadi bukti kepemilikan.
export async function getSetPasswordInfo(req, res, next) {
  try {
    const { token } = req.query
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: { message: 'Token tidak valid' } })
    }

    const result = await getOrganizationActivationInfo(token)
    return res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

// Langkah 1 di SetOrganizationPasswordPage — trigger kirim OTP begitu user
// submit password+konfirmasi (password itu sendiri belum dikirim/disimpan di
// sini, cuma divalidasi di frontend; baru dipakai betulan di langkah 2).
// Sengaja TANPA requireAuth — token di body sendiri jadi bukti kepemilikan.
export async function requestSetPasswordOtp(req, res, next) {
  try {
    const { token } = req.body
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: { message: 'Token tidak valid' } })
    }

    const result = await requestOrganizationActivationOtp(token)
    return res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

// Langkah 2 — verifikasi kode OTP + simpan password beneran + aktivasi
// organisasi. Sengaja TANPA requireAuth — token+OTP sendiri jadi bukti kepemilikan.
export async function setPassword(req, res, next) {
  try {
    const { token, password, code } = req.body
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: { message: 'Token tidak valid' } })
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: { message: 'Password minimal 8 karakter' } })
    }
    if (!code || typeof code !== 'string' || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: { message: 'Kode OTP harus 6 digit angka' } })
    }

    const result = await verifyOrganizationActivationOtp(token, password, code)
    return res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}
