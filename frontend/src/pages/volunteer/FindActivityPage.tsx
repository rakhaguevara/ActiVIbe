import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import EventListSidebar from '../../components/EventListSidebar'
import EventDetailPanel from '../../components/EventDetailPanel'
import EventApplyForm from '../../components/EventApplyForm'
import VolunteerSearchBar, { type EventFilters } from '../../components/VolunteerSearchBar'
import { mockEvents } from '../../data/mockEvents'
import banner from '../../assets/svg/background-1.svg'
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
  const [filters, setFilters] = useState<EventFilters>(EMPTY_FILTERS)
  const [sortBy, setSortBy] = useState<SortOption>('matchScore')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    () => [...mockEvents].sort((a, b) => b.matchScore - a.matchScore)[0]?.id ?? null
  )

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/', { replace: true })
    }
  }, [isLoading, user, navigate])

  const categories = useMemo(() => Array.from(new Set(mockEvents.map((event) => event.category))), [])
  const skills = useMemo(() => Array.from(new Set(mockEvents.flatMap((event) => event.skills))), [])

  const filteredEvents = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase()
    const location = filters.location.trim().toLowerCase()

    return mockEvents.filter((event) => {
      if (
        keyword &&
        !event.title.toLowerCase().includes(keyword) &&
        !event.description.toLowerCase().includes(keyword)
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
  }, [filters])

  const sortedEvents = useMemo(() => {
    const events = [...filteredEvents]
    if (sortBy === 'matchScore') {
      events.sort((a, b) => b.matchScore - a.matchScore)
    } else {
      events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    }
    return events
  }, [filteredEvents, sortBy])

  useEffect(() => {
    if (sortedEvents.length === 0) {
      setSelectedEventId(null)
      return
    }
    if (!sortedEvents.some((event) => event.id === selectedEventId)) {
      setSelectedEventId(sortedEvents[0].id)
    }
  }, [sortedEvents, selectedEventId])

  if (isLoading || !user) {
    return null
  }

  const selectedEvent = sortedEvents.find((event) => event.id === selectedEventId) ?? null

  return (
    <main className="find-activity-page">
      <VolunteerSearchBar filters={filters} onChange={setFilters} categories={categories} />

      <section className="find-activity-page__banner">
        <img src={banner} alt="" className="find-activity-page__banner-img" aria-hidden="true" />
        <p className="find-activity-page__greeting">
          Halo, {user.name.split(' ')[0]}! Yuk temukan kegiatan volunteer yang cocok buatmu.
        </p>
      </section>

      <div className="find-activity-page__results-row">
        <p className="find-activity-page__results-count">
          Kegiatan Volunteer | Total {sortedEvents.length} hasil
        </p>

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
        {sortedEvents.length === 0 ? (
          <p className="find-activity-page__empty">Tidak ada kegiatan yang cocok dengan filter ini.</p>
        ) : (
          <EventListSidebar
            events={sortedEvents}
            selectedEventId={selectedEventId}
            onSelect={setSelectedEventId}
          />
        )}

        {selectedEvent ? (
          <>
            <EventDetailPanel event={selectedEvent} />
            <EventApplyForm event={selectedEvent} />
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
