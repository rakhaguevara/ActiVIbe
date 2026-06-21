# Footer Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable `Footer` component for the ActiVibe frontend that replicates the approved screenshot mockup (newsletter CTA band + footer link grid + bottom bar), wire it into `HomePage`, and verify it visually at desktop/tablet/mobile widths.

**Architecture:** One self-contained component (`Footer.tsx` + `Footer.css`) following the existing `Navbar.tsx`/`Navbar.css` pattern — no props, hardcoded data constants, imported and rendered once in `HomePage.tsx`. Internally it has three visually distinct sub-sections (newsletter band, link grid, bottom bar) but they are not split into separate files since they always render together as "the footer" and the whole thing is ~250 lines, comparable to `Navbar.tsx`.

**Tech Stack:** React 19 + TypeScript (Vite, `frontend/`), plain CSS (no CSS framework), `react-icons` for social/contact icons (new dependency).

## Global Constraints

- No hardcoded hex colors anywhere — only `var(--token-name)` from `docs/design.md` §1 / `frontend/src/index.css`.
- `Footer` takes no props; all content is hardcoded constants inside `Footer.tsx`, matching the `Navbar.tsx` convention.
- All footer links and social links use `href="#"` (no routing exists yet).
- Footer column labels, contact info, and bottom bar are in Bahasa Indonesia (adapted from the generic SaaS screenshot text). The newsletter band heading/subtext/button/hint and the tagline "Find Your Activity With Vibe" stay in English exactly as in the spec — do not translate them.
- Reuse existing assets only: `frontend/src/assets/svg/background-1.svg` (newsletter band background) and `frontend/src/assets/svg/logo.svg` (footer logo, same as Navbar). Do not add new image assets.
- `react-icons` is a new dependency, added via `pnpm add react-icons` in `frontend/`.
- No network/backend calls — the newsletter form's `onSubmit` only calls `preventDefault()` and clears local state.
- `frontend/tsconfig.app.json` has `verbatimModuleSyntax: true`, `noUnusedLocals: true`, `noUnusedParameters: true` — type-only imports must use the `type` keyword (e.g. `import { useState, type FormEvent } from 'react'`), and no unused variables/params are allowed.
- Responsive breakpoints: `900px` (tablet) and `600px` (mobile), matching the convention already used throughout `frontend/src/pages/HomePage.css` (e.g. `.trust` section) — not the `768px` breakpoint used by the fixed/sticky `Navbar`.
- Outer horizontal padding / max-width pattern matches `.trust`/`.trust__card` in `HomePage.css`: `padding: 0 40px` on the outer section (`24px` at ≤900px, `20px` at ≤600px), inner content `max-width: 1200px; margin: 0 auto`.

---

## Task 1: Add `react-icons` dependency

**Files:**
- Modify: `frontend/package.json` (via pnpm, not manual edit)

**Interfaces:**
- Produces: `react-icons/fa` module available for import in later tasks (`FaYoutube`, `FaFacebookF`, `FaTwitter`, `FaInstagram`, `FaLinkedinIn`, `FaPhoneAlt`, `FaEnvelope`).

- [ ] **Step 1: Install the dependency**

Run from `frontend/`:

```bash
pnpm add react-icons
```

- [ ] **Step 2: Verify it installed**

Run:

```bash
node -e "console.log(require('./frontend/node_modules/react-icons/package.json').version)"
```

Expected: prints a version string (e.g. `5.x.x`) with no error.

Also confirm `frontend/package.json` now lists `"react-icons"` under `"dependencies"`.

- [ ] **Step 3: Commit**

```bash
git add frontend/package.json frontend/pnpm-lock.yaml
git commit -m "Add react-icons dependency for footer social/contact icons"
```

---

## Task 2: Scaffold `Footer` component and wire it into `HomePage`

**Files:**
- Create: `frontend/src/components/Footer.tsx`
- Create: `frontend/src/components/Footer.css`
- Modify: `frontend/src/pages/HomePage.tsx` (add import + render after the `trust` section)

**Interfaces:**
- Produces: `export default function Footer()` from `frontend/src/components/Footer.tsx`, a zero-prop component rendering `<footer className="site-footer">`.
- Consumes: none (first task that touches these files).

- [ ] **Step 1: Create the skeleton component**

Create `frontend/src/components/Footer.tsx`:

```tsx
import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <p style={{ padding: 40 }}>Footer placeholder</p>
    </footer>
  )
}
```

- [ ] **Step 2: Create an empty stylesheet**

Create `frontend/src/components/Footer.css`:

```css
.site-footer {
  background: var(--color-bg-true);
}
```

- [ ] **Step 3: Wire `Footer` into `HomePage`**

In `frontend/src/pages/HomePage.tsx`, add the import near the top alongside the other component-level imports (after the `aboutIllustration` import, before `import './HomePage.css'` — order doesn't matter functionally, keep it grouped with other non-asset imports):

```tsx
import Footer from '../components/Footer'
```

Then render it as the last child of `<main>`, immediately after the closing `</section>` of the `trust` section (the last section in the file) and before the closing `</main>`:

```tsx
      {/* ═══ Trust Badges ═══ */}
      <section className="trust">
        ...
      </section>

      <Footer />

    </main>
  )
}
```

- [ ] **Step 4: Verify it renders**

Run from `frontend/`:

```bash
pnpm dev
```

Open the printed local URL (default `http://localhost:5173`) in a browser, scroll to the bottom of the page. Expected: "Footer placeholder" text is visible below the Trust Badges section, no console errors in devtools.

Stop the dev server (Ctrl+C) once verified.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/Footer.tsx frontend/src/components/Footer.css frontend/src/pages/HomePage.tsx
git commit -m "Scaffold Footer component and wire it into HomePage"
```

---

## Task 3: Build the Newsletter CTA band

**Files:**
- Modify: `frontend/src/components/Footer.tsx`
- Modify: `frontend/src/components/Footer.css`

**Interfaces:**
- Consumes: `frontend/src/assets/svg/background-1.svg` (existing asset, same one imported in `HomePage.tsx` as `bg`).
- Produces: no new exports — internal markup/styles only.

- [ ] **Step 1: Replace the skeleton with the newsletter band markup**

Replace the full contents of `frontend/src/components/Footer.tsx`:

```tsx
import { useState, type FormEvent } from 'react'
import newsletterBg from '../assets/svg/background-1.svg'
import './Footer.css'

export default function Footer() {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEmail('')
  }

  return (
    <footer className="site-footer">
      <div className="footer__newsletter">
        <img src={newsletterBg} alt="" className="footer__newsletter-bg" aria-hidden="true" />
        <div className="footer__newsletter-overlay" aria-hidden="true" />

        <div className="footer__newsletter-content">
          <h2 className="footer__newsletter-title">
            Subscribe to our newsletter to get updates to our latest activity
          </h2>
          <p className="footer__newsletter-desc">
            Enter your email here and get the most vibes activity ever!
          </p>

          <form className="footer__newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="footer__newsletter-input"
              aria-label="Email"
            />
            <button type="submit" className="footer__newsletter-submit">
              Subscribe
            </button>
          </form>

          <p className="footer__newsletter-hint">You'll able to unsubscribe at any time</p>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Style the newsletter band**

Replace the full contents of `frontend/src/components/Footer.css`:

```css
.site-footer {
  background: var(--color-bg-true);
  padding: 0 40px 40px;
}

/* ── Newsletter CTA band ── */
.footer__newsletter {
  position: relative;
  max-width: 1200px;
  margin: 0 auto 64px;
  border-radius: 24px;
  overflow: hidden;
  padding: 64px 56px;
  min-height: 360px;
  display: flex;
  align-items: center;
}

.footer__newsletter-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.footer__newsletter-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(26, 26, 46, 0.75) 60%);
  z-index: 1;
}

.footer__newsletter-content {
  position: relative;
  z-index: 2;
  max-width: 480px;
  margin-left: auto;
  color: var(--color-text-on-dark);
}

.footer__newsletter-title {
  font-family: var(--font-display);
  font-size: var(--text-display-sm);
  line-height: var(--leading-tight);
  color: var(--color-text-on-dark);
  margin: 0 0 12px;
}

.footer__newsletter-desc {
  font-family: var(--font-body);
  font-size: var(--text-body-md);
  color: var(--color-text-on-dark);
  opacity: 0.9;
  margin: 0 0 20px;
}

.footer__newsletter-form {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-bg-true);
  border-radius: 999px;
  padding: 6px 6px 6px 20px;
}

.footer__newsletter-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  font-family: var(--font-body);
  font-size: var(--text-body-md);
  color: var(--color-text-body);
  outline: none;
}

.footer__newsletter-input::placeholder {
  color: var(--color-text-muted);
}

.footer__newsletter-submit {
  flex-shrink: 0;
  background: var(--color-primary);
  color: var(--color-text-on-accent);
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  padding: 14px 32px;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease;
}

.footer__newsletter-submit:hover {
  background: var(--color-primary-hover);
}

.footer__newsletter-submit:active {
  transform: scale(0.97);
}

.footer__newsletter-hint {
  font-family: var(--font-body);
  font-size: var(--text-body-xs);
  color: var(--color-text-on-dark);
  opacity: 0.75;
  margin: 12px 0 0;
}
```

- [ ] **Step 3: Verify visually**

Run `pnpm dev` from `frontend/`, open the browser, scroll to the footer. Expected: a large rounded card with the hero illustration as background, a dark gradient on the right side, heading/subtext/email-form/hint text readable in white on the right side of the card, "Subscribe" as a purple pill button. Compare against the top portion of the reference screenshot.

Stop the dev server once verified.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/Footer.tsx frontend/src/components/Footer.css
git commit -m "Build Footer newsletter CTA band"
```

---

## Task 4: Build the Footer main grid (brand + social + link columns)

**Files:**
- Modify: `frontend/src/components/Footer.tsx`
- Modify: `frontend/src/components/Footer.css`

**Interfaces:**
- Consumes: `frontend/src/assets/svg/logo.svg` (existing asset, same one imported in `Navbar.tsx`); `react-icons/fa` icons added in Task 1.
- Produces: no new exports — internal markup/styles only.

- [ ] **Step 1: Add data constants and the main-grid markup**

In `frontend/src/components/Footer.tsx`, add these imports at the top (below the existing `newsletterBg` import):

```tsx
import {
  FaYoutube,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaPhoneAlt,
  FaEnvelope,
} from 'react-icons/fa'
import logo from '../assets/svg/logo.svg'
```

Add these constants above the `export default function Footer()` line:

```tsx
const SOCIAL_LINKS = [
  { icon: FaYoutube, label: 'YouTube' },
  { icon: FaFacebookF, label: 'Facebook' },
  { icon: FaTwitter, label: 'Twitter' },
  { icon: FaInstagram, label: 'Instagram' },
  { icon: FaLinkedinIn, label: 'LinkedIn' },
]

const FOOTER_COLUMNS = [
  { title: 'Perusahaan', links: ['Tentang Kami', 'Karir', 'Komunitas', 'Testimoni'] },
  { title: 'Bantuan', links: ['Pusat Bantuan', 'Webinar', 'Kirim Masukan'] },
  { title: 'Tautan', links: ['Cara Kerja', 'Cari Aktivitas', 'Cari Organisasi'] },
]

const CONTACT_INFO = [
  { icon: FaPhoneAlt, label: '0813-8900-8988' },
  { icon: FaEnvelope, label: 'support@activibe.com' },
]
```

Inside `<footer className="site-footer">`, after the closing `</div>` of `footer__newsletter`, add the main grid:

```tsx
      <div className="footer__main">
        <div className="footer__brand">
          <img src={logo} alt="ActiVibe" className="footer__logo" />
          <p className="footer__tagline">Find Your Activity With Vibe</p>
          <p className="footer__desc">
            Lorem ipsum dolor sit amet consectetur. Quis diam sed scelerisque aliquam imperdiet egestas. Eros at sit enim.
          </p>
          <div className="footer__social">
            {SOCIAL_LINKS.map(({ icon: Icon, label }) => (
              <a key={label} href="#" className="footer__social-link" aria-label={label}>
                <Icon />
              </a>
            ))}
          </div>
        </div>

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

        <div className="footer__column">
          <h3 className="footer__column-title">Hubungi Kami</h3>
          <ul className="footer__column-list">
            {CONTACT_INFO.map(({ icon: Icon, label }) => (
              <li key={label} className="footer__contact-item">
                <Icon className="footer__contact-icon" />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
```

The full file should now have this shape (imports → constants → component → newsletter band div → main grid div → closing `</footer>`).

- [ ] **Step 2: Style the main grid**

Append to `frontend/src/components/Footer.css`:

```css
/* ── Main grid ── */
.footer__main {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 32px;
  padding-bottom: 48px;
  border-bottom: 1px solid var(--color-border-light);
}

.footer__brand {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer__logo {
  height: 40px;
  width: auto;
}

.footer__tagline {
  font-family: var(--font-display);
  font-size: var(--text-body-md);
  color: var(--color-text-heading);
  margin: 0;
}

.footer__desc {
  font-family: var(--font-body);
  font-size: var(--text-body-sm);
  color: var(--color-text-body);
  line-height: var(--leading-normal);
  margin: 0;
  max-width: 320px;
}

.footer__social {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.footer__social-link {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-text-heading);
  color: var(--color-bg-true);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  text-decoration: none;
  transition: background 0.2s ease;
}

.footer__social-link:hover {
  background: var(--color-primary);
}

.footer__column-title {
  font-family: var(--font-body);
  font-size: var(--text-body-md);
  font-weight: 600;
  color: var(--color-text-heading);
  margin: 0 0 16px;
}

.footer__column-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer__column-link {
  font-family: var(--font-body);
  font-size: var(--text-body-sm);
  color: var(--color-text-body);
  text-decoration: none;
  transition: color 0.15s ease;
}

.footer__column-link:hover {
  color: var(--color-primary);
}

.footer__contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-body);
  font-size: var(--text-body-sm);
  color: var(--color-text-body);
}

.footer__contact-icon {
  color: var(--color-primary);
  font-size: 15px;
  flex-shrink: 0;
}
```

- [ ] **Step 3: Verify visually**

Run `pnpm dev`, open the browser, scroll below the newsletter band. Expected: logo + "Find Your Activity With Vibe" tagline + lorem-ipsum description + 5 circular social icons on the left, 4 columns ("Perusahaan", "Bantuan", "Tautan", "Hubungi Kami") to the right, contact column shows phone and email with icons, a thin border line below the whole grid. Compare against the lower-left/middle portion of the reference screenshot.

Stop the dev server once verified.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/Footer.tsx frontend/src/components/Footer.css
git commit -m "Build Footer main grid with brand, social icons, and link columns"
```

---

## Task 5: Build the bottom bar

**Files:**
- Modify: `frontend/src/components/Footer.tsx`
- Modify: `frontend/src/components/Footer.css`

**Interfaces:**
- Consumes: none new.
- Produces: no new exports — internal markup/styles only.

- [ ] **Step 1: Add the bottom-bar constant and markup**

In `frontend/src/components/Footer.tsx`, add this constant alongside the other constants (after `CONTACT_INFO`):

```tsx
const LEGAL_LINKS = ['Kebijakan Privasi', 'Syarat Penggunaan', 'Legal']
```

Inside `<footer className="site-footer">`, after the closing `</div>` of `footer__main`, add:

```tsx
      <div className="footer__bottom">
        <p className="footer__copyright">
          © {new Date().getFullYear()} ActiVibe. Semua hak dilindungi.
        </p>
        <div className="footer__legal">
          {LEGAL_LINKS.map((label, i) => (
            <span key={label} className="footer__legal-item">
              <a href="#" className="footer__legal-link">{label}</a>
              {i < LEGAL_LINKS.length - 1 && (
                <span className="footer__legal-sep" aria-hidden="true">·</span>
              )}
            </span>
          ))}
        </div>
      </div>
```

- [ ] **Step 2: Style the bottom bar**

Append to `frontend/src/components/Footer.css`:

```css
/* ── Bottom bar ── */
.footer__bottom {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 24px;
}

.footer__copyright {
  font-family: var(--font-body);
  font-size: var(--text-body-xs);
  color: var(--color-text-muted);
  margin: 0;
}

.footer__legal {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer__legal-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer__legal-link {
  font-family: var(--font-body);
  font-size: var(--text-body-xs);
  color: var(--color-text-muted);
  text-decoration: none;
}

.footer__legal-link:hover {
  color: var(--color-primary);
}

.footer__legal-sep {
  color: var(--color-text-muted);
}
```

- [ ] **Step 3: Verify visually**

Run `pnpm dev`, scroll to the very bottom of the page. Expected: "© 2026 ActiVibe. Semua hak dilindungi." on the left, "Kebijakan Privasi · Syarat Penggunaan · Legal" on the right, separated by a thin top border from the grid above.

Stop the dev server once verified.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/Footer.tsx frontend/src/components/Footer.css
git commit -m "Build Footer bottom bar with copyright and legal links"
```

---

## Task 6: Responsive breakpoints and final QA

**Files:**
- Modify: `frontend/src/components/Footer.css`

**Interfaces:**
- Consumes: all class names defined in Tasks 3–5.
- Produces: none — final styling pass.

- [ ] **Step 1: Add tablet breakpoint (≤900px)**

Append to `frontend/src/components/Footer.css`:

```css
/* ── Tablet ── */
@media (max-width: 900px) {
  .site-footer {
    padding: 0 24px 32px;
  }

  .footer__newsletter {
    padding: 40px 32px;
    margin-bottom: 48px;
    min-height: auto;
  }

  .footer__newsletter-content {
    max-width: 100%;
    margin-left: 0;
  }

  .footer__main {
    grid-template-columns: repeat(2, 1fr);
    gap: 32px 24px;
  }

  .footer__brand {
    grid-column: 1 / -1;
  }
}
```

- [ ] **Step 2: Add mobile breakpoint (≤600px)**

Append to `frontend/src/components/Footer.css`:

```css
/* ── Mobile ── */
@media (max-width: 600px) {
  .site-footer {
    padding: 0 20px 24px;
  }

  .footer__newsletter {
    padding: 32px 24px;
    border-radius: 20px;
  }

  .footer__newsletter-title {
    font-size: 1.25rem;
  }

  .footer__newsletter-form {
    flex-direction: column;
    align-items: stretch;
    border-radius: 20px;
    padding: 12px;
  }

  .footer__newsletter-input {
    padding: 8px 8px;
  }

  .footer__newsletter-submit {
    width: 100%;
  }

  .footer__main {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .footer__bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
```

- [ ] **Step 3: Verify responsive behavior**

Run `pnpm dev`, open the browser devtools device toolbar (or resize the window):
- At ~1280px width: layout matches Task 3–5 verification (5-column grid, newsletter content right-aligned).
- At ~800px width: main grid becomes 2 columns with brand row spanning full width above them; newsletter band content stretches full width.
- At ~400px width: newsletter form stacks input above button (both full width); main grid becomes a single column; bottom bar stacks copyright above legal links.

No horizontal scrollbar should appear at any width. Stop the dev server once verified.

- [ ] **Step 4: Run the production build to catch type/lint errors**

Run from `frontend/`:

```bash
pnpm build
```

Expected: build completes with no TypeScript errors (this also catches unused-variable/unused-param violations from `noUnusedLocals`/`noUnusedParameters`) and no missing-module errors for `react-icons`.

- [ ] **Step 5: Final visual comparison against the reference screenshot**

With `pnpm dev` running, compare the full footer (newsletter band → main grid → bottom bar) side-by-side against the original reference screenshot. Confirm: illustration + gradient overlay on the newsletter band, pill Subscribe button, logo + tagline + lorem-ipsum + 5 social icons on the left, 4 link columns adapted to ActiVibe content, copyright bar with "ActiVibe" (not "SawIT"). Ignore the purple striped background from the screenshot (confirmed out of scope) and the absence of a wave divider (confirmed out of scope).

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/Footer.css
git commit -m "Add responsive breakpoints for Footer component"
```
