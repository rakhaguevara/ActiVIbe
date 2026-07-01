# Halaman "Cara Kerja" (`/cara-kerja`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new public page at `/cara-kerja` (Hero, Overview Umum, Alur Detail Volunteer, Impact Passport, CTA) per the approved spec at `docs/superpowers/specs/2026-06-26-cara-kerja-page-design.md`, replacing the small stepper section currently embedded in `HomePage.tsx`, and repoint every existing "Cara Kerja" nav link at the new page.

**Architecture:** Three tasks, building the page top-to-bottom. Task 1 scaffolds `CaraKerjaPage.tsx`/`.css` with the simple sections (Hero, Overview Umum, CTA, Footer), wires the route into `AppRoutes.tsx`, and repoints every "Cara Kerja" link (`Navbar.tsx`, `DashboardLayout.tsx`, `Footer.tsx`) — this makes the page real and navigable immediately. Task 2 inserts the interactive "Alur Detail Volunteer" stepper (ported from `HomePage.tsx`'s old `.how` section, expanded with description text) and removes the now-superseded section, state, effect, and CSS from `HomePage.tsx`/`.css`. Task 3 inserts the "Impact Passport" section (feature grid + illustrative mockup card), completing the page.

**Tech Stack:** React 19 + TypeScript, Vite, plain CSS (BEM-style classes, CSS custom properties from `docs/design.md`), `react-router-dom` v7. No test runner is configured in this project (no `test` script, no `*.test.*` files) — verification is type safety plus a manual visual check in the browser. Unlike `/dashboard`, **`/cara-kerja` is a public route under `PublicLayout` with no auth gate** (confirmed by reading `frontend/src/layouts/PublicLayout.tsx` — it only renders `<Navbar />` + `<Outlet />`, no login check), so manual verification needs nothing more than `pnpm dev` and opening the URL — no backend/Postgres/login session required.

**Type-check command — read before running any verification step:** `frontend/tsconfig.json` is a solution-style config (`"files": []`, only `"references"`). Plain `tsc --noEmit` type-checks **zero files** and silently exits 0 even with real type errors present. Always use **`pnpm exec tsc -b --noEmit`** (build mode, follows project references) from inside `frontend/`. If a stale build cache is suspected, clear it: `rm -f frontend/node_modules/.tmp/tsconfig.app.tsbuildinfo frontend/node_modules/.tmp/tsconfig.node.tsbuildinfo`.

## Global Constraints

- No new color hex values — every color must be an existing `var(--token-name)` from `docs/design.md` (CLAUDE.md design-system rule). This plan only reuses tokens already used by `AboutPage.css`/`HomePage.css`: `--color-primary`, `--color-primary-soft`, `--color-accent-orange`, `--color-accent-yellow-soft`, `--color-text-heading`, `--color-text-body`, `--color-text-muted`, `--color-text-on-accent`, `--color-text-on-dark`, `--color-bg-true`, `--color-bg-surface`, `--color-border-light`, `--color-border-medium`, `--font-display`, `--font-body`.
- No new npm dependencies.
- No new image assets — reuse `pic1`/`pic2` (`frontend/src/assets/png/pic1 1.png`, `pic2 1.png`) and `flowerDeco` (`frontend/src/assets/svg/flower.svg`), already imported elsewhere (`HomePage.tsx`).
- Replace, not add: the old `.how` section in `HomePage.tsx`/`.css` must be fully removed once its content is ported to `CaraKerjaPage` (Task 2) — no leftover dead code, no duplicate "Cara Kerja" content on the homepage.
- Scope is volunteer-flow only — no organizer/NGO flow content on this page (per spec decision #2).
- Impact Passport section is explanation + feature grid + illustrative mockup only — no real `/passport/{username}` page, no backend/data model work (per spec out-of-scope).
- Do not commit automatically. Per this project's CLAUDE.md, commits in the main session require an explicit user request; the per-task "Commit" step below only applies if this plan is executed via `superpowers:subagent-driven-development` (where the project's documented exception allows subagents to commit locally as an internal mechanism). If executed inline in the main session, skip the commit step and leave changes staged for the user.

---

### Task 1: Scaffold `CaraKerjaPage` (Hero, Overview Umum, CTA) + routing + nav links

**Files:**
- Create: `frontend/src/pages/CaraKerjaPage.tsx`
- Create: `frontend/src/pages/CaraKerjaPage.css`
- Modify: `frontend/src/routes/AppRoutes.tsx`
- Modify: `frontend/src/components/Navbar.tsx:10`
- Modify: `frontend/src/layouts/DashboardLayout.tsx:147,223`
- Modify: `frontend/src/components/Footer.tsx`

**Interfaces:**
- Produces: `CaraKerjaPage({ onSignupClick: () => void })` default export — Task 2 and Task 3 both insert additional `<section>` JSX into this same component between the Overview section and the CTA section, and add to the same data-constant block.

- [ ] **Step 1: Create `CaraKerjaPage.tsx`**

```tsx
import Footer from '../components/Footer'
import './CaraKerjaPage.css'

interface CaraKerjaPageProps {
  onSignupClick: () => void
}

const OVERVIEW_PHASES = [
  {
    label: 'Daftar & Kenali Diri',
    desc: 'Buat akun dan lewati Conversational Onboarding — ActiVibe mengenali minat, skill, dan jadwalmu lewat percakapan singkat, bukan formulir panjang.',
  },
  {
    label: 'Temukan & Terhubung',
    desc: 'AI Matching kami mencocokkan profilmu dengan kegiatan volunteer yang paling relevan, lengkap dengan Predictive Match Score dan alasan kenapa kegiatan itu cocok untukmu.',
  },
  {
    label: 'Beraksi Bersama',
    desc: 'Daftar ke kegiatan, dapatkan tiket konfirmasi digital, dan jalani kegiatan bersama organisasi serta volunteer lain yang sama-sama terverifikasi.',
  },
  {
    label: 'Catat & Bagikan Dampak',
    desc: 'Setiap kontribusi otomatis tercatat — sertifikat digital terbit otomatis, dan dampakmu terkumpul jadi Impact Passport yang bisa dibagikan.',
  },
]

export default function CaraKerjaPage({ onSignupClick }: CaraKerjaPageProps) {
  return (
    <main className="cara-kerja-page">
      <section className="cara-kerja-page__hero">
        <p className="cara-kerja-page__hero-eyebrow">Cara Kerja ActiVibe</p>
        <h1 className="cara-kerja-page__hero-title">
          Satu platform, satu alur jelas — dari daftar sampai dampak nyata.
        </h1>
        <p className="cara-kerja-page__hero-desc">
          ActiVibe menghubungkan volunteer dan organisasi lewat AI, supaya setiap orang menemukan
          kegiatan yang benar-benar cocok, dan setiap kontribusi tercatat jadi bukti dampak yang
          bisa dibanggakan.
        </p>
      </section>

      <section className="cara-kerja-page__overview">
        <div className="cara-kerja-page__overview-inner">
          <p className="cara-kerja-page__overview-eyebrow">Gambaran Besar</p>
          <h2 className="cara-kerja-page__overview-title">
            Empat fase, satu pengalaman yang terhubung.
          </h2>
          <div className="cara-kerja-page__overview-grid">
            {OVERVIEW_PHASES.map((phase, i) => (
              <div key={phase.label} className="cara-kerja-page__overview-item">
                <span className="cara-kerja-page__overview-badge">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="cara-kerja-page__overview-item-title">{phase.label}</h3>
                <p className="cara-kerja-page__overview-item-desc">{phase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cara-kerja-page__cta">
        <h2 className="cara-kerja-page__cta-title">Siap mulai perjalanan volunteering-mu?</h2>
        <p className="cara-kerja-page__cta-desc">
          Buat akun gratis dan biarkan AI ActiVibe mencarikan kegiatan yang paling cocok untukmu.
        </p>
        <button type="button" className="cara-kerja-page__cta-button" onClick={onSignupClick}>
          Daftar Sekarang
        </button>
      </section>

      <Footer />
    </main>
  )
}
```

- [ ] **Step 2: Create `CaraKerjaPage.css`**

```css
/* ── Hero ── */
.cara-kerja-page__hero {
  position: relative;
  margin-top: 72px;
  padding: 40px 40px 0;
  text-align: center;
  overflow: hidden;
}

.cara-kerja-page__hero-eyebrow {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--color-primary);
  text-transform: uppercase;
  margin: 0 0 12px;
}

.cara-kerja-page__hero-title {
  font-size: clamp(28px, 4vw, 44px);
  margin: 0 auto 20px;
  max-width: 720px;
}

.cara-kerja-page__hero-desc {
  font-size: 16px;
  line-height: 1.75;
  color: var(--color-text-body);
  max-width: 620px;
  margin: 0 auto 48px;
}

@media (max-width: 600px) {
  .cara-kerja-page__hero {
    padding: 72px 20px 0;
  }
}

/* ── Overview Umum ── */
.cara-kerja-page__overview {
  background: var(--color-primary-soft);
  padding: 64px 40px;
}

.cara-kerja-page__overview-inner {
  max-width: 1100px;
  margin: 0 auto;
  text-align: center;
}

.cara-kerja-page__overview-eyebrow {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--color-primary);
  text-transform: uppercase;
  margin: 0 0 12px;
}

.cara-kerja-page__overview-title {
  font-size: clamp(22px, 3vw, 30px);
  color: var(--color-text-heading);
  max-width: 760px;
  margin: 0 auto 48px;
}

.cara-kerja-page__overview-grid {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  justify-content: center;
}

.cara-kerja-page__overview-item {
  flex: 1;
  min-width: 220px;
  max-width: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.cara-kerja-page__overview-badge {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-bg-true);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 18px;
  color: var(--color-primary);
  box-shadow: 0 0 0 6px var(--color-accent-yellow-soft);
}

.cara-kerja-page__overview-item-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-heading);
  margin: 0;
}

.cara-kerja-page__overview-item-desc {
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--color-text-body);
  margin: 0;
}

@media (max-width: 700px) {
  .cara-kerja-page__overview {
    padding: 48px 24px;
  }

  .cara-kerja-page__overview-grid {
    flex-direction: column;
    align-items: center;
  }
}

/* ── CTA Penutup ── */
.cara-kerja-page__cta {
  background: var(--color-primary);
  padding: 64px 40px;
  text-align: center;
}

.cara-kerja-page__cta-title {
  color: var(--color-text-on-dark);
  font-size: clamp(22px, 3vw, 30px);
  margin: 0 0 16px;
}

.cara-kerja-page__cta-desc {
  color: var(--color-text-on-dark);
  opacity: 0.9;
  font-size: 15px;
  line-height: 1.7;
  max-width: 560px;
  margin: 0 auto 32px;
}

.cara-kerja-page__cta-button {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 700;
  color: var(--color-primary);
  background: var(--color-bg-true);
  border: none;
  border-radius: 999px;
  padding: 14px 40px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease;
}

.cara-kerja-page__cta-button:hover {
  background: var(--color-primary-soft);
}

.cara-kerja-page__cta-button:active {
  transform: scale(0.97);
}
```

- [ ] **Step 3: Register the route in `AppRoutes.tsx`**

In `frontend/src/routes/AppRoutes.tsx`, add the import:

```tsx
import CaraKerjaPage from '../pages/CaraKerjaPage'
```

(place it after the `AboutPage` import line). Then change:

```tsx
        <Route path="/tentang-kami" element={<AboutPage onSignupClick={onSignupClick} />} />
        <Route path="*" element={<NotFoundPage />} />
```

to:

```tsx
        <Route path="/tentang-kami" element={<AboutPage onSignupClick={onSignupClick} />} />
        <Route path="/cara-kerja" element={<CaraKerjaPage onSignupClick={onSignupClick} />} />
        <Route path="*" element={<NotFoundPage />} />
```

`/cara-kerja` must stay above `path="*"` — React Router matches in order and the catch-all must remain last.

- [ ] **Step 4: Repoint the "Cara Kerja" link in `Navbar.tsx`**

In `frontend/src/components/Navbar.tsx:7-12`, change:

```tsx
const NAV_LINKS = [
  { label: 'Cari Aktivitas', href: '#' },
  { label: 'Cari Organisasi', href: '#' },
  { label: 'Cara Kerja', href: '#' },
  { label: 'Tentang Kami', href: '#', to: '/tentang-kami' },
]
```

to:

```tsx
const NAV_LINKS = [
  { label: 'Cari Aktivitas', href: '#' },
  { label: 'Cari Organisasi', href: '#' },
  { label: 'Cara Kerja', href: '#', to: '/cara-kerja' },
  { label: 'Tentang Kami', href: '#', to: '/tentang-kami' },
]
```

(`Navbar.tsx`'s render code already handles `to` vs `href` conditionally — confirmed at `Navbar.tsx:67-76` — no JSX changes needed here.)

- [ ] **Step 5: Repoint both "Cara Kerja" links in `DashboardLayout.tsx`**

In `frontend/src/layouts/DashboardLayout.tsx:147`, change:

```tsx
          <Link to="/#cara-kerja" className="dashboard-layout__link">Cara Kerja</Link>
```

to:

```tsx
          <Link to="/cara-kerja" className="dashboard-layout__link">Cara Kerja</Link>
```

And at `DashboardLayout.tsx:222-228`, change:

```tsx
            <Link
              to="/#cara-kerja"
              className="dashboard-layout__mobile-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Cara Kerja
            </Link>
```

to:

```tsx
            <Link
              to="/cara-kerja"
              className="dashboard-layout__mobile-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Cara Kerja
            </Link>
```

- [ ] **Step 6: Make "Cara Kerja" a real link in `Footer.tsx`**

In `frontend/src/components/Footer.tsx:1`, change:

```tsx
import { useState, type FormEvent } from 'react'
```

to:

```tsx
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
```

Then in the column-rendering loop (`Footer.tsx:93-104`), change:

```tsx
        {FOOTER_COLUMNS.map(({ title, links }) => (
          <div key={title} className="footer__column">
            <h3 className="footer__column-title">{title}</h3>
            <ul className="footer__column-list">
              {links.map((link) => (
                <li key={link}>
                  <a href="#" className="footer__column-link">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
```

to:

```tsx
        {FOOTER_COLUMNS.map(({ title, links }) => (
          <div key={title} className="footer__column">
            <h3 className="footer__column-title">{title}</h3>
            <ul className="footer__column-list">
              {links.map((link) => (
                <li key={link}>
                  {link === 'Cara Kerja' ? (
                    <Link to="/cara-kerja" className="footer__column-link">{link}</Link>
                  ) : (
                    <a href="#" className="footer__column-link">{link}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
```

Every other link label in `FOOTER_COLUMNS` keeps its current dead `href="#"` — they point to pages that don't exist yet, unchanged from before this task.

- [ ] **Step 7: Type-check**

Run (from `frontend/`): `pnpm exec tsc -b --noEmit`
Expected: PASS — no output, exit code 0.

- [ ] **Step 8: Manual verification in browser**

Run: `cd frontend && pnpm dev` (skip if already running), open `http://localhost:5173/cara-kerja` (no login needed — this is a public route).

Confirm:
- Hero shows the eyebrow "Cara Kerja ActiVibe", the title, and the description paragraph, centered.
- Overview Umum shows 4 numbered cards (01-04) on a light-purple background, each with a title and description.
- CTA section shows a purple band with "Siap mulai perjalanan volunteering-mu?", a description, and a white pill button "Daftar Sekarang" — clicking it opens the signup modal (same modal as elsewhere in the app).
- The site footer renders below the CTA.
- Back on `http://localhost:5173/` (homepage), click "Cara Kerja" in the navbar — it navigates to `/cara-kerja` (not an anchor scroll anymore).
- Log in, go to `/dashboard`, click "Cara Kerja" in the dashboard topbar (desktop) and in the mobile hamburger menu — both navigate to `/cara-kerja`.
- On the homepage, scroll to the footer and click "Cara Kerja" under "Tautan" — it navigates to `/cara-kerja`. Other footer links remain inert (`#`), unchanged.

- [ ] **Step 9: Commit** (only if running under subagent-driven-development; otherwise leave staged)

```bash
git add frontend/src/pages/CaraKerjaPage.tsx frontend/src/pages/CaraKerjaPage.css frontend/src/routes/AppRoutes.tsx frontend/src/components/Navbar.tsx frontend/src/layouts/DashboardLayout.tsx frontend/src/components/Footer.tsx
git commit -m "feat(frontend): scaffold /cara-kerja page and repoint Cara Kerja nav links"
```

---

### Task 2: Add the "Alur Detail Volunteer" stepper and remove it from `HomePage`

**Files:**
- Modify: `frontend/src/pages/CaraKerjaPage.tsx`
- Modify: `frontend/src/pages/CaraKerjaPage.css`
- Modify: `frontend/src/pages/HomePage.tsx`
- Modify: `frontend/src/pages/HomePage.css`

**Interfaces:**
- Consumes: `useRevealOnScroll(threshold: number): { ref: RefObject<HTMLElement>, visible: boolean }` (existing hook, `frontend/src/hooks/useRevealOnScroll.ts`, already used the same way in `HomePage.tsx` and `AboutPage.tsx`).
- Produces: no change to `CaraKerjaPage`'s public props (still just `{ onSignupClick }`) — Task 3 only adds a new section between this one and the CTA, no interface changes.

- [ ] **Step 1: Add imports, data, and `useState`/`useRevealOnScroll` to `CaraKerjaPage.tsx`**

In `frontend/src/pages/CaraKerjaPage.tsx`, change the top of the file from:

```tsx
import Footer from '../components/Footer'
import './CaraKerjaPage.css'

interface CaraKerjaPageProps {
  onSignupClick: () => void
}

const OVERVIEW_PHASES = [
```

to:

```tsx
import { useState } from 'react'
import flowerDeco from '../assets/svg/flower.svg'
import pic1 from '../assets/png/pic1 1.png'
import pic2 from '../assets/png/pic2 1.png'
import Footer from '../components/Footer'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll'
import './CaraKerjaPage.css'

interface CaraKerjaPageProps {
  onSignupClick: () => void
}

const OVERVIEW_PHASES = [
```

Then, right after the `OVERVIEW_PHASES` array's closing `]` and before `export default function CaraKerjaPage`, add:

```tsx
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

Then change the function signature line from:

```tsx
export default function CaraKerjaPage({ onSignupClick }: CaraKerjaPageProps) {
  return (
```

to:

```tsx
export default function CaraKerjaPage({ onSignupClick }: CaraKerjaPageProps) {
  const flowReveal = useRevealOnScroll(0.1)
  const [activeStep, setActiveStep] = useState(0)

  return (
```

- [ ] **Step 2: Insert the Flow section between Overview and CTA**

In `frontend/src/pages/CaraKerjaPage.tsx`, find the boundary between the Overview section's closing `</section>` and the CTA section:

```tsx
        </div>
      </section>

      <section className="cara-kerja-page__cta">
```

Replace it with (inserting the new section in between):

```tsx
        </div>
      </section>

      <section
        id="alur-volunteer"
        ref={flowReveal.ref as React.RefObject<HTMLElement>}
        className={`cara-kerja-page__flow${flowReveal.visible ? ' cara-kerja-page__flow--visible' : ''}`}
      >
        <img src={flowerDeco} alt="" className="cara-kerja-page__flow-deco" aria-hidden="true" />

        <div className="cara-kerja-page__flow-inner">
          <div className="cara-kerja-page__flow-eyebrow-row">
            <span className="cara-kerja-page__flow-eyebrow">Alur Volunteer</span>
            <span className="cara-kerja-page__flow-eyebrow-line" aria-hidden="true" />
          </div>

          <h2 className="cara-kerja-page__flow-title">
            Lima langkah dari kenalan AI sampai dampak tercatat.
          </h2>

          <div className="cara-kerja-page__flow-grid">
            <div className="cara-kerja-page__flow-nav-wrap">
              <span className="cara-kerja-page__flow-counter" aria-hidden="true">
                {String(activeStep + 1).padStart(2, '0')}/{String(VOLUNTEER_FLOW_STEPS.length).padStart(2, '0')}
              </span>
              <span
                className="cara-kerja-page__flow-rail"
                aria-hidden="true"
                style={{ '--progress': `${Math.round(((activeStep + 1) / VOLUNTEER_FLOW_STEPS.length) * 100)}%` } as React.CSSProperties}
              />

              <ul className="cara-kerja-page__flow-nav">
                {VOLUNTEER_FLOW_STEPS.map(({ label }, i) => (
                  <li key={label}>
                    <button
                      type="button"
                      className={`cara-kerja-page__flow-nav-item${i === activeStep ? ' cara-kerja-page__flow-nav-item--active' : ''}`}
                      onClick={() => setActiveStep(i)}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="cara-kerja-page__flow-content">
              <div className="cara-kerja-page__flow-image-wrap">
                <img
                  key={activeStep}
                  src={VOLUNTEER_FLOW_STEPS[activeStep].image}
                  alt={VOLUNTEER_FLOW_STEPS[activeStep].label}
                  className="cara-kerja-page__flow-image"
                />
              </div>
              <p key={`desc-${activeStep}`} className="cara-kerja-page__flow-desc">
                {VOLUNTEER_FLOW_STEPS[activeStep].desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="cara-kerja-page__cta">
```

(`React.RefObject`/`React.CSSProperties` are used here exactly as `HomePage.tsx` already uses them — bare `React.*` type references with no explicit `import React`. Confirmed this compiles in this codebase as-is; do not add a `React` import.)

- [ ] **Step 3: Append Flow styles to `CaraKerjaPage.css`**

Add to the end of `frontend/src/pages/CaraKerjaPage.css`:

```css
/* ── Alur Detail Volunteer ── */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(28px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cara-kerja-page__flow {
  position: relative;
  overflow: hidden;
  background: var(--color-bg-true);
  padding: 80px 40px 96px;
}

.cara-kerja-page__flow-deco {
  position: absolute;
  pointer-events: none;
  user-select: none;
  left: -24px;
  bottom: 32px;
  width: 130px;
  opacity: 0.9;
  transform: rotate(-8deg);
}

.cara-kerja-page__flow-inner {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
}

.cara-kerja-page__flow-eyebrow-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.cara-kerja-page__flow-eyebrow {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-body);
  letter-spacing: 0.2px;
}

.cara-kerja-page__flow-eyebrow-line {
  display: inline-block;
  width: 48px;
  height: 1px;
  background: var(--color-border-medium);
}

.cara-kerja-page__flow-title {
  font-size: clamp(22px, 2.8vw, 32px);
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: -0.3px;
  max-width: 640px;
  margin: 0 0 48px;
}

.cara-kerja-page__flow-grid {
  display: grid;
  grid-template-columns: minmax(260px, 380px) 1fr;
  gap: 56px;
  align-items: center;
}

.cara-kerja-page__flow-nav-wrap {
  display: flex;
  align-items: stretch;
  gap: 18px;
}

.cara-kerja-page__flow-counter {
  flex-shrink: 0;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  letter-spacing: 0.5px;
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cara-kerja-page__flow-rail {
  flex-shrink: 0;
  width: 2px;
  background: var(--color-border-medium);
  border-radius: 1px;
  position: relative;
  overflow: hidden;
}

.cara-kerja-page__flow-rail::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--progress, 0%);
  background: var(--color-accent-orange);
  border-radius: 1px;
  transition: height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.cara-kerja-page__flow-nav {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.cara-kerja-page__flow-nav-item {
  display: block;
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  border-radius: 8px;
  padding: 14px 20px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-body);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.cara-kerja-page__flow-nav-item--active {
  background: var(--color-accent-orange);
  color: var(--color-text-on-accent);
}

.cara-kerja-page__flow-nav-item--active:hover {
  background: var(--color-accent-orange);
}

.cara-kerja-page__flow-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cara-kerja-page__flow-image-wrap {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.cara-kerja-page__flow-image {
  width: 100%;
  height: 320px;
  object-fit: cover;
  display: block;
  animation: fadeInUp 0.4s ease both;
}

.cara-kerja-page__flow-desc {
  font-size: 15px;
  line-height: 1.7;
  color: var(--color-text-body);
  margin: 0;
}

.cara-kerja-page__flow-nav-wrap,
.cara-kerja-page__flow-content {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.cara-kerja-page__flow--visible .cara-kerja-page__flow-nav-wrap {
  opacity: 1;
  transform: translateY(0);
}

.cara-kerja-page__flow--visible .cara-kerja-page__flow-content {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.1s;
}

@media (max-width: 900px) {
  .cara-kerja-page__flow {
    padding: 64px 32px 72px;
  }

  .cara-kerja-page__flow-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .cara-kerja-page__flow-image {
    height: 260px;
  }
}

@media (max-width: 600px) {
  .cara-kerja-page__flow {
    padding: 48px 20px 64px;
  }

  .cara-kerja-page__flow-title {
    margin-bottom: 32px;
  }

  .cara-kerja-page__flow-nav-item {
    padding: 12px 16px;
    font-size: 14px;
  }

  .cara-kerja-page__flow-image {
    height: 200px;
  }

  .cara-kerja-page__flow-deco {
    width: 90px;
    left: -12px;
    bottom: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cara-kerja-page__flow-nav-wrap,
  .cara-kerja-page__flow-content {
    transition: none;
    opacity: 1;
    transform: none;
  }

  .cara-kerja-page__flow-image {
    animation: none;
  }
}
```

- [ ] **Step 4: Remove `HOW_IT_WORKS_STEPS` from `HomePage.tsx`**

In `frontend/src/pages/HomePage.tsx`, remove this block (currently lines 80-88, right before the `LOGO_SYMBOLS` constant):

```tsx
/* ── How It Works steps (placeholder images — reusing pic1/pic2 until 5 real photos exist) ── */
const HOW_IT_WORKS_STEPS = [
  { label: 'Conversational Onboarding', image: pic1 },
  { label: 'Smart AI Matching', image: pic2 },
  { label: 'Pilih Kegiatan Personalmu', image: pic1 },
  { label: 'Beraksi & Beri Dampak', image: pic2 },
  { label: 'Track Your Impact', image: pic1 },
]

```

So the file goes directly from the `JOIN_SLIDES` array's closing `]` to the `LOGO_SYMBOLS` comment, with exactly one blank line between them (matching the spacing pattern used everywhere else between these constants).

- [ ] **Step 5: Remove the `howReveal`/`activeStep` state from `HomePage.tsx`**

In `frontend/src/pages/HomePage.tsx`, change (currently lines 264-271):

```tsx
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)
  const [pageLoaded, setPageLoaded] = useState(false)
  const featuresReveal = useRevealOnScroll(0.1)
  const joinReveal     = useRevealOnScroll(0.08)
  const aboutReveal    = useRevealOnScroll(0.1)
  const howReveal      = useRevealOnScroll(0.1)
  const [activeStep, setActiveStep] = useState(0)
```

to:

```tsx
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)
  const [pageLoaded, setPageLoaded] = useState(false)
  const featuresReveal = useRevealOnScroll(0.1)
  const joinReveal     = useRevealOnScroll(0.08)
  const aboutReveal    = useRevealOnScroll(0.1)
```

- [ ] **Step 6: Remove the `#cara-kerja` hash-scroll `useEffect` from `HomePage.tsx`**

In `frontend/src/pages/HomePage.tsx`, remove this block (currently lines 349-356, right after the `pageLoaded` timeout effect and right before the `statsRef` IntersectionObserver effect):

```tsx
  useEffect(() => {
    if (window.location.hash !== '#cara-kerja') return
    const t = setTimeout(() => {
      document.getElementById('cara-kerja')?.scrollIntoView({ behavior: 'smooth' })
    }, 120)
    return () => clearTimeout(t)
  }, [])

```

- [ ] **Step 7: Remove the "How It Works" section JSX from `HomePage.tsx`**

In `frontend/src/pages/HomePage.tsx`, find the boundary between the end of the "Tentang/About" section and the start of the "Symbols Carousel" section:

```tsx
              </p>
              <Link to="/tentang-kami" className="about__cta">More About Us..</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ How It Works ═══ */}
      <section
        id="cara-kerja"
        ref={howReveal.ref as React.RefObject<HTMLElement>}
        className={`how${howReveal.visible ? ' how--visible' : ''}`}
      >
        <img src={flowerDeco} alt="" className="how__deco how__deco--flower" aria-hidden="true" />

        <div className="how__inner">
          <div className="how__eyebrow-row">
            <span className="how__eyebrow">Cara Kerja ActiVibe</span>
            <span className="how__eyebrow-line" aria-hidden="true" />
          </div>

          <h2 className="how__title">
            Perjalanan volunteering yang terpersonalisasi,<br />
            dari pendaftaran hingga sertifikasi.
          </h2>

          <div className="how__grid">
            <div className="how__nav-wrap">
              <span className="how__counter" aria-hidden="true">
                {String(activeStep + 1).padStart(2, '0')}/{String(HOW_IT_WORKS_STEPS.length).padStart(2, '0')}
              </span>
              <span
                className="how__rail"
                aria-hidden="true"
                style={{ '--progress': `${Math.round(((activeStep + 1) / HOW_IT_WORKS_STEPS.length) * 100)}%` } as React.CSSProperties}
              />

              <ul className="how__nav">
                {HOW_IT_WORKS_STEPS.map(({ label }, i) => (
                  <li key={label}>
                    <button
                      type="button"
                      className={`how__nav-item${i === activeStep ? ' how__nav-item--active' : ''}`}
                      onClick={() => setActiveStep(i)}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="how__image-wrap">
              <img
                key={activeStep}
                src={HOW_IT_WORKS_STEPS[activeStep].image}
                alt={HOW_IT_WORKS_STEPS[activeStep].label}
                className="how__image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Symbols Carousel ═══ */}
```

Replace it with:

```tsx
              </p>
              <Link to="/tentang-kami" className="about__cta">More About Us..</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Symbols Carousel ═══ */}
```

(This removes the whole `.how` section. `flowerDeco`, `pic1`, and `pic2` imports stay in `HomePage.tsx` — they're still used elsewhere: `flowerDeco` by `.features__deco`, `pic1`/`pic2` by `JOIN_SLIDES` and other data arrays.)

- [ ] **Step 8: Remove the "How It Works Section" CSS block from `HomePage.css`**

In `frontend/src/pages/HomePage.css`, remove the entire block from the section header comment at line 1040 through its closing brace at line 1283 (everything between the end of the previous section's `@media (prefers-reduced-motion: reduce)` block and the `/* ════ Symbols Carousel Section... ════ */` comment that follows):

```css
/* ════════════════════════════
   How It Works Section  ("Cara Kerja ActiVibe")
   ════════════════════════════ */
.how {
  position: relative;
  overflow: hidden;
  background: var(--color-bg-true);
  padding: 80px 40px 96px;
}

.how__deco {
  position: absolute;
  pointer-events: none;
  user-select: none;
}

.how__deco--flower {
  left: -24px;
  bottom: 32px;
  width: 130px;
  opacity: 0.9;
  transform: rotate(-8deg);
}

.how__inner {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
}

/* eyebrow row */
.how__eyebrow-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.how__eyebrow {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-body);
  letter-spacing: 0.2px;
}

.how__eyebrow-line {
  display: inline-block;
  width: 48px;
  height: 1px;
  background: var(--color-border-medium);
}

/* heading */
.how__title {
  font-size: clamp(22px, 2.8vw, 32px);
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: -0.3px;
  max-width: 640px;
  margin: 0 0 48px;
}

/* two-column row: nav + image */
.how__grid {
  display: grid;
  grid-template-columns: minmax(260px, 380px) 1fr;
  gap: 56px;
  align-items: center;
}

/* nav column: counter + rail + list */
.how__nav-wrap {
  display: flex;
  align-items: stretch;
  gap: 18px;
}

.how__counter {
  flex-shrink: 0;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  letter-spacing: 0.5px;
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: center;
}

.how__rail {
  flex-shrink: 0;
  width: 2px;
  background: var(--color-border-medium);
  border-radius: 1px;
  position: relative;
  overflow: hidden;
}

/* ── Progress fill — height driven by --progress CSS variable from React ── */
.how__rail::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--progress, 0%);
  background: var(--color-accent-orange);
  border-radius: 1px;
  transition: height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.how__nav {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.how__nav-item {
  display: block;
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  border-radius: 8px;
  padding: 14px 20px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-body);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.how__nav-item:hover {

}

.how__nav-item--active {
  background: var(--color-accent-orange);
  color: var(--color-text-on-accent);

}

.how__nav-item--active:hover {
  background: var(--color-accent-orange);
}

/* image */
.how__image-wrap {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.how__image {
  width: 100%;
  height: 320px;
  object-fit: cover;
  display: block;
  animation: fadeInUp 0.4s ease both;
}

/* scroll-reveal */
.how__nav-wrap,
.how__image-wrap {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.how--visible .how__nav-wrap {
  opacity: 1;
  transform: translateY(0);
}

.how--visible .how__image-wrap {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.1s;
}

/* ── Tablet ── */
@media (max-width: 900px) {
  .how {
    padding: 64px 32px 72px;
  }

  .how__grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .how__image {
    height: 260px;
  }
}

/* ── Mobile ── */
@media (max-width: 600px) {
  .how {
    padding: 48px 20px 64px;
  }

  .how__title {
    margin-bottom: 32px;
  }

  .how__nav-item {
    padding: 12px 16px;
    font-size: 14px;
  }

  .how__image {
    height: 200px;
  }

  .how__deco--flower {
    width: 90px;
    left: -12px;
    bottom: 16px;
  }
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .how__nav-wrap,
  .how__image-wrap {
    transition: none;
    opacity: 1;
    transform: none;
  }

  .how__image {
    animation: none;
  }
}

```

`HomePage.css`'s own `@keyframes fadeInUp` (defined near the top of the file, for the page-load fade-in) stays — it's still used by other sections on the homepage.

- [ ] **Step 9: Type-check**

Run (from `frontend/`): `pnpm exec tsc -b --noEmit`
Expected: PASS — no output, exit code 0. This is the step that confirms `HOW_IT_WORKS_STEPS`, `howReveal`, and `activeStep` are fully gone from `HomePage.tsx` with no leftover references (any leftover reference fails as "cannot find name", since `tsconfig.app.json` has `noUnusedLocals`/`noUnusedParameters` enabled too — an unused import would also fail the build).

- [ ] **Step 10: Manual verification in browser**

Run: `cd frontend && pnpm dev` (skip if already running).

On `http://localhost:5173/cara-kerja`:
- Below the Overview cards, confirm a new section "Alur Volunteer" appears with a left rail showing 5 clickable step labels (Conversational Onboarding, Smart AI Matching, Pilih Kegiatan Personalmu, Beraksi & Beri Dampak, Track Your Impact), a counter like `01/05`, and an orange progress rail.
- Click each step label — confirm the image on the right changes, the description paragraph below it changes to that step's `desc` text, and the counter/progress update.

On `http://localhost:5173/` (homepage):
- Confirm the old "Cara Kerja ActiVibe" stepper section is gone entirely — the page goes straight from the "Tentang/About" section to the "Symbols Carousel" ("SATU LOGO. BANYAK MAKNA.") section.
- Open the browser console — confirm no errors (this would catch a leftover reference to a removed constant/state that somehow still type-checked, though that's not expected here).

- [ ] **Step 11: Commit** (only if running under subagent-driven-development; otherwise leave staged)

```bash
git add frontend/src/pages/CaraKerjaPage.tsx frontend/src/pages/CaraKerjaPage.css frontend/src/pages/HomePage.tsx frontend/src/pages/HomePage.css
git commit -m "feat(frontend): move Cara Kerja stepper from HomePage to /cara-kerja, add step descriptions"
```

---

### Task 3: Add the "Impact Passport" section

**Files:**
- Modify: `frontend/src/pages/CaraKerjaPage.tsx`
- Modify: `frontend/src/pages/CaraKerjaPage.css`

**Interfaces:**
- Consumes: `pic1` (already imported in this file as of Task 2) — reused as the illustrative mockup avatar.
- Produces: nothing further consumed by other tasks — this is the last content task for this page.

- [ ] **Step 1: Add `PASSPORT_FEATURES` and `PASSPORT_MOCKUP` data to `CaraKerjaPage.tsx`**

In `frontend/src/pages/CaraKerjaPage.tsx`, right after the `VOLUNTEER_FLOW_STEPS` array's closing `]` and before `export default function CaraKerjaPage`, add:

```tsx
const PASSPORT_FEATURES = [
  { title: 'Tagline AI Personal', desc: 'Headline unik dari AI berdasarkan total kontribusi dan dampak nyatamu — bukan template generik.' },
  { title: 'Statistik Dampak', desc: 'Total jam kontribusi, jumlah kegiatan selesai, jumlah NGO berbeda, dan metrik spesifik per event (mis. "240 bibit ditanam").' },
  { title: 'Skill Progress Tracker', desc: 'XP bar per skill yang naik otomatis setiap kali kamu menyelesaikan kegiatan terkait skill itu.' },
  { title: 'Timeline Kronologis', desc: 'Riwayat semua kegiatanmu berurutan waktu, lengkap dengan narasi dampak per event.' },
  { title: 'Share 1-Klik', desc: 'Bagikan ke IG Story, LinkedIn, atau WhatsApp — kontennya otomatis disesuaikan tone per platform oleh AI.' },
  { title: 'URL Publik', desc: 'Diakses tanpa login lewat activivibe.id/passport/{username} — siap dilampirkan ke CV atau portofolio beasiswa.' },
]

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

- [ ] **Step 2: Insert the Impact Passport section between the Flow section and the CTA**

In `frontend/src/pages/CaraKerjaPage.tsx`, find the boundary between the Flow section's closing `</section>` and the CTA section:

```tsx
        </div>
      </section>

      <section className="cara-kerja-page__cta">
```

Replace it with (inserting the new section in between):

```tsx
        </div>
      </section>

      <section className="cara-kerja-page__passport">
        <div className="cara-kerja-page__passport-inner">
          <div className="cara-kerja-page__passport-header">
            <p className="cara-kerja-page__passport-eyebrow">Fitur Andalan</p>
            <h2 className="cara-kerja-page__passport-title">
              Impact Passport — portofolio dampakmu, siap dibagikan kapan saja.
            </h2>
            <p className="cara-kerja-page__passport-desc">
              Setiap kontribusi yang kamu beri lewat ActiVibe tidak berhenti jadi kenangan. Semuanya
              terkumpul otomatis jadi satu halaman portofolio publik yang bisa kamu lampirkan ke CV,
              bagikan ke media sosial, atau tunjukkan ke kampus dan lembaga beasiswa — tanpa perlu
              login untuk membukanya.
            </p>
          </div>

          <div className="cara-kerja-page__passport-body">
            <ul className="cara-kerja-page__passport-features">
              {PASSPORT_FEATURES.map((feature) => (
                <li key={feature.title} className="cara-kerja-page__passport-feature">
                  <h3 className="cara-kerja-page__passport-feature-title">{feature.title}</h3>
                  <p className="cara-kerja-page__passport-feature-desc">{feature.desc}</p>
                </li>
              ))}
            </ul>

            <div className="cara-kerja-page__passport-mockup">
              <span className="cara-kerja-page__passport-mockup-tag">Contoh ilustrasi</span>
              <img
                src={PASSPORT_MOCKUP.avatar}
                alt={PASSPORT_MOCKUP.name}
                className="cara-kerja-page__passport-mockup-avatar"
              />
              <p className="cara-kerja-page__passport-mockup-name">{PASSPORT_MOCKUP.name}</p>
              <p className="cara-kerja-page__passport-mockup-tagline">{PASSPORT_MOCKUP.tagline}</p>

              <div className="cara-kerja-page__passport-mockup-stats">
                {PASSPORT_MOCKUP.stats.map((stat) => (
                  <div key={stat.label} className="cara-kerja-page__passport-mockup-stat">
                    <span className="cara-kerja-page__passport-mockup-stat-value">{stat.value}</span>
                    <span className="cara-kerja-page__passport-mockup-stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>

              <div className="cara-kerja-page__passport-mockup-skills">
                {PASSPORT_MOCKUP.skills.map((skill) => (
                  <div key={skill.label} className="cara-kerja-page__passport-mockup-skill">
                    <div className="cara-kerja-page__passport-mockup-skill-row">
                      <span>{skill.label}</span>
                      <span>{skill.xp} XP</span>
                    </div>
                    <div className="cara-kerja-page__passport-mockup-skill-bar">
                      <div
                        className="cara-kerja-page__passport-mockup-skill-fill"
                        style={{ width: `${skill.xp}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cara-kerja-page__cta">
```

- [ ] **Step 3: Append Impact Passport styles to `CaraKerjaPage.css`**

Add to the end of `frontend/src/pages/CaraKerjaPage.css`:

```css
/* ── Impact Passport ── */
.cara-kerja-page__passport {
  background: var(--color-bg-true);
  padding: 64px 40px 88px;
}

.cara-kerja-page__passport-inner {
  max-width: 1100px;
  margin: 0 auto;
}

.cara-kerja-page__passport-header {
  text-align: center;
  max-width: 720px;
  margin: 0 auto 48px;
}

.cara-kerja-page__passport-eyebrow {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--color-primary);
  text-transform: uppercase;
  margin: 0 0 12px;
}

.cara-kerja-page__passport-title {
  font-size: clamp(22px, 3vw, 32px);
  color: var(--color-text-heading);
  margin: 0 0 16px;
}

.cara-kerja-page__passport-desc {
  font-size: 15px;
  line-height: 1.75;
  color: var(--color-text-body);
  margin: 0;
}

.cara-kerja-page__passport-body {
  display: grid;
  grid-template-columns: 1fr minmax(280px, 360px);
  gap: 48px;
  align-items: start;
}

.cara-kerja-page__passport-features {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.cara-kerja-page__passport-feature-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text-heading);
  margin: 0 0 6px;
}

.cara-kerja-page__passport-feature-desc {
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--color-text-body);
  margin: 0;
}

.cara-kerja-page__passport-mockup {
  position: relative;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-light);
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
}

.cara-kerja-page__passport-mockup-tag {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: var(--color-text-muted);
  background: var(--color-bg-true);
  border: 1px solid var(--color-border-light);
  padding: 4px 10px;
  border-radius: 999px;
}

.cara-kerja-page__passport-mockup-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 12px;
  display: block;
}

.cara-kerja-page__passport-mockup-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-heading);
  margin: 0 0 8px;
}

.cara-kerja-page__passport-mockup-tagline {
  font-size: 13px;
  font-style: italic;
  line-height: 1.6;
  color: var(--color-text-body);
  margin: 0 0 24px;
}

.cara-kerja-page__passport-mockup-stats {
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
  border-top: 1px solid var(--color-border-light);
  border-bottom: 1px solid var(--color-border-light);
  margin-bottom: 24px;
}

.cara-kerja-page__passport-mockup-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cara-kerja-page__passport-mockup-stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-primary);
}

.cara-kerja-page__passport-mockup-stat-label {
  font-size: 11px;
  color: var(--color-text-muted);
}

.cara-kerja-page__passport-mockup-skills {
  display: flex;
  flex-direction: column;
  gap: 14px;
  text-align: left;
}

.cara-kerja-page__passport-mockup-skill-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-body);
  margin-bottom: 4px;
}

.cara-kerja-page__passport-mockup-skill-bar {
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: var(--color-border-light);
  overflow: hidden;
}

.cara-kerja-page__passport-mockup-skill-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--color-primary);
}

@media (max-width: 900px) {
  .cara-kerja-page__passport-body {
    grid-template-columns: 1fr;
  }

  .cara-kerja-page__passport-features {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .cara-kerja-page__passport {
    padding: 48px 20px 64px;
  }
}
```

- [ ] **Step 4: Type-check**

Run (from `frontend/`): `pnpm exec tsc -b --noEmit`
Expected: PASS — no output, exit code 0.

- [ ] **Step 5: Manual verification in browser**

Run: `cd frontend && pnpm dev` (skip if already running), open `http://localhost:5173/cara-kerja`.

Between the "Alur Volunteer" stepper and the closing purple CTA band, confirm:
- A section titled "Impact Passport — portofolio dampakmu, siap dibagikan kapan saja." with the intro paragraph above it.
- A 2-column grid of 6 feature cards (Tagline AI Personal, Statistik Dampak, Skill Progress Tracker, Timeline Kronologis, Share 1-Klik, URL Publik), each with a title and description.
- Next to the feature grid, a mockup card labeled "Contoh ilustrasi" in its top-right corner, showing a circular avatar, the name "Abiem Nugroho", an italic tagline about mangrove planting, 3 stat numbers (86 / 12 / 5), and 2 skill bars (Lingkungan ~80% filled, Pendidikan ~45% filled).
- Resize the browser to a narrow width (or use dev tools mobile view) — confirm the feature grid collapses to 1 column and the mockup card stacks below it instead of beside it.

- [ ] **Step 6: Commit** (only if running under subagent-driven-development; otherwise leave staged)

```bash
git add frontend/src/pages/CaraKerjaPage.tsx frontend/src/pages/CaraKerjaPage.css
git commit -m "feat(frontend): add Impact Passport explainer section to /cara-kerja"
```
