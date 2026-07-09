import { useOutletContext } from 'react-router-dom'
import { canCloseEvent } from '../../../lib/eventLifecycle'
import type { EventDetailOutletContext } from '../EventDetailPage'

export default function ImpactTab() {
  const { event, openCloseWizard } = useOutletContext<EventDetailOutletContext>()
  const canClose = canCloseEvent(event)

  return (
    <div className="card event-detail__panel">
      <h2>Impact &amp; Close Event</h2>
      {event.status === 'completed' ? (
        <>
          <p>Event ini telah ditutup. Laporan dampak sudah dapat diakses di menu Reports.</p>
          {event.closeReport && (
            <div className="event-detail__close-report">
              <h3>Laporan Penutupan Kegiatan</h3>
              <p>{event.closeReport.narrativeSummary}</p>
              <ul>
                <li>{event.closeReport.volunteersPresentCount} relawan hadir</li>
                <li>{event.closeReport.totalContributionHours} jam kontribusi total</li>
              </ul>
              {event.closeReport.impactSummary && <p>{event.closeReport.impactSummary}</p>}
              {event.closeReport.constraintsNotes && (
                <p className="event-detail__muted">Catatan: {event.closeReport.constraintsNotes}</p>
              )}
              {event.closeReport.photoUrls.length > 0 && (
                <div className="event-detail__close-report-photos">
                  {event.closeReport.photoUrls.map((url) => (
                    <img key={url} src={url} alt="Dokumentasi penutupan kegiatan" />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <p>Setelah event selesai, Anda dapat menutup event ini dan memasukkan metrik dampak (contoh: kg sampah, jumlah bibit pohon, dll).</p>
          {canClose ? (
            <button type="button" className="btn btn--primary" onClick={openCloseWizard}>
              Tutup Event &amp; Input Impact
            </button>
          ) : (
            <p className="event-detail__muted">Event belum bisa ditutup. Pastikan event sudah melewati tanggal selesai ({event.endDate}).</p>
          )}
        </>
      )}
    </div>
  )
}
