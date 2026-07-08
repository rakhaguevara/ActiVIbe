import { forwardRef, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaLinkedin, FaFacebook, FaInstagram, FaLeaf, FaQuoteLeft, FaStar, FaRegStar } from 'react-icons/fa'
import { FiPlus, FiX, FiSearch, FiMapPin, FiCalendar, FiCheck } from 'react-icons/fi'
import { MAX_GALLERY_PHOTOS } from './passportBook.types'
import type { PassportBookChapter } from './passportBook.types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

// react-pageflip (lihat node_modules/react-pageflip/build/index.es.js) meng-
// clone tiap child langsung dan menempelkan ref ke situ untuk dikumpulkan
// jadi elemen DOM per halaman — child harus forwardRef ke node DOM asli,
// kalau tidak React diam-diam menolak ref-nya (function component biasa
// tidak bisa menerima ref) dan halaman itu gagal terdaftar ke PageFlip
// meski tetap ter-render di DOM. Makanya semua komponen halaman di file ini
// forwardRef ke <div> root-nya.

// 1 & 2. Foto kegiatan + tombol share (LinkedIn/Instagram/Facebook)
export const PhotoSharePage = forwardRef<HTMLDivElement, { chapter: PassportBookChapter }>(function PhotoSharePage(
  { chapter },
  ref,
) {
  const [copied, setCopied] = useState(false)

  const handleShareLinkedin = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(chapter.shareUrl)}`, '_blank')
  }

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(chapter.shareUrl)}`, '_blank')
  }

  const handleShareInstagram = async () => {
    // Instagram tidak punya web share intent — pola sama seperti PassportPage:
    // salin link, IG-nya ditempel manual di caption/bio oleh user.
    await navigator.clipboard.writeText(chapter.shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div ref={ref} className="passport-book__page">
      <div className="passport-book__photo-slot">
        {chapter.heroPhotoUrl ? (
          <img src={chapter.heroPhotoUrl} alt={chapter.eventTitle} />
        ) : (
          <span className="passport-book__photo-placeholder">Slot: Foto kegiatan</span>
        )}
      </div>
      <div className="passport-book__page-meta">
        <span>
          <FiMapPin /> {chapter.location}
        </span>
        <span>
          <FiCalendar /> {formatDate(chapter.date)}
        </span>
      </div>
      <h3 className="passport-book__page-label">{chapter.eventTitle}</h3>
      <p className="passport-book__page-org">{chapter.organizerName}</p>
      <div className="passport-book__share-row">
        <button type="button" className="passport-book__share-btn" onClick={handleShareLinkedin} aria-label="Bagikan ke LinkedIn">
          <FaLinkedin />
        </button>
        <button type="button" className="passport-book__share-btn" onClick={handleShareInstagram} aria-label="Salin link untuk Instagram">
          {copied ? <FiCheck /> : <FaInstagram />}
        </button>
        <button type="button" className="passport-book__share-btn" onClick={handleShareFacebook} aria-label="Bagikan ke Facebook">
          <FaFacebook />
        </button>
      </div>
    </div>
  )
})

// 1 & 2 (mini-list kedua). Rangkuman kegiatan + chart/angka dampak
export const SummaryImpactPage = forwardRef<HTMLDivElement, { chapter: PassportBookChapter }>(
  function SummaryImpactPage({ chapter }, ref) {
    return (
      <div ref={ref} className="passport-book__page">
        <h3 className="passport-book__page-label">Ringkasan Kegiatan</h3>
        <p className="passport-book__summary-text">{chapter.summary}</p>
        <div className="passport-book__stat-tile">
          <span className="passport-book__stat-value">{chapter.impact.value.toLocaleString('id-ID')}</span>
          <span className="passport-book__stat-unit">{chapter.impact.unit}</span>
          <span className="passport-book__stat-label">{chapter.impact.metricLabel}</span>
        </div>
      </div>
    )
  },
)

// 3 & 4. Dampak lingkungan (kategori Lingkungan) ATAU kata dari yang
// terdampak (kategori Kemanusiaan) — dipilih di buildPages, komponen ini
// cuma merender salah satu sesuai data yang ada.
export const CategoryHighlightPage = forwardRef<HTMLDivElement, { chapter: PassportBookChapter }>(
  function CategoryHighlightPage({ chapter }, ref) {
    if (chapter.category === 'Lingkungan' && chapter.environmentalNote) {
      return (
        <div ref={ref} className="passport-book__page passport-book__page--highlight">
          <FaLeaf className="passport-book__highlight-icon" />
          <h3 className="passport-book__page-label">Dampak Lingkungan</h3>
          <p className="passport-book__highlight-text">{chapter.environmentalNote}</p>
        </div>
      )
    }

    if (chapter.category === 'Kemanusiaan' && chapter.beneficiaryQuote) {
      return (
        <div ref={ref} className="passport-book__page passport-book__page--highlight">
          <FaQuoteLeft className="passport-book__highlight-icon" />
          <p className="passport-book__highlight-text passport-book__highlight-text--quote">
            &ldquo;{chapter.beneficiaryQuote.quote}&rdquo;
          </p>
          <span className="passport-book__highlight-author">— {chapter.beneficiaryQuote.author}</span>
        </div>
      )
    }

    return <div ref={ref} className="passport-book__page" />
  },
)

interface GalleryPageProps {
  photos: string[]
  error?: string | null
  onAddPhotos: (files: FileList) => void
  onRemovePhoto: (index: number) => void
}

// 5. Galeri foto milik volunteer sendiri, maksimal 5, format PNG/JPG.
// Belum tersambung backend (lihat komentar di passportBook.types.ts) — foto
// yang ditambahkan cuma preview lokal (object URL), belum diupload/tersimpan.
export const GalleryPage = forwardRef<HTMLDivElement, GalleryPageProps>(function GalleryPage(
  { photos, error, onAddPhotos, onRemovePhoto },
  ref,
) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div ref={ref} className="passport-book__page">
      <h3 className="passport-book__page-label">Galeri Fotoku</h3>
      <div className="passport-book__gallery-grid">
        {photos.map((src, index) => (
          <div key={src} className="passport-book__gallery-item">
            <img src={src} alt={`Foto ${index + 1}`} />
            <button
              type="button"
              className="passport-book__gallery-remove"
              onClick={() => onRemovePhoto(index)}
              aria-label="Hapus foto"
            >
              <FiX />
            </button>
          </div>
        ))}
        {photos.length < MAX_GALLERY_PHOTOS && (
          <button type="button" className="passport-book__gallery-add" onClick={() => inputRef.current?.click()}>
            <FiPlus />
            <span>Tambah foto</span>
          </button>
        )}
      </div>
      <span className="passport-book__gallery-hint">
        {photos.length}/{MAX_GALLERY_PHOTOS} foto — format PNG/JPG
      </span>
      {error && <span className="passport-book__gallery-error">{error}</span>}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        multiple
        hidden
        onChange={(event) => {
          if (event.target.files) onAddPhotos(event.target.files)
          event.target.value = ''
        }}
      />
    </div>
  )
})

// 7. Kesan & pesan volunteer — dari EventFeedback (rating + comment), ikut
// memengaruhi rating organisasi penyelenggara.
export const FeedbackPage = forwardRef<HTMLDivElement, { chapter: PassportBookChapter }>(function FeedbackPage(
  { chapter },
  ref,
) {
  return (
    <div ref={ref} className="passport-book__page">
      <h3 className="passport-book__page-label">Kesan & Pesan</h3>
      {chapter.feedback ? (
        <>
          <div className="passport-book__rating-row">
            {Array.from({ length: 5 }, (_, index) =>
              index < chapter.feedback!.rating ? <FaStar key={index} /> : <FaRegStar key={index} />,
            )}
          </div>
          <p className="passport-book__summary-text">{chapter.feedback.comment}</p>
        </>
      ) : (
        <p className="passport-book__page-slot">Belum ada kesan & pesan untuk kegiatan ini.</p>
      )}
      <span className="passport-book__feedback-hint">
        Kesan & pesan ini juga jadi bagian dari rating organisasi penyelenggara.
      </span>
    </div>
  )
})

// 6. Halaman pengisi kalau jumlah bab belum memenuhi kapasitas buku.
export const CtaFillerPage = forwardRef<HTMLDivElement>(function CtaFillerPage(_props, ref) {
  const navigate = useNavigate()
  return (
    <div ref={ref} className="passport-book__page passport-book__page--cta">
      <FiSearch className="passport-book__cta-icon" />
      <p className="passport-book__cta-text">Halaman ini masih kosong — yuk isi dengan kegiatan berikutnya.</p>
      <button type="button" className="btn btn--primary btn--sm" onClick={() => navigate('/dashboard')}>
        Cari Event Lagi
      </button>
    </div>
  )
})
