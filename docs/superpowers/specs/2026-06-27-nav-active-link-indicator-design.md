# Indikator Garis Warna untuk Nav Link Aktif (Navbar & AppTopbar) — Design Spec

> Status: Approved 2026-06-27. Konteks: saat ini `Navbar.tsx` (publik, visitor anonim) dan `AppTopbar.tsx` (dipakai di `/dashboard` selalu, dan di `/`, `/tentang-kami`, `/cara-kerja` saat user login — lihat `2026-06-27-shared-app-topbar-design.md`) **tidak punya konsep "halaman aktif" sama sekali**. Highlight yang user lihat di screenshot adalah `:hover` (background `--color-primary-soft`) biasa. User minta indikator baru: garis warna di bawah link, beda warna per link, bukan pill background transparan ungu.

## Tujuan

Setiap nav link punya 1 warna accent tetap dari palet resmi (`docs/design.md`). Saat user berada di halaman yang sesuai, link itu dapat garis bawah (underline bar) 3px berwarna sesuai accent-nya + teks jadi bold — bukan ganti warna teks (lihat §2 soal kendala kontras AA). Berlaku konsisten di `Navbar` dan `AppTopbar`, termasuk versi mobile-nya.

## 1. Mapping Warna per Link (Tetap, Dipakai di Kedua Komponen)

| Link | Accent modifier class | Token warna |
|---|---|---|
| Cari Aktivitas | `--primary` | `--color-primary` (ungu) |
| Cari Organisasi | `--secondary` | `--color-secondary` (biru) |
| Cara Kerja | `--orange` | `--color-accent-orange` |
| Tentang Kami | `--yellow` | `--color-accent-yellow` |

Mapping ini final per persetujuan user (urutan sesuai urutan link di nav, pink diganti biru sekunder karena pink tidak ada di palet resmi).

## 2. Visual Treatment — Underline Bar, Bukan Pill, Bukan Teks Berwarna

- Garis bawah: `::after` pseudo-element, `height: 3px`, `border-radius: 999px`, inset `left/right: 14px` (selaras `padding` horizontal link yang sudah ada), posisi `bottom: 2px`, default `background: transparent`, transisi halus. Butuh `position: relative` di elemen link.
- Saat aktif (`.is-active`): `font-weight: 600`, `background` pseudo-element berubah ke token accent link tsb. **Teks TIDAK ikut berubah warna** — tetap `--color-text-heading`. Alasan: `docs/design.md` Section 1 melarang `--color-secondary` dan `--color-accent-yellow` jadi warna teks di atas background putih (gagal WCAG AA). Supaya treatment konsisten di 4 link (bukan 2 link berubah warna teks, 2 tidak), semua link aktif pakai aturan yang sama: bold + garis berwarna, teks tetap heading-color.
- Hover saat link itu **sedang aktif**: ganti tint hover dari `--color-primary-soft` generik ke `-soft` milik accent-nya sendiri (`--color-secondary-soft`, `--color-accent-orange-soft`, `--color-accent-yellow-soft` — keempatnya sudah ada di palet). Link yang **tidak aktif** tetap pakai hover `--color-primary-soft` seperti sekarang (tidak ada perubahan).

## 3. Logika "Sedang di Halaman Ini" per Komponen

**`Navbar.tsx` (publik):**
- `NAV_LINKS` ditambah field `accent` (`'primary' | 'secondary' | 'orange' | 'yellow'`) sesuai §1.
- Item dengan `to` (Cara Kerja, Tentang Kami) → ganti `Link` jadi `NavLink`, pakai `className={({isActive}) => ...}` untuk menambah class `is-active`.
- Item `href="#"` (Cari Aktivitas, Cari Organisasi) → masih placeholder, tidak punya rute, jadi **tidak pernah** `is-active`. Class accent (`navbar__link--primary`, `navbar__link--secondary`) tetap dipasang dari sekarang supaya begitu link ini jadi rute sungguhan nanti, warnanya sudah konsisten tanpa perubahan lanjutan.

**`AppTopbar.tsx` (dashboard + publik saat login):**
- Cara Kerja, Tentang Kami → sama seperti Navbar: `Link` → `NavLink`, accent orange/yellow.
- Cari Aktivitas (trigger mega-menu, `<button>`, bukan link langsung) → pakai `useLocation()`, aktif kalau `pathname.startsWith('/dashboard')` (satu-satunya rute nyata di bawah mega-menu ini sekarang, sesuai isi mega-menu "Semua Kegiatan Volunteer" → `/dashboard`).
- Cari Organisasi (`<button>`) → semua isi mega-menu-nya masih "Segera Hadir" (belum ada rute nyata). Tulis sebagai `const ORGANISASI_ROUTES: string[] = []` lalu `pathname.startsWith(...)` di-OR-kan dari array itu — supaya begitu ada rute organisasi sungguhan, tinggal tambah ke array, bukan nulis ulang logic.

## 4. Mobile Menu — Accent Bar Vertikal

Layout mobile berbentuk list vertikal, jadi underline horizontal tidak cocok. Treatment: `border-left: 4px solid transparent` default di `.navbar__mobile-link`/`.app-topbar__mobile-link`, berubah ke token accent saat `.is-active` (border-radius kecil di sisi kiri, padding-left disesuaikan supaya teks tidak nempel ke bar). Mapping accent & logika is-active sama dengan versi desktop (§1, §3) — termasuk reuse `NavLink` untuk item yang punya `to`.

Catatan untuk `AppTopbar` mobile: mega-menu di mobile sudah diflatten jadi list datar (lihat `2026-06-26-dashboard-navbar-redesign-design.md` §6) — item "Semua Kegiatan Volunteer" (`Link to="/dashboard"`) pakai accent `--primary` (mewarisi warna "Cari Aktivitas"), item disabled "Segera Hadir" tidak diberi accent/active state apa pun (tetap pudar seperti sekarang).

## 5. File Plan

| File | Aksi |
|---|---|
| `frontend/src/components/Navbar.tsx` | Modify — `NAV_LINKS` tambah field `accent`, item `to` pakai `NavLink`, render class accent + `is-active`, terapkan juga di render mobile menu |
| `frontend/src/components/Navbar.css` | Modify — tambah `::after` underline bar, 4 modifier class `--primary/--secondary/--orange/--yellow`, hover-soft per accent saat aktif, border-left accent di mobile link |
| `frontend/src/components/AppTopbar.tsx` | Modify — `useLocation()` utk hitung `isAktivitasActive`/`isOrganisasiActive`, `Cara Kerja`/`Tentang Kami` jadi `NavLink`, render class accent + `is-active` di trigger button & link, terapkan juga di mobile menu (termasuk item "Semua Kegiatan Volunteer") |
| `frontend/src/components/AppTopbar.css` | Modify — sama seperti `Navbar.css` (underline bar, modifier class, hover-soft, border-left mobile) |
| `docs/design.md` | Modify — update komentar Section 1 (baris ~39-40, saat ini bilang `--color-primary` dipakai utk "active state navigasi") jadi menjelaskan pola baru: tiap nav link punya accent tetap (ungu/biru/orange/kuning), dipakai sbg underline bar 3px, teks tetap heading-color (bukan accent) krn alasan kontras AA |

Tidak ada file baru, tidak ada rute baru, tidak ada dependency baru (`NavLink` sudah bagian dari `react-router-dom` yang sudah dipakai).

## 6. Di Luar Scope (Disengaja)

- Tidak menambahkan rute nyata untuk "Cari Organisasi" atau mengubah href "Cari Aktivitas"/"Cari Organisasi" di `Navbar` publik dari `#` — itu pekerjaan terpisah.
- Tidak mengubah warna teks link aktif (lihat §2, sengaja dihindari karena kendala AA).
- Tidak menambahkan animasi/transition warna pada hover non-aktif (tetap seperti sekarang).

## Testing / Verifikasi

Tidak ada test otomatis di frontend (konsisten dengan project ini). Verifikasi manual via `pnpm dev`:
- Logout, buka `/cara-kerja` → link "Cara Kerja" di `Navbar` dapat garis bawah orange + bold; "Tentang Kami" tidak. Buka `/tentang-kami` → sebaliknya.
- Login, buka `/dashboard` → "Cari Aktivitas" di `AppTopbar` dapat garis bawah ungu. Buka `/cara-kerja`/`/tentang-kami` dalam keadaan login → `AppTopbar` tetap muncul (sesuai spec sebelumnya) dan garis pindah ke link yang sesuai; "Cari Aktivitas" tidak lagi aktif begitu pindah dari `/dashboard`.
- Hover di link yang sedang aktif → tint background pakai warna `-soft` milik link itu sendiri, bukan ungu generik. Hover di link lain (tidak aktif) → tetap ungu generik seperti sekarang.
- Resize ke mobile, buka hamburger menu → item yang aktif dapat accent bar kiri sesuai warna yang sama dengan versi desktop.
