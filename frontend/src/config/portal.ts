export type Portal = 'volunteer' | 'organizer' | 'admin'

export const PORTAL: Portal = (import.meta.env.VITE_PORTAL as Portal | undefined) ?? 'volunteer'
