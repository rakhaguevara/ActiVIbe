import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AccountSidebar from '../../components/AccountSidebar'
import Badge from '../../components/Badge'
import InlineLoading from '../../components/InlineLoading'
import { getMyApplications, type ApplicationRecord, type ApplicationStatus } from '../../lib/applicationApi'
import { getCategoryStyle } from '../../utils/categoryStyle'
import { formatDateShort } from '../../utils/formatDate'
import { mockEvents } from '../../data/mockEvents'
import type { Event } from '../../types/event'
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

interface HistoryEntry {
  application: ApplicationRecord
  event: Event
}

export default function ApplicationHistoryPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(() => {
    setIsLoading(true)
    setError(null)
    getMyApplications()
      .then((applications) => {
        const withEvent = applications
          .map((application) => {
            const event = mockEvents.find((e) => e.id === application.eventId)
            return event ? { application, event } : null
          })
          .filter((entry): entry is HistoryEntry => entry !== null)
          .sort((a, b) => new Date(b.application.appliedAt).getTime() - new Date(a.application.appliedAt).getTime())
        setEntries(withEvent)
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
        <header className="application-history-page__header">
          <h1>Riwayat Pendaftaran</h1>
        </header>

        {isLoading ? (
          <InlineLoading />
        ) : error ? (
          <div className="card application-history-page__empty">
            <p className="application-history-page__empty-title">{error}</p>
            <p className="application-history-page__empty-desc">
              <button type="button" className="application-history-page__retry" onClick={fetchHistory}>
                Muat ulang
              </button>
            </p>
          </div>
        ) : entries.length === 0 ? (
          <div className="card application-history-page__empty">
            <p className="application-history-page__empty-title">Kamu belum pernah mendaftar kegiatan apa pun.</p>
            <p className="application-history-page__empty-desc">
              <Link to="/dashboard">Mulai cari kegiatan</Link> dan daftar untuk melihat riwayatnya di sini.
            </p>
          </div>
        ) : (
          <div className="application-history-page__list">
            {entries.map(({ application, event }) => {
              const { icon: Icon } = getCategoryStyle(event.category)
              return (
                <div key={event.id} className="card application-history-page__row">
                  <img src={event.imageUrl} alt="" className="application-history-page__image" />

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

                  <Link to={`/dashboard?event=${event.id}`} className="btn btn--outline btn--sm">
                    Lihat Detail
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
