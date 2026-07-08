import { useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import PassportBook from '../../components/passport-book/PassportBook'
import { MOCK_CHAPTERS } from '../../components/passport-book/passportBook.mockData'
import type { PassportSkill } from '../../components/passport-book/passportBook.types'
import './PassportPage.css'

const SKILLS: PassportSkill[] = [
  { name: 'Kerja Tim', xp: 340, xpTarget: 500, level: 3 },
  { name: 'Mengajar', xp: 210, xpTarget: 300, level: 2 },
  { name: 'Fisik/Lapangan', xp: 180, xpTarget: 300, level: 2 },
  { name: 'Kreativitas', xp: 90, xpTarget: 200, level: 1 },
]

const STATS = {
  totalHours: 42,
  eventsCompleted: MOCK_CHAPTERS.length,
  ngoCount: new Set(MOCK_CHAPTERS.map((c) => c.organizerName)).size,
  points: 950,
}

// Halaman ini sekarang cuma bingkai buku (bio, stats, skill tracker, dan
// share card semuanya jadi halaman pertama-ketiga bukunya sendiri, lihat
// PassportBook + SummaryPages.tsx) — bukan lagi kumpulan card terpisah.
export default function PassportPage() {
  const { user } = useAuth()

  const firstName = user?.name.split(' ')[0] ?? 'Volunteer'
  const slug = useMemo(
    () => (user?.name ?? 'volunteer').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'),
    [user?.name],
  )
  const publicUrl = `activivibe.id/passport/${slug}`
  const tagline = `"${firstName} adalah volunteer aktif yang telah mengabdikan ${STATS.totalHours} jam untuk lingkungan dan pendidikan bersama ${STATS.ngoCount} organisasi berbeda."`

  return (
    <main className="passport-page">
      <PassportBook
        title="Impact Passport"
        chapters={MOCK_CHAPTERS}
        tagline={tagline}
        stats={STATS}
        skills={SKILLS}
        publicUrl={publicUrl}
      />
    </main>
  )
}
