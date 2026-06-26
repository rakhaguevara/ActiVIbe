# Navbar Dashboard (Post-Login) — Redesign — Design Spec

> Status: Approved 2026-06-26. Konteks: setelah login, `DashboardLayout` cuma render topbar minim (logo + nama + Logout) dan `FindActivityPage` punya `VolunteerSearchBar` terpisah di bawah banner foto. User minta seluruh navbar (topbar + search bar) didesain ulang mengikuti referensi screenshot navbar Idealist.org (topbar dengan nav link + mega-menu + sapaan user + ikon notifikasi, ditambah search bar 1 baris di bawahnya).

## Tujuan

Navbar dashboard terlihat sebagai satu blok utuh (topbar + search bar nempel tanpa gap, meniru referensi), dengan nav link yang punya mega-menu dropdown ala Idealist, tanpa membangun fitur backend baru (notifikasi, organisasi, resources) yang belum ada — bagian yang kontennya belum ada ditandai non-aktif + badge "Segera Hadir", bukan dihilangkan diam-diam atau dibuat seolah berfungsi.

## 1. Arsitektur Komponen (tidak berubah dari pola yang ada)

`DashboardLayout` (shared layout, dipakai ulang nanti utk Organizer/Admin sesuai catatan di `CLAUDE.md`) **tidak** memiliki logic filter event volunteer — itu tetap milik `FindActivityPage`/`VolunteerSearchBar`. Kesan "1 navbar utuh" dicapai murni lewat CSS (tidak ada gap/border/shadow di antara topbar dan search bar), bukan dengan memindahkan state filter ke layout bersama.

| Baris | Komponen | Lokasi |
|---|---|---|
| 1 — Topbar | `DashboardLayout.tsx` (+`.css`) | shared layout, di luar `<Outlet/>` |
| 2 — Search bar | `VolunteerSearchBar.tsx` (+`.css`) | tetap di `FindActivityPage`, dipindah jadi child PERTAMA (sebelum banner) |

## 2. Topbar — Nav Link & Mega-Menu

4 nav link, render di tengah topbar (mengikuti pola `navbar__links` yang sudah ada di `Navbar.tsx` publik):

| Link | Punya mega-menu? | Trigger |
|---|---|---|
| Cari Aktivitas | Ya | klik (toggle), bukan hover |
| Cari Organisasi | Ya | klik (toggle) |
| Cara Kerja | Tidak — link biasa | — |
| Tentang Kami | Tidak — link biasa | — |

**Isi mega-menu "Cari Aktivitas"** (2 kolom):

| Kolom | Eyebrow | Item | Status |
|---|---|---|---|
| Kiri | AKTIVITAS | "Semua Kegiatan Volunteer" | Real — `Link to="/dashboard"`, tutup menu saat diklik |
| Kiri | AKTIVITAS | "Kegiatan Match Tertinggi" | Non-aktif + badge "Segera Hadir" |
| Kanan | RESOURCES | "Tips Jadi Volunteer" (ikon `FiBookOpen`) | Non-aktif + badge |
| Kanan | RESOURCES | "Cerita Dampak Komunitas" (ikon `FiHeart`) | Non-aktif + badge |

**Isi mega-menu "Cari Organisasi"** (2 kolom):

| Kolom | Eyebrow | Item | Status |
|---|---|---|---|
| Kiri | ORGANISASI | "Semua Organisasi" | Non-aktif + badge |
| Kiri | ORGANISASI | "Organisasi Terverifikasi" | Non-aktif + badge |
| Kanan | RESOURCES | "Panduan untuk Organisasi" (ikon `FiClipboard`) | Non-aktif + badge |

Item non-aktif: `<span>` (bukan `<a>`/`<button>`), styling pudar (`color: var(--color-text-muted)`), `cursor: not-allowed`, badge kecil teks "Segera Hadir" (background `--color-border-light`, teks `--color-text-muted`, pill kecil). Item real pakai elemen interaktif sesungguhnya (`Link`/`button`).

**"Cara Kerja"** → `Link to="/#cara-kerja"`. Section "How It Works" di `HomePage.tsx` (baris ~543, `<section className="how...">`) belum punya `id` — tambah `id="cara-kerja"`. `HomePage` butuh efek tambahan: on-mount, kalau `window.location.hash === '#cara-kerja'`, `scrollIntoView({ behavior: 'smooth' })` ke elemen itu (React Router tidak auto-scroll-to-hash secara default).

**"Tentang Kami"** → `Link to="/tentang-kami"` (route sudah ada, tidak ada perubahan).

**Dropdown user** ("Hi, {nama}!" + ikon chevron `FiChevronDown`): klik toggle dropdown kecil isi 1 item "Logout" (ikon `FiLogOut`, panggil `handleLogout` yang sudah ada di `DashboardLayout.tsx`).

**Dropdown notifikasi** (ikon `FiBell`): klik toggle dropdown kecil, isi teks statis "Belum ada notifikasi" (`color: var(--color-text-muted)`, centered). Tidak ada badge angka, tidak ada data — murni placeholder, tidak ada sistem notifikasi backend.

**Aturan buka/tutup dropdown:** hanya satu yang terbuka dalam satu waktu (state tunggal `openMenu: 'cari-aktivitas' | 'cari-organisasi' | 'user' | 'notif' | null` di `DashboardLayout`). Klik di luar topbar atau tombol `Escape` menutup dropdown yang terbuka.

## 3. Search Bar (Baris 2, Nempel Topbar)

Urutan elemen dalam 1 baris (flex row, wrap di mobile):

1. Label statis non-interaktif "Kegiatan Volunteer" (kotak dengan border, tidak bisa diklik — menggantikan posisi dropdown "Jobs" di referensi, ActiVibe cuma punya 1 jenis listing)
2. Input keyword (ikon `FiSearch`, placeholder "Cari kegiatan, skill, atau minat...") — sudah ada, dipindah
3. Input lokasi (ikon `FiMapPin`, placeholder "Lokasi (cth. Yogyakarta)") — sudah ada, dipindah
4. Dropdown **Kategori** (`<select>`, opsi dari `categories` yang sudah dihitung di `FindActivityPage`) — menggantikan posisi "Default Radius" di referensi
5. Tombol **Cari** (`background: var(--color-primary)`, `color: var(--color-text-on-accent)`, `border-radius: 10px`, ikon `FiSearch` + teks "Cari" — bukan "Search", konsisten Bahasa Indonesia dengan seluruh UI ActiVibe)

Filtering tetap **live** (tidak berubah dari behavior sekarang — `onChange` langsung update state filter di `FindActivityPage`). Seluruh search bar dibungkus `<form onSubmit={(e) => e.preventDefault()}>` supaya tombol Search dan tombol Enter di input text punya target submit yang valid (tidak reload page), walau secara fungsional tidak melakukan apa-apa tambahan karena filter sudah live.

Field `skill` dan `oneDayOnly` di `EventFilters` (interface, sudah ada) **tidak dihapus** — kontrolnya cuma pindah lokasi render (lihat §4), logic filtering di `FindActivityPage` tidak berubah.

CSS: hapus `border-top`/margin yang membuat search bar terlihat sebagai blok terpisah dari topbar; `border-bottom: 1px solid var(--color-border-light)` (sudah ada) dipertahankan sebagai pemisah halus ke banner di bawahnya.

## 4. Baris Hasil — Tambahan Skill & Toggle

`find-activity-page__results-row` (sudah ada, isinya teks "Kegiatan Volunteer | Total X hasil" + dropdown Sort) ditambah 2 kontrol baru di antara teks dan dropdown Sort:

- Dropdown **Skill** (opsi dari `skills` yang sudah dihitung di `FindActivityPage`, value `filters.skill`)
- Toggle checkbox **"Hanya 1 hari"** (value `filters.oneDayOnly`)

Keduanya pindahan langsung dari `VolunteerSearchBar` lama — markup/handler sama, cuma lokasi render & parent komponennya beda (sekarang dirender inline di `FindActivityPage.tsx`, bukan di dalam `VolunteerSearchBar`).

## 5. Reorder `FindActivityPage.tsx`

Urutan baru top-to-bottom: `VolunteerSearchBar` → banner foto+sapaan (`find-activity-page__banner`, tidak berubah) → results-row (dengan tambahan §4) → columns (tidak berubah).

## 6. Mobile / Responsive

Topbar pakai pola hamburger yang sama dengan `Navbar.tsx` publik (state `isMenuOpen`, tombol hamburger 3-garis, backdrop saat terbuka): di ≤768px, nav link + mega-menu disembunyikan dari row utama, dipindah ke dalam mobile menu sebagai **flat list** (mega-menu 2 kolom disederhanakan — item "Segera Hadir" tetap muncul tapi sebagai list datar, tanpa kolom RESOURCES bergambar). Ikon notifikasi dan trigger dropdown user tetap terlihat di topbar (di luar hamburger), supaya akses Logout & cek notifikasi tidak perlu buka hamburger dulu.

Search bar mengikuti pola wrap yang sudah ada di `VolunteerSearchBar.css` (`flex-wrap: wrap`), kelima elemen jadi full-width stacked di mobile.

## 7. File Plan

| File | Aksi |
|---|---|
| `frontend/src/layouts/DashboardLayout.tsx` | Modify total — tambah nav links, mega-menu, dropdown user, dropdown notifikasi, hamburger mobile |
| `frontend/src/layouts/DashboardLayout.css` | Modify total |
| `frontend/src/components/VolunteerSearchBar.tsx` | Modify — restruktur field sesuai §3, tambah tombol Search + label statis + dropdown Kategori, hapus render Skill/toggle (pindah ke §4) |
| `frontend/src/components/VolunteerSearchBar.css` | Modify — layout 1 baris pill, hapus border yang memisahkan dari topbar |
| `frontend/src/pages/volunteer/FindActivityPage.tsx` | Modify — reorder (§5), tambah dropdown Skill + toggle 1-hari di results-row, teruskan props baru (`categories`) ke `VolunteerSearchBar` kalau perlu |
| `frontend/src/pages/volunteer/FindActivityPage.css` | Modify — style kontrol baru di `find-activity-page__results-row` |
| `frontend/src/pages/HomePage.tsx` | Modify — tambah `id="cara-kerja"` di section "How It Works", tambah `useEffect` scroll-to-hash on mount |

Tidak ada file baru — semua perubahan terjadi di komponen yang sudah ada (`DashboardLayout`, `VolunteerSearchBar`, `FindActivityPage`, `HomePage`).

## 8. Styling

Semua warna lewat token `docs/design.md` yang sudah ada (`--color-primary`, `--color-text-muted`, `--color-border-light`, dst) — tidak ada hex baru. Radius elemen search bar (input/dropdown/tombol) konsisten 10px (sesuai [[button-radius-hierarchy]] — bukan pill, search bar bukan kategori tombol CTA besar). Dropdown mega-menu/user/notifikasi pakai card putih, `border-radius: 12px`, `box-shadow` ringan konsisten dengan shadow yang sudah dipakai `navbar__mobile-menu`.

## Testing / Verifikasi

Tidak ada test otomatis di frontend (konsisten dengan project ini). Verifikasi manual via `pnpm dev`: klik "Cari Aktivitas"/"Cari Organisasi" → mega-menu terbuka, klik di luar → tertutup; klik "Cara Kerja" dari `/dashboard` → pindah ke `/` dan scroll ke section "How It Works"; klik "Hi, {nama}" → dropdown Logout muncul & berfungsi; klik ikon bell → dropdown "Belum ada notifikasi" muncul; ketik di search bar → hasil tetap live-filter seperti sebelumnya; klik tombol "Cari" / tekan Enter di input → tidak reload halaman; filter Skill & toggle 1-hari di baris hasil tetap mempengaruhi list; resize ke mobile → hamburger menu muncul, nav link jadi flat list.
