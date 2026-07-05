import { useOutletContext } from 'react-router-dom'
import type { OrganizerEvent, Applicant } from '../../../types/organizer'

interface ContextType {
  event: OrganizerEvent
  eventApplicants: Applicant[]
}

export default function OverviewTab() {
  const { event, eventApplicants } = useOutletContext<ContextType>()

  return (
    <div className="card event-detail__panel">
      <p>{event.description}</p>
      <div className="event-detail__kpi-row">
        <div><strong>{event.quota}</strong><span>Kuota</span></div>
        <div><strong>{eventApplicants.length}</strong><span>Total Pendaftar</span></div>
        <div><strong>{eventApplicants.filter((a) => a.status === 'accepted' || a.status === 'checked_in' || a.status === 'completed').length}</strong><span>Accepted</span></div>
        <div><strong>{event.impactMetricLabel}</strong><span>Metrik Dampak ({event.impactMetricUnit})</span></div>
      </div>
    </div>
  )
}
