import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import EventCard from '../../components/EventCard'
import { mockEvents } from '../../data/mockEvents'
import banner from '../../assets/svg/background-1.svg'
import './FindActivityPage.css'

type SortOption = 'matchScore' | 'dateAsc'

export default function FindActivityPage() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [sortBy, setSortBy] = useState<SortOption>('matchScore')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    () => [...mockEvents].sort((a, b) => b.matchScore - a.matchScore)[0]?.id ?? null
  )

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/', { replace: true })
    }
  }, [isLoading, user, navigate])

  const sortedEvents = useMemo(() => {
    const events = [...mockEvents]
    if (sortBy === 'matchScore') {
      events.sort((a, b) => b.matchScore - a.matchScore)
    } else {
      events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    }
    return events
  }, [sortBy])

  if (isLoading || !user) {
    return null
  }

  return (
    <main className="find-activity-page">
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

        <select
          className="find-activity-page__sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
        >
          <option value="matchScore">Match Score Tertinggi</option>
          <option value="dateAsc">Tanggal Terdekat</option>
        </select>
      </div>

      <div className="find-activity-page__columns">
        <div className="find-activity-page__list">
          {sortedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isSelected={event.id === selectedEventId}
              onSelect={setSelectedEventId}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
