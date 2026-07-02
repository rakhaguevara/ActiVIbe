# Shared App Topbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the dashboard-style topbar (logo, nav links, mega-menus, notification/user dropdowns, mobile hamburger) appear on the public marketing pages (`/`, `/tentang-kami`, `/cara-kerja`) too, whenever the visitor is logged in — instead of falling back to the plain marketing `Navbar`.

**Architecture:** Extract the topbar currently inline in `DashboardLayout.tsx`/`.css` into a new standalone, reusable component `AppTopbar` (renamed classes `dashboard-layout__*` → `app-topbar__*`, 1:1 structural copy, plus one new `logoTo` prop). `DashboardLayout` always renders it; `PublicLayout` renders it only when `useAuth()` reports a logged-in `user`, falling back to the existing `Navbar` otherwise. The component's root rule switches `position: relative` → `position: sticky; top: 0;` so it stays pinned while scrolling the (normally-scrolling) public pages, with zero behavior change on `/dashboard` (which has no outer page scroll to begin with).

**Tech Stack:** React 19, TypeScript (strict — `noUnusedLocals`/`noUnusedParameters` are **on**), Vite 8, plain CSS (BEM, no shared `.btn`/`.card`/`.badge` classes), `react-icons/fi`, `react-router-dom` v7.

**Spec:** `docs/superpowers/specs/2026-06-27-shared-app-topbar-design.md`

## Global Constraints

- No hardcoded hex colors — every color goes through `var(--token-name)` from the existing design tokens. This plan introduces zero new colors (pure extraction + one `position` value change).
- `frontend/tsconfig.app.json` has `noUnusedLocals: true` and `noUnusedParameters: true` — `DashboardLayout.tsx` loses several imports it no longer needs once its logic moves to `AppTopbar`; remove them in the same task, don't leave them dangling.
- No automated frontend test runner — verification per task is `pnpm build` (catches type errors) plus a manual Playwright check.
- The class rename (`dashboard-layout__*` → `app-topbar__*`) must be exactly 1:1 — same structure, same modifiers, same behavior. Any deviation is a bug, not an improvement opportunity for this plan.
- `AppTopbar` takes exactly one prop, `logoTo: string`. No other configuration is introduced — nav links, mega-menu content, and dropdown content stay hardcoded inside the component exactly as they are today.
- **Branch:** continue the established in-place `main`-branch workflow (per `CLAUDE.md`'s documented subagent-driven-development exception, and the convention already used by the two most recent plans in this repo) — no new feature branch.
- **Commit policy:** if executed via `superpowers:subagent-driven-development`, each task's implementer commits locally at the end of the task. Never `git push`. If executed inline (no subagents), do not commit — leave the working tree for the user.

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

Reusable login helper (paste into every Playwright script):
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

### Task 1: Extract `AppTopbar` and wire it into `DashboardLayout`

**Files:**
- Create: `frontend/src/components/AppTopbar.tsx`
- Create: `frontend/src/components/AppTopbar.css`
- Modify: `frontend/src/layouts/DashboardLayout.tsx` (full rewrite)
- Modify: `frontend/src/layouts/DashboardLayout.css` (full rewrite)

**Interfaces:**
- Produces: `export default function AppTopbar({ logoTo }: { logoTo: string })` — a self-contained component (its own `openMenu`/`isMobileMenuOpen` state, outside-click/Escape handling) with no dependency on its parent beyond the `logoTo` prop. Consumed by Task 2 (`PublicLayout`) with `logoTo="/"`.

- [ ] **Step 1: Create `AppTopbar.tsx`**

Create `frontend/src/components/AppTopbar.tsx`:

```tsx
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/svg/logo.svg'
import { FiChevronDown, FiLogOut, FiBell, FiBookOpen, FiHeart, FiClipboard } from 'react-icons/fi'
import './AppTopbar.css'

type OpenMenu = 'cari-aktivitas' | 'cari-organisasi' | 'user' | 'notif' | null

interface AppTopbarProps {
  logoTo: string
}

export default function AppTopbar({ logoTo }: AppTopbarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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
    <>
      <header className="app-topbar" ref={topbarRef}>
        <Link to={logoTo} className="app-topbar__logo">
          <img src={logo} alt="ActiVibe" height="36" />
        </Link>

        <nav className="app-topbar__nav">
          <div className="app-topbar__menu-wrap">
            <button
              type="button"
              className="app-topbar__link"
              onClick={() => toggleMenu('cari-aktivitas')}
            >
              Cari Aktivitas <FiChevronDown className="app-topbar__link-chevron" />
            </button>
            {openMenu === 'cari-aktivitas' && (
              <div className="app-topbar__mega">
                <div className="app-topbar__mega-col">
                  <p className="app-topbar__mega-eyebrow">AKTIVITAS</p>
                  <Link
                    to="/dashboard"
                    className="app-topbar__mega-item"
                    onClick={() => setOpenMenu(null)}
                  >
                    Semua Kegiatan Volunteer
                  </Link>
                  <div className="app-topbar__mega-item app-topbar__mega-item--disabled">
                    Kegiatan Match Tertinggi
                    <span className="app-topbar__mega-badge">Segera Hadir</span>
                  </div>
                </div>
                <div className="app-topbar__mega-col">
                  <p className="app-topbar__mega-eyebrow">RESOURCES</p>
                  <div className="app-topbar__mega-card app-topbar__mega-card--disabled">
                    <FiBookOpen className="app-topbar__mega-card-icon" />
                    <div className="app-topbar__mega-card-text">
                      <p className="app-topbar__mega-card-title">
                        Tips Jadi Volunteer
                        <span className="app-topbar__mega-badge">Segera Hadir</span>
                      </p>
                      <p className="app-topbar__mega-card-desc">
                        Tips dan inspirasi menemukan kegiatan volunteer yang cocok.
                      </p>
                    </div>
                  </div>
                  <div className="app-topbar__mega-card app-topbar__mega-card--disabled">
                    <FiHeart className="app-topbar__mega-card-icon" />
                    <div className="app-topbar__mega-card-text">
                      <p className="app-topbar__mega-card-title">
                        Cerita Dampak Komunitas
                        <span className="app-topbar__mega-badge">Segera Hadir</span>
                      </p>
                      <p className="app-topbar__mega-card-desc">
                        Kumpulan cerita dampak nyata dari komunitas volunteer ActiVibe.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="app-topbar__menu-wrap">
            <button
              type="button"
              className="app-topbar__link"
              onClick={() => toggleMenu('cari-organisasi')}
            >
              Cari Organisasi <FiChevronDown className="app-topbar__link-chevron" />
            </button>
            {openMenu === 'cari-organisasi' && (
              <div className="app-topbar__mega">
                <div className="app-topbar__mega-col">
                  <p className="app-topbar__mega-eyebrow">ORGANISASI</p>
                  <div className="app-topbar__mega-item app-topbar__mega-item--disabled">
                    Semua Organisasi
                    <span className="app-topbar__mega-badge">Segera Hadir</span>
                  </div>
                  <div className="app-topbar__mega-item app-topbar__mega-item--disabled">
                    Organisasi Terverifikasi
                    <span className="app-topbar__mega-badge">Segera Hadir</span>
                  </div>
                </div>
                <div className="app-topbar__mega-col">
                  <p className="app-topbar__mega-eyebrow">RESOURCES</p>
                  <div className="app-topbar__mega-card app-topbar__mega-card--disabled">
                    <FiClipboard className="app-topbar__mega-card-icon" />
                    <div className="app-topbar__mega-card-text">
                      <p className="app-topbar__mega-card-title">
                        Panduan untuk Organisasi
                        <span className="app-topbar__mega-badge">Segera Hadir</span>
                      </p>
                      <p className="app-topbar__mega-card-desc">
                        Panduan lengkap mendaftarkan organisasimu di ActiVibe.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link to="/cara-kerja" className="app-topbar__link">Cara Kerja</Link>
          <Link to="/tentang-kami" className="app-topbar__link">Tentang Kami</Link>
        </nav>

        {user && (
          <div className="app-topbar__actions">
            <div className="app-topbar__menu-wrap">
              <button
                type="button"
                className="app-topbar__icon-btn"
                aria-label="Notifikasi"
                onClick={() => toggleMenu('notif')}
              >
                <FiBell />
              </button>
              {openMenu === 'notif' && (
                <div className="app-topbar__dropdown app-topbar__dropdown--notif">
                  <p className="app-topbar__notif-empty">Belum ada notifikasi</p>
                </div>
              )}
            </div>

            <div className="app-topbar__menu-wrap">
              <button
                type="button"
                className="app-topbar__user-trigger"
                onClick={() => toggleMenu('user')}
              >
                <span className="app-topbar__user-name">Hi, {user.name.split(' ')[0]}!</span>
                <FiChevronDown />
              </button>
              {openMenu === 'user' && (
                <div className="app-topbar__dropdown app-topbar__dropdown--user">
                  <button type="button" className="app-topbar__dropdown-item" onClick={handleLogout}>
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          className={`app-topbar__hamburger${isMobileMenuOpen ? ' is-open' : ''}`}
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={isMobileMenuOpen}
        >
          <span />
          <span />
          <span />
        </button>

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
      </header>

      {isMobileMenuOpen && (
        <div className="app-topbar__backdrop" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </>
  )
}
```

- [ ] **Step 2: Create `AppTopbar.css`**

Create `frontend/src/components/AppTopbar.css`:

```css
.app-topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 24px;
  height: 72px;
  padding: 0 48px;
  background: var(--color-bg-true);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08);
}

.app-topbar__logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;
}

.app-topbar__nav {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

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

.app-topbar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.app-topbar__menu-wrap {
  position: relative;
}

.app-topbar__icon-btn {
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

.app-topbar__icon-btn:hover {
  background: var(--color-primary-soft);
}

.app-topbar__user-trigger {
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

.app-topbar__user-trigger:hover {
  background: var(--color-primary-soft);
}

.app-topbar__user-name {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-heading);
}

.app-topbar__dropdown {
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

.app-topbar__dropdown--notif {
  min-width: 220px;
  padding: 16px;
}

.app-topbar__notif-empty {
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--text-body-sm);
  color: var(--color-text-muted);
  text-align: center;
}

.app-topbar__dropdown-item {
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

.app-topbar__dropdown-item:hover {
  background: var(--color-primary-soft);
}

.app-topbar__link-chevron {
  font-size: 14px;
}

.app-topbar__mega {
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

.app-topbar__mega-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 180px;
}

.app-topbar__mega-eyebrow {
  margin: 0 0 8px;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

.app-topbar__mega-item {
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

.app-topbar__mega-item:hover {
  background: var(--color-primary-soft);
}

.app-topbar__mega-item--disabled {
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.app-topbar__mega-item--disabled:hover {
  background: none;
}

.app-topbar__mega-badge {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  background: var(--color-border-light);
  border-radius: 999px;
  padding: 2px 8px;
}

.app-topbar__mega-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  cursor: not-allowed;
}

.app-topbar__mega-card-icon {
  flex-shrink: 0;
  margin-top: 2px;
  font-size: 20px;
  color: var(--color-accent-yellow);
}

.app-topbar__mega-card-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.app-topbar__mega-card-title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.app-topbar__mega-card-desc {
  margin: 0;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-muted);
}

.app-topbar__hamburger {
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

.app-topbar__hamburger:hover {
  background: var(--color-primary-soft);
}

.app-topbar__hamburger span {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--color-text-heading);
  border-radius: 2px;
  transition: transform 0.25s ease, opacity 0.25s ease, width 0.25s ease;
  transform-origin: center;
}

.app-topbar__hamburger.is-open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.app-topbar__hamburger.is-open span:nth-child(2) {
  opacity: 0;
  width: 0;
}
.app-topbar__hamburger.is-open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

.app-topbar__mobile-menu {
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

.app-topbar__mobile-link--disabled {
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.app-topbar__mobile-link--disabled:hover {
  background: none;
  color: var(--color-text-muted);
}

.app-topbar__backdrop {
  position: fixed;
  inset: 0;
  z-index: 99;
}

@media (max-width: 768px) {
  .app-topbar {
    padding: 0 20px;
  }

  .app-topbar__nav {
    display: none;
  }

  .app-topbar__hamburger {
    display: flex;
  }
}
```

- [ ] **Step 3: Rewrite `DashboardLayout.tsx` to use `AppTopbar`**

Replace the full contents of `frontend/src/layouts/DashboardLayout.tsx`:

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

- [ ] **Step 4: Rewrite `DashboardLayout.css` down to just the shell rules**

Replace the full contents of `frontend/src/layouts/DashboardLayout.css`:

```css
.dashboard-layout {
  min-height: 100vh;
  background: var(--color-bg-surface);
}

@media (min-width: 1025px) {
  .dashboard-layout {
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .dashboard-layout > .app-topbar {
    flex-shrink: 0;
  }

  .dashboard-layout > main {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
}
```

- [ ] **Step 5: Type-check**

Run: `cd "d:\smester-4\tubes\ActiVIbe\frontend" && pnpm build`
Expected: builds with no TypeScript errors (confirms `DashboardLayout.tsx` has no leftover unused imports now that its logic moved to `AppTopbar`).

- [ ] **Step 6: Verify `/dashboard` is visually and functionally unchanged**

```js
async function loginAndGotoDashboard(page) {
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
  await page.click('button.navbar__login')
  await page.fill('#email', 'find-activity-test@example.com')
  await page.fill('#password', 'Password123!')
  await page.click('button.auth-modal__submit')
  await page.waitForURL('**/dashboard', { timeout: 8000 })
}

await loginAndGotoDashboard(page)

// mega-menu still works under the new class names
await page.click('text=Cari Aktivitas')
console.log('mega visible:', await page.locator('.app-topbar__mega').first().isVisible())

// logo click closes the mega-menu and keeps us on /dashboard (logoTo="/dashboard")
await page.click('.app-topbar__logo')
console.log('mega closed after logo click:', (await page.locator('.app-topbar__mega').count()) === 0)
console.log('logo kept us on:', page.url())

// user dropdown + logout still work (Logout always navigates to "/", per handleLogout)
await page.click('.app-topbar__user-trigger')
console.log('user dropdown visible:', await page.locator('.app-topbar__dropdown--user').isVisible())
await page.click('.app-topbar__dropdown-item')
await page.waitForURL('http://localhost:5173/', { timeout: 5000 })
console.log('logout redirected to:', page.url())
```

Expected: `mega visible: true`, `mega closed after logo click: true`, `logo kept us on: http://localhost:5173/dashboard` (confirms `logoTo="/dashboard"` works), `user dropdown visible: true`, `logout redirected to: http://localhost:5173/`.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/AppTopbar.tsx frontend/src/components/AppTopbar.css frontend/src/layouts/DashboardLayout.tsx frontend/src/layouts/DashboardLayout.css
git commit -m "Extract AppTopbar from DashboardLayout for reuse"
```

---

### Task 2: Render `AppTopbar` in `PublicLayout` when logged in

**Files:**
- Modify: `frontend/src/layouts/PublicLayout.tsx` (full rewrite)

**Interfaces:**
- Consumes: `AppTopbar` from Task 1 (`{ logoTo: string }` prop), `useAuth()` from `frontend/src/contexts/AuthContext.tsx` (already existing, returns `{ user, isLoading, ... }`).

- [ ] **Step 1: Rewrite `PublicLayout.tsx`**

Replace the full contents of `frontend/src/layouts/PublicLayout.tsx`:

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

`user` is `null` both before login and while the initial `/auth/me` check is still in flight (per the existing `AuthProvider` in `AuthContext.tsx`), so this naturally falls back to `Navbar` during loading with no extra `isLoading` branch needed — it only switches to `AppTopbar` once a logged-in user is confirmed.

- [ ] **Step 2: Type-check**

Run: `cd "d:\smester-4\tubes\ActiVIbe\frontend" && pnpm build`
Expected: builds with no TypeScript errors.

- [ ] **Step 3: Verify the topbar swap on all 3 public routes**

```js
async function loginAndGotoDashboard(page) {
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
  await page.click('button.navbar__login')
  await page.fill('#email', 'find-activity-test@example.com')
  await page.fill('#password', 'Password123!')
  await page.click('button.auth-modal__submit')
  await page.waitForURL('**/dashboard', { timeout: 8000 })
}

await loginAndGotoDashboard(page)

for (const path of ['/', '/tentang-kami', '/cara-kerja']) {
  await page.goto(`http://localhost:5173${path}`, { waitUntil: 'networkidle' })
  const hasAppTopbar = await page.locator('.app-topbar').isVisible()
  const hasMarketingNavbar = await page.locator('.navbar').count()
  console.log(`${path}: app-topbar visible=${hasAppTopbar}, marketing navbar count=${hasMarketingNavbar}`)
}

// logo on a public page goes to "/", not "/dashboard"
await page.goto('http://localhost:5173/tentang-kami', { waitUntil: 'networkidle' })
await page.click('.app-topbar__logo')
console.log('logo from /tentang-kami went to:', page.url())

// sticky while scrolling a long public page
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await page.mouse.wheel(0, 800)
await page.waitForTimeout(300)
const topbarTop = await page.evaluate(() => document.querySelector('.app-topbar').getBoundingClientRect().top)
console.log('app-topbar top after scrolling 800px on /:', topbarTop)
```

Expected: for each of the 3 paths, `app-topbar visible=true` and `marketing navbar count=0`; logo click from `/tentang-kami` lands on `http://localhost:5173/`; `topbarTop` is `0` after scrolling (confirms `position: sticky` kept it pinned).

- [ ] **Step 4: Verify the fallback when logged out**

```js
// logout via the dropdown, then re-check the 3 public routes
await page.click('.app-topbar__user-trigger')
await page.click('.app-topbar__dropdown-item')
await page.waitForURL('http://localhost:5173/', { timeout: 5000 })

for (const path of ['/', '/tentang-kami', '/cara-kerja']) {
  await page.goto(`http://localhost:5173${path}`, { waitUntil: 'networkidle' })
  const hasAppTopbar = await page.locator('.app-topbar').count()
  const hasMarketingNavbar = await page.locator('.navbar').isVisible()
  console.log(`${path} (logged out): app-topbar count=${hasAppTopbar}, marketing navbar visible=${hasMarketingNavbar}`)
}
```

Expected: for each path, `app-topbar count=0` and `marketing navbar visible=true`.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/layouts/PublicLayout.tsx
git commit -m "Render AppTopbar in PublicLayout when the user is logged in"
```

---

### Task 3: Update `CLAUDE.md` routing documentation

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:** None — documentation only.

- [ ] **Step 1: Replace the stale Routing paragraph**

In `CLAUDE.md`, find (note this paragraph predates `/cara-kerja` and the navbar redesign, so it's stale in more than one way):

```
**Routing:** `frontend/` pakai `react-router-dom` (dikonfigurasi di `frontend/src/routes/AppRoutes.tsx`, dibungkus `<BrowserRouter>` di `App.tsx`). Sejak halaman Find Activity (`/dashboard`), routing terbagi 2 grup nested route lewat layout wrapper (`<Outlet />`): `PublicLayout` (render `Navbar` marketing, dipakai `/` dan `/tentang-kami`) dan `DashboardLayout` (header berbeda — logo + nama user + Logout, tanpa link marketing — dipakai `/dashboard`, dan jadi pola yang akan dipakai ulang untuk dashboard Organizer/Admin nanti). `AuthModal` tetap di `App.tsx` di luar kedua layout (state modal lintas-halaman). Kalau menambah halaman publik baru, daftarkan di bawah `PublicLayout` di `AppRoutes.tsx`; kalau halaman dashboard baru, di bawah `DashboardLayout` (atau layout dashboard role lain kalau sudah dibuat).
```

Replace with:

```
**Routing:** `frontend/` pakai `react-router-dom` (dikonfigurasi di `frontend/src/routes/AppRoutes.tsx`, dibungkus `<BrowserRouter>` di `App.tsx`). Routing terbagi 2 grup nested route lewat layout wrapper (`<Outlet />`): `PublicLayout` (dipakai `/`, `/tentang-kami`, `/cara-kerja`) dan `DashboardLayout` (dipakai `/dashboard`, dan jadi pola yang akan dipakai ulang untuk dashboard Organizer/Admin nanti). Topbar-nya sendiri ada di komponen bersama `AppTopbar` (`frontend/src/components/AppTopbar.tsx`) — logo, nav link, mega-menu "Cari Aktivitas"/"Cari Organisasi", dropdown notifikasi & user, hamburger mobile. `DashboardLayout` selalu render `AppTopbar`; `PublicLayout` render `AppTopbar` juga TAPI HANYA kalau `user` (dari `useAuth()`) sudah login — kalau belum login (atau masih `isLoading`), `PublicLayout` render `Navbar` marketing biasa (Masuk/Daftar) sebagai gantinya. Jadi begitu user login, navbar-nya konsisten "dashboard-style" di halaman publik manapun, bukan cuma di `/dashboard`. `AuthModal` tetap di `App.tsx` di luar kedua layout (state modal lintas-halaman). Kalau menambah halaman publik baru, daftarkan di bawah `PublicLayout` di `AppRoutes.tsx`; kalau halaman dashboard baru, di bawah `DashboardLayout` (atau layout dashboard role lain kalau sudah dibuat).
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "Update CLAUDE.md routing docs for shared AppTopbar"
```
