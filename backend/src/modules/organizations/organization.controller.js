import {
  listOrganizations,
  getOrganizationById,
  getMyOrganization,
  updateMyOrganizationLogo,
  updateMyOrganizationBrandingAsset,
  updateMyOrganizationVisualIdentity,
  updateMyOrganizationEmailIdentity,
  updateMyOrganizationProfile,
  sendMyOrganizationTestEmail,
  registerOrganization,
  getOrganizationActivationInfo,
  requestOrganizationActivationOtp,
  verifyOrganizationActivationOtp,
  deactivateMyOrganization,
  reactivateMyOrganization,
  transferMyOrganizationOwnership,
  softDeleteMyOrganization,
} from './organization.service.js'

export async function getMine(req, res, next) {
  try {
    const organization = await getMyOrganization(req.user.id)
    return res.json({ organization })
  } catch (err) {
    next(err)
  }
}

export async function postMyLogo(req, res, next) {
  try {
    const organization = await updateMyOrganizationLogo(req.user.id, req.file)
    return res.json({ organization })
  } catch (err) {
    next(err)
  }
}

export async function postMyBanner(req, res, next) {
  try {
    const organization = await updateMyOrganizationBrandingAsset(req.user.id, 'bannerUrl', req.file)
    return res.json({ organization })
  } catch (err) {
    next(err)
  }
}

export async function postMySignature(req, res, next) {
  try {
    const organization = await updateMyOrganizationBrandingAsset(req.user.id, 'signatureUrl', req.file)
    return res.json({ organization })
  } catch (err) {
    next(err)
  }
}

export async function postMyStamp(req, res, next) {
  try {
    const organization = await updateMyOrganizationBrandingAsset(req.user.id, 'stampUrl', req.file)
    return res.json({ organization })
  } catch (err) {
    next(err)
  }
}

export async function postMyEmailHeader(req, res, next) {
  try {
    const organization = await updateMyOrganizationBrandingAsset(req.user.id, 'emailHeaderImageUrl', req.file)
    return res.json({ organization })
  } catch (err) {
    next(err)
  }
}

export async function patchMyVisualIdentity(req, res, next) {
  try {
    const { primaryColor, secondaryColor } = req.body
    const organization = await updateMyOrganizationVisualIdentity(req.user.id, { primaryColor, secondaryColor })
    return res.json({ organization })
  } catch (err) {
    next(err)
  }
}

export async function patchMyEmailIdentity(req, res, next) {
  try {
    const { emailFooterText } = req.body
    const organization = await updateMyOrganizationEmailIdentity(req.user.id, { emailFooterText })
    return res.json({ organization })
  } catch (err) {
    next(err)
  }
}

export async function patchMyProfile(req, res, next) {
  try {
    const { name, location, phone, mission, aboutUs, website, facebookUrl, instagramUrl, linkedinUrl } = req.body
    const organization = await updateMyOrganizationProfile(req.user.id, {
      name,
      location,
      phone,
      mission,
      aboutUs,
      website,
      facebookUrl,
      instagramUrl,
      linkedinUrl,
    })
    return res.json({ organization })
  } catch (err) {
    next(err)
  }
}

export async function postMyBrandingTestEmail(req, res, next) {
  try {
    const result = await sendMyOrganizationTestEmail(req.user.id)
    return res.json(result)
  } catch (err) {
    next(err)
  }
}

// Danger Zone (SecuritySettingsView) — password re-entry, bukan cuma requireAuth.
export async function postMyDeactivate(req, res, next) {
  try {
    const organization = await deactivateMyOrganization(req.user.id, { password: req.body?.password })
    return res.json({ organization })
  } catch (err) {
    next(err)
  }
}

export async function postMyReactivate(req, res, next) {
  try {
    const organization = await reactivateMyOrganization(req.user.id, { password: req.body?.password })
    return res.json({ organization })
  } catch (err) {
    next(err)
  }
}

export async function postMyTransfer(req, res, next) {
  try {
    const organization = await transferMyOrganizationOwnership(req.user.id, {
      newOwnerEmail: req.body?.newOwnerEmail,
      password: req.body?.password,
    })
    return res.json({ organization })
  } catch (err) {
    next(err)
  }
}

export async function postMyDelete(req, res, next) {
  try {
    await softDeleteMyOrganization(req.user.id, { password: req.body?.password })
    return res.status(200).json({ success: true })
  } catch (err) {
    next(err)
  }
}

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
