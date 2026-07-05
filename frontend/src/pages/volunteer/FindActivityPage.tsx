import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import EventListSidebar from '../../components/EventListSidebar'
import EventDetailPanel from '../../components/EventDetailPanel'
import EventApplyForm from '../../components/EventApplyForm'
import ScrollPane from '../../components/ScrollPane'
import VolunteerSearchBar, { type EventFilters } from '../../components/VolunteerSearchBar'
import { useRecommendations } from '../../hooks/useRecommendations'
import './FindActivityPage.css'

type SortOption = 'matchScore' | 'dateAsc'

const EMPTY_FILTERS: EventFilters = {
  keyword: '',
  location: '',
  category: '',
  skill: '',
  oneDayOnly: false,
}

export default function FindActivityPage() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState<EventFilters>(EMPTY_FILTERS)
  const [sortBy, setSortBy] = useState<SortOption>('matchScore')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  // Hasil personalisasi FR-005 dari backend (algoritma rule-based + AI);
  // fallback otomatis ke mockEvents kalau backend tidak bisa dihubungi.
  const { events, isLoading: isLoadingEvents, isFallback, aiEnabled, aiProvider, profileComplete } =
    useRecommendations()

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/', { replace: true })
    }
  }, [isLoading, user, navigate])

  // Pilih event awal begitu data rekomendasi datang: default event dengan
  // Match Score tertinggi (kalau belum ada pilihan yang masih valid).
  useEffect(() => {
    if (isLoadingEvents || events.length === 0) return
    setSelectedEventId((current) => {
      if (current && events.some((event) => event.id === current)) return current
      return [...events].sort((a, b) => b.matchScore - a.matchScore)[0]?.id ?? null
    })
  }, [isLoadingEvents, events])

  // ?event=... menang atas pilihan default — dipakai link share DAN tombol
  // "Daftar Sekarang" di PersonalizationResultModal (pasca-onboarding),
  // supaya event pilihan user langsung terbuka dengan form pendaftarannya.
  useEffect(() => {
    const sharedEventId = searchParams.get('event')
    if (sharedEventId && events.some((event) => event.id === sharedEventId)) {
      setSelectedEventId(sharedEventId)
    }
  }, [searchParams, events])

  // ?organizer=... dipakai tombol "Daftar Kegiatan" di halaman Cari Organisasi,
  // supaya kegiatan dari organisasi tersebut langsung terfilter di sini.
  useEffect(() => {
    const organizerName = searchParams.get('organizer')
    if (organizerName) {
      setFilters((current) => ({ ...current, keyword: organizerName }))
    }
  }, [searchParams])

  const categories = useMemo(() => Array.from(new Set(events.map((event) => event.category))), [events])
  const skills = useMemo(() => Array.from(new Set(events.flatMap((event) => event.skills))), [events])

  const filteredEvents = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase()
    const location = filters.location.trim().toLowerCase()

    return events.filter((event) => {
      if (
        keyword &&
        !event.title.toLowerCase().includes(keyword) &&
        !event.description.toLowerCase().includes(keyword) &&
        !event.organizerName.toLowerCase().includes(keyword)
      ) {
        return false
      }
      if (location && !event.location.toLowerCase().includes(location)) {
        return false
      }
      if (filters.category && event.category !== filters.category) {
        return false
      }
      if (filters.skill && !event.skills.includes(filters.skill)) {
        return false
      }
      if (filters.oneDayOnly && event.startDate !== event.endDate) {
        return false
      }
      return true
    })
  }, [events, filters])

  const sortedEvents = useMemo(() => {
    const sorted = [...filteredEvents]
    if (sortBy === 'matchScore') {
      sorted.sort((a, b) => b.matchScore - a.matchScore)
    } else {
      sorted.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    }
    return sorted
  }, [filteredEvents, sortBy])

  useEffect(() => {
    if (isLoadingEvents) return
    if (sortedEvents.length === 0) {
      setSelectedEventId(null)
      return
    }
    if (!sortedEvents.some((event) => event.id === selectedEventId)) {
      setSelectedEventId(sortedEvents[0].id)
    }
  }, [isLoadingEvents, sortedEvents, selectedEventId])

  if (isLoading || !user) {
    return null
  }

  const selectedEvent = sortedEvents.find((event) => event.id === selectedEventId) ?? null

  return (
    <main className="find-activity-page">
      <VolunteerSearchBar filters={filters} onChange={setFilters} categories={categories} />

      <div className="find-activity-page__results-row">
        <div>
          <p className="find-activity-page__results-count">
            Kegiatan Volunteer | Total {sortedEvents.length} hasil
          </p>
          {!isLoadingEvents && !isFallback && (
            <p className="find-activity-page__ai-status">
              {aiEnabled
                ? `✨ Dipersonalisasi oleh AI untukmu${aiProvider ? ` (${aiProvider})` : ''}`
                : 'Diurutkan berdasarkan kecocokan profilmu'}
              {!profileComplete && ' · Lengkapi profilmu agar rekomendasi makin akurat'}
            </p>
          )}
        </div>

        <div className="find-activity-page__results-filters">
          <select
            className="find-activity-page__skill"
            value={filters.skill}
            onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
          >
            <option value="">Semua Skill</option>
            {skills.map((skill) => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>

          <label className="find-activity-page__toggle">
            <input
              type="checkbox"
              checked={filters.oneDayOnly}
              onChange={(e) => setFilters({ ...filters, oneDayOnly: e.target.checked })}
            />
            Hanya 1 hari
          </label>

          <select
            className="find-activity-page__sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="matchScore">Match Score Tertinggi</option>
            <option value="dateAsc">Tanggal Terdekat</option>
          </select>
        </div>
      </div>

      <div className="find-activity-page__columns">
        {isLoadingEvents ? (
          <p className="find-activity-page__empty">Menyusun rekomendasi kegiatan untukmu…</p>
        ) : sortedEvents.length === 0 ? (
          <p className="find-activity-page__empty">Tidak ada kegiatan yang cocok dengan filter ini.</p>
        ) : (
          <ScrollPane>
            <EventListSidebar
              events={sortedEvents}
              selectedEventId={selectedEventId}
              onSelect={setSelectedEventId}
            />
          </ScrollPane>
        )}

        {isLoadingEvents ? null : selectedEvent ? (
          <>
            <ScrollPane>
              <EventDetailPanel event={selectedEvent} />
            </ScrollPane>
            <ScrollPane>
              <EventApplyForm event={selectedEvent} />
            </ScrollPane>
          </>
        ) : (
          <p className="find-activity-page__empty find-activity-page__empty--panel">
            Pilih atau ubah filter untuk melihat kegiatan.
          </p>
        )}
      </div>
    </main>
  )
}
