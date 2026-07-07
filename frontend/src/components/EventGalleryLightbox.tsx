import { useEffect, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi'
import './EventGalleryLightbox.css'

interface EventGalleryLightboxProps {
  photos: string[]
  initialIndex: number
  onClose: () => void
}

// Modal fullscreen hand-rolled, pola sama persis dgn ConfirmDialog.tsx
// (backdrop + role="dialog" + Escape-to-close) — bukan pakai @radix-ui/react-dialog
// yang terpasang tapi tidak dipakai di manapun di codebase ini.
export default function EventGalleryLightbox({ photos, initialIndex, onClose }: EventGalleryLightboxProps) {
  const [index, setIndex] = useState(initialIndex)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + photos.length) % photos.length)
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % photos.length)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, photos.length])

  return (
    <div className="event-gallery-lightbox__backdrop" onClick={onClose}>
      <div className="event-gallery-lightbox" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="event-gallery-lightbox__close" aria-label="Tutup" onClick={onClose}>
          <FiX />
        </button>
        <img src={photos[index]} alt={`Dokumentasi event ${index + 1}`} />
        {photos.length > 1 && (
          <>
            <button
              type="button"
              className="event-gallery-lightbox__nav event-gallery-lightbox__nav--prev"
              aria-label="Sebelumnya"
              onClick={() => setIndex((i) => (i - 1 + photos.length) % photos.length)}
            >
              <FiChevronLeft />
            </button>
            <button
              type="button"
              className="event-gallery-lightbox__nav event-gallery-lightbox__nav--next"
              aria-label="Berikutnya"
              onClick={() => setIndex((i) => (i + 1) % photos.length)}
            >
              <FiChevronRight />
            </button>
            <span className="event-gallery-lightbox__counter">
              {index + 1} / {photos.length}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
