# Halaman "Cara Kerja" (`/cara-kerja`) Design

**Date:** 2026-06-26
**Status:** Approved by user

## Context

"Cara Kerja" saat ini cuma section stepper kecil di homepage (`HomePage.tsx`, `id="cara-kerja"`):
5 step (label + 1 gambar besar, tanpa deskripsi), di-link dari `Navbar.tsx`, `DashboardLayout.tsx`,
dan `Footer.tsx` lewat anchor `/#cara-kerja`. User minta halaman penuh terpisah yang menjelaskan
alur aplikasi sesuai PRD **dan** menjelaskan **Impact Passport** (FR-008) — fitur portofolio
publik volunteer yang belum punya halaman implementasi sendiri, baru didokumentasikan di PRD.

## Decisions (confirmed with user)

1. **Replace, bukan tambahan.** Section stepper di homepage dihapus total. Semua link "Cara
   Kerja" (Navbar, DashboardLayout, Footer) diarahkan ke halaman baru `/cara-kerja`.
2. **Struktur dua lapis:** section umum/overview dulu (penjelasan besar, tidak dipisah per role),
   baru section detail — dan detail yang diminta scope-nya **volunteer saja** (alur organizer di
   luar scope halaman ini, sesuai stepper yang sudah ada).
3. **Impact Passport:** penjelasan konsep + daftar fitur (grid ringkas dari 6 poin FR-008) **dan**
   mockup visual ilustratif (data contoh, bukan tampilan asli karena halaman Impact Passport
   sungguhan belum dibangun).
4. **Tidak ada aset gambar baru** — reuse `pic1`/`pic2` (sudah dipakai di `HomePage`/`AboutPage`)
   untuk ilustrasi step dan avatar contoh di mockup Impact Passport.
5. **Tidak ada token warna baru** — semua styling pakai token yang sudah ada di `docs/design.md`,
   termasuk pola stepper vertikal di §6.5 yang memang direferensikan untuk "Cara Kerja ActiVibe".

## Page structure — `frontend/src/pages/CaraKerjaPage.tsx`

Pola file & registrasi route sama seperti `AboutPage.tsx` (public page, di bawah `PublicLayout`,
diakhiri `<Footer />`). Lima section, top to bottom:

### Section 1 — Hero

```
Eyebrow: "Cara Kerja ActiVibe"
Judul:   "Satu platform, satu alur jelas — dari daftar sampai dampak nyata."
Subjudul: "ActiVibe menghubungkan volunteer dan organisasi lewat AI, supaya setiap orang
           menemukan kegiatan yang benar-benar cocok, dan setiap kontribusi tercatat jadi
           bukti dampak yang bisa dibanggakan."
```

### Section 2 — Overview Umum (4 fase besar, kartu ringkas, bukan stepper)

Tidak dipisah per role — bahasa netral yang berlaku untuk volunteer maupun organisasi yang
membaca dari sisi mereka masing-masing.

| # | Label | Deskripsi |
|---|---|---|
| 1 | Daftar & Kenali Diri | Buat akun dan lewati Conversational Onboarding — ActiVibe mengenali minat, skill, dan jadwalmu lewat percakapan singkat, bukan formulir panjang. |
| 2 | Temukan & Terhubung | AI Matching kami mencocokkan profilmu dengan kegiatan volunteer yang paling relevan, lengkap dengan Predictive Match Score dan alasan kenapa kegiatan itu cocok untukmu. |
| 3 | Beraksi Bersama | Daftar ke kegiatan, dapatkan tiket konfirmasi digital, dan jalani kegiatan bersama organisasi serta volunteer lain yang sama-sama terverifikasi. |
| 4 | Catat & Bagikan Dampak | Setiap kontribusi otomatis tercatat — sertifikat digital terbit otomatis, dan dampakmu terkumpul jadi Impact Passport yang bisa dibagikan. |

### Section 3 — Alur Detail Volunteer (stepper, dipindah & diperluas dari HomePage)

Reuse pola UI `how__*` dari `HomePage.tsx` (nav rail kiri dengan progress + pill aktif, gambar besar
di kanan yang berganti sesuai step aktif — `activeStep` state, klik step di rail untuk pindah).
Sama `HOW_IT_WORKS_STEPS` (5 step), **ditambah field `desc` baru** (belum pernah ditulis):

```ts
const VOLUNTEER_FLOW_STEPS = [
  {
    label: 'Conversational Onboarding',
    image: pic1,
    desc: 'Alih-alih formulir panjang, ActiVibe mengenalimu lewat percakapan santai dengan AI Onboarding Agent. Dalam hitungan menit, sistem sudah tahu minat, skill, dan jadwalmu — siap dipakai untuk mencarikan kegiatan yang paling cocok.',
  },
  {
    label: 'Smart AI Matching',
    image: pic2,
    desc: 'Berdasarkan hasil onboarding, AI kami menyusun rekomendasi kegiatan volunteer yang dipersonalisasi lengkap dengan Predictive Match Score (%) dan alasan di baliknya — supaya kamu tahu persis kenapa sebuah kegiatan direkomendasikan untukmu.',
  },
  {
    label: 'Pilih Kegiatan Personalmu',
    image: pic1,
    desc: 'Telusuri daftar rekomendasi, bandingkan match score-nya, lalu daftar ke kegiatan yang paling sesuai dengan satu klik. Tiket konfirmasi digital berisi detail lengkap kegiatan langsung terbit setelah pendaftaranmu berhasil.',
  },
  {
    label: 'Beraksi & Beri Dampak',
    image: pic2,
    desc: 'Datang dan jalani kegiatan bersama organisasi serta volunteer lain. Setelah kegiatan selesai, beri feedback dan rating — masukanmu jadi sinyal yang membuat rekomendasi AI berikutnya makin akurat.',
  },
  {
    label: 'Track Your Impact',
    image: pic1,
    desc: 'Begitu organizer menutup kegiatan, sistem otomatis menerbitkan sertifikat digital personal dan memperbarui Skill Progress Tracker-mu. Semua tercatat rapi di Impact Passport — siap dibagikan kapan saja.',
  },
]
```

### Section 4 — Impact Passport

Penjelasan + grid fitur + mockup, dalam satu section `<section className="passport-explainer">`.

**Copy pembuka:**
```
Eyebrow: "Fitur Andalan"
Judul:   "Impact Passport — portofolio dampakmu, siap dibagikan kapan saja."
Body:    "Setiap kontribusi yang kamu beri lewat ActiVibe tidak berhenti jadi kenangan. Semuanya
          terkumpul otomatis jadi satu halaman portofolio publik yang bisa kamu lampirkan ke CV,
          bagikan ke media sosial, atau tunjukkan ke kampus dan lembaga beasiswa — tanpa perlu
          login untuk membukanya."
```

**Grid 6 fitur** (langsung dari FR-008, dirapikan jadi kalimat singkat per kartu):

```ts
const PASSPORT_FEATURES = [
  { title: 'Tagline AI Personal', desc: 'Headline unik dari AI berdasarkan total kontribusi dan dampak nyatamu — bukan template generik.' },
  { title: 'Statistik Dampak', desc: 'Total jam kontribusi, jumlah kegiatan selesai, jumlah NGO berbeda, dan metrik spesifik per event (mis. "240 bibit ditanam").' },
  { title: 'Skill Progress Tracker', desc: 'XP bar per skill yang naik otomatis setiap kali kamu menyelesaikan kegiatan terkait skill itu.' },
  { title: 'Timeline Kronologis', desc: 'Riwayat semua kegiatanmu berurutan waktu, lengkap dengan narasi dampak per event.' },
  { title: 'Share 1-Klik', desc: 'Bagikan ke IG Story, LinkedIn, atau WhatsApp — kontennya otomatis disesuaikan tone per platform oleh AI.' },
  { title: 'URL Publik', desc: 'Diakses tanpa login lewat activivibe.id/passport/{username} — siap dilampirkan ke CV atau portofolio beasiswa.' },
]
```

**Mockup visual:** kartu ilustratif statis (bukan komponen interaktif/link ke halaman nyata) memakai
data contoh, mengikuti narasi yang sudah ada di PRD FR-009 (volunteer "Abiem Nugroho" menanam
mangrove) supaya konsisten dengan dokumen produk:

```ts
const PASSPORT_MOCKUP = {
  name: 'Abiem Nugroho',
  avatar: pic1,
  tagline: '"Telah berkontribusi menanam 240 bibit mangrove bersama Yayasan Alam Nusantara."',
  stats: [
    { label: 'Jam Kontribusi', value: '86' },
    { label: 'Kegiatan Selesai', value: '12' },
    { label: 'NGO Berbeda', value: '5' },
  ],
  skills: [
    { label: 'Lingkungan', xp: 80 },
    { label: 'Pendidikan', xp: 45 },
  ],
}
```
Render sebagai kartu statis: avatar bulat + nama + tagline italic, 3 angka statistik berjajar, 2
skill bar (lebar bar = `xp`%). Beri label kecil "Contoh ilustrasi" di pojok kartu supaya jelas ini
bukan data sungguhan / bukan link aktif.

### Section 5 — CTA Penutup

```
Judul: "Siap mulai perjalanan volunteering-mu?"
Body:  "Buat akun gratis dan biarkan AI ActiVibe mencarikan kegiatan yang paling cocok untukmu."
Button: "Daftar Sekarang" → trigger signup modal (pola sama seperti AboutPage `__cta`, lihat
         AboutPage.tsx baris ~214-224 untuk cara memanggil `onSignupClick` dari halaman publik)
```

Lalu `<Footer />`.

## Migrasi dari `HomePage.tsx` / `HomePage.css`

- Hapus section `<section id="cara-kerja" className="how">` (baris 550-605). Confirmed via grep:
  `const howReveal = useRevealOnScroll(0.1)` (baris 270) dan
  `const [activeStep, setActiveStep] = useState(0)` (baris 271) **hanya** dipakai di section ini
  (baris 553-599) — hapus kedua deklarasi itu juga. Hapus juga `useEffect` hash-scroll
  `#cara-kerja` (baris ~349-353) beserta cek `window.location.hash !== '#cara-kerja'`.
- Hapus konstanta `HOW_IT_WORKS_STEPS` dari `HomePage.tsx` (datanya pindah & berkembang jadi
  `VOLUNTEER_FLOW_STEPS` di `CaraKerjaPage.tsx`).
- Pindahkan blok CSS "How It Works Section" (`HomePage.css`, baris 1040-1283, dari komentar header
  `/* ════ How It Works Section ("Cara Kerja ActiVibe") ════ */` sampai penutup media query
  `prefers-reduced-motion` sebelum komentar section "Symbols Carousel" di baris 1285) ke
  `CaraKerjaPage.css`, sesuaikan nama class kalau perlu (mis. `.how` → `.flow` supaya tidak
  membingungkan dengan section lain), tapi pertahankan visual look (rail progress, pill aktif,
  gambar besar di kanan) — ini bahasa visual "Cara Kerja" yang sudah disetujui di `docs/design.md`
  §6.5.

## Update link navigasi

- `frontend/src/components/Navbar.tsx:10` — `{ label: 'Cara Kerja', href: '#' }` → tambah
  `to: '/cara-kerja'` (pola identik entry `Tentang Kami` di baris 11).
- `frontend/src/layouts/DashboardLayout.tsx` — confirmed via grep: 2 occurrence `to="/#cara-kerja"`
  (baris 147 — topbar desktop link; baris 223 — mobile menu link, label "Cara Kerja" di baris 227
  adalah children JSX dari link yang sama, bukan occurrence terpisah) → ubah keduanya jadi
  `to="/cara-kerja"`.
- `frontend/src/components/Footer.tsx` — confirmed via Read: `Footer.tsx` belum import `Link` dari
  `react-router-dom` (baris 1 cuma `import { useState, type FormEvent } from 'react'`) — tambah
  import itu. Lalu di render loop kolom footer (baris 93-104, `FOOTER_COLUMNS.map(...) →
  links.map((link) => <li key={link}><a href="#" className="footer__column-link">{link}</a></li>)`),
  ubah baris 99 jadi conditional: kalau `link === 'Cara Kerja'`, render
  `<Link to="/cara-kerja" className="footer__column-link">{link}</Link>`; selain itu tetap
  `<a href="#" className="footer__column-link">{link}</a>` seperti sekarang (label lain di Footer
  sudah mati dari awal, di luar scope perubahan ini — jangan diubah).

## Routing

`frontend/src/routes/AppRoutes.tsx` — tambah di bawah `<Route element={<PublicLayout ...>}>`,
**sebelum** `<Route path="*" element={<NotFoundPage />} />` (baris 20 saat ini — urutan penting di
React Router, catch-all `*` harus selalu jadi route terakhir):
```tsx
<Route path="/tentang-kami" element={<AboutPage onSignupClick={onSignupClick} />} />
<Route path="/cara-kerja" element={<CaraKerjaPage onSignupClick={onSignupClick} />} />
<Route path="*" element={<NotFoundPage />} />
```
(Perlu prop `onSignupClick` diteruskan dari `AppRoutes` karena dipakai CTA section, sama seperti
`AboutPage` menerimanya di baris 19.)

## Out of scope

- Tidak membangun halaman Impact Passport sungguhan (`/passport/{username}`) — itu FR-008 utuh,
  proyek terpisah jauh lebih besar (butuh data model `ImpactLog`, backend, dst). Section di
  halaman ini murni penjelasan + mockup ilustratif.
- Tidak menjelaskan alur organizer/NGO — di luar scope per keputusan user.
- Tidak ada aset gambar atau token warna baru.
- Tidak mengubah `EventDetailPanel`, `EventScheduleCalendar`, atau komponen dashboard lain.
