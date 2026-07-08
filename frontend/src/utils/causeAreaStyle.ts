import type { IconType } from 'react-icons'
import { FiGlobe, FiBookOpen, FiHeart, FiUsers, FiShield, FiTrendingUp } from 'react-icons/fi'

export interface CauseAreaStyle {
  icon: IconType
  bgToken: string
}

const CAUSE_AREA_STYLES: Record<string, CauseAreaStyle> = {
  'Lingkungan': { icon: FiGlobe, bgToken: 'var(--color-secondary-soft)' },
  'Pendidikan': { icon: FiBookOpen, bgToken: 'var(--color-primary-soft)' },
  'Edukasi Publik': { icon: FiBookOpen, bgToken: 'var(--color-primary-soft)' },
  'Kesehatan': { icon: FiHeart, bgToken: 'var(--color-accent-orange-soft)' },
  'Anak & Remaja': { icon: FiHeart, bgToken: 'var(--color-accent-orange-soft)' },
  'Kebencanaan': { icon: FiUsers, bgToken: 'var(--color-accent-yellow-soft)' },
  'Mitigasi Bencana': { icon: FiShield, bgToken: 'var(--color-accent-yellow-soft)' },
  'Bantuan Sosial': { icon: FiUsers, bgToken: 'var(--color-accent-yellow-soft)' },
  'Pemberdayaan Perempuan': { icon: FiTrendingUp, bgToken: 'var(--color-primary-soft)' },
  'Ekonomi Kreatif': { icon: FiTrendingUp, bgToken: 'var(--color-accent-orange-soft)' },
  'Kepemimpinan Pemuda': { icon: FiUsers, bgToken: 'var(--color-primary-soft)' },
  'Pertukaran Budaya': { icon: FiGlobe, bgToken: 'var(--color-secondary-soft)' },
  'Seni & Budaya': { icon: FiGlobe, bgToken: 'var(--color-secondary-soft)' },
}

const DEFAULT_STYLE: CauseAreaStyle = { icon: FiGlobe, bgToken: 'var(--color-secondary-soft)' }

export function getCauseAreaStyle(causeArea: string): CauseAreaStyle {
  return CAUSE_AREA_STYLES[causeArea] ?? DEFAULT_STYLE
}

// Daftar cause area baku (dipakai form pendaftaran organisasi) — sumber
// tunggal supaya konsisten dgn styling/ikon yang sudah dipetakan di atas.
export const CAUSE_AREA_OPTIONS = Object.keys(CAUSE_AREA_STYLES)
