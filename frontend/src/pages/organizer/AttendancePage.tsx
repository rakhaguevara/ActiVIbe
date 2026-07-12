import { useEffect, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { FiCheck, FiUserX, FiCamera, FiLock } from 'react-icons/fi'
import { useOrganizerData } from '../../contexts/OrganizerDataContext'
import Badge from '../../components/Badge'
import QrCheckInScanner from '../../components/organizer/QrCheckInScanner'
import { getMySubscription, type SubscriptionTier } from '../../lib/subscriptionApi'
import './AttendancePage.css'

export default function AttendancePage() {
  const { eventId } = useParams<{ eventId: string }>()
  const { isLoading, events, applicants, attendanceRecords, checkInAttendance, checkInByTicket, markNoShow } = useOrganizerData()
  const [ticketCode, setTicketCode] = useState('')
  const [ticketStatus, setTicketStatus] = useState<'idle' | 'submitting'>('idle')
  const [ticketError, setTicketError] = useState('')
  const [showQrScanner, setShowQrScanner] = useState(false)
  // ActiVibe Plus — scan QR check-in khusus tier PLUS_PRO (lihat plans.js
  // LIMITS.qrScanCheckIn); tiket manual tetap tersedia semua tier, backend
  // checkInByTicketCode() sendiri tidak dibedakan berdasar cara input kode.
  const [tier, setTier] = useState<SubscriptionTier>('FREE')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    getMySubscription().then((sub) => setTier(sub.tier)).catch(() => {})
  }, [])
  const qrScanUnlocked = tier === 'PLUS_PRO'

  const handleTicketCheckIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setTicketError('')
    setTicketStatus('submitting')
    try {
      await checkInByTicket(ticketCode.trim())
      setTicketCode('')
    } catch (err) {
      setTicketError(err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi.')
    } finally {
      setTicketStatus('idle')
    }
  }

  const effectiveEventId = eventId || ''
  const selectedEvent = events.find((e) => e.id === effectiveEventId)

  const currentShifts = selectedEvent?.roles.flatMap((r) => r.shifts.map((s) => ({ ...s, roleName: r.roleName }))) ?? []

  const records = attendanceRecords.filter((r) => r.eventId === effectiveEventId)

  const withNames = records.map((r) => {
    const shift = currentShifts.find((s) => s.id === r.shiftId)
    return {
      ...r,
      volunteerName: applicants.find((a) => a.id === r.applicantId)?.volunteerName ?? 'Volunteer',
      shiftName: shift ? `${shift.roleName} — ${shift.shiftDate} ${shift.startTime}` : '-',
    }
  })

  const itemsPerPage = 10
  const totalPages = Math.ceil(withNames.length / itemsPerPage)
  const currentData = withNames.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  if (isLoading) {
    return <p className="attendance-page__empty">Memuat data...</p>
  }

  return (
    <div className="attendance-page">
      <header className="attendance-page__header">
        <h1>Attendance</h1>
        <p>Kelola check-in volunteer pada hari pelaksanaan event.</p>
      </header>

      <div className="attendance-page__toolbar">
        <form className="attendance-page__ticket-form" onSubmit={handleTicketCheckIn}>
          <input
            type="text"
            placeholder="Kode tiket (mis. AV-XXXXXXXXXX)"
            value={ticketCode}
            onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
            required
          />
          <button type="submit" className="btn btn--outline btn--sm" disabled={ticketStatus === 'submitting'}>
            {ticketStatus === 'submitting' ? 'Memproses...' : 'Cek-in via Tiket'}
          </button>
        </form>
        {qrScanUnlocked ? (
          <button type="button" className="btn btn--primary btn--sm" onClick={() => setShowQrScanner(true)}>
            <FiCamera /> Scan QR
          </button>
        ) : (
          <a href="/activibe-plus" className="btn btn--outline btn--sm" title="Scan QR khusus ActiVibe Plus Pro">
            <FiLock /> Scan QR (Plus Pro)
          </a>
        )}
      </div>
      {ticketError && <p className="attendance-page__ticket-error">{ticketError}</p>}

      {showQrScanner && qrScanUnlocked && (
        <QrCheckInScanner onScan={checkInByTicket} onClose={() => setShowQrScanner(false)} />
      )}

      <div className="card attendance-page__list">
        {withNames.length === 0 ? (
          <p className="attendance-page__empty">Tidak ada volunteer terdaftar untuk event ini.</p>
        ) : (
          <>
            <div className="events-table-wrapper" style={{ overflowX: 'auto', borderRadius: '4px', border: '1px solid var(--color-border-light)' }}>
              <table className="events-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--color-bg-subtle)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)' }}>Nama Volunteer</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)' }}>Shift / Role</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-muted)' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                      <td style={{ padding: '16px' }}>{r.volunteerName}</td>
                      <td style={{ padding: '16px', color: 'var(--color-text-muted)', fontSize: '13px' }}>{r.shiftName}</td>
                      <td style={{ padding: '16px' }}>
                        {r.status === 'checked_in' && <Badge variant="success">Hadir {r.checkedInAt ? `(${r.method})` : ''}</Badge>}
                        {r.status === 'no_show' && <Badge variant="danger">No-show</Badge>}
                        {r.status === 'expected' && <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Belum Hadir</span>}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        {r.status === 'expected' && (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn--outline btn--sm" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }} onClick={() => checkInAttendance(r.id, 'manual')}>
                              <FiCheck /> Check-in
                            </button>
                            <button type="button" className="btn btn--outline btn--sm" style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }} onClick={() => markNoShow(r.id)}>
                              <FiUserX /> No-show
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--color-text-muted)' }}>
                <span>Menampilkan {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, withNames.length)} dari {withNames.length} peserta</span>
                <div className="pagination__controls" style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn btn--outline btn--sm" 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  >
                    Previous
                  </button>
                  <button 
                    className="btn btn--outline btn--sm" 
                    disabled={currentPage === totalPages} 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
