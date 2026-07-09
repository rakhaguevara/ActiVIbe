import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useRecommendations } from '../../hooks/useRecommendations'
import EventDetailPanel from '../../components/EventDetailPanel'
import EventApplyForm from '../../components/EventApplyForm'
import SectionState from '../../components/SectionState'
import SectionErrorBoundary from '../../components/SectionErrorBoundary'
import { getMyProfile, type Gender } from '../../lib/profileApi'
import { FiChevronLeft } from 'react-icons/fi'
import './ActivityDetailPage.css'

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isLoading } = useAuth()
  const { events, isLoading: isLoadingEvents, error: recommendationsError } = useRecommendations()
  // Fitur "women respect" — lihat FindActivityPage.tsx utk pola yang sama.
  const [currentUserGender, setCurrentUserGender] = useState<Gender | null>(null)

  useEffect(() => {
    getMyProfile()
      .then((profile) => setCurrentUserGender(profile.gender))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/', { replace: true })
    }
  }, [isLoading, user, navigate])

  if (isLoading || !user) {
    return null
  }

  if (isLoadingEvents) {
    return (
      <div className="activity-detail-page">
        <SectionState variant="loading" title="Memuat detail kegiatan..." />
      </div>
    )
  }

  if (recommendationsError) {
    return (
      <div className="activity-detail-page">
        <SectionState variant="error" title={recommendationsError} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  const selectedEvent = events.find((event) => event.id === id)

  if (!selectedEvent) {
    return (
      <div className="activity-detail-page">
        <div className="activity-detail-page__header">
          <button type="button" className="activity-detail-page__back" onClick={() => navigate(-1)}>
            <FiChevronLeft /> Kembali
          </button>
        </div>
        <SectionState variant="empty" title="Kegiatan tidak ditemukan." />
      </div>
    )
  }

  return (
    <div className="activity-detail-page">
      <div className="activity-detail-page__header">
        <button type="button" className="activity-detail-page__back" onClick={() => navigate(-1)}>
          <FiChevronLeft /> Kembali
        </button>
      </div>

      <div className="activity-detail-page__content">
        <SectionErrorBoundary>
          <EventDetailPanel event={selectedEvent} currentUserGender={currentUserGender} />
        </SectionErrorBoundary>

        <SectionErrorBoundary>
          <EventApplyForm event={selectedEvent} currentUserGender={currentUserGender} />
        </SectionErrorBoundary>
      </div>
    </div>
  )
}
