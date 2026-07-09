import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FiSearch, FiCheck, FiUserX } from 'react-icons/fi'
import { useOrganizerData } from '../../contexts/OrganizerDataContext'
import Badge from '../../components/Badge'
import ScrollPane from '../../components/ScrollPane'
import VolunteerDetailDrawer from '../../components/organizer/VolunteerDetailDrawer'
import type { ApplicantStatus } from '../../types/organizer'
import './ApplicantsPage.css'

const STATUS_LABEL: Record<ApplicantStatus, string> = {
  applied: 'Applied',
  under_review: 'Under Review',
  accepted: 'Accepted',
  rejected: 'Rejected',
  waitlisted: 'Waitlisted',
  checked_in: 'Checked-in',
  completed: 'Completed',
  no_show: 'No-show',
  cancelled_by_organizer: 'Dibatalkan Organizer',
  cancelled_by_volunteer: 'Dibatalkan Volunteer',
}

const STATUS_VARIANT: Record<ApplicantStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  applied: 'info',
  under_review: 'warning',
  accepted: 'success',
  rejected: 'danger',
  waitlisted: 'warning',
  checked_in: 'success',
  completed: 'success',
  no_show: 'danger',
  cancelled_by_organizer: 'danger',
  cancelled_by_volunteer: 'danger',
}

export default function ApplicantsPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const { isLoading, events, applicants, updateApplicantStatus, addApplicantNote } = useOrganizerData()
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ApplicantStatus>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [openApplicantId, setOpenApplicantId] = useState<string | null>(null)

  const effectiveEventId = eventId || ''

  const selectedEvent = events.find((e) => e.id === effectiveEventId)

  const filteredApplicants = useMemo(() => {
    const query = keyword.trim().toLowerCase()
    return applicants.filter((a) => {
      if (a.eventId !== effectiveEventId) return false
      if (statusFilter !== 'all' && a.status !== statusFilter) return false
      if (query && !a.volunteerName.toLowerCase().includes(query) && !a.email.toLowerCase().includes(query)) return false
      return true
    })
  }, [applicants, effectiveEventId, statusFilter, keyword])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const bulkSetStatus = (status: ApplicantStatus) => {
    selectedIds.forEach((id) => updateApplicantStatus(id, status))
    setSelectedIds([])
  }

  const openApplicant = applicants.find((a) => a.id === openApplicantId)

  if (isLoading) {
    return <p className="applicants-page__empty">Memuat data pendaftar...</p>
  }

  return (
    <div className="applicants-page">
      <header className="applicants-page__header">
        <h1>Applicants</h1>
        <p>Kelola pipeline pendaftar volunteer per event.</p>
      </header>

      <div className="applicants-page__toolbar">
        <div className="applicants-page__search">
          <FiSearch />
          <input placeholder="Cari nama atau email..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </div>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
          <option value="all">Semua Status</option>
          {(Object.keys(STATUS_LABEL) as ApplicantStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
      </div>

      {selectedIds.length > 0 && (
        <div className="card applicants-page__bulk-bar">
          <span>{selectedIds.length} volunteer dipilih</span>
          <div className="applicants-page__bulk-actions">
            <button type="button" className="btn btn--primary btn--sm" onClick={() => bulkSetStatus('accepted')}>Accept</button>
            <button type="button" className="btn btn--outline btn--sm" onClick={() => bulkSetStatus('waitlisted')}>Waitlist</button>
            <button type="button" className="btn btn--danger btn--sm" onClick={() => bulkSetStatus('rejected')}>Reject</button>
          </div>
        </div>
      )}

      <ScrollPane>
        <table className="admin-table">
          <thead>
            <tr>
              <th></th>
              <th>Nama</th>
              <th>Match Score</th>
              <th>Skill</th>
              <th>Requirement</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplicants.map((a) => (
              <tr key={a.id}>
                <td>
                  <input type="checkbox" checked={selectedIds.includes(a.id)} onChange={() => toggleSelect(a.id)} />
                </td>
                <td className="applicants-page__name" onClick={() => setOpenApplicantId(a.id)}>
                  {a.volunteerName}
                </td>
                <td>{a.matchScore !== undefined ? `${a.matchScore}%` : '—'}</td>
                <td>{a.skills.join(', ') || '—'}</td>
                <td>{a.requirementStatus === 'completed' ? 'Selesai' : a.requirementStatus === 'in_progress' ? 'Berjalan' : 'Belum Mulai'}</td>
                <td>
                  <Badge variant={STATUS_VARIANT[a.status]}>{STATUS_LABEL[a.status]}</Badge>
                </td>
                <td>
                  <div className="applicants-page__actions">
                    {(a.status === 'applied' || a.status === 'under_review') && (
                      <>
                        <button
                          type="button"
                          className="btn btn--primary btn--sm"
                          title="Terima volunteer"
                          onClick={() => updateApplicantStatus(a.id, 'accepted')}
                        >
                          <FiCheck /> Accept
                        </button>
                        <button
                          type="button"
                          className="btn btn--danger btn--sm"
                          title="Tolak volunteer"
                          onClick={() => updateApplicantStatus(a.id, 'rejected')}
                        >
                          <FiUserX /> Reject
                        </button>
                      </>
                    )}
                    <button type="button" className="btn btn--outline btn--sm" onClick={() => setOpenApplicantId(a.id)}>
                      Detail
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredApplicants.length === 0 && (
              <tr>
                <td colSpan={7} className="applicants-page__empty">Tidak ada pendaftar yang cocok.</td>
              </tr>
            )}
          </tbody>
        </table>
      </ScrollPane>

      {openApplicant && selectedEvent && (
        <VolunteerDetailDrawer
          applicant={openApplicant}
          event={selectedEvent}
          onClose={() => setOpenApplicantId(null)}
          onStatusChange={(status) => updateApplicantStatus(openApplicant.id, status)}
          onAddNote={(note) => addApplicantNote(openApplicant.id, note)}
        />
      )}
    </div>
  )
}
