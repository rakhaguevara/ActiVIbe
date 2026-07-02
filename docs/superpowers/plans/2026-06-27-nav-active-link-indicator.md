# Indikator Garis Warna untuk Nav Link Aktif Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tambah indikator "halaman aktif" di `Navbar` (publik) dan `AppTopbar` (dashboard + publik saat login) — tiap nav link punya warna accent tetap, ditunjukkan lewat underline bar 3px (desktop) atau border-left accent (mobile) saat user berada di halaman yang sesuai, menggantikan ketiadaan indikator aktif sama sekali sekarang.

**Architecture:** `NAV_LINKS` (Navbar) ditambah field `accent`; item dengan rute (`to`) di kedua komponen diganti dari `Link` ke `NavLink` (react-router) supaya class `is-active` otomatis terpasang berdasar URL. Item tanpa rute langsung (mega-menu trigger button "Cari Aktivitas"/"Cari Organisasi" di `AppTopbar`) pakai `useLocation()` manual. Semua styling lewat CSS modifier class (`--primary/--secondary/--orange/--yellow` × `.is-active`), warna 100% dari token yang sudah ada di `docs/design.md` — tidak ada hex baru.

**Tech Stack:** React 19 + TypeScript + Vite, `react-router-dom` (sudah terpasang, `NavLink`/`useLocation` adalah API yang sudah ada, bukan dependency baru), CSS murni (tidak ada CSS-in-JS di project ini).

## Global Constraints

- Semua warna wajib lewat `var(--token-name)` yang sudah ada di `docs/design.md` — dilarang hardcode hex baru (lihat `CLAUDE.md`).
- `--color-secondary` dan `--color-accent-yellow` **tidak boleh** dipakai sebagai warna teks di atas background putih (gagal WCAG AA, `docs/design.md` Section 1 poin 1). Karena itu teks link aktif TIDAK berubah warna di plan ini — hanya underline/border accent dan `font-weight`.
- Mapping warna final (tidak berubah dari spec): Cari Aktivitas = ungu (`--color-primary`), Cari Organisasi = biru (`--color-secondary`), Cara Kerja = orange (`--color-accent-orange`), Tentang Kami = kuning (`--color-accent-yellow`).
- Tidak ada test otomatis di frontend project ini — verifikasi tiap task lewat `pnpm dev` + cek manual di browser (konsisten dengan pola spec lain di `docs/superpowers/specs/`).
- Jangan `git commit`/`git push` kecuali dieksekusi lewat `superpowers:subagent-driven-development` (mekanisme commit-per-task internal) — di luar itu, biarkan working tree apa adanya untuk user commit sendiri (lihat `CLAUDE.md`).

---

### Task 1: `Navbar.tsx` + `Navbar.css` — Accent Mapping & Active Underline

**Files:**
- Modify: `frontend/src/components/Navbar.tsx`
- Modify: `frontend/src/components/Navbar.css`

**Interfaces:**
- Consumes: tidak ada (komponen self-contained, tidak depend ke task lain)
- Produces: pola CSS modifier (`.navbar__link--{accent}`, `.navbar__link--{accent}.is-active`) yang akan direplikasi 1:1 dengan nama class berbeda (`app-topbar__*`) di Task 2 — pastikan urutan warna per accent key (`primary`/`secondary`/`orange`/`yellow`) sama persis supaya konsisten.

- [ ] **Step 1: Update import dan `NAV_LINKS` di `Navbar.tsx`**

Ganti baris 1-12:

```tsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/svg/logo.svg'
import './Navbar.css'

const NAV_LINKS = [
  { label: 'Cari Aktivitas', href: '#' },
  { label: 'Cari Organisasi', href: '#' },
  { label: 'Cara Kerja', href: '#', to: '/cara-kerja' },
  { label: 'Tentang Kami', href: '#', to: '/tentang-kami' },
]
```

menjadi:

```tsx
import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/svg/logo.svg'
import './Navbar.css'

const NAV_LINKS = [
  { label: 'Cari Aktivitas', href: '#', accent: 'primary' },
  { label: 'Cari Organisasi', href: '#', accent: 'secondary' },
  { label: 'Cara Kerja', href: '#', to: '/cara-kerja', accent: 'orange' },
  { label: 'Tentang Kami', href: '#', to: '/tentang-kami', accent: 'yellow' },
]
```

- [ ] **Step 2: Update render nav desktop**

Ganti blok (saat ini sekitar baris 66-78):

```tsx
        <nav className="navbar__links">
          {NAV_LINKS.map(({ label, href, to }) => (
            to ? (
              <Link key={label} to={to} className="navbar__link">
                {label}
              </Link>
            ) : (
              <a key={label} href={href} className="navbar__link">
                {label}
              </a>
            )
          ))}
        </nav>
```

menjadi:

```tsx
        <nav className="navbar__links">
          {NAV_LINKS.map(({ label, href, to, accent }) => (
            to ? (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  ['navbar__link', `navbar__link--${accent}`, isActive ? 'is-active' : '']
                    .filter(Boolean)
                    .join(' ')
                }
              >
                {label}
              </NavLink>
            ) : (
              <a key={label} href={href} className={`navbar__link navbar__link--${accent}`}>
                {label}
              </a>
            )
          ))}
        </nav>
```

- [ ] **Step 3: Update render mobile menu**

Ganti blok (saat ini sekitar baris 112-133):

```tsx
            {NAV_LINKS.map(({ label, href, to }) => (
              to ? (
                <Link
                  key={label}
                  to={to}
                  className="navbar__mobile-link"
                  onClick={closeMenu}
                >
                  {label}
                </Link>
              ) : (
                <a
                  key={label}
                  href={href}
                  className="navbar__mobile-link"
                  onClick={closeMenu}
                >
                  {label}
                </a>
              )
            ))}
```

menjadi:

```tsx
            {NAV_LINKS.map(({ label, href, to, accent }) => (
              to ? (
                <NavLink
                  key={label}
                  to={to}
                  className={({ isActive }) =>
                    ['navbar__mobile-link', `navbar__mobile-link--${accent}`, isActive ? 'is-active' : '']
                      .filter(Boolean)
                      .join(' ')
                  }
                  onClick={closeMenu}
                >
                  {label}
                </NavLink>
              ) : (
                <a
                  key={label}
                  href={href}
                  className={`navbar__mobile-link navbar__mobile-link--${accent}`}
                  onClick={closeMenu}
                >
                  {label}
                </a>
              )
            ))}
```

- [ ] **Step 4: Tambah `position: relative` ke `.navbar__link` dan underline bar di `Navbar.css`**

Ganti:

```css
.navbar__link {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-heading);
  text-decoration: none;
  padding: 8px 14px;
  border-radius: 8px;
  white-space: nowrap;
  transition: background 0.15s ease, color 0.15s ease;
}

.navbar__link:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}
```

menjadi:

```css
.navbar__link {
  position: relative;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-heading);
  text-decoration: none;
  padding: 8px 14px;
  border-radius: 8px;
  white-space: nowrap;
  transition: background 0.15s ease, color 0.15s ease;
}

.navbar__link::after {
  content: '';
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 2px;
  height: 3px;
  border-radius: 999px;
  background: transparent;
  transition: background 0.15s ease;
}

.navbar__link:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.navbar__link.is-active {
  font-weight: 600;
}

.navbar__link--primary.is-active::after { background: var(--color-primary); }
.navbar__link--secondary.is-active::after { background: var(--color-secondary); }
.navbar__link--orange.is-active::after { background: var(--color-accent-orange); }
.navbar__link--yellow.is-active::after { background: var(--color-accent-yellow); }

.navbar__link--secondary.is-active:hover { background: var(--color-secondary-soft); }
.navbar__link--orange.is-active:hover { background: var(--color-accent-orange-soft); }
.navbar__link--yellow.is-active:hover { background: var(--color-accent-yellow-soft); }
```

- [ ] **Step 5: Tambah border-left accent di `.navbar__mobile-link`**

Ganti:

```css
.navbar__mobile-link {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-heading);
  text-decoration: none;
  padding: 12px 16px;
  border-radius: 10px;
  transition: background 0.15s ease, color 0.15s ease;
}

.navbar__mobile-link:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}
```

menjadi:

```css
.navbar__mobile-link {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-heading);
  text-decoration: none;
  padding: 12px 16px;
  border-radius: 10px;
  border-left: 4px solid transparent;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.navbar__mobile-link:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.navbar__mobile-link.is-active {
  font-weight: 600;
}

.navbar__mobile-link--primary.is-active { border-left-color: var(--color-primary); }
.navbar__mobile-link--secondary.is-active { border-left-color: var(--color-secondary); }
.navbar__mobile-link--orange.is-active { border-left-color: var(--color-accent-orange); }
.navbar__mobile-link--yellow.is-active { border-left-color: var(--color-accent-yellow); }

.navbar__mobile-link--secondary.is-active:hover { background: var(--color-secondary-soft); }
.navbar__mobile-link--orange.is-active:hover { background: var(--color-accent-orange-soft); }
.navbar__mobile-link--yellow.is-active:hover { background: var(--color-accent-yellow-soft); }
```

- [ ] **Step 6: Verifikasi manual**

Jalankan `pnpm dev` di `frontend/` (kalau belum jalan). Logout (atau buka di Incognito supaya pasti anonymous). Buka `/cara-kerja` → link "Cara Kerja" di navbar dapat garis bawah orange + jadi bold, "Tentang Kami" tidak. Buka `/tentang-kami` → sebaliknya, garis kuning di "Tentang Kami". Resize browser ke ≤768px, buka hamburger menu → item yang aktif (sesuai halaman saat ini) dapat border-left berwarna sesuai, bukan transparent.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/Navbar.tsx frontend/src/components/Navbar.css
git commit -m "feat(frontend): add colored active-link underline to public Navbar"
```

---

### Task 2: `AppTopbar.tsx` + `AppTopbar.css` — Accent Mapping & Active Underline

**Files:**
- Modify: `frontend/src/components/AppTopbar.tsx`
- Modify: `frontend/src/components/AppTopbar.css`

**Interfaces:**
- Consumes: tidak ada dari Task 1 secara langsung (file berbeda), tapi **harus pakai accent key & urutan warna yang identik** dengan Task 1 (`primary`=ungu, `secondary`=biru, `orange`=orange, `yellow`=kuning) supaya kedua navbar konsisten.
- Produces: tidak ada yang dikonsumsi task lain.

- [ ] **Step 1: Update import, tambah konstanta `ORGANISASI_ROUTES`, dan hitung status aktif**

Ganti baris 1-8:

```tsx
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/svg/logo.svg'
import { FiChevronDown, FiLogOut, FiBell, FiBookOpen, FiHeart, FiClipboard } from 'react-icons/fi'
import './AppTopbar.css'

type OpenMenu = 'cari-aktivitas' | 'cari-organisasi' | 'user' | 'notif' | null
```

menjadi:

```tsx
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/svg/logo.svg'
import { FiChevronDown, FiLogOut, FiBell, FiBookOpen, FiHeart, FiClipboard } from 'react-icons/fi'
import './AppTopbar.css'

type OpenMenu = 'cari-aktivitas' | 'cari-organisasi' | 'user' | 'notif' | null

// Belum ada rute nyata untuk "Cari Organisasi" — isi array ini begitu ada,
// jangan tulis ulang logic isOrganisasiActive di bawah.
const ORGANISASI_ROUTES: string[] = []
```

Lalu ganti (saat ini baris 15-17):

```tsx
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null)
```

menjadi:

```tsx
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isAktivitasActive = location.pathname.startsWith('/dashboard')
  const isOrganisasiActive = ORGANISASI_ROUTES.some((route) => location.pathname.startsWith(route))
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null)
```

- [ ] **Step 2: Pasang class accent + active di trigger "Cari Aktivitas"**

Ganti:

```tsx
            <button
              type="button"
              className="app-topbar__link"
              onClick={() => toggleMenu('cari-aktivitas')}
            >
              Cari Aktivitas <FiChevronDown className="app-topbar__link-chevron" />
            </button>
```

menjadi:

```tsx
            <button
              type="button"
              className={['app-topbar__link', 'app-topbar__link--primary', isAktivitasActive ? 'is-active' : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => toggleMenu('cari-aktivitas')}
            >
              Cari Aktivitas <FiChevronDown className="app-topbar__link-chevron" />
            </button>
```

- [ ] **Step 3: Pasang class accent + active di trigger "Cari Organisasi"**

Ganti:

```tsx
            <button
              type="button"
              className="app-topbar__link"
              onClick={() => toggleMenu('cari-organisasi')}
            >
              Cari Organisasi <FiChevronDown className="app-topbar__link-chevron" />
            </button>
```

menjadi:

```tsx
            <button
              type="button"
              className={['app-topbar__link', 'app-topbar__link--secondary', isOrganisasiActive ? 'is-active' : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => toggleMenu('cari-organisasi')}
            >
              Cari Organisasi <FiChevronDown className="app-topbar__link-chevron" />
            </button>
```

- [ ] **Step 4: Ganti "Cara Kerja"/"Tentang Kami" jadi `NavLink`**

Ganti:

```tsx
          <Link to="/cara-kerja" className="app-topbar__link">Cara Kerja</Link>
          <Link to="/tentang-kami" className="app-topbar__link">Tentang Kami</Link>
```

menjadi:

```tsx
          <NavLink
            to="/cara-kerja"
            className={({ isActive }) =>
              ['app-topbar__link', 'app-topbar__link--orange', isActive ? 'is-active' : '']
                .filter(Boolean)
                .join(' ')
            }
          >
            Cara Kerja
          </NavLink>
          <NavLink
            to="/tentang-kami"
            className={({ isActive }) =>
              ['app-topbar__link', 'app-topbar__link--yellow', isActive ? 'is-active' : '']
                .filter(Boolean)
                .join(' ')
            }
          >
            Tentang Kami
          </NavLink>
```

- [ ] **Step 5: Update mobile menu (flat list)**

Ganti:

```tsx
        {isMobileMenuOpen && (
          <div className="app-topbar__mobile-menu">
            <Link
              to="/dashboard"
              className="app-topbar__mobile-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Semua Kegiatan Volunteer
            </Link>
            <div className="app-topbar__mobile-link app-topbar__mobile-link--disabled">
              Kegiatan Match Tertinggi
              <span className="app-topbar__mega-badge">Segera Hadir</span>
            </div>
            <div className="app-topbar__mobile-link app-topbar__mobile-link--disabled">
              Semua Organisasi
              <span className="app-topbar__mega-badge">Segera Hadir</span>
            </div>
            <div className="app-topbar__mobile-link app-topbar__mobile-link--disabled">
              Organisasi Terverifikasi
              <span className="app-topbar__mega-badge">Segera Hadir</span>
            </div>
            <Link
              to="/cara-kerja"
              className="app-topbar__mobile-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Cara Kerja
            </Link>
            <Link
              to="/tentang-kami"
              className="app-topbar__mobile-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Tentang Kami
            </Link>
          </div>
        )}
```

menjadi:

```tsx
        {isMobileMenuOpen && (
          <div className="app-topbar__mobile-menu">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                ['app-topbar__mobile-link', 'app-topbar__mobile-link--primary', isActive ? 'is-active' : '']
                  .filter(Boolean)
                  .join(' ')
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Semua Kegiatan Volunteer
            </NavLink>
            <div className="app-topbar__mobile-link app-topbar__mobile-link--disabled">
              Kegiatan Match Tertinggi
              <span className="app-topbar__mega-badge">Segera Hadir</span>
            </div>
            <div className="app-topbar__mobile-link app-topbar__mobile-link--disabled">
              Semua Organisasi
              <span className="app-topbar__mega-badge">Segera Hadir</span>
            </div>
            <div className="app-topbar__mobile-link app-topbar__mobile-link--disabled">
              Organisasi Terverifikasi
              <span className="app-topbar__mega-badge">Segera Hadir</span>
            </div>
            <NavLink
              to="/cara-kerja"
              className={({ isActive }) =>
                ['app-topbar__mobile-link', 'app-topbar__mobile-link--orange', isActive ? 'is-active' : '']
                  .filter(Boolean)
                  .join(' ')
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Cara Kerja
            </NavLink>
            <NavLink
              to="/tentang-kami"
              className={({ isActive }) =>
                ['app-topbar__mobile-link', 'app-topbar__mobile-link--yellow', isActive ? 'is-active' : '']
                  .filter(Boolean)
                  .join(' ')
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Tentang Kami
            </NavLink>
          </div>
        )}
```

- [ ] **Step 6: Tambah `position: relative` + underline bar di `.app-topbar__link`**

Ganti:

```css
.app-topbar__link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-heading);
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 14px;
  border-radius: 8px;
  white-space: nowrap;
  transition: background 0.15s ease, color 0.15s ease;
}

.app-topbar__link:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}
```

menjadi:

```css
.app-topbar__link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-heading);
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 14px;
  border-radius: 8px;
  white-space: nowrap;
  transition: background 0.15s ease, color 0.15s ease;
}

.app-topbar__link::after {
  content: '';
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 2px;
  height: 3px;
  border-radius: 999px;
  background: transparent;
  transition: background 0.15s ease;
}

.app-topbar__link:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.app-topbar__link.is-active {
  font-weight: 600;
}

.app-topbar__link--primary.is-active::after { background: var(--color-primary); }
.app-topbar__link--secondary.is-active::after { background: var(--color-secondary); }
.app-topbar__link--orange.is-active::after { background: var(--color-accent-orange); }
.app-topbar__link--yellow.is-active::after { background: var(--color-accent-yellow); }

.app-topbar__link--secondary.is-active:hover { background: var(--color-secondary-soft); }
.app-topbar__link--orange.is-active:hover { background: var(--color-accent-orange-soft); }
.app-topbar__link--yellow.is-active:hover { background: var(--color-accent-yellow-soft); }
```

- [ ] **Step 7: Tambah border-left accent di `.app-topbar__mobile-link`**

Ganti:

```css
.app-topbar__mobile-link {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-heading);
  text-decoration: none;
  padding: 12px 10px;
  border-radius: 10px;
  transition: background 0.15s ease, color 0.15s ease;
}

.app-topbar__mobile-link:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}
```

menjadi:

```css
.app-topbar__mobile-link {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-heading);
  text-decoration: none;
  padding: 12px 10px;
  border-radius: 10px;
  border-left: 4px solid transparent;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.app-topbar__mobile-link:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.app-topbar__mobile-link.is-active {
  font-weight: 600;
}

.app-topbar__mobile-link--primary.is-active { border-left-color: var(--color-primary); }
.app-topbar__mobile-link--secondary.is-active { border-left-color: var(--color-secondary); }
.app-topbar__mobile-link--orange.is-active { border-left-color: var(--color-accent-orange); }
.app-topbar__mobile-link--yellow.is-active { border-left-color: var(--color-accent-yellow); }

.app-topbar__mobile-link--secondary.is-active:hover { background: var(--color-secondary-soft); }
.app-topbar__mobile-link--orange.is-active:hover { background: var(--color-accent-orange-soft); }
.app-topbar__mobile-link--yellow.is-active:hover { background: var(--color-accent-yellow-soft); }
```

Catatan: rule `.app-topbar__mobile-link--disabled` dan `.app-topbar__mobile-link--disabled:hover` yang sudah ada di file tidak diganti — item disabled tidak pernah dapat class accent/`is-active` dari Step 5, jadi otomatis tetap pudar.

- [ ] **Step 8: Verifikasi manual**

Jalankan `pnpm dev`. Login (akun apa pun yang sudah ada/dibuat lewat `/auth/register`). Buka `/dashboard` → trigger "Cari Aktivitas" dapat garis bawah ungu + bold (mega-menu tetap berfungsi normal saat diklik). Buka `/cara-kerja` dalam keadaan login → `AppTopbar` tetap muncul (bukan `Navbar` marketing), garis pindah ke "Cara Kerja" (orange), "Cari Aktivitas" tidak lagi aktif. Buka `/tentang-kami` → garis di "Tentang Kami" (kuning). Resize ke ≤768px, buka hamburger → "Semua Kegiatan Volunteer"/"Cara Kerja"/"Tentang Kami" dapat border-left accent sesuai halaman aktif, item "Segera Hadir" tetap pudar tanpa border accent.

- [ ] **Step 9: Commit**

```bash
git add frontend/src/components/AppTopbar.tsx frontend/src/components/AppTopbar.css
git commit -m "feat(frontend): add colored active-link underline to AppTopbar"
```

---

### Task 3: `docs/design.md` — Dokumentasikan Pola Active-State Nav Link

**Files:**
- Modify: `docs/design.md`

**Interfaces:**
- Consumes: mapping warna & alasan AA dari Task 1/2 (harus sudah selesai diimplementasikan supaya dokumentasi mencerminkan kode yang sebenarnya).
- Produces: tidak ada (dokumentasi murni).

- [ ] **Step 1: Update komentar Section 1 (BRAND PRIMARY)**

Ganti:

```css
  /* ============================================
     2. BRAND PRIMARY — Ungu
     Dipakai di: CTA button utama, logo "Vibe", link aktif,
     active state navigasi, tombol Subscribe
     ============================================ */
```

menjadi:

```css
  /* ============================================
     2. BRAND PRIMARY — Ungu
     Dipakai di: CTA button utama, logo "Vibe", link aktif,
     tombol Subscribe. Untuk active-state nav link (underline
     bar di Navbar/AppTopbar) lihat subsection "Active State
     Nav Link" di bawah — tiap link punya accent sendiri
     (ungu/biru/orange/kuning), bukan cuma ungu.
     ============================================ */
```

- [ ] **Step 2: Tambah subsection baru di akhir Section 1, sebelum "## 2. Typography"**

Cari teks ini (akhir dari "Aturan pakai warna"):

```markdown
4. Kalau ada dua warna brand dipakai berdampingan dan terasa "bertabrakan" (misal orange+kuning solid bersisian tanpa spacing/border), **laporkan dulu sebelum lanjut coding**, beri rekomendasi: kasih `--color-bg-true` sebagai pemisah, atau ubah satu jadi versi `-soft`.

---

## 2. Typography
```

Ganti menjadi:

```markdown
4. Kalau ada dua warna brand dipakai berdampingan dan terasa "bertabrakan" (misal orange+kuning solid bersisian tanpa spacing/border), **laporkan dulu sebelum lanjut coding**, beri rekomendasi: kasih `--color-bg-true` sebagai pemisah, atau ubah satu jadi versi `-soft`.

### Active State Nav Link (Navbar & AppTopbar)

Tiap nav link (`Cari Aktivitas`, `Cari Organisasi`, `Cara Kerja`, `Tentang Kami`) punya accent warna tetap, urutan sesuai urutan link di nav: ungu (`--color-primary`), biru (`--color-secondary`), orange (`--color-accent-orange`), kuning (`--color-accent-yellow`). Saat halaman yang sedang dibuka cocok dengan link itu, link dapat underline bar 3px (mobile: border-left 4px) berwarna accent-nya + `font-weight: 600`.

**Teks link aktif TIDAK ikut berubah warna** (tetap `--color-text-heading`) — karena poin 1 di atas melarang `--color-secondary`/`--color-accent-yellow` jadi warna teks, dan supaya treatment ke-4 link konsisten satu sama lain (bukan 2 link ganti warna teks, 2 tidak). Implementasi: lihat `Navbar.tsx`/`Navbar.css` dan `AppTopbar.tsx`/`AppTopbar.css`.

---

## 2. Typography
```

- [ ] **Step 3: Commit**

```bash
git add docs/design.md
git commit -m "docs: document per-link accent color pattern for active nav state"
```
