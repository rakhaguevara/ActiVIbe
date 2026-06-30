import type { IconType } from 'react-icons'
import { FiGlobe, FiBookOpen, FiHeart, FiUsers } from 'react-icons/fi'

export interface CategoryStyle {
  icon: IconType
  bgToken: string
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  'Lingkungan': { icon: FiGlobe, bgToken: 'var(--color-secondary-soft)' },
  'Pendidikan': { icon: FiBookOpen, bgToken: 'var(--color-primary-soft)' },
  'Kesehatan': { icon: FiHeart, bgToken: 'var(--color-accent-orange-soft)' },
  'Bencana & Sosial': { icon: FiUsers, bgToken: 'var(--color-accent-yellow-soft)' },
}

const DEFAULT_STYLE: CategoryStyle = { icon: FiGlobe, bgToken: 'var(--color-secondary-soft)' }

export function getCategoryStyle(category: string): CategoryStyle {
  return CATEGORY_STYLES[category] ?? DEFAULT_STYLE
}
