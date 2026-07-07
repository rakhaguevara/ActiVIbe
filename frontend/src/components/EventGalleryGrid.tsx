import './EventGalleryGrid.css'

interface EventGalleryGridProps {
  photos: string[]
  onOpenLightbox: (index: number) => void
}

// Renderer foto asli event: 1 foto -> hero tunggal, 2-6 foto -> kolase grid
// responsif (foto pertama lebih besar). Return null kalau tidak ada foto —
// parent (EventDetailPanel) yang jatuh balik ke EventGalleryHero (ikon
// kategori), supaya event lama tanpa galeri tetap tampil wajar.
export default function EventGalleryGrid({ photos, onOpenLightbox }: EventGalleryGridProps) {
  if (photos.length === 0) return null

  if (photos.length === 1) {
    return (
      <button type="button" className="event-gallery-grid event-gallery-grid--single" onClick={() => onOpenLightbox(0)}>
        <img src={photos[0]} alt="Dokumentasi event" />
      </button>
    )
  }

  return (
    <div className={`event-gallery-grid event-gallery-grid--count-${photos.length}`}>
      {photos.map((photo, index) => (
        <button
          type="button"
          key={photo}
          className="event-gallery-grid__cell"
          onClick={() => onOpenLightbox(index)}
        >
          <img src={photo} alt={`Dokumentasi event ${index + 1}`} />
        </button>
      ))}
    </div>
  )
}
