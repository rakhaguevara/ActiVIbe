export type MatchTier = 'success' | 'info' | 'warning'

export function getMatchTier(score: number): MatchTier {
  if (score >= 85) return 'success'
  if (score >= 60) return 'info'
  return 'warning'
}
