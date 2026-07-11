import { useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import PassportBook from '../../components/passport-book/PassportBook'
import SectionState from '../../components/SectionState'
import { usePassportData } from '../../hooks/usePassportData'
import './PassportPage.css'

// Halaman ini sekarang cuma bingkai buku (bio, stats, skill tracker, dan
// share card semuanya jadi halaman pertama-ketiga bukunya sendiri, lihat
// PassportBook + SummaryPages.tsx) — bukan lagi kumpulan card terpisah.
// Semua data (stats, skills, chapters) real dari backend (usePassportData),
// tidak ada lagi fallback ke MOCK_CHAPTERS — lihat komentar di hook itu.
export default function PassportPage() {
  const { user } = useAuth()
  const { chapters, stats, skills, isLoading, error, passportLock } = usePassportData()

  const firstName = user?.name.split(' ')[0] ?? 'Volunteer'
  const slug = useMemo(
    () => (user?.name ?? 'volunteer').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
    [user?.name],
  )
  const publicUrl = `activivibe.id/passport/${slug}`
  const tagline = `"${firstName} adalah volunteer aktif yang telah mengabdikan ${stats.totalHours} jam untuk lingkungan dan pendidikan bersama ${stats.ngoCount} organisasi berbeda."`

  if (isLoading) {
    return (
      <main className="passport-page">
        <SectionState variant="loading" title="Memuat Impact Passport..." />
      </main>
    )
  }

  if (error) {
    return (
      <main className="passport-page">
        <SectionState variant="error" title="Gagal memuat Impact Passport" description={error} />
      </main>
    )
  }

  // TIDAK ada branch "kosong" terpisah — walau chapters=[] (belum ada event
  // COMPLETED), buku tetap dirender apa adanya. buildPages() (PassportBook.tsx)
  // sudah selalu menyertakan halaman 1-3 (bio/skills/share) + filler CTA +
  // halaman quote terakhir terlepas dari isi chapters (chapters.forEach di
  // array kosong = no-op) — cuma halaman PER-CHAPTER yang otomatis tidak ada.
  return (
    <main className="passport-page">
      <PassportBook
        title="Impact Passport"
        chapters={chapters}
        tagline={tagline}
        stats={stats}
        skills={skills}
        publicUrl={publicUrl}
      />
      {passportLock?.locked && (
        <div className="passport-page__lock-banner">
          <p>
            🔒 {passportLock.totalChapters - passportLock.visibleCount} halaman kegiatan lainnya terkunci di paket Free/Starter —
            upgrade ke <strong>ActiVibe Plus Pro</strong> untuk membuka semua halaman Impact Passport-mu.
          </p>
          <a href="/activibe-plus" className="btn btn--primary btn--sm">Upgrade Sekarang</a>
        </div>
      )}
    </main>
  )
}
