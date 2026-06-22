# "Tentang Kami" About Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a routed `/tentang-kami` About page for ActiVibe explaining the company's journey, introducing `react-router-dom` to the project for the first time.

**Architecture:** `App.tsx` gains a `<BrowserRouter>` wrapping a new `frontend/src/routes/AppRoutes.tsx` (the pre-planned, currently-empty `routes/` folder). `Navbar` and `AuthModal` stay outside `<Routes>` so they persist across pages. `AboutPage.tsx` is built incrementally, one content section per task, reusing the visual patterns already established in `HomePage.tsx`/`docs/design.md` under a new `.about-page__` BEM prefix (never reusing `HomePage.css` class names verbatim — both stylesheets are bundled globally regardless of route, so identical class names would collide).

**Tech Stack:** React 19, TypeScript (strict — `noUnusedLocals`/`noUnusedParameters` are **on**, see Global Constraints), Vite 8, `react-router-dom` ^7.18, plain CSS (no modules/Tailwind).

**Spec:** `docs/superpowers/specs/2026-06-22-about-page-design.md`

## Global Constraints

- No hardcoded hex colors — every color goes through a `var(--token-name)` from `docs/design.md` §1 (already loaded globally via `frontend/src/index.css`).
- Heading font is `var(--font-display)` (Itim), body/button/label font is `var(--font-body)` (Poppins) — both already the default for `h1`-`h6` and `body/p/button/input/label` respectively via `index.css`, so plain elements need no extra font-family rule.
- `tsconfig.app.json` has `"noUnusedLocals": true` and `"noUnusedParameters": true` — an unused prop, import, or variable fails `pnpm build` (this exact mistake broke the build once before in this repo, see `docs/perubahan-byGemini.md` Sesi 3). **Never add a prop/param before the same task also uses it.**
- This project has **no automated test runner** (no Jest/Vitest in `frontend/package.json`). Verification is: `pnpm build` (type-check via `tsc -b` + bundle via `vite build`) for every task, plus a Playwright screenshot/console-check for tasks that change rendered UI — same approach already used successfully earlier in this project for `AuthModal`.
- **Commit policy (confirmed with user 2026-06-22):** when this plan is executed via `superpowers:subagent-driven-development`, each task's implementer subagent DOES commit its own work locally at the end of the task (needed for the reviewer's diff). `git push` is never allowed, in any mode. If this plan is instead executed in the main session directly (no subagents), do not commit — leave the working tree for the user, per `CLAUDE.md`'s "Git Commit & Push" section.
- Reuse existing assets only (`frontend/src/assets/svg/*`, already-imported `Footer`/`useRevealOnScroll`-style hooks) — do not add new SVGs/images without asking the user first.

### Playwright verification helper (used by every UI task)

The dev server is started once and left running for the whole plan:

```bash
cd "d:\smester-4\tubes\ActiVIbe\frontend" && pnpm dev > /tmp/vite-dev.log 2>&1 &
echo $! > /tmp/vite-dev.pid
timeout 30 bash -c 'until curl -sf http://localhost:5173 >/dev/null; do sleep 1; done'
```

Playwright (Chromium) is already cached on this machine from earlier work in this project — no install needed. Scripts import it via its cached npx path:

```js
import('file:///C:/Users/rakha/AppData/Local/npm-cache/_npx/48b1ca104c3549f4/node_modules/playwright/index.mjs')
```

If that exact path is gone in a fresh environment, run `npx --no-install playwright --version` to confirm it's cached, find the real path with `find "$(npm config get cache)/_npx" -iname playwright -maxdepth 4`, and substitute it. If Playwright isn't cached at all, run `npx playwright install chromium` once first.

---

### Task 1: Routing skeleton + minimal AboutPage (Hero + Footer)

**Files:**
- Modify: `frontend/package.json` (add `react-router-dom` dependency)
- Create: `frontend/src/routes/AppRoutes.tsx`
- Modify: `frontend/src/App.tsx`
- Create: `frontend/src/pages/AboutPage.tsx`
- Create: `frontend/src/pages/AboutPage.css`
- Modify: `frontend/src/components/Navbar.tsx`
- Modify: `frontend/src/pages/HomePage.tsx`

**Interfaces:**
- Produces: `AboutPage` component (no props yet — props are added in Task 6 when first used), default-exported from `frontend/src/pages/AboutPage.tsx`.
- Produces: `AppRoutes` component (no props yet), default-exported from `frontend/src/routes/AppRoutes.tsx`, rendering `<Route path="/" element={<HomePage />} />` and `<Route path="/tentang-kami" element={<AboutPage />} />`.

- [ ] **Step 1: Install react-router-dom**

```bash
cd "d:\smester-4\tubes\ActiVIbe\frontend" && pnpm add react-router-dom
```

Expected: `frontend/package.json` `dependencies` gains `"react-router-dom": "^7.18.0"` (or newer patch), `pnpm-lock.yaml` updates.

- [ ] **Step 2: Create the routes file**

Create `frontend/src/routes/AppRoutes.tsx`:

```tsx
import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import AboutPage from '../pages/AboutPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tentang-kami" element={<AboutPage />} />
    </Routes>
  )
}
```

- [ ] **Step 3: Create the minimal AboutPage (Hero only)**

Create `frontend/src/pages/AboutPage.css`:

```css
/* ── Hero ── */
.about-page__hero {
  position: relative;
  margin-top: 72px;
  padding: 96px 40px 0;
  text-align: center;
  overflow: hidden;
}

.about-page__hero-eyebrow {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--color-primary);
  text-transform: uppercase;
  margin: 0 0 12px;
}

.about-page__hero-title {
  font-size: clamp(28px, 4vw, 44px);
  margin: 0 auto 20px;
  max-width: 720px;
}

.about-page__hero-desc {
  font-size: 16px;
  line-height: 1.75;
  color: var(--color-text-body);
  max-width: 620px;
  margin: 0 auto 48px;
}

.about-page__hero-wave {
  display: block;
  width: 100%;
  height: auto;
}

@media (max-width: 600px) {
  .about-page__hero {
    padding: 72px 20px 0;
  }
}
```

Create `frontend/src/pages/AboutPage.tsx`:

```tsx
import wave from '../assets/svg/wave.svg'
import Footer from '../components/Footer'
import './AboutPage.css'

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-page__hero">
        <p className="about-page__hero-eyebrow">Tentang ActiVibe</p>
        <h1 className="about-page__hero-title">Perjalanan Kami Membangun ActiVibe</h1>
        <p className="about-page__hero-desc">
          ActiVibe lahir dari satu pertanyaan sederhana: kenapa masih sulit menemukan kegiatan
          volunteer yang benar-benar cocok dengan minat dan kemampuan kita? Ini cerita tentang
          bagaimana kami mencoba menjawabnya.
        </p>
        <img src={wave} alt="" className="about-page__hero-wave" aria-hidden="true" />
      </section>

      <Footer />
    </main>
  )
}
```

- [ ] **Step 4: Wire App.tsx to use the router**

Read current `frontend/src/App.tsx` first to confirm it still matches (it was last touched in the AuthModal work this session):

```tsx
import { useState } from 'react'
import Navbar from './components/Navbar'
import AuthModal, { type AuthMode } from './components/AuthModal'
import HomePage from './pages/HomePage'

function App() {
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)

  return (
    <>
      <Navbar
        onLoginClick={() => setAuthMode('login')}
        onSignupClick={() => setAuthMode('signup')}
      />
      <HomePage />

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onModeChange={setAuthMode}
        />
      )}
    </>
  )
}

export default App
```

Replace its entire contents with:

```tsx
import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import Navbar from './components/Navbar'
import AuthModal, { type AuthMode } from './components/AuthModal'
import AppRoutes from './routes/AppRoutes'

function App() {
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)

  return (
    <BrowserRouter>
      <Navbar
        onLoginClick={() => setAuthMode('login')}
        onSignupClick={() => setAuthMode('signup')}
      />
      <AppRoutes />

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onModeChange={setAuthMode}
        />
      )}
    </BrowserRouter>
  )
}

export default App
```

- [ ] **Step 5: Point Navbar's "Tentang Kami" link and logo at real routes**

In `frontend/src/components/Navbar.tsx`, change the import line:

```tsx
import { useState, useEffect } from 'react'
import logo from '../assets/svg/logo.svg'
import './Navbar.css'
```

to:

```tsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/svg/logo.svg'
import './Navbar.css'
```

Change the `NAV_LINKS` array from:

```tsx
const NAV_LINKS = [
  { label: 'Cari Aktivitas', href: '#' },
  { label: 'Cari Organisasi', href: '#' },
  { label: 'Cara Kerja', href: '#' },
  { label: 'Tentang Kami', href: '#' },
]
```

to:

```tsx
const NAV_LINKS = [
  { label: 'Cari Aktivitas', href: '#' },
  { label: 'Cari Organisasi', href: '#' },
  { label: 'Cara Kerja', href: '#' },
  { label: 'Tentang Kami', href: '#', to: '/tentang-kami' },
]
```

Change the logo anchor from:

```tsx
        <a href="/" className="navbar__logo">
          <img src={logo} alt="ActiVibe" height="44" />
        </a>
```

to:

```tsx
        <Link to="/" className="navbar__logo">
          <img src={logo} alt="ActiVibe" height="44" />
        </Link>
```

Change the desktop nav render from:

```tsx
        <nav className="navbar__links">
          {NAV_LINKS.map(({ label, href }) => (
            <a key={label} href={href} className="navbar__link">
              {label}
            </a>
          ))}
        </nav>
```

to:

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

Change the mobile nav render from:

```tsx
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="navbar__mobile-link"
                onClick={closeMenu}
              >
                {label}
              </a>
            ))}
```

to:

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

- [ ] **Step 6: Point HomePage's "More About Us.." CTA at the real route**

In `frontend/src/pages/HomePage.tsx`, add to the top import block (it currently starts with `import { useState, useEffect, useRef } from 'react'`):

```tsx
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
```

Find this line inside the About section:

```tsx
              <a href="#" className="about__cta">More About Us..</a>
```

Replace it with:

```tsx
              <Link to="/tentang-kami" className="about__cta">More About Us..</Link>
```

- [ ] **Step 7: Verify build passes**

```bash
cd "d:\smester-4\tubes\ActiVIbe\frontend" && pnpm build
```

Expected: exits 0, no TypeScript errors (this is the step that would catch an unused import/prop or a typo in `to`/`href`).

- [ ] **Step 8: Verify routing works in the browser**

Start the dev server per the helper above, then run:

```bash
cd "d:\smester-4\tubes\ActiVIbe\frontend" && node -e "
import('file:///C:/Users/rakha/AppData/Local/npm-cache/_npx/48b1ca104c3549f4/node_modules/playwright/index.mjs').then(async ({ chromium }) => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push(String(e)))

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
  await page.click('text=Tentang Kami')
  await page.waitForSelector('.about-page__hero-title')
  console.log('URL_AFTER_NAV_CLICK:', page.url())

  await page.goto('http://localhost:5173')
  await page.click('text=More About Us..')
  await page.waitForSelector('.about-page__hero-title')
  console.log('URL_AFTER_CTA_CLICK:', page.url())

  console.log('CONSOLE_ERRORS:', JSON.stringify(errors))
  await browser.close()
})
"
```

Expected: both `URL_AFTER_*` lines end with `/tentang-kami`, `CONSOLE_ERRORS: []`.

- [ ] **Step 9: Commit**

```bash
cd "d:\smester-4\tubes\ActiVIbe" && git add frontend/package.json frontend/pnpm-lock.yaml frontend/src/routes/AppRoutes.tsx frontend/src/App.tsx frontend/src/pages/AboutPage.tsx frontend/src/pages/AboutPage.css frontend/src/components/Navbar.tsx frontend/src/pages/HomePage.tsx
git commit -m "Add routing skeleton and minimal AboutPage (hero + footer)"
```

No `git push`.

---

### Task 2: Extract `useRevealOnScroll` hook + add "Cerita Kami" section

**Files:**
- Create: `frontend/src/hooks/useRevealOnScroll.ts`
- Modify: `frontend/src/pages/HomePage.tsx` (remove local copy, import the extracted one)
- Modify: `frontend/src/pages/AboutPage.tsx`
- Modify: `frontend/src/pages/AboutPage.css`

**Interfaces:**
- Consumes: nothing new from Task 1.
- Produces: `useRevealOnScroll(threshold?: number): { ref: RefObject<HTMLElement>, visible: boolean }`, exported from `frontend/src/hooks/useRevealOnScroll.ts`. Both `HomePage.tsx` and `AboutPage.tsx` import it from there from now on.

- [ ] **Step 1: Extract the hook**

Create `frontend/src/hooks/useRevealOnScroll.ts`:

```ts
import { useEffect, useRef, useState } from 'react'

export function useRevealOnScroll(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return { ref, visible }
}
```

- [ ] **Step 2: Remove the local copy from HomePage.tsx and import the shared one**

In `frontend/src/pages/HomePage.tsx`, find:

```tsx
function useRevealOnScroll(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return { ref, visible }
}
```

Delete that whole function declaration. Then add an import for the extracted version — find:

```tsx
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
```

and change it to:

```tsx
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll'
```

- [ ] **Step 3: Verify HomePage still builds and renders after the extraction**

```bash
cd "d:\smester-4\tubes\ActiVIbe\frontend" && pnpm build
```

Expected: exits 0. (`useRef` import in `HomePage.tsx` stays used elsewhere — e.g. `statsRef`, carousel refs — so it won't become an unused import.)

- [ ] **Step 4: Add "Cerita Kami" section to AboutPage**

Append to `frontend/src/pages/AboutPage.css`:

```css
/* ── Cerita Kami ── */
.about-page__story {
  position: relative;
  overflow: hidden;
  background: var(--color-bg-true);
  padding: 64px 40px 88px;
}

.about-page__story-title {
  position: relative;
  display: inline-block;
  font-size: clamp(24px, 3vw, 34px);
  margin: 0 0 16px;
}

.about-page__story-title::after {
  content: '';
  position: absolute;
  left: 2px;
  bottom: -8px;
  width: calc(100% - 4px);
  height: 4px;
  border-radius: 2px;
  background: var(--color-accent-yellow);
}

.about-page__story-grid {
  display: grid;
  grid-template-columns: minmax(220px, 340px) 1fr;
  gap: 56px;
  align-items: center;
  margin-top: 56px;
  max-width: 1200px;
  margin-inline: auto;
}

.about-page__story-illustration-wrap {
  opacity: 0;
  transform: translateX(-32px);
  transition: opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.1s,
    transform 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.1s;
}

.about-page__story--visible .about-page__story-illustration-wrap {
  opacity: 1;
  transform: translateX(0);
}

.about-page__story-illustration {
  width: 100%;
  display: block;
}

.about-page__story-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
  opacity: 0;
  transform: translateX(32px);
  transition: opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.2s,
    transform 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.2s;
}

.about-page__story--visible .about-page__story-content {
  opacity: 1;
  transform: translateX(0);
}

.about-page__story-desc {
  font-size: 15px;
  line-height: 1.75;
  color: var(--color-text-body);
  margin: 0;
}

@media (max-width: 900px) {
  .about-page__story-grid {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .about-page__story-illustration-wrap {
    max-width: 280px;
    margin-inline: auto;
  }
}
```

In `frontend/src/pages/AboutPage.tsx`, change the imports from:

```tsx
import wave from '../assets/svg/wave.svg'
import Footer from '../components/Footer'
import './AboutPage.css'
```

to:

```tsx
import wave from '../assets/svg/wave.svg'
import storyIllustration from '../assets/svg/logo-utama.svg'
import Footer from '../components/Footer'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll'
import './AboutPage.css'
```

Add the hook call and section inside the component — change:

```tsx
export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-page__hero">
        <p className="about-page__hero-eyebrow">Tentang ActiVibe</p>
        <h1 className="about-page__hero-title">Perjalanan Kami Membangun ActiVibe</h1>
        <p className="about-page__hero-desc">
          ActiVibe lahir dari satu pertanyaan sederhana: kenapa masih sulit menemukan kegiatan
          volunteer yang benar-benar cocok dengan minat dan kemampuan kita? Ini cerita tentang
          bagaimana kami mencoba menjawabnya.
        </p>
        <img src={wave} alt="" className="about-page__hero-wave" aria-hidden="true" />
      </section>

      <Footer />
    </main>
  )
}
```

to:

```tsx
export default function AboutPage() {
  const storyReveal = useRevealOnScroll(0.1)

  return (
    <main className="about-page">
      <section className="about-page__hero">
        <p className="about-page__hero-eyebrow">Tentang ActiVibe</p>
        <h1 className="about-page__hero-title">Perjalanan Kami Membangun ActiVibe</h1>
        <p className="about-page__hero-desc">
          ActiVibe lahir dari satu pertanyaan sederhana: kenapa masih sulit menemukan kegiatan
          volunteer yang benar-benar cocok dengan minat dan kemampuan kita? Ini cerita tentang
          bagaimana kami mencoba menjawabnya.
        </p>
        <img src={wave} alt="" className="about-page__hero-wave" aria-hidden="true" />
      </section>

      <section
        ref={storyReveal.ref as React.RefObject<HTMLElement>}
        className={`about-page__story${storyReveal.visible ? ' about-page__story--visible' : ''}`}
      >
        <div className="about-page__story-grid">
          <div className="about-page__story-illustration-wrap">
            <img
              src={storyIllustration}
              alt="Ilustrasi komunitas ActiVibe"
              className="about-page__story-illustration"
            />
          </div>

          <div className="about-page__story-content">
            <h2 className="about-page__story-title">Cerita Kami</h2>
            <p className="about-page__story-desc">
              Di Indonesia, partisipasi sosial masyarakatnya tinggi — tapi sebagian besar kegiatan
              volunteer masih dicari secara manual, tanpa rekomendasi yang benar-benar memahami
              minat dan skill masing-masing orang. Akibatnya, tingkat ketidaksesuaian antara
              volunteer dan kegiatan yang mereka ikuti diperkirakan mencapai 40–60%. Banyak yang
              berhenti setelah satu kali coba, dan organisasi kesulitan menjaring volunteer yang
              benar-benar relevan.
            </p>
            <p className="about-page__story-desc">
              Dari situ, tim kami — Saw iT — mulai merancang ActiVibe: platform volunteer yang
              menggunakan AI untuk mencocokkan minat, skill, dan jadwal seseorang dengan kegiatan
              yang paling sesuai untuk mereka. Bukan sekadar daftar kegiatan, tapi pengalaman
              volunteering yang personal, terukur, dan punya jejak dampak yang bisa dibanggakan
              lewat Impact Passport.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
```

- [ ] **Step 5: Verify build**

```bash
cd "d:\smester-4\tubes\ActiVIbe\frontend" && pnpm build
```

Expected: exits 0.

- [ ] **Step 6: Verify visually**

Dev server should still be running from Task 1 (if not, restart per the helper). Then:

```bash
cd "d:\smester-4\tubes\ActiVIbe\frontend" && node -e "
import('file:///C:/Users/rakha/AppData/Local/npm-cache/_npx/48b1ca104c3549f4/node_modules/playwright/index.mjs').then(async ({ chromium }) => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push(String(e)))
  await page.goto('http://localhost:5173/tentang-kami', { waitUntil: 'networkidle' })
  await page.locator('.about-page__story').scrollIntoViewIfNeeded()
  await page.waitForSelector('.about-page__story--visible')
  await page.screenshot({ path: 'd:/tmp/about-story.png', fullPage: false })
  console.log('CONSOLE_ERRORS:', JSON.stringify(errors))
  await browser.close()
})
"
```

Expected: `CONSOLE_ERRORS: []`, no thrown error from the `waitForSelector` (confirms the scroll-reveal class toggles). Read `d:/tmp/about-story.png` to confirm the illustration + two paragraphs render side by side, then delete it.

- [ ] **Step 7: Commit**

```bash
cd "d:\smester-4\tubes\ActiVIbe" && git add frontend/src/hooks/useRevealOnScroll.ts frontend/src/pages/HomePage.tsx frontend/src/pages/AboutPage.tsx frontend/src/pages/AboutPage.css
git commit -m "Extract useRevealOnScroll hook, add About page Cerita Kami section"
```

No `git push`.

---

### Task 3: Add "Timeline Perjalanan" section

**Files:**
- Modify: `frontend/src/pages/AboutPage.tsx`
- Modify: `frontend/src/pages/AboutPage.css`

**Interfaces:**
- Consumes: `useRevealOnScroll` from Task 2.
- Produces: nothing new consumed by later tasks (static content section).

- [ ] **Step 1: Append CSS**

Append to `frontend/src/pages/AboutPage.css`:

```css
/* ── Timeline Perjalanan ── */
.about-page__timeline {
  background: var(--color-bg-true);
  padding: 32px 40px 88px;
}

.about-page__timeline-inner {
  max-width: 760px;
  margin: 0 auto;
}

.about-page__timeline-eyebrow {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  margin: 0 0 12px;
  text-align: center;
}

.about-page__timeline-title {
  font-size: clamp(22px, 3vw, 32px);
  text-align: center;
  margin: 0 0 48px;
}

.about-page__timeline-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.about-page__timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 18px;
}

.about-page__timeline-rail {
  flex-shrink: 0;
  width: 2px;
  align-self: stretch;
  background: var(--color-border-medium);
  border-radius: 1px;
}

.about-page__timeline-item:last-child .about-page__timeline-rail {
  background: transparent;
}

.about-page__timeline-body {
  padding-bottom: 8px;
}

.about-page__timeline-label {
  display: inline-block;
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-body);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-light);
  padding: 6px 16px;
  border-radius: 999px;
  margin-bottom: 8px;
}

.about-page__timeline-item--active .about-page__timeline-label {
  background: var(--color-accent-orange);
  color: var(--color-text-on-accent);
  border-color: var(--color-accent-orange);
}

.about-page__timeline-desc {
  font-size: 14.5px;
  line-height: 1.7;
  color: var(--color-text-body);
  margin: 0;
  max-width: 560px;
}

@media (max-width: 600px) {
  .about-page__timeline {
    padding: 24px 20px 64px;
  }
}
```

- [ ] **Step 2: Add the section to AboutPage.tsx**

Add a data constant above the component — find the import block (now ending with `import './AboutPage.css'`) and add the constant right after the imports:

```tsx
const TIMELINE = [
  {
    label: 'Riset & Insight',
    desc: 'Mengamati langsung masalah mismatch volunteer di lapangan, mengumpulkan data dan feedback dari calon volunteer maupun organisasi penyelenggara.',
  },
  {
    label: 'Ide ActiVibe Lahir',
    desc: 'Tim Saw iT merancang konsep platform matching berbasis AI sebagai jawaban atas masalah yang ditemukan.',
  },
  {
    label: 'Penyusunan PRD & Design System',
    desc: 'Menyusun dokumen produk lengkap (problem statement hingga FR-027) dan sistem desain yang konsisten di seluruh platform.',
  },
  {
    label: 'MVP Landing Page',
    desc: 'Landing page, autentikasi, dan fondasi desain ActiVibe yang sedang kamu lihat ini.',
    active: true,
  },
  {
    label: 'Next: Peluncuran Beta',
    desc: 'Conversational Onboarding, Smart AI Matching, dan Impact Passport masuk ke tahap pengembangan penuh.',
  },
] as const
```

Insert the new section in the JSX, right after the `</section>` that closes the "Cerita Kami" section and before `<Footer />`:

```tsx
      <section className="about-page__timeline">
        <div className="about-page__timeline-inner">
          <p className="about-page__timeline-eyebrow">Timeline Perjalanan</p>
          <h2 className="about-page__timeline-title">Dari Ide Sampai ke Sini</h2>

          <div className="about-page__timeline-list">
            {TIMELINE.map(({ label, desc, active }) => (
              <div
                key={label}
                className={`about-page__timeline-item${active ? ' about-page__timeline-item--active' : ''}`}
              >
                <span className="about-page__timeline-rail" aria-hidden="true" />
                <div className="about-page__timeline-body">
                  <span className="about-page__timeline-label">{label}</span>
                  <p className="about-page__timeline-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
```

(Remove the old standalone `<Footer />` line that was there before — there must be exactly one `<Footer />` at the end.)

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
  const page = await browser.newPage({ viewport: { width: 1280, height: 1400 } })
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push(String(e)))
  await page.goto('http://localhost:5173/tentang-kami', { waitUntil: 'networkidle' })
  await page.waitForSelector('.about-page__timeline-item--active')
  await page.screenshot({ path: 'd:/tmp/about-timeline.png' })
  console.log('CONSOLE_ERRORS:', JSON.stringify(errors))
  await browser.close()
})
"
```

Expected: `CONSOLE_ERRORS: []`. Read `d:/tmp/about-timeline.png`, confirm 5 timeline items render with the 4th one highlighted orange, then delete the screenshot.

- [ ] **Step 5: Commit**

```bash
cd "d:\smester-4\tubes\ActiVIbe" && git add frontend/src/pages/AboutPage.tsx frontend/src/pages/AboutPage.css
git commit -m "Add About page Timeline Perjalanan section"
```

No `git push`.

---

### Task 4: Add "Visi & Misi" section

**Files:**
- Modify: `frontend/src/pages/AboutPage.tsx`
- Modify: `frontend/src/pages/AboutPage.css`

- [ ] **Step 1: Append CSS**

Append to `frontend/src/pages/AboutPage.css`:

```css
/* ── Visi & Misi ── */
.about-page__vision {
  background: var(--color-primary-soft);
  padding: 64px 40px;
}

.about-page__vision-inner {
  max-width: 1100px;
  margin: 0 auto;
  text-align: center;
}

.about-page__vision-eyebrow {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--color-primary);
  text-transform: uppercase;
  margin: 0 0 12px;
}

.about-page__vision-statement {
  font-size: clamp(22px, 3vw, 30px);
  color: var(--color-text-heading);
  max-width: 760px;
  margin: 0 auto 48px;
}

.about-page__mission-grid {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  justify-content: center;
}

.about-page__mission-item {
  flex: 1;
  min-width: 220px;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.about-page__mission-badge {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-bg-true);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 22px;
  color: var(--color-primary);
  box-shadow: 0 0 0 6px var(--color-accent-yellow-soft);
}

.about-page__mission-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-heading);
  margin: 0;
}

.about-page__mission-desc {
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--color-text-body);
  margin: 0;
}

@media (max-width: 700px) {
  .about-page__vision {
    padding: 48px 24px;
  }

  .about-page__mission-grid {
    flex-direction: column;
    align-items: center;
  }
}
```

- [ ] **Step 2: Add the section to AboutPage.tsx**

Add a second data constant right after `TIMELINE`:

```tsx
const MISSION_POINTS = [
  {
    icon: '01',
    title: 'Memudahkan Pencarian',
    desc: 'Mengurangi proses coba-coba lewat rekomendasi kegiatan yang relevan dengan minat dan kemampuan setiap volunteer.',
  },
  {
    icon: '02',
    title: 'Mendukung Organisasi',
    desc: 'Membantu NGO dan komunitas menjangkau volunteer yang tepat, lebih cepat, dan lebih efisien dari proses manual.',
  },
  {
    icon: '03',
    title: 'Transparansi Dampak',
    desc: 'Mencatat setiap kontribusi volunteer lewat Impact Passport digital yang bisa dibagikan dan dibanggakan.',
  },
] as const
```

Insert the new section right after the Timeline `</section>` and before `<Footer />`:

```tsx
      <section className="about-page__vision">
        <div className="about-page__vision-inner">
          <p className="about-page__vision-eyebrow">Visi & Misi</p>
          <h2 className="about-page__vision-statement">
            Menjadi platform volunteer paling terpercaya di Indonesia, tempat setiap orang bisa
            menemukan kegiatan sosial yang benar-benar sesuai dengan minat dan potensinya.
          </h2>

          <div className="about-page__mission-grid">
            {MISSION_POINTS.map(({ icon, title, desc }) => (
              <div key={title} className="about-page__mission-item">
                <span className="about-page__mission-badge" aria-hidden="true">{icon}</span>
                <h3 className="about-page__mission-title">{title}</h3>
                <p className="about-page__mission-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
```

(Again, remove the now-duplicate older `<Footer />` line so there's exactly one at the end.)

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
  const page = await browser.newPage({ viewport: { width: 1280, height: 1800 } })
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push(String(e)))
  await page.goto('http://localhost:5173/tentang-kami', { waitUntil: 'networkidle' })
  await page.waitForSelector('.about-page__mission-item')
  await page.screenshot({ path: 'd:/tmp/about-vision.png' })
  console.log('CONSOLE_ERRORS:', JSON.stringify(errors))
  await browser.close()
})
"
```

Expected: `CONSOLE_ERRORS: []`. Read `d:/tmp/about-vision.png`, confirm vision statement + 3 mission cards render, then delete the screenshot.

- [ ] **Step 5: Commit**

```bash
cd "d:\smester-4\tubes\ActiVIbe" && git add frontend/src/pages/AboutPage.tsx frontend/src/pages/AboutPage.css
git commit -m "Add About page Visi & Misi section"
```

No `git push`.

---

### Task 5: Add "Tim Kami" section

**Files:**
- Modify: `frontend/src/pages/AboutPage.tsx`
- Modify: `frontend/src/pages/AboutPage.css`

- [ ] **Step 1: Append CSS**

Append to `frontend/src/pages/AboutPage.css`:

```css
/* ── Tim Kami ── */
.about-page__team {
  background: var(--color-bg-true);
  padding: 64px 40px 88px;
}

.about-page__team-inner {
  max-width: 1100px;
  margin: 0 auto;
  text-align: center;
}

.about-page__team-eyebrow {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  margin: 0 0 12px;
}

.about-page__team-title {
  font-size: clamp(22px, 3vw, 32px);
  margin: 0 0 48px;
}

.about-page__team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.about-page__team-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-light);
  border-radius: 20px;
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.about-page__team-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(26, 26, 46, 0.08);
}

.about-page__team-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-text-on-accent);
  font-family: var(--font-display);
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.about-page__team-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-heading);
  margin: 0;
  text-align: center;
}

.about-page__team-role {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
  text-align: center;
}
```

- [ ] **Step 2: Add the section to AboutPage.tsx**

Add a third data constant right after `MISSION_POINTS`:

```tsx
const TEAM = [
  { name: 'Rakha Dzikra Guevara', role: 'Product Owner', initial: 'R' },
  { name: 'Haikal', role: 'Co-Founder & Tim Pengembang', initial: 'H' },
  { name: 'Daffa', role: 'Co-Founder & Tim Pengembang', initial: 'D' },
  { name: 'Abiem', role: 'Co-Founder & Tim Pengembang', initial: 'A' },
] as const
```

Insert the new section right after the Visi & Misi `</section>` and before `<Footer />`:

```tsx
      <section className="about-page__team">
        <div className="about-page__team-inner">
          <p className="about-page__team-eyebrow">Tim Kami</p>
          <h2 className="about-page__team-title">Orang-Orang di Balik ActiVibe</h2>

          <div className="about-page__team-grid">
            {TEAM.map(({ name, role, initial }) => (
              <div key={name} className="about-page__team-card">
                <span className="about-page__team-avatar" aria-hidden="true">{initial}</span>
                <p className="about-page__team-name">{name}</p>
                <p className="about-page__team-role">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
```

(Remove the now-duplicate older `<Footer />` line so there's exactly one at the end.)

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
  const page = await browser.newPage({ viewport: { width: 1280, height: 2200 } })
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push(String(e)))
  await page.goto('http://localhost:5173/tentang-kami', { waitUntil: 'networkidle' })
  const cards = await page.locator('.about-page__team-card').count()
  console.log('TEAM_CARD_COUNT:', cards)
  await page.screenshot({ path: 'd:/tmp/about-team.png' })
  console.log('CONSOLE_ERRORS:', JSON.stringify(errors))
  await browser.close()
})
"
```

Expected: `TEAM_CARD_COUNT: 4`, `CONSOLE_ERRORS: []`. Read `d:/tmp/about-team.png` to confirm, then delete the screenshot.

- [ ] **Step 5: Commit**

```bash
cd "d:\smester-4\tubes\ActiVIbe" && git add frontend/src/pages/AboutPage.tsx frontend/src/pages/AboutPage.css
git commit -m "Add About page Tim Kami section"
```

No `git push`.

---

### Task 6: Add "CTA Penutup" section wired to AuthModal signup

**Files:**
- Modify: `frontend/src/pages/AboutPage.tsx`
- Modify: `frontend/src/pages/AboutPage.css`
- Modify: `frontend/src/routes/AppRoutes.tsx`
- Modify: `frontend/src/App.tsx`

**Interfaces:**
- Consumes: `AuthMode` type and `setAuthMode` setter already in `App.tsx` (from the AuthModal work earlier this session).
- Produces: `AboutPage` now requires `{ onSignupClick: () => void }`; `AppRoutes` now requires `{ onSignupClick: () => void }` and forwards it. This is the **first** place either component takes props — introduced here, not before, so no step has an unused parameter.

- [ ] **Step 1: Append CSS**

Append to `frontend/src/pages/AboutPage.css`:

```css
/* ── CTA Penutup ── */
.about-page__cta {
  background: var(--color-primary);
  padding: 64px 40px;
  text-align: center;
}

.about-page__cta-title {
  color: var(--color-text-on-dark);
  font-size: clamp(22px, 3vw, 30px);
  margin: 0 0 16px;
}

.about-page__cta-desc {
  color: var(--color-text-on-dark);
  opacity: 0.9;
  font-size: 15px;
  line-height: 1.7;
  max-width: 560px;
  margin: 0 auto 32px;
}

.about-page__cta-button {
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

.about-page__cta-button:hover {
  background: var(--color-primary-soft);
}

.about-page__cta-button:active {
  transform: scale(0.97);
}
```

- [ ] **Step 2: Make AboutPage accept and use `onSignupClick`**

In `frontend/src/pages/AboutPage.tsx`, change the component signature from:

```tsx
export default function AboutPage() {
```

to:

```tsx
interface AboutPageProps {
  onSignupClick: () => void
}

export default function AboutPage({ onSignupClick }: AboutPageProps) {
```

Insert the new section right after the Tim Kami `</section>` and before `<Footer />`:

```tsx
      <section className="about-page__cta">
        <h2 className="about-page__cta-title">Jadi Bagian dari Perjalanan Ini</h2>
        <p className="about-page__cta-desc">
          Mulai langkah pertamamu bersama ActiVibe — baik sebagai volunteer yang ingin
          berdampak, atau organisasi yang ingin menjangkau lebih banyak relawan.
        </p>
        <button type="button" className="about-page__cta-button" onClick={onSignupClick}>
          Daftar Sekarang
        </button>
      </section>

      <Footer />
```

(Remove the now-duplicate older `<Footer />` line so there's exactly one at the end.)

- [ ] **Step 3: Thread `onSignupClick` through AppRoutes**

Replace the full contents of `frontend/src/routes/AppRoutes.tsx`:

```tsx
import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import AboutPage from '../pages/AboutPage'

interface AppRoutesProps {
  onSignupClick: () => void
}

export default function AppRoutes({ onSignupClick }: AppRoutesProps) {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tentang-kami" element={<AboutPage onSignupClick={onSignupClick} />} />
    </Routes>
  )
}
```

- [ ] **Step 4: Pass the callback from App.tsx**

In `frontend/src/App.tsx`, change:

```tsx
      <AppRoutes />
```

to:

```tsx
      <AppRoutes onSignupClick={() => setAuthMode('signup')} />
```

- [ ] **Step 5: Verify build**

```bash
cd "d:\smester-4\tubes\ActiVIbe\frontend" && pnpm build
```

Expected: exits 0.

- [ ] **Step 6: Verify the CTA opens the signup modal**

```bash
cd "d:\smester-4\tubes\ActiVIbe\frontend" && node -e "
import('file:///C:/Users/rakha/AppData/Local/npm-cache/_npx/48b1ca104c3549f4/node_modules/playwright/index.mjs').then(async ({ chromium }) => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 2400 } })
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push(String(e)))
  await page.goto('http://localhost:5173/tentang-kami', { waitUntil: 'networkidle' })
  await page.click('button.about-page__cta-button')
  await page.waitForSelector('.auth-modal')
  const hasSignupField = await page.locator('#firstName').count()
  console.log('SIGNUP_FIELD_PRESENT:', hasSignupField)
  console.log('CONSOLE_ERRORS:', JSON.stringify(errors))
  await browser.close()
})
"
```

Expected: `SIGNUP_FIELD_PRESENT: 1` (confirms the modal opened in **signup** mode, not login), `CONSOLE_ERRORS: []`.

- [ ] **Step 7: Commit**

```bash
cd "d:\smester-4\tubes\ActiVIbe" && git add frontend/src/pages/AboutPage.tsx frontend/src/pages/AboutPage.css frontend/src/routes/AppRoutes.tsx frontend/src/App.tsx
git commit -m "Add About page CTA section, wire it to the signup modal"
```

No `git push`.

---

### Task 7: Update README.md and CLAUDE.md

**Files:**
- Modify: `README.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update README.md**

In `README.md`, find the "Progres" checklist:

```markdown
## Progres

- [x] Bersihkan boilerplate template Vite/React (komponen demo, aset logo, styling default)
- [x] Restruktur repo jadi monorepo (`frontend/`, `backend/`, `docs/`)
- [x] Buat skeleton folder `frontend/src` per aktor (auth, onboarding, volunteer, organizer, admin)
- [x] Landing Page — Hero section dengan animasi page-load
- [x] Landing Page — Stats card dengan counter animation (scroll-triggered)
- [x] Landing Page — Features section (3 kartu, scroll-reveal, dekorasi flower & sun)
- [x] Landing Page — Join section "Bergabung Bersama Activibe" (background biru #63C2E0, wave top/bottom, ikon dekoratif SVG, 2 foto PNG, tombol CTA oranye)
- [ ] Bangun layout nav-body
- [ ] Inisialisasi `backend/`
```

Replace it with:

```markdown
## Progres

- [x] Bersihkan boilerplate template Vite/React (komponen demo, aset logo, styling default)
- [x] Restruktur repo jadi monorepo (`frontend/`, `backend/`, `docs/`)
- [x] Buat skeleton folder `frontend/src` per aktor (auth, onboarding, volunteer, organizer, admin)
- [x] Landing Page — Hero section dengan animasi page-load
- [x] Landing Page — Stats card dengan counter animation (scroll-triggered)
- [x] Landing Page — Features section (3 kartu, scroll-reveal, dekorasi flower & sun)
- [x] Landing Page — Join section "Bergabung Bersama Activibe" (background biru #63C2E0, wave top/bottom, ikon dekoratif SVG, 2 foto PNG, tombol CTA oranye)
- [x] Modal Login & Sign Up (`AuthModal`), dipicu dari tombol Masuk/Daftar di Navbar
- [x] Routing pertama di project (`react-router-dom`) — Halaman "Tentang Kami" (`/tentang-kami`) berisi cerita, timeline, visi-misi, dan tim
- [ ] Bangun layout nav-body
- [ ] Inisialisasi `backend/`
```

Find the "Struktur `frontend/src`" section:

```markdown
### Struktur `frontend/src`

Folder disusun per aktor sesuai PRD (Volunteer, Organizer, Admin), saat ini masih berupa skeleton kosong:

```

```
src/
├── App.tsx
├── main.tsx
├── index.css
├── assets/
├── components/      # komponen UI reusable
├── layouts/          # nav-body & layout wrapper per role
├── routes/            # konfigurasi routing
├── hooks/
├── services/         # pemanggilan API
├── types/
├── utils/
└── pages/
    ├── auth/
    ├── onboarding/
    ├── volunteer/
    ├── organizer/
    └── admin/
```

Replace the intro sentence and the `routes/`/`hooks/` lines — change:

```markdown
Folder disusun per aktor sesuai PRD (Volunteer, Organizer, Admin), saat ini masih berupa skeleton kosong:
```

to:

```markdown
Folder disusun per aktor sesuai PRD (Volunteer, Organizer, Admin). `routes/` dan `hooks/` sudah mulai terisi (routing & `useRevealOnScroll`), sisanya masih skeleton kosong:
```

and change:

```
├── routes/            # konfigurasi routing
├── hooks/
```

to:

```
├── routes/            # konfigurasi routing (AppRoutes.tsx — react-router-dom)
├── hooks/             # custom hooks reusable (cth. useRevealOnScroll)
```

- [ ] **Step 2: Update CLAUDE.md**

Read `CLAUDE.md` first to get its exact current content (it may have been edited since this plan was written — check before editing). Find the "Struktur Repo" section:

```markdown
## Struktur Repo

Monorepo dengan 3 bagian utama:
- `frontend/` — Web app (React 19 + TypeScript + Vite, pakai `pnpm`)
- `backend/` — API & services (belum diinisialisasi — rencana arsitektur: Express.js + PostgreSQL + Prisma + JWT, lihat [backend/README.md](backend/README.md). Auth dipanggil langsung dari frontend lewat REST API, **bukan** Next.js/NextAuth)
- `docs/` — Dokumentasi product (PRD, design system, dst.)
```

Add a new paragraph right after it (before the "Git Push" section):

```markdown
**Routing:** sejak halaman "Tentang Kami", `frontend/` pakai `react-router-dom` (dikonfigurasi di `frontend/src/routes/AppRoutes.tsx`, dibungkus `<BrowserRouter>` di `App.tsx`). `Navbar` dan `AuthModal` dirender di luar `<Routes>` supaya tetap tampil di semua halaman. Kalau menambah halaman baru, daftarkan route-nya di `AppRoutes.tsx`, jangan render langsung di `App.tsx`.
```

- [ ] **Step 3: Commit**

```bash
cd "d:\smester-4\tubes\ActiVIbe" && git add README.md CLAUDE.md
git commit -m "Update README and CLAUDE.md for the new routing setup"
```

No `git push`.

---

## Self-Review Notes

- **Spec coverage:** Hero ✓ (Task 1), Cerita Kami ✓ (Task 2), Timeline ✓ (Task 3), Visi & Misi ✓ (Task 4), Tim Kami ✓ (Task 5), CTA Penutup ✓ (Task 6), Footer ✓ (Task 1, kept through every task), README/CLAUDE.md ✓ (Task 7), routing architecture ✓ (Task 1 + Task 6 for prop threading).
- **Placeholder scan:** none — every step has literal code, exact strings to find/replace, and concrete expected command output.
- **Type consistency:** `useRevealOnScroll` signature (`(threshold = 0.15): { ref, visible }`) defined once in Task 2 and consumed identically in `AboutPage.tsx` and (after extraction) `HomePage.tsx`. `AboutPageProps`/`AppRoutesProps` both use the exact same `onSignupClick: () => void` shape as `NavbarProps` already does in the existing codebase.
- **Footer duplication trap:** because each task in 3–6 inserts a new section "before `<Footer />`", every step explicitly says to remove the old standalone `<Footer />` line so it never ends up rendered twice — flagged in Steps 2-5's instructions.
