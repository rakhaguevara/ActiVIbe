import { useCallback, useState } from 'react'

const STORAGE_KEY = 'activibe:followed-organizations'

function readStoredIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

export function useFollowedOrganizations() {
  const [followedIds, setFollowedIds] = useState<string[]>(() => readStoredIds())

  const toggle = useCallback((id: string) => {
    setFollowedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isFollowed = useCallback((id: string) => followedIds.includes(id), [followedIds])

  return { followedIds, isFollowed, toggle }
}
