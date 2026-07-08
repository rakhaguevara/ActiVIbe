import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HTMLFlipBook from 'react-pageflip'
import type { FlipBookHandle, PageFlipEvent } from 'react-pageflip'
import { PhotoSharePage, SummaryImpactPage, CategoryHighlightPage, GalleryPage, FeedbackPage, CtaFillerPage } from './ChapterPages'
import { MAX_GALLERY_PHOTOS, ALLOWED_GALLERY_MIME_TYPES } from './passportBook.types'
import type { PassportBookChapter } from './passportBook.types'
import './PassportBook.css'

interface PassportBookProps {
  title?: string
  chapters?: PassportBookChapter[]
  // Berapa halaman CTA "Cari Event Lagi" ditambahkan di akhir buku. Sengaja
  // kecil & tetap (bukan mengisi sampai jumlah halaman tertentu) — kalau
  // dipaksa mengisi banyak halaman kosong, beberapa spread berturut-turut
  // isinya identik persis dan kelihatan seperti macet/nge-bug, padahal
  // flip-nya jalan normal (sudah ketemu masalah ini saat uji coba).
  fillerPages?: number
}

type RenderPage =
  | { id: string; kind: 'cover' | 'blank' | 'cta' }
  | { id: string; kind: 'chapter'; chapter: PassportBookChapter; pageType: 'photo-share' | 'summary-impact' | 'highlight' | 'gallery' | 'feedback' }

function chapterHasHighlight(chapter: PassportBookChapter) {
  return (
    (chapter.category === 'Lingkungan' && Boolean(chapter.environmentalNote)) ||
    (chapter.category === 'Kemanusiaan' && Boolean(chapter.beneficiaryQuote))
  )
}

// Cover (sendirian lewat showCover) -> halaman blank (verso, meniru buku
// fisik) -> tiap bab dipecah jadi beberapa halaman sesuai urutan yang
// diminta: foto+share, ringkasan+dampak, dampak lingkungan/kata penerima
// manfaat (kondisional), galeri, kesan & pesan -> ditutup beberapa halaman
// CTA di akhir (jumlah tetap & kecil, lihat komentar fillerPages).
function buildPages(chapters: PassportBookChapter[], fillerPages: number): RenderPage[] {
  const pages: RenderPage[] = [
    { id: 'cover', kind: 'cover' },
    { id: 'cover-blank', kind: 'blank' },
  ]

  chapters.forEach((chapter) => {
    pages.push({ id: `${chapter.id}-photo`, kind: 'chapter', chapter, pageType: 'photo-share' })
    pages.push({ id: `${chapter.id}-summary`, kind: 'chapter', chapter, pageType: 'summary-impact' })
    if (chapterHasHighlight(chapter)) {
      pages.push({ id: `${chapter.id}-highlight`, kind: 'chapter', chapter, pageType: 'highlight' })
    }
    pages.push({ id: `${chapter.id}-gallery`, kind: 'chapter', chapter, pageType: 'gallery' })
    pages.push({ id: `${chapter.id}-feedback`, kind: 'chapter', chapter, pageType: 'feedback' })
  })

  for (let i = 0; i < fillerPages; i += 1) {
    pages.push({ id: `cta-${i}`, kind: 'cta' })
  }

  return pages
}

// Vite mengambil file cover.* apa pun yang ditaruh di src/assets/passport
// (lihat README di folder itu) — jadi menaruh desain cover final tidak perlu
// menyentuh komponen ini sama sekali.
const coverModules = import.meta.glob('/src/assets/passport/cover.*', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>
const coverUrl = Object.values(coverModules)[0]

export default function PassportBook({ title = 'Impact Passport', chapters = [], fillerPages = 1 }: PassportBookProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isBookMounted, setIsBookMounted] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const flipBookRef = useRef<FlipBookHandle>(null)

  // Galeri foto per-volunteer belum ada endpoint backend — state lokal ini
  // cuma preview di sesi berjalan (object URL), belum ter-upload/tersimpan.
  const [galleryPhotosByChapter, setGalleryPhotosByChapter] = useState<Record<string, string[]>>({})
  const [galleryErrorByChapter, setGalleryErrorByChapter] = useState<Record<string, string | null>>({})

  const getGalleryPhotos = (chapter: PassportBookChapter) => galleryPhotosByChapter[chapter.id] ?? chapter.galleryPhotos

  const handleAddPhotos = (chapter: PassportBookChapter, files: FileList) => {
    const current = getGalleryPhotos(chapter)
    const incoming = Array.from(files)

    if (incoming.some((file) => !ALLOWED_GALLERY_MIME_TYPES.includes(file.type))) {
      setGalleryErrorByChapter((prev) => ({ ...prev, [chapter.id]: 'Hanya file PNG/JPG yang didukung.' }))
      return
    }

    const remainingSlots = Math.max(0, MAX_GALLERY_PHOTOS - current.length)
    const accepted = incoming.slice(0, remainingSlots)
    const wasTruncated = accepted.length < incoming.length

    setGalleryErrorByChapter((prev) => ({
      ...prev,
      [chapter.id]: wasTruncated ? `Maksimal ${MAX_GALLERY_PHOTOS} foto per kegiatan.` : null,
    }))
    setGalleryPhotosByChapter((prev) => ({
      ...prev,
      [chapter.id]: [...current, ...accepted.map((file) => URL.createObjectURL(file))],
    }))
  }

  const handleRemovePhoto = (chapter: PassportBookChapter, index: number) => {
    setGalleryPhotosByChapter((prev) => ({
      ...prev,
      [chapter.id]: getGalleryPhotos(chapter).filter((_, photoIndex) => photoIndex !== index),
    }))
    setGalleryErrorByChapter((prev) => ({ ...prev, [chapter.id]: null }))
  }

  const pages = buildPages(chapters, fillerPages)

  const handleOpen = () => setIsExpanded(true)

  const handleFlipInit = (event: PageFlipEvent) => {
    setCurrentPage(event.object.getCurrentPageIndex())
    setPageCount(event.object.getPageCount())
    setOrientation(event.object.getOrientation())
  }

  const handleFlip = (event: PageFlipEvent) => {
    setCurrentPage(event.object.getCurrentPageIndex())
    setOrientation(event.object.getOrientation())
  }

  // Dalam mode spread (landscape/2-halaman), getCurrentPageIndex() balikin
  // index halaman KIRI dari pasangan yang tampil — spread terakhir jadinya
  // berhenti di pageCount-2, bukan pageCount-1 (itu cuma tercapai di mode
  // portrait/1-halaman). Ketemu manual: tanpa ini tombol next tetap aktif
  // walau sudah di halaman paling akhir.
  const isAtLastPage =
    pageCount > 0 && currentPage >= pageCount - (orientation === 'landscape' ? 2 : 1)

  const goPrev = () => flipBookRef.current?.pageFlip().flipPrev()
  const goNext = () => flipBookRef.current?.pageFlip().flipNext()

  const handleClose = () => {
    // Lepas flipbook dulu sebelum permukaan mengecil, supaya transform 3D
    // internalnya (react-pageflip) tidak berebut dengan animasi layout
    // framer-motion yang sedang mengecilkan container.
    setIsBookMounted(false)
    setIsExpanded(false)
  }

  const handleLayoutAnimationComplete = () => {
    if (isExpanded) setIsBookMounted(true)
  }

  const renderPage = (page: RenderPage): ReactNode => {
    switch (page.kind) {
      case 'cover':
        return (
          <div key={page.id} className="passport-book__page">
            <span className="passport-book__page-label">{title}</span>
            <p className="passport-book__summary-text">Rangkuman perjalanan volunteer-mu ada di halaman berikutnya.</p>
          </div>
        )
      case 'blank':
        return <div key={page.id} className="passport-book__page passport-book__page--blank" />
      case 'cta':
        return <CtaFillerPage key={page.id} />
      case 'chapter':
        switch (page.pageType) {
          case 'photo-share':
            return <PhotoSharePage key={page.id} chapter={page.chapter} />
          case 'summary-impact':
            return <SummaryImpactPage key={page.id} chapter={page.chapter} />
          case 'highlight':
            return <CategoryHighlightPage key={page.id} chapter={page.chapter} />
          case 'gallery':
            return (
              <GalleryPage
                key={page.id}
                photos={getGalleryPhotos(page.chapter)}
                error={galleryErrorByChapter[page.chapter.id]}
                onAddPhotos={(files) => handleAddPhotos(page.chapter, files)}
                onRemovePhoto={(index) => handleRemovePhoto(page.chapter, index)}
              />
            )
          case 'feedback':
            return <FeedbackPage key={page.id} chapter={page.chapter} />
          default:
            return null
        }
      default:
        return null
    }
  }

  return (
    <div className="passport-book">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="passport-book__backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
        )}
      </AnimatePresence>

      <div className={`passport-book__frame ${isExpanded ? 'passport-book__frame--open' : ''}`}>
        <motion.div
          layout
          onLayoutAnimationComplete={handleLayoutAnimationComplete}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={`passport-book__surface ${
            isExpanded ? 'passport-book__surface--open' : 'passport-book__surface--closed'
          }`}
          onClick={isExpanded ? undefined : handleOpen}
        >
          {!isBookMounted ? (
            <div
              className="passport-book__cover-face"
              style={coverUrl ? { backgroundImage: `url(${coverUrl})`, border: 'none' } : undefined}
            >
              {!coverUrl && (
                <>
                  <span className="passport-book__cover-placeholder-tag">Placeholder cover</span>
                  <span className="passport-book__cover-title">{title}</span>
                  <span className="passport-book__cover-hint">
                    {isExpanded ? 'Membuka…' : 'Klik untuk membuka'}
                  </span>
                </>
              )}
            </div>
          ) : (
            <div className="passport-book__reader">
              <button type="button" className="passport-book__close-btn" onClick={handleClose} aria-label="Tutup">
                ×
              </button>
              <HTMLFlipBook
                ref={flipBookRef}
                width={420}
                height={600}
                size="stretch"
                minWidth={280}
                maxWidth={480}
                minHeight={400}
                maxHeight={680}
                showCover
                usePortrait
                drawShadow
                maxShadowOpacity={0.2}
                flippingTime={700}
                clickEventForward
                className="passport-book__flipbook"
                onInit={handleFlipInit}
                onFlip={handleFlip}
              >
                {pages.map((page) => renderPage(page))}
              </HTMLFlipBook>
            </div>
          )}
        </motion.div>

        {isExpanded && (
          <div className="passport-book__nav-row">
            <button
              type="button"
              className="passport-book__nav passport-book__nav--prev"
              onClick={goPrev}
              disabled={!isBookMounted || currentPage <= 0}
              aria-label="Halaman sebelumnya"
            >
              ‹
            </button>
            <button
              type="button"
              className="passport-book__nav passport-book__nav--next"
              onClick={goNext}
              disabled={!isBookMounted || isAtLastPage}
              aria-label="Halaman berikutnya"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
