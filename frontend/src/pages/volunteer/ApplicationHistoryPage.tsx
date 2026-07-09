import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AccountSidebar from '../../components/AccountSidebar'
import Badge from '../../components/Badge'
import InlineLoading from '../../components/InlineLoading'
import SectionState from '../../components/SectionState'
import RatingModal from '../../components/RatingModal'
import TicketModal from '../../components/TicketModal'
import MobileSearchHeader from '../../components/MobileSearchHeader'
import { getMyApplications, type ApplicationRecord, type ApplicationStatus } from '../../lib/applicationApi'
import { submitEventFeedbackRequest } from '../../lib/eventApi'
import { getCategoryStyle } from '../../utils/categoryStyle'
import { formatDateShort } from '../../utils/formatDate'
import fallbackImage from '../../assets/png/pic1 1.png'
import './ApplicationHistoryPage.css'

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  APPLIED: 'Menunggu Review',
  UNDER_REVIEW: 'Sedang Direview',
  ACCEPTED: 'Diterima',
  REJECTED: 'Ditolak',
  WAITLISTED: 'Waiting List',
  CHECKED_IN: 'Sudah Check-in',
  COMPLETED: 'Selesai',
  NO_SHOW: 'Tidak Hadir',
  CANCELLED_BY_ORGANIZER: 'Dibatalkan Organizer',
  CANCELLED_BY_VOLUNTEER: 'Dibatalkan Sendiri',
}

const STATUS_VARIANT: Record<ApplicationStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  APPLIED: 'info',
  UNDER_REVIEW: 'warning',
  ACCEPTED: 'success',
  REJECTED: 'danger',
  WAITLISTED: 'warning',
  CHECKED_IN: 'success',
  COMPLETED: 'success',
  NO_SHOW: 'danger',
  CANCELLED_BY_ORGANIZER: 'danger',
  CANCELLED_BY_VOLUNTEER: 'danger',
}

export default function ApplicationHistoryPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [applications, setApplications] = useState<ApplicationRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [ratingTarget, setRatingTarget] = useState<ApplicationRecord | null>(null)
  const [ticketTarget, setTicketTarget] = useState<ApplicationRecord | null>(null)

  // Event sekarang di-embed langsung oleh GET /applications/me (lihat
  // application.service.js getMyApplications) — tidak ada lagi join ke
  // mockEvents yang bisa diam-diam membuang aplikasi asli.
  const fetchHistory = useCallback(() => {
    setIsLoading(true)
    setError(null)
    getMyApplications()
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime(),
        )
        setApplications(sorted)
      })
      .catch(() => setError('Gagal memuat riwayat pendaftaran, coba muat ulang.'))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return (
    <main className="application-history-page">
      <AccountSidebar active="riwayat" />

      <div className="application-history-page__content">
        <div className="application-history-page__mobile-header">
          <MobileSearchHeader title="Riwayat Pendaftaran" subtitle="Cari dan lihat status pendaftaran" />
        </div>
        <header className="application-history-page__header">
          <h1>Riwayat Pendaftaran</h1>
        </header>

        {isLoading ? (
          <InlineLoading />
        ) : error ? (
          <SectionState variant="error" title={error} onRetry={fetchHistory} />
        ) : applications.length === 0 ? (
          <SectionState
            variant="empty"
            title="Kamu belum pernah mendaftar kegiatan apa pun."
            description="Mulai cari kegiatan dan daftar untuk melihat riwayatnya di sini."
            action={{ label: 'Mulai cari kegiatan', to: '/dashboard' }}
          />
        ) : (
          <div className="application-history-page__list">
            {applications.map((application) => {
              const { event } = application
              const { icon: Icon } = getCategoryStyle(event.category)
              return (
                <div key={event.id} className="card application-history-page__row">
                  <img src={fallbackImage} alt="" className="application-history-page__image" />

                  <div className="application-history-page__main">
                    <div className="application-history-page__row-head">
                      <span className="application-history-page__title">{event.title}</span>
                      <Badge variant={STATUS_VARIANT[application.status]}>
                        {STATUS_LABEL[application.status]}
                      </Badge>
                    </div>
                    <p className="application-history-page__meta">
                      <Icon className="application-history-page__meta-icon" aria-hidden="true" />
                      {event.organizerName} &middot; {event.location}
                    </p>
                    <p className="application-history-page__meta">
                      {formatDateShort(event.startDate)} – {formatDateShort(event.endDate)}
                    </p>
                    <p className="application-history-page__applied-at">
                      Mendaftar pada {formatDateShort(application.appliedAt)}
                    </p>
                  </div>

                  <div className="application-history-page__actions">
                    {application.status === 'COMPLETED' && !application.hasFeedback && (
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={() => setRatingTarget(application)}
                      >
                        Beri Rating
                      </button>
                    )}
                    {application.ticketCode ? (
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={() => setTicketTarget(application)}
                      >
                        Lihat Detail
                      </button>
                    ) : (
                      <Link to={`/dashboard?event=${event.id}`} className="btn btn--outline btn--sm">
                        Lihat Detail
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {ratingTarget && (
          <RatingModal
            eventTitle={ratingTarget.event.title}
            onClose={() => setRatingTarget(null)}
            onSubmit={async (rating, comment) => {
              await submitEventFeedbackRequest(ratingTarget.eventId, rating, comment)
              setApplications((prev) =>
                prev.map((a) => (a.eventId === ratingTarget.eventId ? { ...a, hasFeedback: true } : a)),
              )
            }}
          />
        )}

        {ticketTarget && ticketTarget.ticketCode && (
          <TicketModal
            eventTitle={ticketTarget.event.title}
            eventLocation={ticketTarget.event.location}
            eventStartDate={ticketTarget.event.startDate}
            eventEndDate={ticketTarget.event.endDate}
            ticketCode={ticketTarget.ticketCode}
            status={ticketTarget.status}
            onClose={() => setTicketTarget(null)}
          />
        )}
      </div>
    </main>
  )
}
