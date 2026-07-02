# Navbar Dashboard Persisten di Halaman Publik (Saat Login) — Design Spec

> Status: Approved 2026-06-27. Konteks: setelah login, topbar dashboard (logo, nav link, mega-menu "Cari Aktivitas"/"Cari Organisasi", dropdown notifikasi/user, hamburger mobile — dibangun di `DashboardLayout.tsx` lewat plan `2026-06-26-dashboard-navbar-redesign.md`) cuma muncul di `/dashboard`. User minta topbar yang SAMA tetap muncul ketika user yang sudah login berpindah ke halaman publik (`/`, `/tentang-kami`, `/cara-kerja`) — bukan kembali ke `Navbar` marketing biasa.

## Tujuan

Satu komponen topbar yang sama dipakai di `/dashboard` (selalu) dan di tiga halaman publik (hanya saat `user` login) — anonymous visitor di halaman publik tetap lihat `Navbar` marketing seperti sekarang (Masuk/Daftar). Tidak ada perubahan pada `VolunteerSearchBar`, `FindActivityPage`, atau isi mega-menu — murni soal komponen mana yang mount di layout mana.

## 1. Komponen Baru: `AppTopbar`

`frontend/src/components/AppTopbar.tsx` (+ `.css`) — hasil ekstraksi penuh dari isi `<header className="dashboard-layout__topbar">` yang saat ini inline di `DashboardLayout.tsx` (state `openMenu`/`isMobileMenuOpen`, `topbarRef`, outside-click/Escape handler, seluruh JSX nav link + mega-menu + dropdown notifikasi/user + hamburger + mobile menu + backdrop — lihat `DashboardLayout.tsx` baris 10-247 saat ini).

Semua class diganti prefix dari `dashboard-layout__*` → `app-topbar__*` (termasuk `dashboard-layout__mega*`, `dashboard-layout__dropdown*`, `dashboard-layout__mobile*`, `dashboard-layout__hamburger`, `dashboard-layout__backdrop`, dst — rename mekanis 1:1, tidak ada perubahan struktur/perilaku). Alasan rename: komponen ini sekarang dipakai di luar konteks "dashboard", prefix lama jadi menyesatkan.

**Props:**
```ts
interface AppTopbarProps {
  logoTo: string   // tujuan klik logo — berbeda per layout pemanggil
}
```

Satu-satunya pemakaian prop ini: `<Link to={logoTo} className="app-topbar__logo">`. Tidak ada prop lain — semua konten nav/mega-menu/dropdown tetap hardcoded di dalam komponen seperti sekarang (sama seperti `DashboardLayout` sebelumnya, tidak menambah konfigurasi baru di luar yang diminta).

`AppTopbar` me-return Fragment berisi 2 elemen bersebelahan — `<header className="app-topbar">` (isi utama) dan, kondisional saat `isMobileMenuOpen`, `<div className="app-topbar__backdrop">` — persis strukturnya sama dengan `<header>`+backdrop yang sekarang ada langsung di `DashboardLayout.tsx`. Karena React Fragment tidak menghasilkan node DOM pembungkus, kedua elemen ini tetap jadi direct children dari parent mana pun yang merender `<AppTopbar/>` (baik `.dashboard-layout` maupun `PublicLayout`), jadi selector seperti `.dashboard-layout > .app-topbar` di Section 4 tetap valid.

## 2. `DashboardLayout.tsx` — Setelah Refactor

```tsx
import { Outlet } from 'react-router-dom'
import AppTopbar from '../components/AppTopbar'
import './DashboardLayout.css'

export default function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <AppTopbar logoTo="/dashboard" />
      <Outlet />
    </div>
  )
}
```

Semua state/logic dropdown pindah ke `AppTopbar`, jadi `DashboardLayout.tsx` jadi murni wrapper shell (height:100vh flex-column dari plan sebelumnya, tidak berubah).

## 3. `PublicLayout.tsx` — Pilih Topbar Berdasar Status Login

```tsx
import { Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import AppTopbar from '../components/AppTopbar'

interface PublicLayoutProps {
  onLoginClick: () => void
  onSignupClick: () => void
}

export default function PublicLayout({ onLoginClick, onSignupClick }: PublicLayoutProps) {
  const { user } = useAuth()

  return (
    <>
      {user ? (
        <AppTopbar logoTo="/" />
      ) : (
        <Navbar onLoginClick={onLoginClick} onSignupClick={onSignupClick} />
      )}
      <Outlet />
    </>
  )
}
```

Selama `isLoading` (initial auth check belum selesai), `user` masih `null` per `AuthContext` yang sudah ada — jadi otomatis fallback ke `Navbar` dulu (tidak perlu state/logic tambahan untuk loading), baru berpindah ke `AppTopbar` begitu `user` terisi. Berlaku otomatis untuk ketiga route di bawah `PublicLayout` (`/`, `/tentang-kami`, `/cara-kerja`) tanpa perubahan di `AppRoutes.tsx`.

## 4. CSS — `position: sticky` Supaya Tidak Ikut Ter-scroll di Halaman Publik

Di `AppTopbar.css`, rule dasar (hasil rename dari `.dashboard-layout__topbar`):

```css
.app-topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  /* sisanya identik dengan .dashboard-layout__topbar sebelumnya */
}
```

`position: sticky` aman dipakai di kedua konteks:
- Di `/dashboard`: halaman ini sendiri tidak punya scroll (shell `height:100vh` dari plan sebelumnya) — sticky tidak punya scrolling ancestor untuk "menempel", jadi efeknya identik dengan `position: relative` yang dipakai sebelumnya (tidak ada perubahan visual/perilaku).
- Di halaman publik: halaman-halaman ini scroll normal (konten panjang) — sticky bikin topbar nempel di atas viewport persis seperti `Navbar` yang sekarang pakai `position: fixed`, tanpa perlu padding-compensation tambahan di konten bawahnya (beda dengan `fixed`, `sticky` tetap menyisakan ruang di layout flow).

`flex-shrink: 0` yang sebelumnya nempel di rule topbar (krusial supaya topbar tidak ikut mengecil di flex shell `/dashboard`) **pindah** ke `DashboardLayout.css`, di-scope ke konteks parent-nya saja:

```css
@media (min-width: 1025px) {
  .dashboard-layout > .app-topbar {
    flex-shrink: 0;
  }
}
```

Alasan pindah: `flex-shrink` cuma relevan kalau elemen ini jadi flex child (kasus `/dashboard`), bukan kalau dipasang di `PublicLayout` (`<>...</>` fragment, bukan flex container) — jadi ini concern punya parent, bukan punya `AppTopbar` sendiri.

## 5. Dokumentasi — `CLAUDE.md`

Update paragraf "Routing" di `CLAUDE.md` (bagian yang menjelaskan `PublicLayout`/`DashboardLayout`) — tambah 1-2 kalimat: topbar dashboard (`AppTopbar`) sekarang adalah komponen bersama, dipasang permanen di `DashboardLayout` dan dipasang kondisional di `PublicLayout` (gantian sama `Navbar` tergantung `user` dari `useAuth()`) — supaya sesi Claude berikutnya tidak mengira `PublicLayout` selalu pakai `Navbar` marketing.

## 6. File Plan

| File | Aksi |
|---|---|
| `frontend/src/components/AppTopbar.tsx` | Baru — hasil ekstraksi dari `DashboardLayout.tsx`, ditambah prop `logoTo` |
| `frontend/src/components/AppTopbar.css` | Baru — hasil ekstraksi dari `DashboardLayout.css` (rule `.dashboard-layout__*` yang berhubungan dengan topbar, mega-menu, dropdown, hamburger, mobile-menu, backdrop), class direname ke `app-topbar__*`, base rule jadi `position: sticky` |
| `frontend/src/layouts/DashboardLayout.tsx` | Modify total — jadi wrapper tipis, render `<AppTopbar logoTo="/dashboard" />` |
| `frontend/src/layouts/DashboardLayout.css` | Modify — hapus rule yang sudah dipindah ke `AppTopbar.css`, sisakan `.dashboard-layout`/`.dashboard-layout > main` shell rules + tambah `.dashboard-layout > .app-topbar { flex-shrink: 0; }` |
| `frontend/src/layouts/PublicLayout.tsx` | Modify — tambah `useAuth()`, render kondisional `AppTopbar`/`Navbar` |
| `CLAUDE.md` | Modify — update paragraf routing |

Tidak ada file yang dihapus — `Navbar.tsx`/`.css` tetap dipakai penuh untuk visitor anonim.

## 7. Di Luar Scope (Disengaja)

- Search bar (`VolunteerSearchBar`) tetap eksklusif di `/dashboard` — tidak ikut ke halaman publik.
- Tidak ada highlight "active link" di nav — baik `Navbar` maupun `AppTopbar` sebelumnya tidak punya fitur ini, tidak ditambah sekarang.
- Konten mega-menu, dropdown notifikasi, dan link nav tetap hardcoded sama seperti sekarang — tidak jadi configurable per halaman.

## Testing / Verifikasi

Tidak ada test otomatis di frontend (konsisten dengan project ini). Verifikasi manual via `pnpm dev`: login → buka `/` → topbar dashboard muncul (bukan `Navbar` marketing), scroll halaman panjang → topbar tetap nempel di atas; klik logo dari `/` → tetap di `/` (tidak pindah); buka `/tentang-kami` dan `/cara-kerja` dalam keadaan login → topbar dashboard juga muncul di kedua halaman; logout → ketiga halaman publik balik ke `Navbar` marketing (Masuk/Daftar); buka `/dashboard` → topbar tetap identik secara visual & fungsional seperti sebelum refactor (mega-menu, dropdown, hamburger, klik logo → tetap di `/dashboard`).
