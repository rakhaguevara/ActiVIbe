import PassportBook from '../../components/passport-book/PassportBook'
import { MOCK_CHAPTERS } from '../../components/passport-book/passportBook.mockData'

const MOCK_STATS = {
  totalHours: 42,
  eventsCompleted: MOCK_CHAPTERS.length,
  ngoCount: new Set(MOCK_CHAPTERS.map((c) => c.organizerName)).size,
  points: 950,
}

const MOCK_SKILLS = [
  { name: 'Kerja Tim', xp: 340, xpTarget: 500, level: 3 },
  { name: 'Mengajar', xp: 210, xpTarget: 300, level: 2 },
]

// Halaman preview terisolasi buat uji mekanisme buku (buka/tutup/flip) —
// belum dipasang ke navigasi mana pun. Sekarang PassportPage.tsx (rute
// /dashboard/passport) sudah pakai komponen yang sama sebagai halaman
// utuh; ini cuma testbed tanpa dashboard chrome di sekitarnya.
export default function PassportBookPreview() {
  return (
    <main style={{ padding: 'var(--space-xl)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-md)' }}>
        Prototype — Impact Passport Book
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-xl)' }}>
        Klik sampul untuk menguji animasi zoom-in dan flip halaman. Data bab masih mock (lihat{' '}
        <code>passportBook.mockData.ts</code>) — belum tersambung endpoint backend.
      </p>
      <PassportBook
        chapters={MOCK_CHAPTERS}
        tagline="Ini contoh tagline AI untuk uji coba prototype."
        stats={MOCK_STATS}
        skills={MOCK_SKILLS}
        publicUrl="activivibe.id/passport/preview"
      />
    </main>
  )
}
