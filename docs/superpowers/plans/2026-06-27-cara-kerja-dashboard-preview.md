# Cara Kerja Dashboard Preview Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new "Intip Tampilannya" section to `/cara-kerja` showing a CSS-only browser-frame placeholder mockup of the ActiVibe dashboard, paired with copy about how easy it is to find and register for activities — placed between the existing Impact Passport section and the closing CTA bar.

**Architecture:** Single new `<section className="cara-kerja-page__preview">` inserted inline in `CaraKerjaPage.tsx` (no new const data array — this section has no repeated list items, unlike `OVERVIEW_PHASES`/`VOLUNTEER_FLOW_STEPS`/`PASSPORT_FEATURES`). Two-column grid (text left, mockup right) mirroring the existing `cara-kerja-page__passport-body` pattern. The mockup itself is plain nested `<div>`s styled to look like a browser window (chrome bar + 3 dots + fake URL pill) containing two generic placeholder shapes (a topbar-bar and 3 card-rectangles) — no new image assets, no real UI replication.

**Tech Stack:** React 19, TypeScript (strict), Vite 8, plain CSS (BEM, no shared `.btn`/`.card` classes).

**Spec:** `docs/superpowers/specs/2026-06-27-cara-kerja-dashboard-preview-design.md`

## Global Constraints

- No hardcoded hex colors — every color goes through `var(--token-name)` from the existing design tokens (`--color-bg-true`, `--color-bg-surface`, `--color-border-light`, `--color-border-medium`, `--color-primary`, `--color-primary-soft`, `--color-text-heading`, `--color-text-muted`, `--color-text-body`). This plan introduces zero new colors.
- No automated frontend test runner — verification is `pnpm build` (type-check) plus a manual Playwright check.
- This section is exclusive to `/cara-kerja` (`frontend/src/pages/CaraKerjaPage.tsx`/`.css`). Do not touch `Footer.tsx`, `HomePage.tsx`, or any other page.
- The new section must sit between the existing `cara-kerja-page__passport` section and the existing `cara-kerja-page__cta` section — the CTA must remain the last section before `<Footer />`.
- No new CTA button in this section — the existing CTA bar directly below already serves that purpose.
- No scroll-reveal animation — this section is static, consistent with the Impact Passport section above it (not animated like `cara-kerja-page__flow`).

### Dev server (for manual verification)

```bash
cd "d:\smester-4\tubes\ActiVIbe\frontend" && pnpm dev > /tmp/vite-dev.log 2>&1 &
timeout 30 bash -c 'until curl -sf http://localhost:5173 >/dev/null; do sleep 1; done'
```

`/cara-kerja` is a public, no-auth route — no backend/login needed to verify it.

Playwright (Chromium) cached; import via:
```js
import('file:///C:/Users/rakha/AppData/Local/npm-cache/_npx/48b1ca104c3549f4/node_modules/playwright/index.mjs')
```

---

### Task 1: Add the "Intip Tampilannya" preview section to `CaraKerjaPage`

**Files:**
- Modify: `frontend/src/pages/CaraKerjaPage.tsx` (insert new section between line 245 `</section>` of `cara-kerja-page__passport` and line 247 `<section className="cara-kerja-page__cta">`)
- Modify: `frontend/src/pages/CaraKerjaPage.css` (append new rule block)

**Interfaces:** None — this is a self-contained, static section with no props, no state, no data consumed from or produced for other tasks.

- [ ] **Step 1: Insert the new section's JSX**

In `frontend/src/pages/CaraKerjaPage.tsx`, find this exact existing boundary (currently lines 245-247):

```tsx
      </section>

      <section className="cara-kerja-page__cta">
```

Replace it with (inserting the new section, keeping the existing `</section>` and the existing `cara-kerja-page__cta` opening tag exactly as they are):

```tsx
      </section>

      <section className="cara-kerja-page__preview">
        <div className="cara-kerja-page__preview-inner">
          <div className="cara-kerja-page__preview-text">
            <p className="cara-kerja-page__preview-eyebrow">Intip Tampilannya</p>
            <h2 className="cara-kerja-page__preview-title">
              Satu dashboard, semua kegiatan yang relevan untukmu.
            </h2>
            <p className="cara-kerja-page__preview-desc">
              Cari kegiatan, baca detailnya, dan daftar — semua dalam satu tampilan, tanpa pindah
              halaman atau mengisi form berlapis. Setiap kegiatan yang muncul sudah disaring AI
              Matching kami, jadi yang kamu lihat memang relevan dengan minat dan jadwalmu.
            </p>
          </div>

          <div className="cara-kerja-page__preview-mockup">
            <div className="cara-kerja-page__preview-mockup-tag-row">
              <span className="cara-kerja-page__preview-mockup-tag">Contoh ilustrasi</span>
            </div>

            <div className="cara-kerja-page__preview-browser">
              <div className="cara-kerja-page__preview-browser-bar">
                <span className="cara-kerja-page__preview-browser-dot" />
                <span className="cara-kerja-page__preview-browser-dot" />
                <span className="cara-kerja-page__preview-browser-dot" />
                <span className="cara-kerja-page__preview-browser-url">activibe.id/dashboard</span>
              </div>

              <div className="cara-kerja-page__preview-browser-body">
                <div className="cara-kerja-page__preview-placeholder-bar" />
                <div className="cara-kerja-page__preview-placeholder-row">
                  <div className="cara-kerja-page__preview-placeholder-card" />
                  <div className="cara-kerja-page__preview-placeholder-card" />
                  <div className="cara-kerja-page__preview-placeholder-card" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cara-kerja-page__cta">
```

Note: the tag ("Contoh ilustrasi") sits in its own flex row right-aligned above the browser frame, rather than absolute-positioned over the frame like the Impact Passport mockup's tag — this avoids overlapping the browser chrome bar's dots/URL pill while keeping the same visual badge styling. This is a deliberate, minor deviation from the spec's literal "position: absolute" description; the visual result (small muted badge, top-right of the mockup) is the same.

- [ ] **Step 2: Append the new CSS rules**

In `frontend/src/pages/CaraKerjaPage.css`, append this block at the end of the file (after the existing `@media (max-width: 600px)` block for `.cara-kerja-page__passport`):

```css

/* ── Intip Tampilannya (Dashboard Preview) ── */
.cara-kerja-page__preview {
  background: var(--color-bg-true);
  padding: 64px 40px 88px;
}

.cara-kerja-page__preview-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr minmax(280px, 360px);
  gap: 48px;
  align-items: center;
}

.cara-kerja-page__preview-eyebrow {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--color-primary);
  text-transform: uppercase;
  margin: 0 0 12px;
}

.cara-kerja-page__preview-title {
  font-size: clamp(22px, 3vw, 32px);
  color: var(--color-text-heading);
  margin: 0 0 16px;
}

.cara-kerja-page__preview-desc {
  font-size: 15px;
  line-height: 1.75;
  color: var(--color-text-body);
  margin: 0;
}

.cara-kerja-page__preview-mockup-tag-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.cara-kerja-page__preview-mockup-tag {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: var(--color-text-muted);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-light);
  padding: 4px 10px;
  border-radius: 999px;
}

.cara-kerja-page__preview-browser {
  border-radius: 16px;
  border: 1px solid var(--color-border-light);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.cara-kerja-page__preview-browser-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-bg-surface);
  padding: 10px 16px;
}

.cara-kerja-page__preview-browser-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-border-medium);
  flex-shrink: 0;
}

.cara-kerja-page__preview-browser-url {
  flex: 1;
  font-size: 12px;
  color: var(--color-text-muted);
  background: var(--color-bg-true);
  border-radius: 999px;
  padding: 4px 12px;
}

.cara-kerja-page__preview-browser-body {
  background: var(--color-bg-true);
  padding: 24px;
}

.cara-kerja-page__preview-placeholder-bar {
  height: 28px;
  width: 40%;
  border-radius: 8px;
  background: var(--color-primary-soft);
  margin-bottom: 20px;
}

.cara-kerja-page__preview-placeholder-row {
  display: flex;
  gap: 16px;
}

.cara-kerja-page__preview-placeholder-card {
  flex: 1;
  height: 90px;
  border-radius: 12px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-light);
}

@media (max-width: 900px) {
  .cara-kerja-page__preview-inner {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .cara-kerja-page__preview {
    padding: 48px 20px 64px;
  }
}
```

- [ ] **Step 3: Type-check**

Run: `cd "d:\smester-4\tubes\ActiVIbe\frontend" && pnpm build`
Expected: builds with no TypeScript errors.

- [ ] **Step 4: Verify visually with Playwright**

```js
const { chromium } = await import('file:///C:/Users/rakha/AppData/Local/npm-cache/_npx/48b1ca104c3549f4/node_modules/playwright/index.mjs')
const browser = await chromium.launch()
const page = await browser.newPage()

await page.goto('http://localhost:5173/cara-kerja', { waitUntil: 'networkidle' })

const sectionCount = await page.locator('.cara-kerja-page__preview').count()
console.log('preview section present:', sectionCount === 1)

const textBeforeMockup = await page.evaluate(() => {
  const inner = document.querySelector('.cara-kerja-page__preview-inner')
  const children = Array.from(inner.children)
  return children[0].className.includes('preview-text') && children[1].className.includes('preview-mockup')
})
console.log('text is first column, mockup is second:', textBeforeMockup)

const order = await page.evaluate(() => {
  const main = document.querySelector('.cara-kerja-page')
  const sections = Array.from(main.children).map(el => el.className)
  const passportIdx = sections.findIndex(c => c.includes('cara-kerja-page__passport') && !c.includes('preview'))
  const previewIdx = sections.findIndex(c => c.includes('cara-kerja-page__preview'))
  const ctaIdx = sections.findIndex(c => c.includes('cara-kerja-page__cta'))
  return { passportIdx, previewIdx, ctaIdx }
})
console.log('section order (passport < preview < cta):', order.passportIdx < order.previewIdx && order.previewIdx < order.ctaIdx, order)

const dotCount = await page.locator('.cara-kerja-page__preview-browser-dot').count()
const cardCount = await page.locator('.cara-kerja-page__preview-placeholder-card').count()
console.log('3 browser dots:', dotCount === 3, '| 3 placeholder cards:', cardCount === 3)

// responsive: grid collapses to 1 column under 900px
await page.setViewportSize({ width: 800, height: 900 })
const gridCols = await page.evaluate(() => getComputedStyle(document.querySelector('.cara-kerja-page__preview-inner')).gridTemplateColumns)
console.log('grid-template-columns at 800px width (should be a single value, not two):', gridCols)

await browser.close()
```

Expected: `preview section present: true`, `text is first column, mockup is second: true`, `section order (passport < preview < cta): true`, `3 browser dots: true | 3 placeholder cards: true`, and at 800px width `gridCols` is a single column value (not two space-separated track sizes).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/CaraKerjaPage.tsx frontend/src/pages/CaraKerjaPage.css
git commit -m "feat(frontend): add dashboard preview section to /cara-kerja"
```
