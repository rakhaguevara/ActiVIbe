import { Link } from 'react-router-dom'
import InlineLoading from './InlineLoading'
import './SectionState.css'

interface SectionStateAction {
  label: string
  to: string
}

interface SectionStateProps {
  variant: 'error' | 'empty' | 'loading'
  title: string
  description?: string
  onRetry?: () => void
  action?: SectionStateAction
  /** Class tambahan dari parent (mis. modifier grid-column span) */
  className?: string
}

// Fallback per-section dipakai tiap halaman volunteer saat data gagal
// dimuat/kosong — supaya cuma bagian yang bermasalah yang menampilkan pesan,
// bukan seluruh halaman jadi kosong/putih (lihat docs/design.md Section 6.2
// utk token card, Section 1.7 utk warna semantik).
export default function SectionState({ variant, title, description, onRetry, action, className }: SectionStateProps) {
  if (variant === 'loading') {
    return <InlineLoading />
  }

  return (
    <div className={`section-state section-state--${variant}${className ? ` ${className}` : ''}`}>
      <p className="section-state__code">404</p>
      <p className="section-state__title">{title}</p>
      {description && <p className="section-state__description">{description}</p>}
      {onRetry && (
        <button type="button" className="section-state__retry" onClick={onRetry}>
          Muat ulang
        </button>
      )}
      {action && (
        <Link to={action.to} className="section-state__retry">
          {action.label}
        </Link>
      )}
    </div>
  )
}
