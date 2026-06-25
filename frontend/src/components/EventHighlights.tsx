import { FiAward, FiTrendingUp, FiUserCheck } from 'react-icons/fi'
import './EventHighlights.css'

const HIGHLIGHTS = [
  {
    icon: FiAward,
    title: 'Sertifikat Digital',
    desc: 'Dapatkan sertifikat digital otomatis setelah kegiatan selesai.',
  },
  {
    icon: FiTrendingUp,
    title: 'Dampak Terukur',
    desc: 'Kontribusimu tercatat di Impact Passport sebagai jejak dampak yang bisa dibagikan.',
  },
  {
    icon: FiUserCheck,
    title: 'Didampingi Panitia',
    desc: 'Panitia dari penyelenggara mendampingi selama kegiatan berlangsung.',
  },
] as const

export default function EventHighlights() {
  return (
    <div className="event-highlights">
      {HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="event-highlights__item">
          <Icon className="event-highlights__icon" aria-hidden="true" />
          <div>
            <p className="event-highlights__title">{title}</p>
            <p className="event-highlights__desc">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
