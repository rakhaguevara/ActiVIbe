import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HTMLFlipBook from 'react-pageflip'
import type { FlipBookHandle, PageFlipEvent } from 'react-pageflip'
import { PhotoSharePage, SummaryImpactPage, CategoryHighlightPage, GalleryPage, FeedbackPage, CtaFillerPage, FinalQuotePage } from './ChapterPages'
import { SummaryStatsPage, SkillsPage, SharePage } from './SummaryPages'
import { MAX_GALLERY_PHOTOS, ALLOWED_GALLERY_MIME_TYPES } from './passportBook.types'
import type { PassportBookChapter, PassportSkill, PassportStats } from './passportBook.types'
import { FiDownload, FiX } from 'react-icons/fi'
import './PassportBook.css'

interface PassportBookProps {
  title?: string
  chapters?: PassportBookChapter[]
  // Bio page di depan buku — dulu section terpisah (hero/stats/skills/share)
  // di PassportPage.tsx, sekarang jadi 3 halaman pertama buku.
  tagline: string
  stats: PassportStats
  skills: PassportSkill[]
  publicUrl: string
  // Berapa halaman CTA "Cari Event Lagi" ditambahkan di akhir buku. Sengaja
  // kecil & tetap (bukan mengisi sampai jumlah halaman tertentu) — kalau
  // dipaksa mengisi banyak halaman kosong, beberapa spread berturut-turut
  // isinya identik persis dan kelihatan seperti macet/nge-bug, padahal
  // flip-nya jalan normal (sudah ketemu masalah ini saat uji coba).
  fillerPages?: number
}

type RenderPage =
  | { id: string; kind: 'summary' | 'skills' | 'share' | 'cta' | 'final-quote' }
  | { id: string; kind: 'chapter'; chapter: PassportBookChapter; pageType: 'photo-share' | 'summary-impact' | 'highlight' | 'gallery' | 'feedback' }

function chapterHasHighlight(chapter: PassportBookChapter) {
  return (
    (chapter.category === 'Lingkungan' && Boolean(chapter.environmentalNote)) ||
    (chapter.category === 'Kemanusiaan' && Boolean(chapter.beneficiaryQuote))
  )
}

// Bio page (tagline+stats, sendirian lewat showCover, kayak halaman biodata
// di paspor asli) -> skill tracker + share card (sepasang) -> tiap bab
// dipecah jadi beberapa halaman sesuai urutan yang diminta: foto+share,
// ringkasan+dampak, dampak lingkungan/kata penerima manfaat (kondisional),
// galeri, kesan & pesan -> ditutup beberapa halaman CTA di akhir (jumlah
// tetap & kecil, lihat komentar fillerPages).
function buildPages(chapters: PassportBookChapter[], fillerPages: number): RenderPage[] {
  const pages: RenderPage[] = [
    { id: 'summary', kind: 'summary' },
    { id: 'skills', kind: 'skills' },
    { id: 'share', kind: 'share' },
  ]

  chapters.forEach((chapter) => {
    pages.push({ id: `${chapter.id}-photo`, kind: 'chapter', chapter, pageType: 'photo-share' })
    // Cuma ada kalau ImpactLog beneran ada (organizer sudah close event) —
    // backend tidak pernah mengarang angka dampak, jadi halaman ini di-skip
    // utk chapter yang belum punya ImpactLog, bukan tampil dgn angka kosong.
    if (chapter.impact) {
      pages.push({ id: `${chapter.id}-summary`, kind: 'chapter', chapter, pageType: 'summary-impact' })
    }
    if (chapterHasHighlight(chapter)) {
      pages.push({ id: `${chapter.id}-highlight`, kind: 'chapter', chapter, pageType: 'highlight' })
    }
    pages.push({ id: `${chapter.id}-gallery`, kind: 'chapter', chapter, pageType: 'gallery' })
    pages.push({ id: `${chapter.id}-feedback`, kind: 'chapter', chapter, pageType: 'feedback' })
  })

  for (let i = 0; i < fillerPages; i += 1) {
    pages.push({ id: `cta-${i}`, kind: 'cta' })
  }

  pages.push({ id: 'final-quote', kind: 'final-quote' })

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

export default function PassportBook({
  title = 'Impact Passport',
  chapters = [],
  tagline,
  stats,
  skills,
  publicUrl,
  fillerPages = 1,
}: PassportBookProps) {
  const shareText = `Aku baru saja menyelesaikan ${stats.eventsCompleted} kegiatan volunteer dan berkontribusi ${stats.totalHours} jam bersama ${stats.ngoCount} organisasi lewat ActiVibe!`

  const [isExpanded, setIsExpanded] = useState(false)
  // Begitu animasi zoom (framer-motion) ke ukuran penuh selesai, cover masih
  // ditampilkan dulu (bukan langsung memasang flipbook) supaya user sempat
  // lihat cover-nya + klik lagi buat membuka halaman — dua tahap sengaja
  // dipisah dari isBookMounted supaya ada jeda "klik untuk membuka" yang
  // terlihat, bukan cuma sekilas sebelum langsung ganti ke reader.
  const [hasZoomedIn, setHasZoomedIn] = useState(false)
  // Klik di cover men-trigger pelebaran surface dari lebar "cover" (portrait,
  // selebar buku tertutup) ke lebar "reader" (spread, melebar di breakpoint
  // desktop) LEBIH DULU lewat state ini — HTMLFlipBook (size="stretch") baru
  // dipasang setelah animasi lebar itu selesai (lihat handleLayoutAnimationComplete).
  // Kalau dipasang bersamaan dengan resize container, react-pageflip sempat
  // mengukur lebar container di tengah transisi lalu salah ukur, halamannya
  // kelihatan seret/gepeng sesaat pas baru dibuka.
  const [isReaderSized, setIsReaderSized] = useState(false)
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
  const handleOpenReader = () => setIsReaderSized(true)

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
    setHasZoomedIn(false)
    setIsReaderSized(false)
  }

  // motion.div surface punya 2 macam animasi layout yang lewat callback yang
  // sama, dibedakan dari state saat ini:
  // 1. closed -> cover (zoom awal selesai): tandai hasZoomedIn supaya cover
  //    full-size berhenti dulu + hint "klik untuk membuka" muncul.
  // 2. cover -> reader (pelebaran ke lebar spread selesai): BARU DI SINI
  //    flipbook dipasang (isBookMounted), supaya react-pageflip mengukur
  //    container yang sudah di ukuran final, bukan di tengah transisi.
  const handleLayoutAnimationComplete = () => {
    if (isReaderSized) {
      setIsBookMounted(true)
      return
    }
    if (isExpanded) setHasZoomedIn(true)
  }

  const renderPage = (page: RenderPage): ReactNode => {
    switch (page.kind) {
      case 'summary':
        return <SummaryStatsPage key={page.id} tagline={tagline} stats={stats} />
      case 'skills':
        return <SkillsPage key={page.id} skills={skills} />
      case 'share':
        return <SharePage key={page.id} publicUrl={publicUrl} shareText={shareText} />
      case 'cta':
        return <CtaFillerPage key={page.id} />
      case 'final-quote':
        return <FinalQuotePage key={page.id} />
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
            !isExpanded
              ? 'passport-book__surface--closed'
              : isReaderSized
                ? 'passport-book__surface--reader'
                : 'passport-book__surface--cover'
          } ${hasZoomedIn && !isReaderSized ? 'passport-book__surface--cover-ready' : ''}`}
          onClick={
            !isExpanded ? handleOpen : hasZoomedIn && !isReaderSized ? handleOpenReader : undefined
          }
        >
          {!isBookMounted ? (
            <div
              // Selagi surface masih animasi membesar dari thumbnail kecil ke
              // ukuran cover penuh (isExpanded tapi belum hasZoomedIn),
              // gambar cover-nya SENGAJA tidak dipasang jadi background —
              // background-size:cover ikut "menggelembung" tidak enak dilihat
              // kalau dibiarkan scale bareng animasi resize. Tampilkan abu-abu
              // polos dulu, baru pasang gambar aslinya begitu ukuran final
              // tercapai (hasZoomedIn true).
              className={`passport-book__cover-face ${
                isExpanded && !hasZoomedIn ? 'passport-book__cover-face--loading' : ''
              }`}
              style={
                coverUrl && (!isExpanded || hasZoomedIn)
                  ? { backgroundImage: `url(${coverUrl})`, border: 'none' }
                  : undefined
              }
            >
              {!coverUrl && (
                <>
                  <span className="passport-book__cover-placeholder-tag">Placeholder cover</span>
                  <span className="passport-book__cover-title">{title}</span>
                  {!isExpanded && <span className="passport-book__cover-hint">Klik untuk membuka</span>}
                </>
              )}
              {hasZoomedIn && !isReaderSized && (
                <span className="passport-book__cover-hint passport-book__cover-hint--prompt">
                  Klik untuk membuka
                </span>
              )}
            </div>
          ) : (
            <div className="passport-book__reader">
              <div className="passport-book__reader-actions">
                <button type="button" className="passport-book__action-btn" title="Download PDF" onClick={() => alert('Fitur Download PDF belum tersedia')}>
                  <FiDownload />
                </button>
                <button type="button" className="passport-book__action-btn" onClick={handleClose} aria-label="Tutup" title="Tutup">
                  <FiX />
                </button>
              </div>
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
          <div
            className={`passport-book__nav-row ${
              isBookMounted ? 'passport-book__nav-row--reader' : ''
            }`}
          >
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
