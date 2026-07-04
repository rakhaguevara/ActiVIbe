export interface RegionStat {
  id: string
  name: string
  volunteerCount: number
  eventCount: number
  ngoCount: number
  hours: number
  growth: number
}

export interface RegionDistributionResponse {
  regions: RegionStat[]
}

// Future-proof Map Level Configuration
export type MapLevel = 'Country' | 'Island' | 'Province' | 'City' | 'District' | 'Event'
