import axios from 'axios'

export interface RegionStat {
  /** Matches the province "NAME" field in TopoJSON */
  regionId: string
  regionName: string
  volunteerCount: number
  eventCount: number
  ngoCount: number
  volunteerHours: number
}

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

// Production: will call real backend
const api = axios.create({ baseURL: BASE_URL, timeout: 8000 })

// ─── Mock data (matches province names from TopoJSON) ────────────────────────
const MOCK_REGION_STATS: RegionStat[] = [
  { regionId: 'jawa-barat',    regionName: 'Jawa Barat',           volunteerCount: 4200, eventCount: 38, ngoCount: 12, volunteerHours: 18400 },
  { regionId: 'jawa-timur',    regionName: 'Jawa Timur',           volunteerCount: 3800, eventCount: 31, ngoCount: 10, volunteerHours: 15200 },
  { regionId: 'jawa-tengah',   regionName: 'Jawa Tengah',          volunteerCount: 2900, eventCount: 24, ngoCount: 8,  volunteerHours: 12100 },
  { regionId: 'dki-jakarta',   regionName: 'DKI Jakarta',          volunteerCount: 5100, eventCount: 52, ngoCount: 18, volunteerHours: 22000 },
  { regionId: 'banten',        regionName: 'Banten',               volunteerCount: 1200, eventCount: 10, ngoCount: 4,  volunteerHours: 4800  },
  { regionId: 'sumatera-utara',regionName: 'Sumatera Utara',       volunteerCount: 1800, eventCount: 14, ngoCount: 5,  volunteerHours: 7200  },
  { regionId: 'sumatera-barat',regionName: 'Sumatera Barat',       volunteerCount: 950,  eventCount: 8,  ngoCount: 3,  volunteerHours: 3800  },
  { regionId: 'sulawesi-selatan',regionName: 'Sulawesi Selatan',   volunteerCount: 1450, eventCount: 12, ngoCount: 5,  volunteerHours: 5800  },
  { regionId: 'kalimantan-timur',regionName: 'Kalimantan Timur',   volunteerCount: 870,  eventCount: 7,  ngoCount: 3,  volunteerHours: 3480  },
  { regionId: 'bali',          regionName: 'Bali',                 volunteerCount: 2100, eventCount: 19, ngoCount: 7,  volunteerHours: 8400  },
  { regionId: 'nusa-tenggara-barat', regionName: 'Nusa Tenggara Barat', volunteerCount: 620, eventCount: 5, ngoCount: 2, volunteerHours: 2480 },
  { regionId: 'nusa-tenggara-timur', regionName: 'Nusa Tenggara Timur', volunteerCount: 430, eventCount: 4, ngoCount: 2, volunteerHours: 1720 },
  { regionId: 'papua',         regionName: 'Papua',                volunteerCount: 0,    eventCount: 0,  ngoCount: 0,  volunteerHours: 0     },
  { regionId: 'maluku',        regionName: 'Maluku',               volunteerCount: 310,  eventCount: 3,  ngoCount: 1,  volunteerHours: 1240  },
  { regionId: 'aceh',          regionName: 'Aceh',                 volunteerCount: 680,  eventCount: 6,  ngoCount: 2,  volunteerHours: 2720  },
  { regionId: 'riau',          regionName: 'Riau',                 volunteerCount: 740,  eventCount: 6,  ngoCount: 3,  volunteerHours: 2960  },
  { regionId: 'kalimantan-barat',regionName: 'Kalimantan Barat',   volunteerCount: 520,  eventCount: 4,  ngoCount: 2,  volunteerHours: 2080  },
  { regionId: 'sulawesi-utara',regionName: 'Sulawesi Utara',       volunteerCount: 390,  eventCount: 3,  ngoCount: 1,  volunteerHours: 1560  },
]

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * Fetch region statistics for the Indonesia map.
 * In production: calls GET /api/dashboard/region-stats
 * Currently: returns mock data with simulated network delay
 */
export async function fetchRegionStats(): Promise<RegionStat[]> {
  // Production flag — switch to true when backend is ready
  const USE_REAL_API = false

  if (USE_REAL_API) {
    const { data } = await api.get<RegionStat[]>('/dashboard/region-stats')
    return data
  }

  // Simulate network delay
  await new Promise((r) => setTimeout(r, 600))
  return MOCK_REGION_STATS
}

export const dashboardService = {
  getRegionsDistribution: async (): Promise<import('../types/region').RegionDistributionResponse> => {
    // In a real app: return (await api.get('/api/dashboard/regions')).data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          regions: [
            { id: "jawa-barat", name: "Jawa Barat", volunteerCount: 5200, eventCount: 120, ngoCount: 45, hours: 25000, growth: 12 },
            { id: "jawa-timur", name: "Jawa Timur", volunteerCount: 4800, eventCount: 95, ngoCount: 38, hours: 21000, growth: 8 },
            { id: "jawa-tengah", name: "Jawa Tengah", volunteerCount: 4100, eventCount: 88, ngoCount: 32, hours: 19500, growth: 5 },
            { id: "dki-jakarta", name: "DKI Jakarta", volunteerCount: 3500, eventCount: 150, ngoCount: 60, hours: 18000, growth: 15 },
            { id: "banten", name: "Banten", volunteerCount: 2200, eventCount: 45, ngoCount: 15, hours: 9000, growth: -2 },
            { id: "sumatera-utara", name: "Sumatera Utara", volunteerCount: 1800, eventCount: 30, ngoCount: 12, hours: 7500, growth: 4 },
            { id: "sulawesi-selatan", name: "Sulawesi Selatan", volunteerCount: 1500, eventCount: 25, ngoCount: 10, hours: 6200, growth: 6 },
            { id: "bali", name: "Bali", volunteerCount: 1200, eventCount: 40, ngoCount: 18, hours: 5800, growth: 20 },
            { id: "kalimantan-timur", name: "Kalimantan Timur", volunteerCount: 950, eventCount: 15, ngoCount: 8, hours: 4100, growth: 3 },
            { id: "di-yogyakarta", name: "DI Yogyakarta", volunteerCount: 850, eventCount: 35, ngoCount: 14, hours: 3900, growth: 11 },
            { id: "nusa-tenggara-barat", name: "Nusa Tenggara Barat", volunteerCount: 600, eventCount: 12, ngoCount: 5, hours: 2500, growth: 2 },
            { id: "papua", name: "Papua", volunteerCount: 300, eventCount: 5, ngoCount: 2, hours: 1200, growth: 1 },
          ]
        })
      }, 800)
    })
  }
}

export default api
