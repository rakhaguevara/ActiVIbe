import { AppError } from '../../utils/AppError.js'

const EMSIFA_BASE = 'https://www.emsifa.com/api-wilayah-indonesia/api'

/**
 * Petakan array wilayah EMSIFA ke format ringkas { id, name }.
 * EMSIFA menggunakan field `id` dan `name` sudah, jadi hanya perlu pick.
 * @param {Array<{id: string, name: string}>} items
 */
function mapItems(items) {
  return items.map(({ id, name }) => ({ id: String(id), name }))
}

/**
 * Wrapper fetch ke EMSIFA. Jika gagal (network error atau status non-ok),
 * lempar AppError 500 supaya errorHandler global menanganinya dengan benar
 * dan aplikasi tidak crash.
 * @param {string} url
 */
async function emsifaFetch(url) {
  let res
  try {
    res = await fetch(url)
  } catch {
    throw new AppError(500, 'Failed to fetch location data.')
  }
  if (!res.ok) {
    throw new AppError(500, 'Failed to fetch location data.')
  }
  try {
    return await res.json()
  } catch {
    throw new AppError(500, 'Failed to fetch location data.')
  }
}

/**
 * Ambil seluruh provinsi Indonesia.
 * @returns {Promise<Array<{id: string, name: string}>>}
 */
export async function getProvinces() {
  const data = await emsifaFetch(`${EMSIFA_BASE}/provinces.json`)
  return mapItems(data)
}

/**
 * Ambil seluruh kabupaten/kota dalam satu provinsi.
 * @param {string} provinceId
 * @returns {Promise<Array<{id: string, name: string}>>}
 */
export async function getRegencies(provinceId) {
  const data = await emsifaFetch(`${EMSIFA_BASE}/regencies/${provinceId}.json`)
  return mapItems(data)
}

/**
 * Ambil seluruh kecamatan dalam satu kabupaten/kota.
 * @param {string} regencyId
 * @returns {Promise<Array<{id: string, name: string}>>}
 */
export async function getDistricts(regencyId) {
  const data = await emsifaFetch(`${EMSIFA_BASE}/districts/${regencyId}.json`)
  return mapItems(data)
}

/**
 * Ambil seluruh desa/kelurahan dalam satu kecamatan.
 * @param {string} districtId
 * @returns {Promise<Array<{id: string, name: string}>>}
 */
export async function getVillages(districtId) {
  const data = await emsifaFetch(`${EMSIFA_BASE}/villages/${districtId}.json`)
  return mapItems(data)
}
