# Find Activity Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/dashboard` — the volunteer "find activity" page that replaces the 404 users currently hit after login — with a 3-column list/detail/apply-form layout over dummy `Event` data, plus a header/search-bar that's separate from the marketing `Navbar`.

**Architecture:** `AppRoutes.tsx` splits into two nested-route groups: `PublicLayout` (existing `Navbar`, for `/`, `/tentang-kami`, `*`) and `DashboardLayout` (new minimal topbar — logo + user name + logout — for `/dashboard`). `FindActivityPage` owns all page state (selected event, sort, filters) over a static `mockEvents` array; `VolunteerSearchBar` (the screenshot-2-style search/filter bar) is page content rendered inside `FindActivityPage`, not part of the reusable `DashboardLayout` chrome — keeping `DashboardLayout` generic for future Organizer/Admin dashboards per the spec's own stated intent.

**Tech Stack:** React 19, TypeScript (strict — `noUnusedLocals`/`noUnusedParameters` are **on**), Vite 8, `react-router-dom` ^7.18 (nested routes via `<Outlet />`), plain CSS (no modules/Tailwind), `react-icons` for icons.

**Spec:** `docs/superpowers/specs/2026-06-24-find-activity-page-design.md`

## Global Constraints

- No hardcoded hex colors — every color goes through a `var(--token-name)` from `docs/design.md` §1 (already loaded globally via `frontend/src/index.css`).
- No shared `.btn`/`.card`/`.badge` utility classes exist in this codebase — `docs/design.md` §6 documents the *recipe*, but every real component defines its own scoped BEM-style classes (e.g. `.navbar__link`, `.auth-modal__submit`) using the tokens directly. Follow that pattern: `.event-card__...`, `.event-detail-panel__...`, etc. — never write a bare `.card` or `.btn--primary` selector expecting it to already exist.
- `tsconfig.app.json` has `"noUnusedLocals": true` and `"noUnusedParameters": true` — an unused prop/import/variable fails `pnpm build`. Never add a prop/param before the same task also uses it.
- This project has **no automated test runner** for the frontend. Verification is `pnpm build` (type-check + bundle) for every task, plus a Playwright check for any task that changes rendered UI.
- Reuse existing assets only (`frontend/src/assets/svg/background-1.svg` for the banner — explicitly decided over adding a new illustration). Do not add new SVGs/images without asking the user first.
- **Commit policy:** if this plan is executed via `superpowers:subagent-driven-development`, each task's implementer subagent commits its own work locally at the end of the task (needed for the reviewer's diff). `git push` is never allowed. If executed inline in the main session (no subagents), **do not commit** — leave the working tree for the user, per `CLAUDE.md`'s "Git Commit & Push" section.
- Current branch is `feature/find-activity-page` (already created from `main`). Stay on this branch for the whole plan.

### Test user (used by every Playwright check below)

Backend (`http://localhost:4000`) and frontend (`http://localhost:5173`) dev servers must both be running. Start them once per session:

```bash
cd "d:\smester-4\tubes\ActiVIbe\backend" && npm run dev > /tmp/backend-dev.log 2>&1 &
echo $! > /tmp/backend-dev.pid
timeout 30 bash -c 'until curl -s http://localhost:4000/auth/me -o /dev/null; do sleep 1; done'

cd "d:\smester-4\tubes\ActiVIbe\frontend" && pnpm dev > /tmp/vite-dev.log 2>&1 &
echo $! > /tmp/vite-dev.pid
timeout 30 bash -c 'until curl -sf http://localhost:5173 >/dev/null; do sleep 1; done'
```

Task 1's Step 6 registers a fixed test user via direct API call:

- Email: `find-activity-test@example.com`
- Password: `Password123!`

Every later task logs in with these same credentials (registration already happened in Task 1 — logging in again is idempotent, re-registering is not, since duplicate email returns 409). Playwright (Chromium) is already cached on this machine — scripts import it via:

```js
import('file:///C:/Users/rakha/AppData/Local/npm-cache/_npx/48b1ca104c3549f4/node_modules/playwright/index.mjs')
```

If that exact path is gone in a fresh environment, run `npx --no-install playwright --version` to confirm it's cached, find the real path with `find "$(npm config get cache)/_npx" -iname playwright -maxdepth 4`, and substitute it.

Reusable login helper (used inside every Playwright script below — paste it in, don't just reference it):

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

### Task 1: Routing restructure — `PublicLayout` / `DashboardLayout`, fix the post-login 404

**Files:**
- Create: `frontend/src/layouts/PublicLayout.tsx`
- Create: `frontend/src/layouts/DashboardLayout.tsx`
- Create: `frontend/src/layouts/DashboardLayout.css`
- Create: `frontend/src/pages/volunteer/FindActivityPage.tsx`
- Create: `frontend/src/pages/volunteer/FindActivityPage.css`
- Modify: `frontend/src/routes/AppRoutes.tsx`
- Modify: `frontend/src/App.tsx`

**Interfaces:**
- Produces: `PublicLayout({ onLoginClick, onSignupClick }: { onLoginClick: () => void; onSignupClick: () => void })`, default export.
- Produces: `DashboardLayout()` (no props — reads `user`/`logout` from `useAuth()` itself), default export.
- Produces: `FindActivityPage()` (no props), default export — minimal placeholder this task, built out in Tasks 3–6.

- [ ] **Step 1: Create `PublicLayout`**

Create `frontend/src/layouts/PublicLayout.tsx`:

```tsx
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

interface PublicLayoutProps {
  onLoginClick: () => void
  onSignupClick: () => void
}

export default function PublicLayout({ onLoginClick, onSignupClick }: PublicLayoutProps) {
  return (
    <>
      <Navbar onLoginClick={onLoginClick} onSignupClick={onSignupClick} />
      <Outlet />
    </>
  )
}
```

- [ ] **Step 2: Create `DashboardLayout`**

Create `frontend/src/layouts/DashboardLayout.css`:

```css
.dashboard-layout {
  min-height: 100vh;
  background: var(--color-bg-surface);
}

.dashboard-layout__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  padding: 0 48px;
  background: var(--color-bg-true);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08);
}

.dashboard-layout__logo {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.dashboard-layout__user {
  display: flex;
  align-items: center;
  gap: 16px;
}

.dashboard-layout__user-name {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-heading);
}

.dashboard-layout__logout {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-primary-soft);
  border: none;
  border-radius: 10px;
  padding: 8px 18px;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.dashboard-layout__logout:hover {
  opacity: 0.85;
}

@media (max-width: 768px) {
  .dashboard-layout__topbar {
    padding: 0 20px;
  }

  .dashboard-layout__user-name {
    display: none;
  }
}
```

Create `frontend/src/layouts/DashboardLayout.tsx`:

```tsx
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/svg/logo.svg'
import './DashboardLayout.css'

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="dashboard-layout">
      <header className="dashboard-layout__topbar">
        <Link to="/dashboard" className="dashboard-layout__logo">
          <img src={logo} alt="ActiVibe" height="36" />
        </Link>

        {user && (
          <div className="dashboard-layout__user">
            <span className="dashboard-layout__user-name">{user.name.split(' ')[0]}</span>
            <button type="button" className="dashboard-layout__logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </header>

      <Outlet />
    </div>
  )
}
```

- [ ] **Step 3: Create the minimal `FindActivityPage` placeholder**

Create `frontend/src/pages/volunteer/FindActivityPage.css`:

```css
.find-activity-page {
  padding: 48px;
}

.find-activity-page__placeholder {
  font-size: 18px;
  color: var(--color-text-body);
}
```

Create `frontend/src/pages/volunteer/FindActivityPage.tsx`:

```tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './FindActivityPage.css'

export default function FindActivityPage() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/', { replace: true })
    }
  }, [isLoading, user, navigate])

  if (isLoading || !user) {
    return null
  }

  return (
    <main className="find-activity-page">
      <p className="find-activity-page__placeholder">
        Halo, {user.name.split(' ')[0]}! Halaman cari kegiatan akan segera hadir di sini.
      </p>
    </main>
  )
}
```

- [ ] **Step 4: Restructure `AppRoutes.tsx` into the two layout groups**

Replace the full contents of `frontend/src/routes/AppRoutes.tsx`:

```tsx
import { Routes, Route } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import HomePage from '../pages/HomePage'
import AboutPage from '../pages/AboutPage'
import NotFoundPage from '../pages/NotFoundPage'
import FindActivityPage from '../pages/volunteer/FindActivityPage'

interface AppRoutesProps {
  onLoginClick: () => void
  onSignupClick: () => void
}

export default function AppRoutes({ onLoginClick, onSignupClick }: AppRoutesProps) {
  return (
    <Routes>
      <Route element={<PublicLayout onLoginClick={onLoginClick} onSignupClick={onSignupClick} />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/tentang-kami" element={<AboutPage onSignupClick={onSignupClick} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<FindActivityPage />} />
      </Route>
    </Routes>
  )
}
```

- [ ] **Step 5: Update `App.tsx` — `Navbar` no longer renders directly here**

Replace the full contents of `frontend/src/App.tsx`:

```tsx
import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import AuthModal, { type AuthMode } from './components/AuthModal'
import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes
          onLoginClick={() => setAuthMode('login')}
          onSignupClick={() => setAuthMode('signup')}
        />

        {authMode && (
          <AuthModal
            mode={authMode}
            onClose={() => setAuthMode(null)}
            onModeChange={setAuthMode}
          />
        )}
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
```

- [ ] **Step 6: Verify build, then register the fixed test user**

```bash
cd "d:\smester-4\tubes\ActiVIbe\frontend" && pnpm build
```

Expected: exits 0.

Start backend + frontend per the Global Constraints helper above, then register the test user directly via API (one-time setup for the rest of this plan):

```bash
cd "d:\smester-4\tubes\ActiVIbe" && node -e "
fetch('http://localhost:4000/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'Test',
    lastName: 'Volunteer',
    email: 'find-activity-test@example.com',
    password: 'Password123!'
  })
}).then(async (res) => {
  console.log('STATUS:', res.status)
  console.log(await res.text())
})
"
```

Expected: `STATUS: 201` (first run) or `STATUS: 409` (already exists — fine on reruns).

- [ ] **Step 7: Verify the 404 is fixed end-to-end, and public pages are unaffected**

```bash
cd "d:\smester-4\tubes\ActiVIbe\frontend" && node -e "
import('file:///C:/Users/rakha/AppData/Local/npm-cache/_npx/48b1ca104c3549f4/node_modules/playwright/index.mjs').then(async ({ chromium }) => {
  const browser = await chromium.launch()

  // 1. Logged-out direct visit to /dashboard redirects to /
  const anonPage = await browser.newPage()
  await anonPage.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' })
  console.log('ANON_DASHBOARD_URL:', anonPage.url())

  // 2. Public pages still show the marketing Navbar
  await anonPage.goto('http://localhost:5173/tentang-kami', { waitUntil: 'networkidle' })
  console.log('NAVBAR_ON_ABOUT:', await anonPage.locator('.navbar__link').count())
  await anonPage.close()

  // 3. Logged-in flow lands on /dashboard, not 404
  const page = await browser.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push(String(e)))

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
  await page.click('button.navbar__login')
  await page.fill('#email', 'find-activity-test@example.com')
  await page.fill('#password', 'Password123!')
  await page.click('button.auth-modal__submit')
  await page.waitForURL('**/dashboard', { timeout: 8000 })
  console.log('LOGGED_IN_URL:', page.url())
  console.log('HAS_404_TEXT:', await page.locator('text=Halaman tidak ditemukan').count())
  console.log('HAS_PLACEHOLDER:', await page.locator('.find-activity-page__placeholder').count())
  console.log('HAS_MARKETING_NAVBAR:', await page.locator('.navbar__link').count())
  console.log('CONSOLE_ERRORS:', JSON.stringify(errors))
  await browser.close()
})
"
```

Expected: `ANON_DASHBOARD_URL` ends with `/` (not `/dashboard`), `NAVBAR_ON_ABOUT: 4`, `LOGGED_IN_URL` ends with `/dashboard`, `HAS_404_TEXT: 0`, `HAS_PLACEHOLDER: 1`, `HAS_MARKETING_NAVBAR: 0` (dashboard uses `DashboardLayout`, not the marketing `Navbar`), `CONSOLE_ERRORS: []`.

- [ ] **Step 8: Commit**

```bash
cd "d:\smester-4\tubes\ActiVIbe" && git add frontend/src/layouts/PublicLayout.tsx frontend/src/layouts/DashboardLayout.tsx frontend/src/layouts/DashboardLayout.css frontend/src/pages/volunteer/FindActivityPage.tsx frontend/src/pages/volunteer/FindActivityPage.css frontend/src/routes/AppRoutes.tsx frontend/src/App.tsx
git commit -m "Add PublicLayout/DashboardLayout split, fix post-login 404 at /dashboard"
```

No `git push`.

---

### Task 2: Dummy `Event` data, types, and formatting utils

**Files:**
- Create: `frontend/src/types/event.ts`
- Create: `frontend/src/utils/matchScore.ts`
- Create: `frontend/src/utils/formatDate.ts`
- Create: `frontend/src/data/mockEvents.ts`

**Interfaces:**
- Produces: `Event` interface, exported from `frontend/src/types/event.ts`.
- Produces: `getMatchTier(score: number): 'success' | 'info' | 'warning'`, exported from `frontend/src/utils/matchScore.ts`.
- Produces: `formatDateShort(iso: string): string`, exported from `frontend/src/utils/formatDate.ts`.
- Produces: `mockEvents: Event[]` (8 items), exported from `frontend/src/data/mockEvents.ts`.

- [ ] **Step 1: Create the `Event` type**

Create `frontend/src/types/event.ts`:

```ts
export interface Event {
  id: string
  title: string
  description: string
  category: string
  location: string
  organizerName: string
  quota: number
  filledSlots: number
  startDate: string
  endDate: string
  skills: string[]
  matchScore: number
  matchReasoning: string
  fitBadgeLabel: string
}
```

- [ ] **Step 2: Create the match-tier and date-formatting utils**

Create `frontend/src/utils/matchScore.ts`:

```ts
export type MatchTier = 'success' | 'info' | 'warning'

export function getMatchTier(score: number): MatchTier {
  if (score >= 85) return 'success'
  if (score >= 60) return 'info'
  return 'warning'
}
```

Create `frontend/src/utils/formatDate.ts`:

```ts
export function formatDateShort(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(iso)
  )
}
```

- [ ] **Step 3: Create the mock dataset**

Create `frontend/src/data/mockEvents.ts`:

```ts
import type { Event } from '../types/event'

export const mockEvents: Event[] = [
  {
    id: 'evt-1',
    title: 'Bersih Pantai Parangtritis',
    description:
      'Aksi bersih-bersih sampah plastik di sepanjang Pantai Parangtritis bersama komunitas pesisir, dilanjutkan edukasi pengelolaan sampah untuk warga sekitar.',
    category: 'Lingkungan',
    location: 'Parangtritis, Bantul',
    organizerName: 'Komunitas Laut Lestari',
    quota: 30,
    filledSlots: 22,
    startDate: '2026-07-12',
    endDate: '2026-07-12',
    skills: ['Kerja Tim', 'Fisik/Lapangan', 'Edukasi Publik'],
    matchScore: 92,
    matchReasoning: 'Minat lingkunganmu dan pengalaman kerja lapangan sebelumnya sangat cocok dengan kegiatan ini.',
    fitBadgeLabel: 'Cocok dengan minat & latar belakangmu',
  },
  {
    id: 'evt-2',
    title: 'Mengajar Baca Tulis Anak Pesisir',
    description:
      'Program belajar baca-tulis untuk anak-anak nelayan di pesisir selatan Gunungkidul, 2 jam tiap akhir pekan selama satu bulan.',
    category: 'Pendidikan',
    location: 'Tepus, Gunungkidul',
    organizerName: 'Yayasan Cahaya Pesisir',
    quota: 15,
    filledSlots: 9,
    startDate: '2026-07-18',
    endDate: '2026-08-09',
    skills: ['Mengajar', 'Kesabaran', 'Komunikasi'],
    matchScore: 87,
    matchReasoning: 'Skill mengajar yang kamu miliki jadi kebutuhan utama di kegiatan ini.',
    fitBadgeLabel: 'Skill mengajarmu sangat dibutuhkan di sini',
  },
  {
    id: 'evt-3',
    title: 'Posyandu Keliling Desa Sehat',
    description: 'Membantu tenaga medis menjalankan posyandu keliling untuk ibu dan anak di desa-desa terpencil Bantul.',
    category: 'Kesehatan',
    location: 'Dlingo, Bantul',
    organizerName: 'Puskesmas Dlingo',
    quota: 20,
    filledSlots: 18,
    startDate: '2026-07-20',
    endDate: '2026-07-20',
    skills: ['Pertolongan Pertama', 'Administrasi', 'Kerja Tim'],
    matchScore: 76,
    matchReasoning: 'Kamu pernah ikut pelatihan kesehatan dasar, cukup relevan untuk dukungan administrasi posyandu.',
    fitBadgeLabel: 'Relevan dengan pengalaman kesehatanmu',
  },
  {
    id: 'evt-4',
    title: 'Dapur Umum Tanggap Bencana',
    description: 'Bergabung dengan tim dapur umum untuk menyiapkan logistik makanan bagi korban terdampak banjir di Sleman.',
    category: 'Bencana & Sosial',
    location: 'Sleman',
    organizerName: 'Posko Tanggap Bencana Sleman',
    quota: 25,
    filledSlots: 10,
    startDate: '2026-07-05',
    endDate: '2026-07-08',
    skills: ['Logistik', 'Kerja Tim', 'Fisik/Lapangan'],
    matchScore: 81,
    matchReasoning: 'Ketersediaanmu di hari kerja cocok dengan jadwal piket dapur umum yang masih kekurangan relawan.',
    fitBadgeLabel: 'Jadwalmu pas dengan kebutuhan piket',
  },
  {
    id: 'evt-5',
    title: 'Donor Darah & Edukasi Kesehatan Kampus',
    description: 'Membantu penyelenggaraan acara donor darah dan booth edukasi kesehatan di area kampus.',
    category: 'Kesehatan',
    location: 'Yogyakarta',
    organizerName: 'PMI Cabang Yogyakarta',
    quota: 50,
    filledSlots: 40,
    startDate: '2026-08-02',
    endDate: '2026-08-02',
    skills: ['Administrasi', 'Komunikasi'],
    matchScore: 68,
    matchReasoning: 'Cocok untuk kamu yang baru mulai volunteering di bidang kesehatan dengan tugas yang ringan.',
    fitBadgeLabel: 'Pilihan baik untuk volunteer pemula',
  },
  {
    id: 'evt-6',
    title: 'Taman Bacaan Komunitas Malioboro',
    description: 'Mengelola dan menjaga taman bacaan komunitas, termasuk mendongeng untuk anak-anak setiap Sabtu sore.',
    category: 'Pendidikan',
    location: 'Malioboro, Yogyakarta',
    organizerName: 'Gerakan Literasi Yogyakarta',
    quota: 12,
    filledSlots: 6,
    startDate: '2026-07-11',
    endDate: '2026-09-26',
    skills: ['Mengajar', 'Kreativitas', 'Komunikasi'],
    matchScore: 95,
    matchReasoning: 'Minat literasi dan pengalaman komunitasmu sangat sesuai dengan suasana taman bacaan ini.',
    fitBadgeLabel: 'Match tertinggi minggu ini buatmu',
  },
  {
    id: 'evt-7',
    title: 'Penghijauan Lereng Merapi',
    description: 'Penanaman pohon di area resapan air lereng Merapi sebagai bagian dari program konservasi jangka panjang.',
    category: 'Lingkungan',
    location: 'Cangkringan, Sleman',
    organizerName: 'Komunitas Hijau Merapi',
    quota: 40,
    filledSlots: 31,
    startDate: '2026-07-26',
    endDate: '2026-07-26',
    skills: ['Fisik/Lapangan', 'Kerja Tim'],
    matchScore: 73,
    matchReasoning: 'Kamu sudah dua kali ikut kegiatan penghijauan sebelumnya, cukup berpengalaman untuk ini.',
    fitBadgeLabel: 'Sesuai jejak kegiatan lingkunganmu',
  },
  {
    id: 'evt-8',
    title: 'Pendampingan Lansia Panti Wreda',
    description: 'Menemani dan mendampingi aktivitas harian lansia di panti wreda, termasuk sesi senam ringan dan bercerita.',
    category: 'Bencana & Sosial',
    location: 'Bantul',
    organizerName: 'Panti Wreda Sejahtera',
    quota: 10,
    filledSlots: 4,
    startDate: '2026-08-15',
    endDate: '2026-08-15',
    skills: ['Kesabaran', 'Komunikasi', 'Empati'],
    matchScore: 64,
    matchReasoning: 'Belum ada riwayat pendampingan lansia, tapi minat sosialmu tetap relevan untuk kegiatan ini.',
    fitBadgeLabel: 'Pengalaman baru yang sesuai minat sosialmu',
  },
]
```

- [ ] **Step 4: Verify build**

```bash
cd "d:\smester-4\tubes\ActiVIbe\frontend" && pnpm build
```

Expected: exits 0. (Nothing imports these files yet — that's fine, unused *module exports* don't trip `noUnusedLocals`, only unused *locals/params* do.)

- [ ] **Step 5: Commit**

```bash
cd "d:\smester-4\tubes\ActiVIbe" && git add frontend/src/types/event.ts frontend/src/utils/matchScore.ts frontend/src/utils/formatDate.ts frontend/src/data/mockEvents.ts
git commit -m "Add Event type, mock dataset, and formatting utils"
```

No `git push`.

---

### Task 3: Banner, results row, and `EventCard` list (left column)

**Files:**
- Create: `frontend/src/components/EventCard.tsx`
- Create: `frontend/src/components/EventCard.css`
- Modify: `frontend/src/pages/volunteer/FindActivityPage.tsx`
- Modify: `frontend/src/pages/volunteer/FindActivityPage.css`

**Interfaces:**
- Consumes: `Event` (Task 2), `getMatchTier` (Task 2), `formatDateShort` (Task 2).
- Produces: `EventCard({ event, isSelected, onSelect }: { event: Event; isSelected: boolean; onSelect: (id: string) => void })`, default export. Later tasks (4–6) consume `onSelect`'s id-string contract and `isSelected`'s boolean contract unchanged.

- [ ] **Step 1: Create `EventCard`**

Create `frontend/src/components/EventCard.css`:

```css
.event-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  text-align: left;
  background: var(--color-bg-true);
  border: 1px solid var(--color-border-light);
  border-radius: 20px;
  padding: 20px;
  cursor: pointer;
  font-family: var(--font-body);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(26, 26, 46, 0.08);
}

.event-card--selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-soft);
}

.event-card__match-badge {
  font-size: var(--text-body-xs);
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 999px;
}

.event-card__match-badge--success { background: var(--color-success-soft); color: var(--color-success); }
.event-card__match-badge--info { background: var(--color-secondary-soft); color: var(--color-secondary-dark); }
.event-card__match-badge--warning { background: var(--color-warning-soft); color: #8A6D00; }

.event-card__title {
  font-size: 17px;
  margin: 0;
}

.event-card__location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-body-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.event-card__meta {
  display: flex;
  gap: 16px;
  font-size: var(--text-body-sm);
  color: var(--color-text-body);
}

.event-card__meta span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.event-card__skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.event-card__skill-tag {
  font-size: var(--text-body-xs);
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-primary-soft);
  padding: 4px 10px;
  border-radius: 999px;
}

.event-card__skill-tag--more {
  color: var(--color-text-muted);
  background: var(--color-border-light);
}

.event-card__slots {
  font-size: var(--text-body-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  margin-top: 4px;
}
```

Create `frontend/src/components/EventCard.tsx`:

```tsx
import { FiMapPin, FiCalendar, FiTag } from 'react-icons/fi'
import type { Event } from '../types/event'
import { getMatchTier } from '../utils/matchScore'
import { formatDateShort } from '../utils/formatDate'
import './EventCard.css'

interface EventCardProps {
  event: Event
  isSelected: boolean
  onSelect: (id: string) => void
}

export default function EventCard({ event, isSelected, onSelect }: EventCardProps) {
  const visibleSkills = event.skills.slice(0, 3)
  const extraSkillCount = event.skills.length - visibleSkills.length
  const slotsLeft = event.quota - event.filledSlots

  return (
    <button
      type="button"
      className={`event-card${isSelected ? ' event-card--selected' : ''}`}
      onClick={() => onSelect(event.id)}
    >
      <span className={`event-card__match-badge event-card__match-badge--${getMatchTier(event.matchScore)}`}>
        {event.matchScore}% Match
      </span>

      <h3 className="event-card__title">{event.title}</h3>

      <p className="event-card__location">
        <FiMapPin aria-hidden="true" /> {event.location}
      </p>

      <div className="event-card__meta">
        <span><FiTag aria-hidden="true" /> {event.category}</span>
        <span><FiCalendar aria-hidden="true" /> {formatDateShort(event.startDate)}</span>
      </div>

      <div className="event-card__skills">
        {visibleSkills.map((skill) => (
          <span key={skill} className="event-card__skill-tag">{skill}</span>
        ))}
        {extraSkillCount > 0 && (
          <span className="event-card__skill-tag event-card__skill-tag--more">+{extraSkillCount} more</span>
        )}
      </div>

      <span className="event-card__slots">{slotsLeft} dari {event.quota} slot tersisa</span>
    </button>
  )
}
```

- [ ] **Step 2: Rewrite `FindActivityPage` to render the banner, results row, and card list**

Replace the full contents of `frontend/src/pages/volunteer/FindActivityPage.css`:

```css
.find-activity-page {
  padding-bottom: 64px;
}

.find-activity-page__banner {
  position: relative;
  overflow: hidden;
}

.find-activity-page__banner-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.find-activity-page__greeting {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  padding: 0 48px;
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(18px, 2.4vw, 26px);
  color: var(--color-text-heading);
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.4) 70%);
}

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

.find-activity-page__columns {
  display: grid;
  grid-template-columns: minmax(320px, 380px) 1fr minmax(320px, 380px);
  gap: 24px;
  padding: 24px 48px;
  align-items: start;
}

.find-activity-page__list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: calc(100vh - 280px);
  overflow-y: auto;
}

@media (max-width: 1024px) {
  .find-activity-page__columns {
    grid-template-columns: 1fr;
  }

  .find-activity-page__list {
    max-height: none;
    overflow-y: visible;
  }
}

@media (max-width: 600px) {
  .find-activity-page__banner-img { height: 140px; }
  .find-activity-page__greeting { padding: 0 20px; font-size: 16px; }
  .find-activity-page__results-row,
  .find-activity-page__columns {
    padding-inline: 20px;
  }
}
```

Replace the full contents of `frontend/src/pages/volunteer/FindActivityPage.tsx`:

```tsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import EventCard from '../../components/EventCard'
import { mockEvents } from '../../data/mockEvents'
import banner from '../../assets/svg/background-1.svg'
import './FindActivityPage.css'

type SortOption = 'matchScore' | 'dateAsc'

export default function FindActivityPage() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [sortBy, setSortBy] = useState<SortOption>('matchScore')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    () => [...mockEvents].sort((a, b) => b.matchScore - a.matchScore)[0]?.id ?? null
  )

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/', { replace: true })
    }
  }, [isLoading, user, navigate])

  const sortedEvents = useMemo(() => {
    const events = [...mockEvents]
    if (sortBy === 'matchScore') {
      events.sort((a, b) => b.matchScore - a.matchScore)
    } else {
      events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    }
    return events
  }, [sortBy])

  if (isLoading || !user) {
    return null
  }

  return (
    <main className="find-activity-page">
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

        <select
          className="find-activity-page__sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
        >
          <option value="matchScore">Match Score Tertinggi</option>
          <option value="dateAsc">Tanggal Terdekat</option>
        </select>
      </div>

      <div className="find-activity-page__columns">
        <div className="find-activity-page__list">
          {sortedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isSelected={event.id === selectedEventId}
              onSelect={setSelectedEventId}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
cd "d:\smester-4\tubes\ActiVIbe\frontend" && pnpm build
```

Expected: exits 0.

- [ ] **Step 4: Verify visually**

Backend + frontend dev servers must be running (Global Constraints helper).

```bash
cd "d:\smester-4\tubes\ActiVIbe\frontend" && node -e "
import('file:///C:/Users/rakha/AppData/Local/npm-cache/_npx/48b1ca104c3549f4/node_modules/playwright/index.mjs').then(async ({ chromium }) => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push(String(e)))

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
  await page.click('button.navbar__login')
  await page.fill('#email', 'find-activity-test@example.com')
  await page.fill('#password', 'Password123!')
  await page.click('button.auth-modal__submit')
  await page.waitForURL('**/dashboard', { timeout: 8000 })

  console.log('CARD_COUNT:', await page.locator('.event-card').count())
  const firstTitleBefore = await page.locator('.event-card').nth(0).locator('.event-card__title').textContent()
  await page.locator('.event-card').nth(1).click()
  console.log('SECOND_CARD_SELECTED:', await page.locator('.event-card').nth(1).evaluate(el => el.classList.contains('event-card--selected')))

  await page.selectOption('.find-activity-page__sort', 'dateAsc')
  const firstTitleAfterSort = await page.locator('.event-card').nth(0).locator('.event-card__title').textContent()
  console.log('TITLE_CHANGED_AFTER_SORT:', firstTitleBefore !== firstTitleAfterSort)

  await page.screenshot({ path: 'd:/tmp/find-activity-list.png', fullPage: true })
  console.log('CONSOLE_ERRORS:', JSON.stringify(errors))
  await browser.close()
})
"
```

Expected: `CARD_COUNT: 8`, `SECOND_CARD_SELECTED: true`, `TITLE_CHANGED_AFTER_SORT: true` (match-score order differs from date order in this dataset), `CONSOLE_ERRORS: []`. Read `d:/tmp/find-activity-list.png` to confirm the banner + list render correctly, then delete the screenshot.

- [ ] **Step 5: Commit**

```bash
cd "d:\smester-4\tubes\ActiVIbe" && git add frontend/src/components/EventCard.tsx frontend/src/components/EventCard.css frontend/src/pages/volunteer/FindActivityPage.tsx frontend/src/pages/volunteer/FindActivityPage.css
git commit -m "Add banner, results row, and EventCard list to FindActivityPage"
```

No `git push`.

---

### Task 4: `EventDetailPanel` (middle column)

**Files:**
- Create: `frontend/src/components/EventDetailPanel.tsx`
- Create: `frontend/src/components/EventDetailPanel.css`
- Modify: `frontend/src/pages/volunteer/FindActivityPage.tsx`

**Interfaces:**
- Consumes: `Event`, `getMatchTier`, `formatDateShort` (Task 2); `selectedEventId`/`sortedEvents` (Task 3).
- Produces: `EventDetailPanel({ event }: { event: Event })`, default export.

- [ ] **Step 1: Create `EventDetailPanel`**

Create `frontend/src/components/EventDetailPanel.css`:

```css
.event-detail-panel {
  background: var(--color-bg-true);
  border: 1px solid var(--color-border-light);
  border-radius: 20px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.event-detail-panel__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.event-detail-panel__match-badge {
  font-size: var(--text-body-xs);
  font-weight: 700;
  padding: 5px 14px;
  border-radius: 999px;
}

.event-detail-panel__match-badge--success { background: var(--color-success-soft); color: var(--color-success); }
.event-detail-panel__match-badge--info { background: var(--color-secondary-soft); color: var(--color-secondary-dark); }
.event-detail-panel__match-badge--warning { background: var(--color-warning-soft); color: #8A6D00; }

.event-detail-panel__fit-badge {
  font-size: var(--text-body-xs);
  font-weight: 700;
  padding: 5px 14px;
  border-radius: 999px;
  background: var(--color-accent-yellow-soft);
  color: #8A6D00;
}

.event-detail-panel__title {
  font-size: 22px;
  margin: 0;
}

.event-detail-panel__category {
  font-size: var(--text-body-sm);
  font-weight: 600;
  color: var(--color-primary);
  margin: 0;
}

.event-detail-panel__desc {
  font-size: var(--text-body-md);
  color: var(--color-text-body);
  line-height: var(--leading-normal);
  margin: 0;
}

.event-detail-panel__facts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 0;
}

.event-detail-panel__fact dt {
  font-size: var(--text-body-xs);
  color: var(--color-text-muted);
  margin: 0 0 4px;
}

.event-detail-panel__fact dd {
  font-size: var(--text-body-sm);
  font-weight: 600;
  color: var(--color-text-heading);
  margin: 0;
}

.event-detail-panel__skills h3,
.event-detail-panel__breakdown h3 {
  font-size: var(--text-body-md);
  margin: 0 0 10px;
}

.event-detail-panel__skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.event-detail-panel__skill-tag {
  font-size: var(--text-body-xs);
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-primary-soft);
  padding: 5px 12px;
  border-radius: 999px;
}

.event-detail-panel__breakdown {
  background: var(--color-secondary-soft);
  border-radius: 14px;
  padding: 16px;
}

.event-detail-panel__breakdown p {
  font-size: var(--text-body-sm);
  color: var(--color-text-body);
  margin: 0;
}

@media (max-width: 600px) {
  .event-detail-panel__facts {
    grid-template-columns: 1fr;
  }
}
```

Create `frontend/src/components/EventDetailPanel.tsx`:

```tsx
import type { Event } from '../types/event'
import { getMatchTier } from '../utils/matchScore'
import { formatDateShort } from '../utils/formatDate'
import './EventDetailPanel.css'

interface EventDetailPanelProps {
  event: Event
}

export default function EventDetailPanel({ event }: EventDetailPanelProps) {
  const slotsLeft = event.quota - event.filledSlots

  return (
    <div className="event-detail-panel">
      <div className="event-detail-panel__badges">
        <span className={`event-detail-panel__match-badge event-detail-panel__match-badge--${getMatchTier(event.matchScore)}`}>
          {event.matchScore}% Match Score
        </span>
        <span className="event-detail-panel__fit-badge">✨ {event.fitBadgeLabel}</span>
      </div>

      <h2 className="event-detail-panel__title">{event.title}</h2>
      <p className="event-detail-panel__category">{event.category}</p>
      <p className="event-detail-panel__desc">{event.description}</p>

      <dl className="event-detail-panel__facts">
        <div className="event-detail-panel__fact">
          <dt>Lokasi</dt>
          <dd>{event.location}</dd>
        </div>
        <div className="event-detail-panel__fact">
          <dt>Jadwal</dt>
          <dd>{formatDateShort(event.startDate)} – {formatDateShort(event.endDate)}</dd>
        </div>
        <div className="event-detail-panel__fact">
          <dt>Diselenggarakan oleh</dt>
          <dd>{event.organizerName}</dd>
        </div>
        <div className="event-detail-panel__fact">
          <dt>Slot tersisa</dt>
          <dd>{slotsLeft} dari {event.quota}</dd>
        </div>
      </dl>

      <div className="event-detail-panel__skills">
        <h3>Skill yang Dibutuhkan</h3>
        <div className="event-detail-panel__skill-list">
          {event.skills.map((skill) => (
            <span key={skill} className="event-detail-panel__skill-tag">{skill}</span>
          ))}
        </div>
      </div>

      <div className="event-detail-panel__breakdown">
        <h3>Kenapa Kegiatan Ini Cocok Buatmu</h3>
        <p>{event.matchReasoning}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Wire it into `FindActivityPage`**

In `frontend/src/pages/volunteer/FindActivityPage.tsx`, change the import block from:

```tsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import EventCard from '../../components/EventCard'
import { mockEvents } from '../../data/mockEvents'
import banner from '../../assets/svg/background-1.svg'
import './FindActivityPage.css'
```

to:

```tsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import EventCard from '../../components/EventCard'
import EventDetailPanel from '../../components/EventDetailPanel'
import type { Event } from '../../types/event'
import { mockEvents } from '../../data/mockEvents'
import banner from '../../assets/svg/background-1.svg'
import './FindActivityPage.css'
```

Right after the `sortedEvents` `useMemo` block, add:

```tsx
  const selectedEvent: Event = sortedEvents.find((event) => event.id === selectedEventId) ?? sortedEvents[0]
```

Change the columns JSX from:

```tsx
      <div className="find-activity-page__columns">
        <div className="find-activity-page__list">
          {sortedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isSelected={event.id === selectedEventId}
              onSelect={setSelectedEventId}
            />
          ))}
        </div>
      </div>
```

to:

```tsx
      <div className="find-activity-page__columns">
        <div className="find-activity-page__list">
          {sortedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isSelected={event.id === selectedEventId}
              onSelect={setSelectedEventId}
            />
          ))}
        </div>

        <EventDetailPanel event={selectedEvent} />
      </div>
```

- [ ] **Step 3: Verify build**

```bash
cd "d:\smester-4\tubes\ActiVIbe\frontend" && pnpm build
```

Expected: exits 0.

- [ ] **Step 4: Verify visually**

```bash
cd "d:\smester-4\tubes\ActiVIbe\frontend" && node -e "
import('file:///C:/Users/rakha/AppData/Local/npm-cache/_npx/48b1ca104c3549f4/node_modules/playwright/index.mjs').then(async ({ chromium }) => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push(String(e)))

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
  await page.click('button.navbar__login')
  await page.fill('#email', 'find-activity-test@example.com')
  await page.fill('#password', 'Password123!')
  await page.click('button.auth-modal__submit')
  await page.waitForURL('**/dashboard', { timeout: 8000 })

  const titleBefore = await page.locator('.event-detail-panel__title').textContent()
  await page.locator('.event-card').nth(2).click()
  const titleAfter = await page.locator('.event-detail-panel__title').textContent()
  console.log('DETAIL_TITLE_CHANGED:', titleBefore !== titleAfter)
  console.log('FIT_BADGE_PRESENT:', await page.locator('.event-detail-panel__fit-badge').count())

  await page.screenshot({ path: 'd:/tmp/find-activity-detail.png', fullPage: true })
  console.log('CONSOLE_ERRORS:', JSON.stringify(errors))
  await browser.close()
})
"
```

Expected: `DETAIL_TITLE_CHANGED: true`, `FIT_BADGE_PRESENT: 1`, `CONSOLE_ERRORS: []`. Read `d:/tmp/find-activity-detail.png` to confirm the detail panel renders next to the list, then delete the screenshot.

- [ ] **Step 5: Commit**

```bash
cd "d:\smester-4\tubes\ActiVIbe" && git add frontend/src/components/EventDetailPanel.tsx frontend/src/components/EventDetailPanel.css frontend/src/pages/volunteer/FindActivityPage.tsx
git commit -m "Add EventDetailPanel middle column to FindActivityPage"
```

No `git push`.

---

### Task 5: `EventApplyForm` (right column)

**Files:**
- Create: `frontend/src/components/EventApplyForm.tsx`
- Create: `frontend/src/components/EventApplyForm.css`
- Modify: `frontend/src/pages/volunteer/FindActivityPage.tsx`

**Interfaces:**
- Consumes: `Event` (Task 2), `useAuth()` (existing `AuthContext`), `selectedEvent` (Task 4).
- Produces: `EventApplyForm({ event }: { event: Event })`, default export.

- [ ] **Step 1: Create `EventApplyForm`**

Create `frontend/src/components/EventApplyForm.css`:

```css
.event-apply-form {
  background: var(--color-bg-true);
  border: 1px solid var(--color-border-light);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.event-apply-form__event-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-heading);
  margin: 0;
}

.event-apply-form__event-date {
  font-size: var(--text-body-sm);
  color: var(--color-text-muted);
  margin: 0 0 8px;
}

.event-apply-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.event-apply-form__field label {
  font-size: var(--text-body-sm);
  font-weight: 600;
  color: var(--color-text-heading);
}

.event-apply-form__field input,
.event-apply-form__field textarea {
  font-family: var(--font-body);
  font-size: var(--text-body-sm);
  padding: 10px 14px;
  border: 1px solid var(--color-border-medium);
  border-radius: 10px;
  resize: vertical;
}

.event-apply-form__field input[readonly] {
  background: var(--color-bg-surface);
  color: var(--color-text-muted);
}

.event-apply-form__availability {
  display: flex;
  gap: 16px;
  border: none;
  padding: 0;
  margin: 0;
}

.event-apply-form__availability legend {
  font-size: var(--text-body-sm);
  font-weight: 600;
  color: var(--color-text-heading);
  margin-bottom: 6px;
  width: 100%;
}

.event-apply-form__availability label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-body-sm);
  color: var(--color-text-body);
}

.event-apply-form__submit {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: var(--text-body-md);
  color: var(--color-text-on-accent);
  background: var(--color-primary);
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease;
}

.event-apply-form__submit:hover {
  background: var(--color-primary-hover);
}

.event-apply-form__submit:active {
  background: var(--color-primary-active);
  transform: scale(0.98);
}

.event-apply-form--success {
  align-items: center;
  text-align: center;
  justify-content: center;
  min-height: 200px;
}

.event-apply-form__success-text {
  font-size: var(--text-body-md);
  font-weight: 600;
  color: var(--color-success);
  margin: 0;
}

.event-apply-form__success-event {
  font-size: var(--text-body-sm);
  color: var(--color-text-muted);
  margin: 0;
}
```

Create `frontend/src/components/EventApplyForm.tsx`:

```tsx
import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import type { Event } from '../types/event'
import { formatDateShort } from '../utils/formatDate'
import './EventApplyForm.css'

interface EventApplyFormProps {
  event: Event
}

export default function EventApplyForm({ event }: EventApplyFormProps) {
  const { user } = useAuth()
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    setSubmitted(false)
  }, [event.id])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="event-apply-form event-apply-form--success">
        <p className="event-apply-form__success-text">
          Pendaftaran tercatat! (demo, belum tersambung backend)
        </p>
        <p className="event-apply-form__success-event">{event.title}</p>
      </div>
    )
  }

  return (
    <form className="event-apply-form" onSubmit={handleSubmit}>
      <p className="event-apply-form__event-title">{event.title}</p>
      <p className="event-apply-form__event-date">
        {formatDateShort(event.startDate)} – {formatDateShort(event.endDate)}
      </p>

      <div className="event-apply-form__field">
        <label htmlFor="apply-name">Nama</label>
        <input id="apply-name" type="text" value={user?.name ?? ''} readOnly />
      </div>

      <div className="event-apply-form__field">
        <label htmlFor="apply-email">Email</label>
        <input id="apply-email" type="email" value={user?.email ?? ''} readOnly />
      </div>

      <div className="event-apply-form__field">
        <label htmlFor="apply-whatsapp">No. WhatsApp</label>
        <input id="apply-whatsapp" name="whatsapp" type="tel" placeholder="08xxxxxxxxxx" required />
      </div>

      <div className="event-apply-form__field">
        <label htmlFor="apply-motivation">Motivasi mengikuti kegiatan ini</label>
        <textarea id="apply-motivation" name="motivation" rows={3} placeholder="Ceritakan alasanmu..." required />
      </div>

      <fieldset className="event-apply-form__availability">
        <legend>Ketersediaan</legend>
        <label><input type="checkbox" name="availability" value="weekday" /> Weekday</label>
        <label><input type="checkbox" name="availability" value="weekend" /> Weekend</label>
      </fieldset>

      <button type="submit" className="event-apply-form__submit">Konfirmasi Pendaftaran</button>
    </form>
  )
}
```

- [ ] **Step 2: Wire it into `FindActivityPage`**

In `frontend/src/pages/volunteer/FindActivityPage.tsx`, add to the import block (after the `EventDetailPanel` import line):

```tsx
import EventApplyForm from '../../components/EventApplyForm'
```

Change:

```tsx
        <EventDetailPanel event={selectedEvent} />
      </div>
```

to:

```tsx
        <EventDetailPanel event={selectedEvent} />
        <EventApplyForm event={selectedEvent} />
      </div>
```

- [ ] **Step 3: Verify build**

```bash
cd "d:\smester-4\tubes\ActiVIbe\frontend" && pnpm build
```

Expected: exits 0.

- [ ] **Step 4: Verify visually — fill, submit, and switch event resets the form**

```bash
cd "d:\smester-4\tubes\ActiVIbe\frontend" && node -e "
import('file:///C:/Users/rakha/AppData/Local/npm-cache/_npx/48b1ca104c3549f4/node_modules/playwright/index.mjs').then(async ({ chromium }) => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } })
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push(String(e)))

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
  await page.click('button.navbar__login')
  await page.fill('#email', 'find-activity-test@example.com')
  await page.fill('#password', 'Password123!')
  await page.click('button.auth-modal__submit')
  await page.waitForURL('**/dashboard', { timeout: 8000 })

  await page.fill('#apply-whatsapp', '081234567890')
  await page.fill('#apply-motivation', 'Ingin berkontribusi langsung di lapangan.')
  await page.check('input[name=availability][value=weekend]')
  await page.click('button.event-apply-form__submit')
  console.log('SUCCESS_VISIBLE:', await page.locator('.event-apply-form__success-text').count())

  await page.locator('.event-card').nth(3).click()
  console.log('FORM_RESET_AFTER_SWITCH:', await page.locator('#apply-whatsapp').count())
  console.log('SUCCESS_GONE_AFTER_SWITCH:', await page.locator('.event-apply-form__success-text').count())

  console.log('CONSOLE_ERRORS:', JSON.stringify(errors))
  await browser.close()
})
"
```

Expected: `SUCCESS_VISIBLE: 1`, `FORM_RESET_AFTER_SWITCH: 1` (form fields back), `SUCCESS_GONE_AFTER_SWITCH: 0`, `CONSOLE_ERRORS: []`.

- [ ] **Step 5: Commit**

```bash
cd "d:\smester-4\tubes\ActiVIbe" && git add frontend/src/components/EventApplyForm.tsx frontend/src/components/EventApplyForm.css frontend/src/pages/volunteer/FindActivityPage.tsx
git commit -m "Add EventApplyForm right column to FindActivityPage"
```

No `git push`.

---

### Task 6: `VolunteerSearchBar` + client-side filtering, empty state

**Files:**
- Create: `frontend/src/components/VolunteerSearchBar.tsx`
- Create: `frontend/src/components/VolunteerSearchBar.css`
- Modify: `frontend/src/pages/volunteer/FindActivityPage.tsx`
- Modify: `frontend/src/pages/volunteer/FindActivityPage.css`

**Interfaces:**
- Produces: `EventFilters` interface and `VolunteerSearchBar({ filters, onChange, categories, skills })`, default export from `frontend/src/components/VolunteerSearchBar.tsx`.

- [ ] **Step 1: Create `VolunteerSearchBar`**

Create `frontend/src/components/VolunteerSearchBar.css`:

```css
.volunteer-search-bar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 48px;
  background: var(--color-bg-true);
  border-bottom: 1px solid var(--color-border-light);
}

.volunteer-search-bar__row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.volunteer-search-bar__input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 220px;
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

.volunteer-search-bar__pills {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.volunteer-search-bar__pills select {
  font-family: var(--font-body);
  font-size: var(--text-body-sm);
  color: var(--color-text-body);
  border: 1px solid var(--color-border-medium);
  border-radius: 999px;
  padding: 8px 16px;
  background: var(--color-bg-true);
}

.volunteer-search-bar__toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-body-sm);
  color: var(--color-text-body);
}

@media (max-width: 600px) {
  .volunteer-search-bar {
    padding: 16px 20px;
  }
}
```

Create `frontend/src/components/VolunteerSearchBar.tsx`:

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
  skills: string[]
}

export default function VolunteerSearchBar({ filters, onChange, categories, skills }: VolunteerSearchBarProps) {
  const update = (patch: Partial<EventFilters>) => onChange({ ...filters, ...patch })

  return (
    <div className="volunteer-search-bar">
      <div className="volunteer-search-bar__row">
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
      </div>

      <div className="volunteer-search-bar__pills">
        <select value={filters.category} onChange={(e) => update({ category: e.target.value })}>
          <option value="">Semua Kategori</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select value={filters.skill} onChange={(e) => update({ skill: e.target.value })}>
          <option value="">Semua Skill</option>
          {skills.map((skill) => (
            <option key={skill} value={skill}>{skill}</option>
          ))}
        </select>

        <label className="volunteer-search-bar__toggle">
          <input
            type="checkbox"
            checked={filters.oneDayOnly}
            onChange={(e) => update({ oneDayOnly: e.target.checked })}
          />
          Hanya 1 hari
        </label>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Wire filtering into `FindActivityPage`**

Append to `frontend/src/pages/volunteer/FindActivityPage.css`:

```css
.find-activity-page__empty {
  font-size: var(--text-body-sm);
  color: var(--color-text-muted);
  padding: 24px;
}

.find-activity-page__empty--panel {
  grid-column: span 2;
  text-align: center;
}
```

Replace the full contents of `frontend/src/pages/volunteer/FindActivityPage.tsx`:

```tsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import EventCard from '../../components/EventCard'
import EventDetailPanel from '../../components/EventDetailPanel'
import EventApplyForm from '../../components/EventApplyForm'
import VolunteerSearchBar, { type EventFilters } from '../../components/VolunteerSearchBar'
import { mockEvents } from '../../data/mockEvents'
import banner from '../../assets/svg/background-1.svg'
import './FindActivityPage.css'

type SortOption = 'matchScore' | 'dateAsc'

const EMPTY_FILTERS: EventFilters = {
  keyword: '',
  location: '',
  category: '',
  skill: '',
  oneDayOnly: false,
}

export default function FindActivityPage() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [filters, setFilters] = useState<EventFilters>(EMPTY_FILTERS)
  const [sortBy, setSortBy] = useState<SortOption>('matchScore')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    () => [...mockEvents].sort((a, b) => b.matchScore - a.matchScore)[0]?.id ?? null
  )

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/', { replace: true })
    }
  }, [isLoading, user, navigate])

  const categories = useMemo(() => Array.from(new Set(mockEvents.map((event) => event.category))), [])
  const skills = useMemo(() => Array.from(new Set(mockEvents.flatMap((event) => event.skills))), [])

  const filteredEvents = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase()
    const location = filters.location.trim().toLowerCase()

    return mockEvents.filter((event) => {
      if (
        keyword &&
        !event.title.toLowerCase().includes(keyword) &&
        !event.description.toLowerCase().includes(keyword)
      ) {
        return false
      }
      if (location && !event.location.toLowerCase().includes(location)) {
        return false
      }
      if (filters.category && event.category !== filters.category) {
        return false
      }
      if (filters.skill && !event.skills.includes(filters.skill)) {
        return false
      }
      if (filters.oneDayOnly && event.startDate !== event.endDate) {
        return false
      }
      return true
    })
  }, [filters])

  const sortedEvents = useMemo(() => {
    const events = [...filteredEvents]
    if (sortBy === 'matchScore') {
      events.sort((a, b) => b.matchScore - a.matchScore)
    } else {
      events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    }
    return events
  }, [filteredEvents, sortBy])

  useEffect(() => {
    if (sortedEvents.length === 0) {
      setSelectedEventId(null)
      return
    }
    if (!sortedEvents.some((event) => event.id === selectedEventId)) {
      setSelectedEventId(sortedEvents[0].id)
    }
  }, [sortedEvents, selectedEventId])

  if (isLoading || !user) {
    return null
  }

  const selectedEvent = sortedEvents.find((event) => event.id === selectedEventId) ?? null

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

      <div className="find-activity-page__columns">
        <div className="find-activity-page__list">
          {sortedEvents.length === 0 && (
            <p className="find-activity-page__empty">Tidak ada kegiatan yang cocok dengan filter ini.</p>
          )}
          {sortedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isSelected={event.id === selectedEventId}
              onSelect={setSelectedEventId}
            />
          ))}
        </div>

        {selectedEvent ? (
          <>
            <EventDetailPanel event={selectedEvent} />
            <EventApplyForm event={selectedEvent} />
          </>
        ) : (
          <p className="find-activity-page__empty find-activity-page__empty--panel">
            Pilih atau ubah filter untuk melihat kegiatan.
          </p>
        )}
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
cd "d:\smester-4\tubes\ActiVIbe\frontend" && pnpm build
```

Expected: exits 0.

- [ ] **Step 4: Verify filtering, sorting, and the empty state**

```bash
cd "d:\smester-4\tubes\ActiVIbe\frontend" && node -e "
import('file:///C:/Users/rakha/AppData/Local/npm-cache/_npx/48b1ca104c3549f4/node_modules/playwright/index.mjs').then(async ({ chromium }) => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } })
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push(String(e)))

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
  await page.click('button.navbar__login')
  await page.fill('#email', 'find-activity-test@example.com')
  await page.fill('#password', 'Password123!')
  await page.click('button.auth-modal__submit')
  await page.waitForURL('**/dashboard', { timeout: 8000 })

  await page.fill('.volunteer-search-bar__input-group input', 'Pantai')
  console.log('KEYWORD_FILTER_COUNT:', await page.locator('.event-card').count())
  await page.fill('.volunteer-search-bar__input-group input', '')

  await page.selectOption('.volunteer-search-bar__pills select >> nth=0', 'Kesehatan')
  console.log('CATEGORY_FILTER_COUNT:', await page.locator('.event-card').count())

  await page.fill('.volunteer-search-bar__input-group input', 'kata yang tidak ada di manapun')
  console.log('EMPTY_STATE_PRESENT:', await page.locator('.find-activity-page__empty--panel').count())

  console.log('CONSOLE_ERRORS:', JSON.stringify(errors))
  await browser.close()
})
"
```

Expected: `KEYWORD_FILTER_COUNT: 1` (only "Bersih Pantai Parangtritis"), `CATEGORY_FILTER_COUNT: 2` (Posyandu + Donor Darah, both "Kesehatan"), `EMPTY_STATE_PRESENT: 1`, `CONSOLE_ERRORS: []`.

- [ ] **Step 5: Commit**

```bash
cd "d:\smester-4\tubes\ActiVIbe" && git add frontend/src/components/VolunteerSearchBar.tsx frontend/src/components/VolunteerSearchBar.css frontend/src/pages/volunteer/FindActivityPage.tsx frontend/src/pages/volunteer/FindActivityPage.css
git commit -m "Add VolunteerSearchBar with client-side filtering and empty state"
```

No `git push`.

---

### Task 7: Update `CLAUDE.md` and `README.md`

**Files:**
- Modify: `CLAUDE.md`
- Modify: `README.md`

- [ ] **Step 1: Update `CLAUDE.md`**

Read `CLAUDE.md` first to confirm its exact current content (it may have changed since this plan was written). Find this paragraph in the "Struktur Repo" section:

```markdown
**Routing:** sejak halaman "Tentang Kami", `frontend/` pakai `react-router-dom` (dikonfigurasi di `frontend/src/routes/AppRoutes.tsx`, dibungkus `<BrowserRouter>` di `App.tsx`). `Navbar` dan `AuthModal` dirender di luar `<Routes>` supaya tetap tampil di semua halaman. Kalau menambah halaman baru, daftarkan route-nya di `AppRoutes.tsx`, jangan render langsung di `App.tsx`.
```

Replace it with:

```markdown
**Routing:** `frontend/` pakai `react-router-dom` (dikonfigurasi di `frontend/src/routes/AppRoutes.tsx`, dibungkus `<BrowserRouter>` di `App.tsx`). Sejak halaman Find Activity (`/dashboard`), routing terbagi 2 grup nested route lewat layout wrapper (`<Outlet />`): `PublicLayout` (render `Navbar` marketing, dipakai `/` dan `/tentang-kami`) dan `DashboardLayout` (header berbeda — logo + nama user + Logout, tanpa link marketing — dipakai `/dashboard`, dan jadi pola yang akan dipakai ulang untuk dashboard Organizer/Admin nanti). `AuthModal` tetap di `App.tsx` di luar kedua layout (state modal lintas-halaman). Kalau menambah halaman publik baru, daftarkan di bawah `PublicLayout` di `AppRoutes.tsx`; kalau halaman dashboard baru, di bawah `DashboardLayout` (atau layout dashboard role lain kalau sudah dibuat).
```

- [ ] **Step 2: Update `README.md`**

In `README.md`, find:

```markdown
- [x] Register & Login end-to-end (`/auth/register`, `/auth/login`, `/auth/me`, `/auth/logout`, httpOnly cookie, `AuthModal` & `Navbar` terhubung ke API asli) — OTP (FR-002/003) masih ditunda
- [ ] Bangun layout nav-body
```

Replace it with:

```markdown
- [x] Register & Login end-to-end (`/auth/register`, `/auth/login`, `/auth/me`, `/auth/logout`, httpOnly cookie, `AuthModal` & `Navbar` terhubung ke API asli) — OTP (FR-002/003) masih ditunda
- [x] Bangun layout nav-body — `PublicLayout`/`DashboardLayout` (nested routes via `<Outlet />`)
- [x] Halaman Find Activity (`/dashboard`) — list/detail/form 3 kolom kegiatan volunteer dengan Match Score, search & filter; data masih dummy (`mockEvents.ts`), backend `Event` model menyusul
```

- [ ] **Step 3: Verify build**

```bash
cd "d:\smester-4\tubes\ActiVIbe\frontend" && pnpm build
```

Expected: exits 0 (docs-only task, but confirms nothing else broke).

- [ ] **Step 4: Commit**

```bash
cd "d:\smester-4\tubes\ActiVIbe" && git add CLAUDE.md README.md
git commit -m "Update CLAUDE.md and README.md for the Find Activity page"
```

No `git push`.

---

## Self-Review Notes

- **Spec coverage:** Routing/header split ✓ (Task 1), banner+greeting ✓ (Task 3), results row+sort ✓ (Task 3), 3-column list/detail/form ✓ (Tasks 3–5), Match Score badge + fit badge ✓ (Tasks 3–4), search/filter bar ✓ (Task 6), dummy data shaped to PRD `Event` fields ✓ (Task 2), docs update ✓ (Task 7).
- **Deviation from spec flagged:** the spec's "Komponen Baru" table named a single `DashboardHeader.tsx` combining logo+user-menu+search bar. Split into `DashboardLayout` (generic chrome: logo + user + logout, reusable by future Organizer/Admin dashboards) + `VolunteerSearchBar` (page-specific, lives inside `FindActivityPage`) instead — avoids baking volunteer-only search/filter UI into chrome the spec itself says should be reusable. No behavior change, purely an internal component-boundary fix caught during planning.
- **Placeholder scan:** none — every step has literal code and concrete expected command output.
- **Type consistency:** `Event` defined once in Task 2, used identically (`EventCardProps`, `EventDetailPanelProps`, `EventApplyFormProps` all take `event: Event`) through Tasks 3–6. `onSelect: (id: string) => void` / `isSelected: boolean` contract from Task 3's `EventCard` is never changed by later tasks. `EventFilters` defined once in Task 6, both read and written through the same `filters`/`setFilters` pair.
