import { apiFetch } from './apiFetch'

const API_URL = import.meta.env.VITE_API_URL ?? ''

export interface LocationItem {
  id: string
  name: string
}

async function parseResponse(res: Response): Promise<LocationItem[]> {
  const data = await res.json().catch(() => [])
  if (!res.ok) {
    throw new Error((data as { message?: string })?.message ?? 'Failed to fetch location data.')
  }
  return data as LocationItem[]
}

/**
 * Ambil seluruh provinsi Indonesia dari backend.
 * Frontend tidak boleh fetch langsung ke EMSIFA.
 */
export async function getProvinces(): Promise<LocationItem[]> {
  const res = await apiFetch(`${API_URL}/locations/provinces`, { credentials: 'include' })
  return parseResponse(res)
}

/**
 * Ambil kabupaten/kota berdasarkan ID provinsi.
 */
export async function getRegencies(provinceId: string): Promise<LocationItem[]> {
  const res = await apiFetch(`${API_URL}/locations/regencies/${provinceId}`, { credentials: 'include' })
  return parseResponse(res)
}

/**
 * Ambil kecamatan berdasarkan ID kabupaten/kota.
 */
export async function getDistricts(regencyId: string): Promise<LocationItem[]> {
  const res = await apiFetch(`${API_URL}/locations/districts/${regencyId}`, { credentials: 'include' })
  return parseResponse(res)
}

/**
 * Ambil desa/kelurahan berdasarkan ID kecamatan.
 */
export async function getVillages(districtId: string): Promise<LocationItem[]> {
  const res = await apiFetch(`${API_URL}/locations/villages/${districtId}`, { credentials: 'include' })
  return parseResponse(res)
}
