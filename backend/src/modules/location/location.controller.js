import { getProvinces, getRegencies, getDistricts, getVillages } from './location.service.js'

/**
 * GET /locations/provinces
 * Kembalikan seluruh provinsi Indonesia.
 */
export async function provinces(req, res, next) {
  try {
    const data = await getProvinces()
    res.status(200).json(data)
  } catch (err) {
    next(err)
  }
}

/**
 * GET /locations/regencies/:provinceId
 * Kembalikan seluruh kabupaten/kota dalam satu provinsi.
 */
export async function regencies(req, res, next) {
  try {
    const data = await getRegencies(req.params.provinceId)
    res.status(200).json(data)
  } catch (err) {
    next(err)
  }
}

/**
 * GET /locations/districts/:regencyId
 * Kembalikan seluruh kecamatan dalam satu kabupaten/kota.
 */
export async function districts(req, res, next) {
  try {
    const data = await getDistricts(req.params.regencyId)
    res.status(200).json(data)
  } catch (err) {
    next(err)
  }
}

/**
 * GET /locations/villages/:districtId
 * Kembalikan seluruh desa/kelurahan dalam satu kecamatan.
 */
export async function villages(req, res, next) {
  try {
    const data = await getVillages(req.params.districtId)
    res.status(200).json(data)
  } catch (err) {
    next(err)
  }
}
