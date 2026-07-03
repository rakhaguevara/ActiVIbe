import type { AuthUser } from '../lib/api'

export const PORTAL_URLS: Record<AuthUser['role'], string> = {
  VOLUNTEER: 'http://localhost:5173',
  ORGANIZER: 'http://localhost:5174',
  ADMIN: 'http://localhost:5175',
}
