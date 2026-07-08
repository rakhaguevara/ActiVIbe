import PassportBook from '../../components/passport-book/PassportBook'
import { MOCK_CHAPTERS } from '../../components/passport-book/passportBook.mockData'

// Halaman preview terisolasi buat uji mekanisme buku (buka/tutup/flip) —
// belum dipasang ke navigasi mana pun, dan tidak menyentuh PassportPage.tsx
// yang sudah ada. Hapus/gabungkan setelah desain final Impact Passport siap.
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
      <PassportBook chapters={MOCK_CHAPTERS} />
    </main>
  )
}
