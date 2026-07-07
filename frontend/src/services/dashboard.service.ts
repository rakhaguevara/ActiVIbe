import { getRegionDistribution } from '../lib/adminApi'
import type { RegionDistributionResponse } from '../types/region'

export const dashboardService = {
  getRegionsDistribution: (): Promise<RegionDistributionResponse> => getRegionDistribution(),
}
