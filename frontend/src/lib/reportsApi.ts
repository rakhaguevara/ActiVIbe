import { apiFetch } from './apiFetch'
import type { OrganizerOverviewStats } from './organizerOverviewApi'

const API_URL = import.meta.env.VITE_API_URL ?? ''

async function parseResponse(res: Response) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Terjadi kesalahan, coba lagi.')
  }
  return data
}

// GET /reports/overview — reports.service.js membungkus buildOrganizerSummary()
// (BUKAN getOrganizerOverviewStats()), jadi field aiInsights/aiInsightsUnlocked
// TIDAK ikut (itu ditambahkan terpisah oleh organizerOverview.controller.js
// utk endpoint /organizer/overview saja) — Omit di sini supaya tipenya jujur
// soal field apa yang benar2 ada di response ini, plus field range-aware baru.
export interface ReportsOverview extends Omit<OrganizerOverviewStats, 'aiInsights' | 'aiInsightsUnlocked'> {
  range: { from: string | null; to: string | null }
  applicantsInRange: number | null
}

export interface EventBreakdownRow {
  eventId: string
  title: string
  status: string
  category: string | null
  startDate: string
  endDate: string
  applicantsCount: number
  acceptedCount: number
  attendedCount: number
  contributionHours: number | null
}

export interface GlobalSearchResult {
  type: 'event' | 'volunteer'
  id: string
  label: string
  navigateTo: string
}

export interface DateRangeFilter {
  from?: string
  to?: string
}

function buildQuery(filter?: DateRangeFilter): string {
  const params = new URLSearchParams()
  if (filter?.from) params.set('from', filter.from)
  if (filter?.to) params.set('to', filter.to)
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export async function getReportsOverview(filter?: DateRangeFilter): Promise<ReportsOverview> {
  const res = await apiFetch(`${API_URL}/reports/overview${buildQuery(filter)}`, { credentials: 'include' })
  return parseResponse(res)
}

export async function getEventBreakdown(filter?: DateRangeFilter): Promise<EventBreakdownRow[]> {
  const res = await apiFetch(`${API_URL}/reports/event-breakdown${buildQuery(filter)}`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.rows
}

export async function searchReports(q: string): Promise<GlobalSearchResult[]> {
  const res = await apiFetch(`${API_URL}/reports/search?q=${encodeURIComponent(q)}`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.results
}
