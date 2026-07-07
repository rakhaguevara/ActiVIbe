import { getProvinces, getRegencies, getDistricts, getVillages } from '../lib/locationApi'
import type { LocationItem } from '../lib/locationApi'

export type { LocationItem }

export const locationService = {
  getProvinces: (): Promise<LocationItem[]> => getProvinces(),
  getRegencies: (provinceId: string): Promise<LocationItem[]> => getRegencies(provinceId),
  getDistricts: (regencyId: string): Promise<LocationItem[]> => getDistricts(regencyId),
  getVillages: (districtId: string): Promise<LocationItem[]> => getVillages(districtId),
}
