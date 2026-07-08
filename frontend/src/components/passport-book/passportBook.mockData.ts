import type { PassportBookChapter } from './passportBook.types'

// Data contoh — nanti diganti hasil endpoint agregasi backend (belum ada,
// lihat catatan gap di README folder ini). 3 event, urutan terbaru dulu,
// sama seperti riwayat mock yang sebelumnya dipakai PassportPage.tsx
// (TIMELINE) — sengaja ada kategori Lingkungan (2x) & Kemanusiaan (1x)
// supaya blok kondisional (dampak lingkungan vs kata dari yang terdampak)
// kelihatan dua-duanya saat diuji.
export const MOCK_CHAPTERS: PassportBookChapter[] = [
  {
    id: 'evt-mock-1',
    eventTitle: 'Taman Bacaan Komunitas Malioboro',
    organizerName: 'Gerakan Literasi Yogyakarta',
    location: 'Malioboro, Yogyakarta',
    date: '2026-06-14',
    category: 'Kemanusiaan',
    heroPhotoUrl: undefined,
    shareUrl: 'https://activivibe.id/passport/evt-mock-1',
    summary:
      'Mendampingi sesi mendongeng dan membaca untuk anak-anak di taman bacaan komunitas selama 6 kali pertemuan akhir pekan.',
    impact: { metricLabel: 'Anak diajar', value: 18, unit: 'anak' },
    beneficiaryQuote: {
      quote: 'Kakak-kakak relawan bikin aku suka baca buku, jadi enggak main HP terus.',
      author: 'Salah satu anak peserta',
    },
    galleryPhotos: [],
    feedback: undefined,
  },
  {
    id: 'evt-mock-2',
    eventTitle: 'Penghijauan Lereng Merapi',
    organizerName: 'Komunitas Hijau Merapi',
    location: 'Sleman, DI Yogyakarta',
    date: '2026-05-03',
    category: 'Lingkungan',
    heroPhotoUrl: undefined,
    shareUrl: 'https://activivibe.id/passport/evt-mock-2',
    summary:
      'Ikut menanam bibit pohon di area resapan air sebagai bagian dari program konservasi jangka panjang lereng Merapi, bersama 40 volunteer lain selama satu hari penuh.',
    impact: { metricLabel: 'Bibit ditanam', value: 240, unit: 'bibit' },
    environmentalNote:
      'Area resapan yang ditanami membantu menjaga cadangan air tanah untuk desa-desa di sekitar lereng.',
    galleryPhotos: [],
    feedback: undefined,
  },
  {
    id: 'evt-mock-3',
    eventTitle: 'Bersih Pantai Parangtritis',
    organizerName: 'Komunitas Laut Lestari',
    location: 'Parangtritis, Bantul, DI Yogyakarta',
    date: '2026-03-21',
    category: 'Lingkungan',
    heroPhotoUrl: undefined,
    shareUrl: 'https://activivibe.id/passport/evt-mock-3',
    summary:
      'Membersihkan sampah plastik di sepanjang pesisir bersama komunitas pesisir, dilanjutkan edukasi pengelolaan sampah untuk warga.',
    impact: { metricLabel: 'Sampah diangkat', value: 18, unit: 'kg' },
    environmentalNote:
      'Sampah plastik yang diangkat sebelum sempat terurai jadi mikroplastik membantu menjaga ekosistem laut di sekitar pesisir.',
    galleryPhotos: [],
    feedback: undefined,
  },
]
