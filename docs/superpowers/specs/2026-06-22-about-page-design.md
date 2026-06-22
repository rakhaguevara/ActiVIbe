# Halaman "Tentang Kami" — Design Spec

> Status: Approved 2026-06-22. Konteks: project belum punya routing sama sekali (semua section ada di satu `HomePage.tsx`, link nav masih `href="#"`). Ini adalah kali pertama `react-router-dom` masuk ke project.

## Tujuan

Membuat halaman publik "Tentang Kami" yang menjelaskan perjalanan ActiVibe (cerita berdirinya, milestone, visi-misi, tim), diakses lewat route URL sendiri (`/tentang-kami`), 100% mengikuti gaya visual & pola komponen yang sudah established di `HomePage.tsx` dan `docs/design.md` — bukan gaya baru.

## Keputusan Arsitektur

### Routing — diperkenalkan pertama kali

- Tambah dependency `react-router-dom` ke `frontend/package.json` (`pnpm add react-router-dom`).
- Konfigurasi routing ditaruh di `frontend/src/routes/AppRoutes.tsx` (folder `routes/` sudah ada sebagai skeleton kosong sejak awal project — sesuai catatan di README "routes/ # konfigurasi routing", jadi ini bukan folder baru, mengisi yang sudah direncanakan).
- `AppRoutes.tsx` export komponen `<AppRoutes />` berisi `<Routes>`: `/` → `HomePage`, `/tentang-kami` → `AboutPage`.
- `App.tsx` dibungkus `<BrowserRouter>`. `Navbar` dan `AuthModal` tetap dirender di luar `<Routes>` (selalu tampil di semua halaman, state modal tetap di `App.tsx` seperti sekarang).
- Link lain di `Navbar.tsx` (Cari Aktivitas, Cari Organisasi, Cara Kerja) **tetap** `<a href="#">` — halaman-halaman itu belum ada, di luar scope.

### Konten

- Sesuai keputusan user: narasi ditulis berdasarkan fakta dari `docs/PRD-ActiVibe-v2.0.md` (problem statement mismatch 40–60%, tim "Saw iT"), bukan Lorem ipsum dan bukan dikte manual.
- Tim: PRD hanya menyebut nama (Rakha, Haikal, Daffa, Abiem) + Rakha sebagai Product Owner, tanpa detail role per orang. Role 3 anggota lain ditulis generik **"Co-Founder & Tim Pengembang"** sebagai placeholder yang mudah dikoreksi user nanti.
- Avatar tim pakai lingkaran inisial (warna token brand), **bukan** foto stok yang berpura-pura jadi foto asli.

## File Plan

| File | Aksi |
|---|---|
| `frontend/package.json` | Tambah `react-router-dom` |
| `frontend/src/routes/AppRoutes.tsx` | Baru — definisi `<Routes>` |
| `frontend/src/App.tsx` | Bungkus `<BrowserRouter>`, render `<AppRoutes />` |
| `frontend/src/components/Navbar.tsx` | Link "Tentang Kami" → `<Link to="/tentang-kami">` (react-router) |
| `frontend/src/pages/HomePage.tsx` | CTA "More About Us.." → `<Link to="/tentang-kami">` (cuma target link, teks/section lain tidak disentuh) |
| `frontend/src/pages/AboutPage.tsx` | Baru |
| `frontend/src/pages/AboutPage.css` | Baru |
| `README.md` | Update progres + struktur (lihat bagian khusus di bawah) |
| `CLAUDE.md` | Catat keputusan struktural baru (routing diperkenalkan) sesuai aturan self-maintain di file itu sendiri |

## Struktur `AboutPage.tsx` (top → bottom)

Setiap section reuse pola/komponen yang sudah ada di `HomePage.tsx` + `design.md` (font Itim/Poppins otomatis via token global di `index.css`, tidak perlu setup font baru).

### 1. Hero

- Eyebrow: "Tentang ActiVibe"
- Heading: "Perjalanan Kami Membangun ActiVibe"
- Paragraf: "ActiVibe lahir dari satu pertanyaan sederhana: kenapa masih sulit menemukan kegiatan volunteer yang benar-benar cocok dengan minat dan kemampuan kita? Ini cerita tentang bagaimana kami mencoba menjawabnya."
- Reuse `wave.svg` sebagai divider bawah (pola sama seperti hero `HomePage`).

### 2. Cerita Kami

Pola identik `.about` section `HomePage.tsx` (grid 2 kolom ilustrasi + teks, judul dengan underline kuning via `::after`, scroll-reveal kiri/kanan pakai `useRevealOnScroll`). Ilustrasi reuse `logo-utama.svg` (sama seperti teaser homepage).

> "Di Indonesia, partisipasi sosial masyarakatnya tinggi — tapi sebagian besar kegiatan volunteer masih dicari secara manual, tanpa rekomendasi yang benar-benar memahami minat dan skill masing-masing orang. Akibatnya, tingkat ketidaksesuaian antara volunteer dan kegiatan yang mereka ikuti diperkirakan mencapai 40–60%. Banyak yang berhenti setelah satu kali coba, dan organisasi kesulitan menjaring volunteer yang benar-benar relevan.
>
> Dari situ, tim kami — Saw iT — mulai merancang ActiVibe: platform volunteer yang menggunakan AI untuk mencocokkan minat, skill, dan jadwal seseorang dengan kegiatan yang paling sesuai untuk mereka. Bukan sekadar daftar kegiatan, tapi pengalaman volunteering yang personal, terukur, dan punya jejak dampak yang bisa dibanggakan lewat Impact Passport."

### 3. Timeline Perjalanan

Meniru gaya stepper section "Cara Kerja" `HomePage.tsx` (rail vertikal oranye + pill aktif), tapi statis (tidak interaktif/klik — ini riwayat, bukan switcher gambar):

| # | Label | Deskripsi |
|---|---|---|
| 1 | Riset & Insight | Mengamati langsung masalah mismatch volunteer di lapangan, mengumpulkan data dan feedback dari calon volunteer maupun organisasi penyelenggara. |
| 2 | Ide ActiVibe Lahir | Tim Saw iT merancang konsep platform matching berbasis AI sebagai jawaban atas masalah yang ditemukan. |
| 3 | Penyusunan PRD & Design System | Menyusun dokumen produk lengkap (problem statement hingga FR-027) dan sistem desain yang konsisten di seluruh platform. |
| 4 | MVP Landing Page *(tahap sekarang — ditandai aktif)* | Landing page, autentikasi, dan fondasi desain ActiVibe yang sedang kamu lihat ini. |
| 5 | Next: Peluncuran Beta | Conversational Onboarding, Smart AI Matching, dan Impact Passport masuk ke tahap pengembangan penuh. |

### 4. Visi & Misi

- Visi (satu statement besar, tipografi `--font-display`): "Menjadi platform volunteer paling terpercaya di Indonesia, tempat setiap orang bisa menemukan kegiatan sosial yang benar-benar sesuai dengan minat dan potensinya."
- Misi — reuse pola card `.trust__item` (icon bulat + judul + desc, 3 kolom):
  1. **Memudahkan Pencarian** — Mengurangi proses coba-coba lewat rekomendasi kegiatan yang relevan dengan minat dan kemampuan setiap volunteer.
  2. **Mendukung Organisasi** — Membantu NGO dan komunitas menjangkau volunteer yang tepat, lebih cepat, dan lebih efisien dari proses manual.
  3. **Transparansi Dampak** — Mencatat setiap kontribusi volunteer lewat Impact Passport digital yang bisa dibagikan dan dibanggakan.

  (Konten misi ditulis baru, sengaja tidak menduplikasi teks `TRUST_BADGES` yang sudah ada di `HomePage.tsx` — hanya pola card-nya yang di-reuse, bukan teksnya, supaya dua halaman tidak terasa copy-paste.)

### 5. Tim Kami

Grid 4 card (reuse `.card` base dari `design.md` §6.2 — border-light, radius 20px), avatar lingkaran inisial:

| Nama | Role |
|---|---|
| Rakha Dzikra Guevara | Product Owner |
| Haikal | Co-Founder & Tim Pengembang |
| Daffa | Co-Founder & Tim Pengembang |
| Abiem | Co-Founder & Tim Pengembang |

### 6. CTA Penutup

- Heading: "Jadi Bagian dari Perjalanan Ini"
- Subtext: "Mulai langkah pertamamu bersama ActiVibe — baik sebagai volunteer yang ingin berdampak, atau organisasi yang ingin menjangkau lebih banyak relawan."
- Tombol "Daftar Sekarang" (`.btn--primary` pill) — `onClick` memanggil `onSignupClick` (prop diteruskan dari `App.tsx`, persis seperti yang sudah dipakai `Navbar`) untuk membuka `AuthModal` mode signup. Reuse modal yang sudah ada, tidak bikin form baru.

### 7. Footer

Render `<Footer />` di akhir, sama seperti `HomePage.tsx` (Footer tetap co-located per halaman, bukan dipindah ke layout wrapper global — supaya konsisten dengan pola yang sudah ada, tidak refactor di luar scope).

## Props / Data Flow

- `AboutPage` menerima 1 prop: `onSignupClick: () => void` (diteruskan dari `App.tsx`, sama seperti pola `Navbar`).
- Semua data section (`STORY`, `TIMELINE`, `MISSION_POINTS`, `TEAM`) hardcoded sebagai konstanta di `AboutPage.tsx`, sama persis pola `NAV_LINKS` di `Navbar.tsx` / `FEATURES` di `HomePage.tsx`. Tidak ada network call (backend belum ada).

## Styling

Tidak ada hex baru — semua lewat token `docs/design.md` §1 (warna), §2 (font), §3 (spacing). Komponen visual yang di-reuse: `.about__title` (underline kuning), `.how__nav-item--active`-style pill untuk timeline aktif, `.trust__item` untuk misi, `.card` untuk tim, `.btn--primary` untuk CTA.

## Update Dokumentasi

- **README.md**: tambah baris progres baru di checklist (`Halaman "Tentang Kami" dengan routing react-router-dom`), dan update bagian "Struktur `frontend/src`" kalau perlu mencerminkan `routes/AppRoutes.tsx` yang sudah terisi (bukan skeleton kosong lagi).
- **CLAUDE.md**: tambah catatan singkat bahwa routing (`react-router-dom`) sudah diperkenalkan mulai dari halaman ini, supaya sesi Claude berikutnya tidak mengira project masih single-page tanpa router.

## Testing / Verifikasi

Tidak ada test otomatis untuk styling di project ini. Verifikasi manual: `pnpm dev`, navigasi `/` → klik "Tentang Kami" / "More About Us.." → cek render `AboutPage` di `/tentang-kami`, scroll-reveal tiap section, klik CTA "Daftar Sekarang" membuka `AuthModal` mode signup, cek responsive di lebar desktop & mobile (pakai Playwright via cara yang sudah dipakai sebelumnya di project ini untuk verifikasi `AuthModal`).
