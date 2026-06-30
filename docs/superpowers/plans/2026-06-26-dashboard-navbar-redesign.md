# Dashboard Navbar Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the post-login topbar (`DashboardLayout`) and the volunteer search bar (`VolunteerSearchBar`) so they read as one continuous navbar block (logo, nav links with mega-menus, user/notification dropdowns, then a search row directly underneath), matching the Idealist.org-style reference the user provided.

**Architecture:** No new components, no new routes. `DashboardLayout` (shared layout, reused later for Organizer/Admin per `CLAUDE.md`) gains nav links, two click-toggle mega-menu dropdowns, a user dropdown, a notification dropdown, and a mobile hamburger — all local `useState`, no new context. `VolunteerSearchBar` is restructured to a single-row layout (static type label, keyword, location, category dropdown, submit button) and moves to the top of `FindActivityPage` (before the banner) so it sits flush under the topbar; the `Skill` dropdown and `oneDayOnly` toggle it used to render move down into the existing results-row in `FindActivityPage`. `HomePage` gains an `id="cara-kerja"` anchor + hash-scroll effect so the new "Cara Kerja" nav link has something real to navigate to.

**Tech Stack:** React 19, TypeScript (strict — `noUnusedLocals`/`noUnusedParameters` are **on**, confirmed in `frontend/tsconfig.app.json`), Vite 8, plain CSS (BEM, no shared `.btn`/`.card`/`.badge` classes), `react-icons/fi`, `react-router-dom` v7.

**Spec:** `docs/superpowers/specs/2026-06-26-dashboard-navbar-redesign-design.md`

## Global Constraints

- No hardcoded hex colors — every color goes through `var(--token-name)` from the existing design tokens (`docs/design.md`). No new tokens are introduced by this plan.
- No shared `.btn`/`.card`/`.badge` utility classes — every component keeps its own scoped BEM-style classes.
- `noUnusedLocals`/`noUnusedParameters` are on — never leave an unused prop/import after a task finishes; if a task removes the last usage of something (e.g. the `skills` prop on `VolunteerSearchBar`), remove the prop/import in the SAME task.
- No automated frontend test runner — verification per task is `pnpm build` (catches type errors) plus a manual Playwright check of the rendered behavior.
- Search bar filtering stays **live** (`onChange`-driven) — the new submit button/`<form>` wrapper must not change when filtering actually happens, it only prevents a full page reload on Enter/click.
- Items pointing at features that don't exist yet (Search Organizations, Resources, etc.) render as non-interactive elements (`<span>`/`<div>`, never `<a>`/`<button>` with a dead href) with a small "Segera Hadir" badge — never a silently-broken link.
- Mobile breakpoint is `768px`, matching the existing `frontend/src/components/Navbar.css` pattern this plan mirrors for the hamburger.
- **Branch:** this work happens on `feature/dashboard-navbar-redesign`, created from the current state before Task 1 (confirmed with the user — current branch `feature/event-detail-page` has unrelated uncommitted WIP that will carry over since it's uncommitted; that's expected and fine).
- **Commit policy:** if executed via `superpowers:subagent-driven-development`, each task's implementer commits locally at the end of the task. Never `git push`. If executed inline (no subagents), do not commit — leave the working tree for the user.

### Create the branch (do this once, before Task 1)

```bash
cd "d:\smester-4\tubes\ActiVIbe" && git checkout -b feature/dashboard-navbar-redesign
```

### Dev servers + test login (reused for every task's verification)

```bash
cd "d:\smester-4\tubes\ActiVIbe\backend" && npm run dev > /tmp/backend-dev.log 2>&1 &
timeout 30 bash -c 'until curl -s http://localhost:4000/auth/me -o /dev/null; do sleep 1; done'
cd "d:\smester-4\tubes\ActiVIbe\frontend" && pnpm dev > /tmp/vite-dev.log 2>&1 &
timeout 30 bash -c 'until curl -sf http://localhost:5173 >/dev/null; do sleep 1; done'
```

Test user already exists: `find-activity-test@example.com` / `Password123!` — log in, never re-register.

Playwright (Chromium) cached; import via:
```js
import('file:///C:/Users/rakha/AppData/Local/npm-cache/_npx/48b1ca104c3549f4/node_modules/playwright/index.mjs')
```
If gone, run `npx --no-install playwright --version` to confirm cached, find the real path with `find "$(npm config get cache)/_npx" -iname playwright -maxdepth 4`, substitute it.

Reusable login helper (paste into every Playwright script for Tasks 2-5; Task 1 doesn't need it, `/` is public):
```js
async function loginAndGotoDashboard(page) {
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
  await page.click('button.navbar__login')
  await page.fill('#email', 'find-activity-test@example.com')
  await page.fill('#password', 'Password123!')
  await page.click('button.auth-modal__submit')
  await page.waitForURL('**/dashboard', { timeout: 8000 })
}
```

---

### Task 1: `HomePage` — `#cara-kerja` anchor + hash-scroll

**Files:**
- Modify: `frontend/src/pages/HomePage.tsx:343-347` (add effect), `frontend/src/pages/HomePage.tsx:543-546` (add `id`)

**Interfaces:**
- Produces: a real, scrollable anchor target `#cara-kerja` on `/` — consumed by Task 2's "Cara Kerja" nav link (`to="/#cara-kerja"`).

- [ ] **Step 1: Add the `id` to the "How It Works" section**

In `frontend/src/pages/HomePage.tsx`, find:

```tsx
      {/* ═══ How It Works ═══ */}
      <section
        ref={howReveal.ref as React.RefObject<HTMLElement>}
        className={`how${howReveal.visible ? ' how--visible' : ''}`}
      >
```

Replace with:

```tsx
      {/* ═══ How It Works ═══ */}
      <section
        id="cara-kerja"
        ref={howReveal.ref as React.RefObject<HTMLElement>}
        className={`how${howReveal.visible ? ' how--visible' : ''}`}
      >
```

- [ ] **Step 2: Add the hash-scroll effect**

In the same file, find:

```tsx
  useEffect(() => {
    const t = setTimeout(() => setPageLoaded(true), 80)
    return () => clearTimeout(t)
  }, [])
```

Replace with:

```tsx
  useEffect(() => {
    const t = setTimeout(() => setPageLoaded(true), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (window.location.hash !== '#cara-kerja') return
    const t = setTimeout(() => {
      document.getElementById('cara-kerja')?.scrollIntoView({ behavior: 'smooth' })
    }, 120)
    return () => clearTimeout(t)
  }, [])
```

- [ ] **Step 3: Type-check**

Run: `cd "d:\smester-4\tubes\ActiVIbe\frontend" && pnpm build`
Expected: builds with no TypeScript errors.

- [ ] **Step 4: Verify the scroll behavior manually**

With the frontend dev server running (see Global Constraints), run via Playwright:

```js
await page.goto('http://localhost:5173/#cara-kerja', { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
const box = await page.locator('#cara-kerja .how__eyebrow').boundingBox()
console.log('eyebrow y position:', box?.y)
```

Expected: `box.y` is a small positive number (roughly `0`-`200`), confirming the "Cara Kerja ActiVibe" eyebrow is scrolled into view near the top of the viewport — not its natural unscrolled position far down the page.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/HomePage.tsx
git commit -m "Add #cara-kerja anchor and hash-scroll on HomePage"
```

---

### Task 2: `DashboardLayout` — nav links, user dropdown, notification dropdown

**Files:**
- Modify: `frontend/src/layouts/DashboardLayout.tsx` (full rewrite)
- Modify: `frontend/src/layouts/DashboardLayout.css` (full rewrite)

**Interfaces:**
- Produces: `type OpenMenu = 'user' | 'notif' | null` (extended by Task 3), `toggleMenu(menu: OpenMenu)`, `topbarRef` (a `useRef<HTMLElement>` on the `<header>`, used for outside-click detection — consumed structurally by Task 3/4, which add more dropdowns inside the same `<header>`).

- [ ] **Step 1: Replace `DashboardLayout.tsx`**

Replace the full contents of `frontend/src/layouts/DashboardLayout.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/svg/logo.svg'
import { FiChevronDown, FiLogOut, FiBell } from 'react-icons/fi'
import './DashboardLayout.css'

type OpenMenu = 'user' | 'notif' | null

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null)
  const topbarRef = useRef<HTMLElement>(null)

  const toggleMenu = (menu: OpenMenu) => {
    setOpenMenu((prev) => (prev === menu ? null : menu))
  }

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (topbarRef.current && !topbarRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null)
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const handleLogout = async () => {
    await logout()
    setOpenMenu(null)
    navigate('/')
  }

  return (
    <div className="dashboard-layout">
      <header className="dashboard-layout__topbar" ref={topbarRef}>
        <Link to="/dashboard" className="dashboard-layout__logo">
          <img src={logo} alt="ActiVibe" height="36" />
        </Link>

        <nav className="dashboard-layout__nav">
          <Link to="/#cara-kerja" className="dashboard-layout__link">Cara Kerja</Link>
          <Link to="/tentang-kami" className="dashboard-layout__link">Tentang Kami</Link>
        </nav>

        {user && (
          <div className="dashboard-layout__actions">
            <div className="dashboard-layout__menu-wrap">
              <button
                type="button"
                className="dashboard-layout__icon-btn"
                aria-label="Notifikasi"
                onClick={() => toggleMenu('notif')}
              >
                <FiBell />
              </button>
              {openMenu === 'notif' && (
                <div className="dashboard-layout__dropdown dashboard-layout__dropdown--notif">
                  <p className="dashboard-layout__notif-empty">Belum ada notifikasi</p>
                </div>
              )}
            </div>

            <div className="dashboard-layout__menu-wrap">
              <button
                type="button"
                className="dashboard-layout__user-trigger"
                onClick={() => toggleMenu('user')}
              >
                <span className="dashboard-layout__user-name">Hi, {user.name.split(' ')[0]}!</span>
                <FiChevronDown />
              </button>
              {openMenu === 'user' && (
                <div className="dashboard-layout__dropdown dashboard-layout__dropdown--user">
                  <button type="button" className="dashboard-layout__dropdown-item" onClick={handleLogout}>
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <Outlet />
    </div>
  )
}
```

- [ ] **Step 2: Replace `DashboardLayout.css`**

Replace the full contents of `frontend/src/layouts/DashboardLayout.css`:

```css
.dashboard-layout {
  min-height: 100vh;
  background: var(--color-bg-surface);
}

.dashboard-layout__topbar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 24px;
  height: 72px;
  padding: 0 48px;
  background: var(--color-bg-true);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08);
}

.dashboard-layout__logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;
}

.dashboard-layout__nav {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.dashboard-layout__link {
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

.dashboard-layout__link:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.dashboard-layout__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.dashboard-layout__menu-wrap {
  position: relative;
}

.dashboard-layout__icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  border-radius: 10px;
  color: var(--color-text-heading);
  font-size: 18px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.dashboard-layout__icon-btn:hover {
  background: var(--color-primary-soft);
}

.dashboard-layout__user-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: none;
  padding: 8px 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.dashboard-layout__user-trigger:hover {
  background: var(--color-primary-soft);
}

.dashboard-layout__user-name {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-heading);
}

.dashboard-layout__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 180px;
  background: var(--color-bg-true);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 8px;
  z-index: 110;
}

.dashboard-layout__dropdown--notif {
  min-width: 220px;
  padding: 16px;
}

.dashboard-layout__notif-empty {
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--text-body-sm);
  color: var(--color-text-muted);
  text-align: center;
}

.dashboard-layout__dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  border: none;
  background: none;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.dashboard-layout__dropdown-item:hover {
  background: var(--color-primary-soft);
}

@media (max-width: 768px) {
  .dashboard-layout__topbar {
    padding: 0 20px;
  }

  .dashboard-layout__nav {
    display: none;
  }
}
```

- [ ] **Step 3: Type-check**

Run: `cd "d:\smester-4\tubes\ActiVIbe\frontend" && pnpm build`
Expected: builds with no TypeScript errors.

- [ ] **Step 4: Verify manually**

```js
await loginAndGotoDashboard(page)

// notification dropdown
await page.click('.dashboard-layout__icon-btn')
console.log('notif visible:', await page.locator('.dashboard-layout__dropdown--notif').isVisible())
await page.click('.dashboard-layout__logo')
console.log('notif closed after outside click:', !(await page.locator('.dashboard-layout__dropdown--notif').isVisible()))

// user dropdown + logout
await page.click('.dashboard-layout__user-trigger')
console.log('user dropdown visible:', await page.locator('.dashboard-layout__dropdown--user').isVisible())
await page.click('.dashboard-layout__dropdown-item')
await page.waitForURL('http://localhost:5173/', { timeout: 5000 })
console.log('logged out, back on /:', page.url())
```

Expected: `notif visible: true`, `notif closed after outside click: true`, `user dropdown visible: true`, final URL is `http://localhost:5173/`.

Log back in (`loginAndGotoDashboard(page)`) and additionally check the plain links:

```js
await page.click('text=Tentang Kami')
await page.waitForURL('**/tentang-kami', { timeout: 5000 })
console.log('tentang kami nav ok:', page.url())
```

Expected: URL ends in `/tentang-kami`.

Log back in again and check "Cara Kerja" end-to-end (this is what Task 1's anchor was built for):

```js
await loginAndGotoDashboard(page)
await page.click('text=Cara Kerja')
await page.waitForURL('http://localhost:5173/#cara-kerja', { timeout: 5000 })
await page.waitForTimeout(500)
const box = await page.locator('#cara-kerja .how__eyebrow').boundingBox()
console.log('left /dashboard:', page.url())
console.log('scrolled to cara-kerja, eyebrow y:', box?.y)
```

Expected: `page.url()` is `http://localhost:5173/#cara-kerja`, and `box.y` is a small positive number (roughly `0`-`200`), same as Task 1's check.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/layouts/DashboardLayout.tsx frontend/src/layouts/DashboardLayout.css
git commit -m "Add nav links, user dropdown and notification dropdown to DashboardLayout topbar"
```

---

### Task 3: `DashboardLayout` — mega-menu dropdowns ("Cari Aktivitas" / "Cari Organisasi")

**Files:**
- Modify: `frontend/src/layouts/DashboardLayout.tsx` (extend `OpenMenu`, replace `<nav>` block)
- Modify: `frontend/src/layouts/DashboardLayout.css` (append mega-menu styles)

**Interfaces:**
- Consumes: `OpenMenu`, `toggleMenu`, `topbarRef` from Task 2.
- Produces: no new exports — extends `OpenMenu` to `'cari-aktivitas' | 'cari-organisasi' | 'user' | 'notif' | null`, consumed by Task 4's mobile menu (same disabled-item content, flattened).

- [ ] **Step 1: Add the new icon imports**

In `frontend/src/layouts/DashboardLayout.tsx`, find:

```tsx
import { FiChevronDown, FiLogOut, FiBell } from 'react-icons/fi'
```

Replace with:

```tsx
import { FiChevronDown, FiLogOut, FiBell, FiBookOpen, FiHeart, FiClipboard } from 'react-icons/fi'
```

- [ ] **Step 2: Extend the `OpenMenu` type**

Find:

```tsx
type OpenMenu = 'user' | 'notif' | null
```

Replace with:

```tsx
type OpenMenu = 'cari-aktivitas' | 'cari-organisasi' | 'user' | 'notif' | null
```

- [ ] **Step 3: Replace the `<nav>` block with the mega-menu version**

Find:

```tsx
        <nav className="dashboard-layout__nav">
          <Link to="/#cara-kerja" className="dashboard-layout__link">Cara Kerja</Link>
          <Link to="/tentang-kami" className="dashboard-layout__link">Tentang Kami</Link>
        </nav>
```

Replace with:

```tsx
        <nav className="dashboard-layout__nav">
          <div className="dashboard-layout__menu-wrap">
            <button
              type="button"
              className="dashboard-layout__link"
              onClick={() => toggleMenu('cari-aktivitas')}
            >
              Cari Aktivitas <FiChevronDown className="dashboard-layout__link-chevron" />
            </button>
            {openMenu === 'cari-aktivitas' && (
              <div className="dashboard-layout__mega">
                <div className="dashboard-layout__mega-col">
                  <p className="dashboard-layout__mega-eyebrow">AKTIVITAS</p>
                  <Link
                    to="/dashboard"
                    className="dashboard-layout__mega-item"
                    onClick={() => setOpenMenu(null)}
                  >
                    Semua Kegiatan Volunteer
                  </Link>
                  <div className="dashboard-layout__mega-item dashboard-layout__mega-item--disabled">
                    Kegiatan Match Tertinggi
                    <span className="dashboard-layout__mega-badge">Segera Hadir</span>
                  </div>
                </div>
                <div className="dashboard-layout__mega-col">
                  <p className="dashboard-layout__mega-eyebrow">RESOURCES</p>
                  <div className="dashboard-layout__mega-card dashboard-layout__mega-card--disabled">
                    <FiBookOpen className="dashboard-layout__mega-card-icon" />
                    <div className="dashboard-layout__mega-card-text">
                      <p className="dashboard-layout__mega-card-title">
                        Tips Jadi Volunteer
                        <span className="dashboard-layout__mega-badge">Segera Hadir</span>
                      </p>
                      <p className="dashboard-layout__mega-card-desc">
                        Tips dan inspirasi menemukan kegiatan volunteer yang cocok.
                      </p>
                    </div>
                  </div>
                  <div className="dashboard-layout__mega-card dashboard-layout__mega-card--disabled">
                    <FiHeart className="dashboard-layout__mega-card-icon" />
                    <div className="dashboard-layout__mega-card-text">
                      <p className="dashboard-layout__mega-card-title">
                        Cerita Dampak Komunitas
                        <span className="dashboard-layout__mega-badge">Segera Hadir</span>
                      </p>
                      <p className="dashboard-layout__mega-card-desc">
                        Kumpulan cerita dampak nyata dari komunitas volunteer ActiVibe.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="dashboard-layout__menu-wrap">
            <button
              type="button"
              className="dashboard-layout__link"
              onClick={() => toggleMenu('cari-organisasi')}
            >
              Cari Organisasi <FiChevronDown className="dashboard-layout__link-chevron" />
            </button>
            {openMenu === 'cari-organisasi' && (
              <div className="dashboard-layout__mega">
                <div className="dashboard-layout__mega-col">
                  <p className="dashboard-layout__mega-eyebrow">ORGANISASI</p>
                  <div className="dashboard-layout__mega-item dashboard-layout__mega-item--disabled">
                    Semua Organisasi
                    <span className="dashboard-layout__mega-badge">Segera Hadir</span>
                  </div>
                  <div className="dashboard-layout__mega-item dashboard-layout__mega-item--disabled">
                    Organisasi Terverifikasi
                    <span className="dashboard-layout__mega-badge">Segera Hadir</span>
                  </div>
                </div>
                <div className="dashboard-layout__mega-col">
                  <p className="dashboard-layout__mega-eyebrow">RESOURCES</p>
                  <div className="dashboard-layout__mega-card dashboard-layout__mega-card--disabled">
                    <FiClipboard className="dashboard-layout__mega-card-icon" />
                    <div className="dashboard-layout__mega-card-text">
                      <p className="dashboard-layout__mega-card-title">
                        Panduan untuk Organisasi
                        <span className="dashboard-layout__mega-badge">Segera Hadir</span>
                      </p>
                      <p className="dashboard-layout__mega-card-desc">
                        Panduan lengkap mendaftarkan organisasimu di ActiVibe.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link to="/#cara-kerja" className="dashboard-layout__link">Cara Kerja</Link>
          <Link to="/tentang-kami" className="dashboard-layout__link">Tentang Kami</Link>
        </nav>
```

- [ ] **Step 4: Append mega-menu styles to `DashboardLayout.css`**

Append to the end of `frontend/src/layouts/DashboardLayout.css` (before the existing `@media (max-width: 768px)` block at the bottom — CSS append order doesn't matter here since none of these selectors overlap, but keeping the media query last keeps the file's existing convention):

```css
.dashboard-layout__link-chevron {
  font-size: 14px;
}

.dashboard-layout__mega {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  display: flex;
  gap: 32px;
  min-width: 420px;
  background: var(--color-bg-true);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 20px 24px;
  z-index: 110;
}

.dashboard-layout__mega-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 180px;
}

.dashboard-layout__mega-eyebrow {
  margin: 0 0 8px;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

.dashboard-layout__mega-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-primary);
  text-decoration: none;
  padding: 8px 10px;
  border-radius: 8px;
  transition: background 0.15s ease;
}

.dashboard-layout__mega-item:hover {
  background: var(--color-primary-soft);
}

.dashboard-layout__mega-item--disabled {
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.dashboard-layout__mega-item--disabled:hover {
  background: none;
}

.dashboard-layout__mega-badge {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  background: var(--color-border-light);
  border-radius: 999px;
  padding: 2px 8px;
}

.dashboard-layout__mega-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  cursor: not-allowed;
}

.dashboard-layout__mega-card-icon {
  flex-shrink: 0;
  margin-top: 2px;
  font-size: 20px;
  color: var(--color-accent-yellow);
}

.dashboard-layout__mega-card-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dashboard-layout__mega-card-title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.dashboard-layout__mega-card-desc {
  margin: 0;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-muted);
}
```

- [ ] **Step 5: Type-check**

Run: `cd "d:\smester-4\tubes\ActiVIbe\frontend" && pnpm build`
Expected: builds with no TypeScript errors.

- [ ] **Step 6: Verify manually**

```js
await loginAndGotoDashboard(page)

await page.click('text=Cari Aktivitas')
console.log('aktivitas mega visible:', await page.locator('.dashboard-layout__mega').first().isVisible())
console.log('has Segera Hadir badge:', await page.locator('.dashboard-layout__mega-badge').first().isVisible())

await page.click('text=Cari Organisasi')
const megaCount = await page.locator('.dashboard-layout__mega').count()
console.log('only one mega open at a time:', megaCount === 1)

await page.click('.dashboard-layout__logo')
console.log('closed after outside click:', (await page.locator('.dashboard-layout__mega').count()) === 0)
```

Expected: `aktivitas mega visible: true`, `has Segera Hadir badge: true`, `only one mega open at a time: true`, `closed after outside click: true`.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/layouts/DashboardLayout.tsx frontend/src/layouts/DashboardLayout.css
git commit -m "Add mega-menu dropdowns for Cari Aktivitas and Cari Organisasi"
```

---

### Task 4: `DashboardLayout` — mobile hamburger menu

**Files:**
- Modify: `frontend/src/layouts/DashboardLayout.tsx` (add mobile state + markup)
- Modify: `frontend/src/layouts/DashboardLayout.css` (append hamburger/mobile-menu styles)

**Interfaces:**
- Consumes: same nav content as Task 3 (flattened, no 2-column layout).
- Produces: nothing consumed by later tasks — this is the last DashboardLayout task.

- [ ] **Step 1: Add mobile menu state and markup**

In `frontend/src/layouts/DashboardLayout.tsx`, find:

```tsx
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null)
  const topbarRef = useRef<HTMLElement>(null)
```

Replace with:

```tsx
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const topbarRef = useRef<HTMLElement>(null)
```

- [ ] **Step 2: Add the hamburger button, mobile menu and backdrop**

Find the end of the `<header>` element and the return statement's closing structure:

```tsx
          </div>
        )}
      </header>

      <Outlet />
    </div>
  )
}
```

Replace with:

```tsx
          </div>
        )}

        <button
          type="button"
          className={`dashboard-layout__hamburger${isMobileMenuOpen ? ' is-open' : ''}`}
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={isMobileMenuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        {isMobileMenuOpen && (
          <div className="dashboard-layout__mobile-menu">
            <Link
              to="/dashboard"
              className="dashboard-layout__mobile-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Semua Kegiatan Volunteer
            </Link>
            <div className="dashboard-layout__mobile-link dashboard-layout__mobile-link--disabled">
              Kegiatan Match Tertinggi
              <span className="dashboard-layout__mega-badge">Segera Hadir</span>
            </div>
            <div className="dashboard-layout__mobile-link dashboard-layout__mobile-link--disabled">
              Semua Organisasi
              <span className="dashboard-layout__mega-badge">Segera Hadir</span>
            </div>
            <div className="dashboard-layout__mobile-link dashboard-layout__mobile-link--disabled">
              Organisasi Terverifikasi
              <span className="dashboard-layout__mega-badge">Segera Hadir</span>
            </div>
            <Link
              to="/#cara-kerja"
              className="dashboard-layout__mobile-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Cara Kerja
            </Link>
            <Link
              to="/tentang-kami"
              className="dashboard-layout__mobile-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Tentang Kami
            </Link>
          </div>
        )}
      </header>

      {isMobileMenuOpen && (
        <div className="dashboard-layout__backdrop" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <Outlet />
    </div>
  )
}
```

- [ ] **Step 3: Give the topbar a `z-index` above the backdrop**

The backdrop added in Step 4 below uses `z-index: 99` (matching the existing `.navbar__backdrop` pattern in `frontend/src/components/Navbar.css`). That pattern also gives `.navbar` an explicit `z-index: 100` so the bar (and its hamburger button) stays clickable above its own backdrop — `.dashboard-layout__topbar` needs the same, otherwise the backdrop would render over the topbar once the mobile menu opens.

In `frontend/src/layouts/DashboardLayout.css`, find:

```css
.dashboard-layout__topbar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 24px;
  height: 72px;
  padding: 0 48px;
  background: var(--color-bg-true);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08);
}
```

Replace with:

```css
.dashboard-layout__topbar {
  position: relative;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 24px;
  height: 72px;
  padding: 0 48px;
  background: var(--color-bg-true);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08);
}
```

- [ ] **Step 4: Append hamburger/mobile-menu styles to `DashboardLayout.css`**

In `frontend/src/layouts/DashboardLayout.css`, find the existing bottom block:

```css
@media (max-width: 768px) {
  .dashboard-layout__topbar {
    padding: 0 20px;
  }

  .dashboard-layout__nav {
    display: none;
  }
}
```

Replace with:

```css
.dashboard-layout__hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 40px;
  height: 40px;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  flex-shrink: 0;
  transition: background 0.15s ease;
}

.dashboard-layout__hamburger:hover {
  background: var(--color-primary-soft);
}

.dashboard-layout__hamburger span {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--color-text-heading);
  border-radius: 2px;
  transition: transform 0.25s ease, opacity 0.25s ease, width 0.25s ease;
  transform-origin: center;
}

.dashboard-layout__hamburger.is-open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.dashboard-layout__hamburger.is-open span:nth-child(2) {
  opacity: 0;
  width: 0;
}
.dashboard-layout__hamburger.is-open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

.dashboard-layout__mobile-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: var(--color-bg-true);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  padding: 12px 16px 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.09);
  z-index: 105;
}

.dashboard-layout__mobile-link {
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

.dashboard-layout__mobile-link:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.dashboard-layout__mobile-link--disabled {
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.dashboard-layout__mobile-link--disabled:hover {
  background: none;
  color: var(--color-text-muted);
}

.dashboard-layout__backdrop {
  position: fixed;
  inset: 0;
  z-index: 99;
}

@media (max-width: 768px) {
  .dashboard-layout__topbar {
    padding: 0 20px;
  }

  .dashboard-layout__nav {
    display: none;
  }

  .dashboard-layout__hamburger {
    display: flex;
  }
}
```

- [ ] **Step 5: Type-check**

Run: `cd "d:\smester-4\tubes\ActiVIbe\frontend" && pnpm build`
Expected: builds with no TypeScript errors.

- [ ] **Step 6: Verify manually**

```js
await page.setViewportSize({ width: 375, height: 800 })
await loginAndGotoDashboard(page)

console.log('hamburger visible:', await page.locator('.dashboard-layout__hamburger').isVisible())
console.log('nav hidden:', !(await page.locator('.dashboard-layout__nav').isVisible()))

await page.click('.dashboard-layout__hamburger')
console.log('mobile menu visible:', await page.locator('.dashboard-layout__mobile-menu').isVisible())
console.log('has Segera Hadir item:', await page.locator('.dashboard-layout__mobile-link--disabled').first().isVisible())

await page.click('.dashboard-layout__backdrop')
console.log('mobile menu closed:', !(await page.locator('.dashboard-layout__mobile-menu').isVisible()))
```

Expected: all five logged booleans are `true`.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/layouts/DashboardLayout.tsx frontend/src/layouts/DashboardLayout.css
git commit -m "Add mobile hamburger menu to DashboardLayout topbar"
```

---

### Task 5: Search bar restructure + `FindActivityPage` reorder

**Files:**
- Modify: `frontend/src/components/VolunteerSearchBar.tsx` (full rewrite)
- Modify: `frontend/src/components/VolunteerSearchBar.css` (full rewrite)
- Modify: `frontend/src/pages/volunteer/FindActivityPage.tsx` (reorder + results-row additions)
- Modify: `frontend/src/pages/volunteer/FindActivityPage.css` (results-row additions)

**Interfaces:**
- Consumes: existing `EventFilters` type (unchanged shape — `keyword`, `location`, `category`, `skill`, `oneDayOnly`), existing `categories`/`skills` arrays already computed in `FindActivityPage.tsx` via `useMemo`.
- Produces: `VolunteerSearchBarProps` drops the `skills` prop (no longer rendered inside `VolunteerSearchBar`) — this task updates the only caller (`FindActivityPage.tsx`) in the same commit so the build never breaks.

- [ ] **Step 1: Rewrite `VolunteerSearchBar.tsx`**

Replace the full contents of `frontend/src/components/VolunteerSearchBar.tsx`:

```tsx
import { FiSearch, FiMapPin } from 'react-icons/fi'
import './VolunteerSearchBar.css'

export interface EventFilters {
  keyword: string
  location: string
  category: string
  skill: string
  oneDayOnly: boolean
}

interface VolunteerSearchBarProps {
  filters: EventFilters
  onChange: (filters: EventFilters) => void
  categories: string[]
}

export default function VolunteerSearchBar({ filters, onChange, categories }: VolunteerSearchBarProps) {
  const update = (patch: Partial<EventFilters>) => onChange({ ...filters, ...patch })

  return (
    <form className="volunteer-search-bar" onSubmit={(e) => e.preventDefault()}>
      <span className="volunteer-search-bar__type">Kegiatan Volunteer</span>

      <div className="volunteer-search-bar__input-group">
        <FiSearch aria-hidden="true" />
        <input
          type="text"
          placeholder="Cari kegiatan, skill, atau minat..."
          value={filters.keyword}
          onChange={(e) => update({ keyword: e.target.value })}
        />
      </div>

      <div className="volunteer-search-bar__input-group">
        <FiMapPin aria-hidden="true" />
        <input
          type="text"
          placeholder="Lokasi (cth. Yogyakarta)"
          value={filters.location}
          onChange={(e) => update({ location: e.target.value })}
        />
      </div>

      <select
        className="volunteer-search-bar__category"
        value={filters.category}
        onChange={(e) => update({ category: e.target.value })}
      >
        <option value="">Semua Kategori</option>
        {categories.map((category) => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>

      <button type="submit" className="volunteer-search-bar__submit">
        <FiSearch aria-hidden="true" /> Cari
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Rewrite `VolunteerSearchBar.css`**

Replace the full contents of `frontend/src/components/VolunteerSearchBar.css`:

```css
.volunteer-search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 48px;
  background: var(--color-bg-true);
  border-bottom: 1px solid var(--color-border-light);
  flex-wrap: wrap;
}

.volunteer-search-bar__type {
  font-family: var(--font-body);
  font-size: var(--text-body-sm);
  font-weight: 600;
  color: var(--color-text-heading);
  border: 1px solid var(--color-border-medium);
  border-radius: 10px;
  padding: 10px 16px;
  white-space: nowrap;
  flex-shrink: 0;
}

.volunteer-search-bar__input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 200px;
  border: 1px solid var(--color-border-medium);
  border-radius: 10px;
  padding: 10px 14px;
  color: var(--color-text-muted);
}

.volunteer-search-bar__input-group input {
  flex: 1;
  border: none;
  outline: none;
  font-family: var(--font-body);
  font-size: var(--text-body-sm);
  color: var(--color-text-body);
}

.volunteer-search-bar__category {
  font-family: var(--font-body);
  font-size: var(--text-body-sm);
  color: var(--color-text-body);
  border: 1px solid var(--color-border-medium);
  border-radius: 10px;
  padding: 10px 14px;
  background: var(--color-bg-true);
  flex-shrink: 0;
}

.volunteer-search-bar__submit {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-body);
  font-size: var(--text-body-sm);
  font-weight: 600;
  color: var(--color-text-on-accent);
  background: var(--color-primary);
  border: none;
  border-radius: 10px;
  padding: 10px 22px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s ease;
}

.volunteer-search-bar__submit:hover {
  background: var(--color-primary-hover);
}

@media (max-width: 600px) {
  .volunteer-search-bar {
    padding: 16px 20px;
  }

  .volunteer-search-bar__type,
  .volunteer-search-bar__input-group,
  .volunteer-search-bar__category,
  .volunteer-search-bar__submit {
    width: 100%;
  }
}
```

- [ ] **Step 3: Reorder `FindActivityPage.tsx` and move Skill/toggle into the results row**

In `frontend/src/pages/volunteer/FindActivityPage.tsx`, find:

```tsx
  return (
    <main className="find-activity-page">
      <section className="find-activity-page__banner">
        <img src={banner} alt="" className="find-activity-page__banner-img" aria-hidden="true" />
        <p className="find-activity-page__greeting">
          Halo, {user.name.split(' ')[0]}! Yuk temukan kegiatan volunteer yang cocok buatmu.
        </p>
      </section>

      <VolunteerSearchBar filters={filters} onChange={setFilters} categories={categories} skills={skills} />

      <div className="find-activity-page__results-row">
        <p className="find-activity-page__results-count">
          Kegiatan Volunteer | Total {sortedEvents.length} hasil
        </p>

        <select
          className="find-activity-page__sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
        >
          <option value="matchScore">Match Score Tertinggi</option>
          <option value="dateAsc">Tanggal Terdekat</option>
        </select>
      </div>
```

Replace with:

```tsx
  return (
    <main className="find-activity-page">
      <VolunteerSearchBar filters={filters} onChange={setFilters} categories={categories} />

      <section className="find-activity-page__banner">
        <img src={banner} alt="" className="find-activity-page__banner-img" aria-hidden="true" />
        <p className="find-activity-page__greeting">
          Halo, {user.name.split(' ')[0]}! Yuk temukan kegiatan volunteer yang cocok buatmu.
        </p>
      </section>

      <div className="find-activity-page__results-row">
        <p className="find-activity-page__results-count">
          Kegiatan Volunteer | Total {sortedEvents.length} hasil
        </p>

        <div className="find-activity-page__results-filters">
          <select
            className="find-activity-page__skill"
            value={filters.skill}
            onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
          >
            <option value="">Semua Skill</option>
            {skills.map((skill) => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>

          <label className="find-activity-page__toggle">
            <input
              type="checkbox"
              checked={filters.oneDayOnly}
              onChange={(e) => setFilters({ ...filters, oneDayOnly: e.target.checked })}
            />
            Hanya 1 hari
          </label>

          <select
            className="find-activity-page__sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="matchScore">Match Score Tertinggi</option>
            <option value="dateAsc">Tanggal Terdekat</option>
          </select>
        </div>
      </div>
```

- [ ] **Step 4: Style the new results-row controls**

In `frontend/src/pages/volunteer/FindActivityPage.css`, find:

```css
.find-activity-page__results-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 48px 0;
}

.find-activity-page__results-count {
  font-size: var(--text-body-md);
  font-weight: 600;
  color: var(--color-text-heading);
  margin: 0;
}

.find-activity-page__sort {
  font-family: var(--font-body);
  font-size: var(--text-body-sm);
  color: var(--color-text-body);
  border: 1px solid var(--color-border-medium);
  border-radius: 10px;
  padding: 8px 14px;
  background: var(--color-bg-true);
}
```

Replace with:

```css
.find-activity-page__results-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 24px 48px 0;
}

.find-activity-page__results-count {
  font-size: var(--text-body-md);
  font-weight: 600;
  color: var(--color-text-heading);
  margin: 0;
}

.find-activity-page__results-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.find-activity-page__sort,
.find-activity-page__skill {
  font-family: var(--font-body);
  font-size: var(--text-body-sm);
  color: var(--color-text-body);
  border: 1px solid var(--color-border-medium);
  border-radius: 10px;
  padding: 8px 14px;
  background: var(--color-bg-true);
}

.find-activity-page__toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-body);
  font-size: var(--text-body-sm);
  color: var(--color-text-body);
  white-space: nowrap;
}
```

- [ ] **Step 5: Type-check**

Run: `cd "d:\smester-4\tubes\ActiVIbe\frontend" && pnpm build`
Expected: builds with no TypeScript errors (confirms `skills` prop removal didn't leave a dangling reference, and `categories`/`skills` locals in `FindActivityPage.tsx` are both still used — no `noUnusedLocals` violation).

- [ ] **Step 6: Verify manually**

```js
await page.setViewportSize({ width: 1280, height: 900 })
await loginAndGotoDashboard(page)

// search bar sits directly under the topbar, before the banner
const order = await page.evaluate(() => {
  const main = document.querySelector('.find-activity-page')
  return Array.from(main.children).map((el) => el.className)
})
console.log('first child is search bar:', order[0].includes('volunteer-search-bar'))
console.log('second child is banner:', order[1].includes('find-activity-page__banner'))

// live filtering still works
await page.fill('.volunteer-search-bar__input-group input', 'Pantai')
await page.waitForTimeout(200)
console.log('result count text:', await page.locator('.find-activity-page__results-count').textContent())

// clicking "Cari" must not reload the page (which would reset React state back to EMPTY_FILTERS)
await page.click('.volunteer-search-bar__submit')
await page.waitForTimeout(200)
console.log('keyword survived submit click (no reload):', await page.locator('.volunteer-search-bar__input-group input').first().inputValue())

// relocated Skill dropdown still filters
await page.fill('.volunteer-search-bar__input-group input', '')
const skillOptions = await page.locator('.find-activity-page__skill option').allTextContents()
await page.selectOption('.find-activity-page__skill', { label: skillOptions[1] })
await page.waitForTimeout(200)
console.log('skill filter result count text:', await page.locator('.find-activity-page__results-count').textContent())

// relocated 1-day toggle still filters
await page.selectOption('.find-activity-page__skill', { label: skillOptions[0] })
await page.check('.find-activity-page__toggle input')
await page.waitForTimeout(200)
console.log('one-day toggle result count text:', await page.locator('.find-activity-page__results-count').textContent())
```

Expected: `first child is search bar: true`, `second child is banner: true`, the first result count reflects only "Pantai"-matching events (lower than the full total), `keyword survived submit click (no reload): 'Pantai'` (proving no full page reload happened), the skill-filtered count is lower than the full total, and the one-day-toggle count (after resetting skill to "Semua Skill") reflects only single-day events.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/VolunteerSearchBar.tsx frontend/src/components/VolunteerSearchBar.css frontend/src/pages/volunteer/FindActivityPage.tsx frontend/src/pages/volunteer/FindActivityPage.css
git commit -m "Restructure VolunteerSearchBar layout and move Skill/1-day filters to results row"
```
