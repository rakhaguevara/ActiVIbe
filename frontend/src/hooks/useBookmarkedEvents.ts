import { useCallback, useState } from 'react'

const STORAGE_KEY = 'activibe:bookmarked-events'

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

export function useBookmarkedEvents() {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => readStoredIds())

  const toggle = useCallback((id: string) => {
    setBookmarkedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isBookmarked = useCallback((id: string) => bookmarkedIds.includes(id), [bookmarkedIds])

  return { isBookmarked, toggle }
}
