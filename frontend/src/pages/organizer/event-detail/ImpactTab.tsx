import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useOrganizerData } from '../../../contexts/OrganizerDataContext'
import CloseEventWizard from '../../../components/organizer/CloseEventWizard'
import type { OrganizerEvent, Applicant } from '../../../types/organizer'

export default function ImpactTab() {
  const { event, eventApplicants } = useOutletContext<{ event: OrganizerEvent, eventApplicants: Applicant[] }>()
  const { closeEvent } = useOrganizerData()
  const [showCloseWizard, setShowCloseWizard] = useState(false)
  
  const TODAY = new Date().toISOString().slice(0, 10)
  const canClose = (event.status === 'published' || event.status === 'ongoing') && event.endDate < TODAY

  return (
    <div className="card event-detail__panel">
      <h2>Impact &amp; Close Event</h2>
      {event.status === 'completed' ? (
        <p>Event ini telah ditutup. Laporan dampak sudah dapat diakses di menu Reports.</p>
      ) : (
        <>
          <p>Setelah event selesai, Anda dapat menutup event ini dan memasukkan metrik dampak (contoh: kg sampah, jumlah bibit pohon, dll).</p>
          {canClose ? (
            <button type="button" className="btn btn--primary" onClick={() => setShowCloseWizard(true)}>
              Tutup Event &amp; Input Impact
            </button>
          ) : (
            <p className="event-detail__muted">Event belum bisa ditutup. Pastikan event sudah melewati tanggal selesai ({event.endDate}).</p>
          )}
        </>
      )}

      {showCloseWizard && (
        <CloseEventWizard
          event={event}
          applicants={eventApplicants.filter((a) => a.assignedRoleId || a.status === 'accepted' || a.status === 'checked_in')}
          onClose={() => setShowCloseWizard(false)}
          onConfirm={(result) => closeEvent(event.id, result)}
        />
      )}
    </div>
  )
}
