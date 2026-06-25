import { FiXCircle, FiClipboard, FiShield } from 'react-icons/fi'
import type { Event } from '../types/event'
import './EventPolicies.css'

interface EventPoliciesProps {
  event: Event
}

const POLICY_SECTIONS = [
  { icon: FiXCircle, title: 'Kebijakan Pembatalan', key: 'cancellationPolicy' as const },
  { icon: FiClipboard, title: 'Aturan Kegiatan', key: 'eventRules' as const },
  { icon: FiShield, title: 'Keamanan & Keselamatan', key: 'safetyInfo' as const },
]

export default function EventPolicies({ event }: EventPoliciesProps) {
  return (
    <div className="event-policies">
      <h3>Hal yang Perlu Diketahui</h3>
      <div className="event-policies__grid">
        {POLICY_SECTIONS.map(({ icon: Icon, title, key }) => (
          <div key={key} className="event-policies__item">
            <Icon className="event-policies__icon" aria-hidden="true" />
            <p className="event-policies__title">{title}</p>
            <p className="event-policies__desc">{event[key]}</p>
            <a href="#" className="event-policies__link">Pelajari lebih lanjut</a>
          </div>
        ))}
      </div>
    </div>
  )
}
