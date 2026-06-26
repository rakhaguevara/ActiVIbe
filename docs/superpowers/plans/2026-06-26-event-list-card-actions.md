# EventListSidebar Card Action Buttons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 3 action buttons (Detail, Bookmark/Save, Share) to the bottom-right of each `EventListSidebar` card on `/dashboard`, change the card's interaction model so only the Detail button selects an event (not the whole card anymore), and tighten the card's internal text-section spacing to 4px — per the approved spec at `docs/superpowers/specs/2026-06-26-event-list-card-actions-design.md`.

**Architecture:** Three tasks. Task 1 adds a standalone, reusable `useBookmarkedEvents` hook (localStorage-backed) under `frontend/src/hooks/`. Task 2 rewrites `EventListSidebar.tsx`'s root element from `<button>` to `<div>`, adds the 3-button actions row wired to the Task 1 hook plus a clipboard-copy handler, and updates `EventListSidebar.css` (4px content gap, new action-button styles). Task 3 makes the Share button's copied link actually work by having `FindActivityPage.tsx` read an `?event=<id>` query param on mount to set the initial selection.

**Tech Stack:** React 19 + TypeScript, Vite, plain CSS (BEM-style classes, CSS custom properties from `docs/design.md`), `react-icons/fi` (already a dependency) for `FiBookmark`/`FiShare2`, `react-router-dom` v7 `useSearchParams`. No test runner is configured in this project (`frontend/package.json` has no `test` script, no `*.test.*` files) — verification is type safety plus manual visual/behavioral checks in the browser, consistent with how prior changes in this codebase (e.g. `docs/superpowers/plans/2026-06-26-event-list-sidebar-card.md`) were verified.

**Type-check command — read before running any verification step:** `frontend/tsconfig.json` is a solution-style config (`"files": []`, only `"references"`). Plain `tsc --noEmit` type-checks **zero files** and silently exits 0 even with real type errors present. Always use **`pnpm exec tsc -b --noEmit`** (build mode, follows project references) from inside `frontend/`. If a stale build cache is suspected, clear it: `rm -f frontend/node_modules/.tmp/tsconfig.app.tsbuildinfo frontend/node_modules/.tmp/tsconfig.node.tsbuildinfo`.

## Global Constraints

- No new color hex values — every color must be an existing `var(--token-name)` from `docs/design.md` (CLAUDE.md design-system rule). This plan only reuses: `--color-primary`, `--color-primary-soft`, `--color-text-on-accent`, `--color-border-medium`, `--color-bg-true`, `--color-bg-surface`, `--color-text-body`, `--color-text-muted`, `--text-body-xs`, `--space-2xs`.
- No new npm dependencies — `react-icons` already provides `FiBookmark`/`FiShare2`; clipboard copy uses the native `navigator.clipboard` API.
- No backend/API persistence for bookmarks — `localStorage` only (spec out-of-scope).
- No native share sheet (`navigator.share`) — clipboard copy only (spec decision #5/#6).
- No new route/page for event detail — the Detail button reuses the existing master-detail panel via the existing `onSelect` prop (spec decision #2).
- Do not commit automatically. Per this project's CLAUDE.md, commits in the main session require an explicit user request; the per-task "Commit" step below only applies if this plan is executed via `superpowers:subagent-driven-development` (where the project's documented exception allows subagents to commit locally as an internal mechanism). If executed inline in the main session, skip the commit step and leave changes staged for the user.

---

### Task 1: `useBookmarkedEvents` hook

**Files:**
- Create: `frontend/src/hooks/useBookmarkedEvents.ts`

**Interfaces:**
- Produces: `useBookmarkedEvents(): { isBookmarked: (id: string) => boolean, toggle: (id: string) => void }` — Task 2 imports and calls this with no arguments.

- [ ] **Step 1: Create the hook**

Create `frontend/src/hooks/useBookmarkedEvents.ts`:

```ts
import { useCallback, useState } from 'react'

const STORAGE_KEY = 'activibe:bookmarked-events'

function readStoredIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

export function useBookmarkedEvents() {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => readStoredIds())

  const toggle = useCallback((id: string) => {
    setBookmarkedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isBookmarked = useCallback((id: string) => bookmarkedIds.includes(id), [bookmarkedIds])

  return { isBookmarked, toggle }
}
```

- [ ] **Step 2: Type-check**

Run (from `frontend/`): `pnpm exec tsc -b --noEmit`
Expected: PASS — no output, exit code 0. (This hook has no standalone UI; its runtime behavior is verified via the manual browser check in Task 2, where it's actually consumed.)

- [ ] **Step 3: Commit** (only if running under subagent-driven-development; otherwise leave staged)

```bash
git add frontend/src/hooks/useBookmarkedEvents.ts
git commit -m "feat(frontend): add useBookmarkedEvents localStorage-backed hook"
```

---

### Task 2: Add action buttons to `EventListSidebar` and re-tighten spacing

**Files:**
- Modify: `frontend/src/components/EventListSidebar.tsx`
- Modify: `frontend/src/components/EventListSidebar.css`

**Interfaces:**
- Consumes: `useBookmarkedEvents(): { isBookmarked: (id: string) => boolean, toggle: (id: string) => void }` (Task 1).
- Produces: no change to `EventListSidebarProps` (`{ events, selectedEventId, onSelect }`) — `FindActivityPage.tsx` (Task 3) needs no prop-shape changes, only its own internal initial-state logic.

- [ ] **Step 1: Replace `EventListSidebar.tsx`**

```tsx
import { useState } from 'react'
import { FiBookmark, FiShare2 } from 'react-icons/fi'
import { getCategoryStyle } from '../utils/categoryStyle'
import { formatDateShort } from '../utils/formatDate'
import { useBookmarkedEvents } from '../hooks/useBookmarkedEvents'
import type { Event } from '../types/event'
import './EventListSidebar.css'

interface EventListSidebarProps {
  events: Event[]
  selectedEventId: string | null
  onSelect: (id: string) => void
}

export default function EventListSidebar({ events, selectedEventId, onSelect }: EventListSidebarProps) {
  const { isBookmarked, toggle } = useBookmarkedEvents()
  const [copiedEventId, setCopiedEventId] = useState<string | null>(null)

  const handleShare = async (eventId: string) => {
    const link = `${window.location.origin}/dashboard?event=${eventId}`
    await navigator.clipboard.writeText(link)
    setCopiedEventId(eventId)
    setTimeout(() => {
      setCopiedEventId((current) => (current === eventId ? null : current))
    }, 1500)
  }

  return (
    <div className="event-list-sidebar">
      {events.map((event) => {
        const { icon: Icon } = getCategoryStyle(event.category)
        const isSelected = event.id === selectedEventId
        const visibleSkills = event.skills.slice(0, 2)
        const extraSkillCount = event.skills.length - visibleSkills.length
        const bookmarked = isBookmarked(event.id)

        return (
          <div
            key={event.id}
            className={`event-list-sidebar__item${isSelected ? ' event-list-sidebar__item--selected' : ''}`}
          >
            <div className="event-list-sidebar__image-wrap">
              <img src={event.imageUrl} alt="" className="event-list-sidebar__image" />
              <span className="event-list-sidebar__badge">{event.matchScore}%</span>
            </div>

            <div className="event-list-sidebar__content">
              <span className="event-list-sidebar__title">{event.title}</span>

              <div className="event-list-sidebar__tags-row">
                <Icon className="event-list-sidebar__icon" aria-hidden="true" />
                {visibleSkills.map((skill) => (
                  <span key={skill} className="event-list-sidebar__skill-chip">{skill}</span>
                ))}
                {extraSkillCount > 0 && (
                  <span className="event-list-sidebar__skill-chip">+{extraSkillCount}</span>
                )}
              </div>

              <p className="event-list-sidebar__desc">{event.description}</p>

              <div className="event-list-sidebar__footer">
                <span className="event-list-sidebar__quota">{event.filledSlots}/{event.quota} slot</span>
                <span className="event-list-sidebar__date">
                  {formatDateShort(event.startDate)} – {formatDateShort(event.endDate)}
                </span>
              </div>

              <div className="event-list-sidebar__actions">
                <button
                  type="button"
                  className="event-list-sidebar__detail-button"
                  aria-label="Lihat detail kegiatan"
                  onClick={() => onSelect(event.id)}
                >
                  Detail
                </button>
                <button
                  type="button"
                  className={`event-list-sidebar__icon-button${bookmarked ? ' event-list-sidebar__icon-button--active' : ''}`}
                  aria-label={bookmarked ? 'Hapus dari simpanan' : 'Simpan kegiatan'}
                  onClick={() => toggle(event.id)}
                >
                  <FiBookmark fill={bookmarked ? 'currentColor' : 'none'} />
                </button>
                <button
                  type="button"
                  className="event-list-sidebar__icon-button"
                  aria-label="Bagikan kegiatan"
                  onClick={() => handleShare(event.id)}
                >
                  <FiShare2 />
                </button>
                {copiedEventId === event.id && (
                  <span className="event-list-sidebar__copied-label">Disalin!</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

Note the root per-item element changed from `<button type="button" className="event-list-sidebar__item..." onClick={...}>` to a plain `<div className="event-list-sidebar__item...">` with no click handler — clicking the image, title, tags, description, or footer no longer selects the event. Only the new "Detail" button calls `onSelect(event.id)`.

- [ ] **Step 2: Replace `EventListSidebar.css`**

```css
.event-list-sidebar {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-list-sidebar__item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  text-align: left;
  background: var(--color-bg-true);
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  padding: 12px;
  font-family: var(--font-body);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.event-list-sidebar__item:hover {
  border-color: var(--color-border-medium);
}

.event-list-sidebar__item--selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-soft);
}

.event-list-sidebar__image-wrap {
  position: relative;
  flex-shrink: 0;
  width: 88px;
  height: 88px;
  border-radius: 10px;
  overflow: hidden;
}

.event-list-sidebar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.event-list-sidebar__badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background: var(--color-primary);
  color: var(--color-text-on-accent);
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  line-height: 1.4;
}

.event-list-sidebar__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2xs);
}

.event-list-sidebar__title {
  font-size: var(--text-body-xs);
  font-weight: 600;
  color: var(--color-text-heading);
}

.event-list-sidebar__tags-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.event-list-sidebar__icon {
  flex-shrink: 0;
  color: var(--color-text-muted);
  font-size: 14px;
}

.event-list-sidebar__skill-chip {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-body);
  background: var(--color-secondary-soft);
  padding: 2px 8px;
  border-radius: 999px;
  white-space: nowrap;
}

.event-list-sidebar__desc {
  font-size: 12px;
  line-height: 1.5;
  color: var(--color-text-muted);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-list-sidebar__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 11px;
  color: var(--color-text-muted);
}

.event-list-sidebar__quota {
  font-weight: 600;
}

.event-list-sidebar__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.event-list-sidebar__detail-button {
  font-size: var(--text-body-xs);
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-primary-soft);
  border: none;
  border-radius: 999px;
  padding: 4px 12px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.event-list-sidebar__detail-button:hover {
  background: var(--color-primary);
  color: var(--color-text-on-accent);
}

.event-list-sidebar__icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 1px solid var(--color-border-medium);
  background: var(--color-bg-true);
  color: var(--color-text-body);
  font-size: 12px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.event-list-sidebar__icon-button:hover {
  background: var(--color-bg-surface);
}

.event-list-sidebar__icon-button--active {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.event-list-sidebar__copied-label {
  font-size: 10px;
  color: var(--color-text-muted);
  white-space: nowrap;
}
```

Two deliberate changes from the previous version beyond what the spec literally itemizes, both direct consequences of decision #2 (card itself is no longer interactive):
- `cursor: pointer` removed from `.event-list-sidebar__item` (the card itself no longer does anything on click; only the 3 real `<button>`s should show a pointer cursor, which they get from their own `cursor: pointer`).
- `.event-list-sidebar__content` gap changed to `var(--space-2xs)` (4px), per spec decision #8.

- [ ] **Step 3: Type-check**

Run (from `frontend/`): `pnpm exec tsc -b --noEmit`
Expected: PASS — no output, exit code 0.

- [ ] **Step 4: Manual verification in browser**

Run: `cd frontend && pnpm dev` (skip if already running), open `http://localhost:5173/dashboard` (must be logged in — redirects to `/` otherwise per `FindActivityPage.tsx:31-35`).

For each card in the left column, confirm:
- A row at the bottom of the card, right-aligned, with 3 controls in this order: a purple pill button labeled "Detail", a circular outline Bookmark icon button, a circular outline Share icon button.
- Clicking anywhere else on the card (image, title, tags, description, footer) does **not** select the event or change the detail panel.
- Clicking "Detail" selects that card (purple ring border) and updates `EventDetailPanel`/`EventApplyForm` — same effect as the old whole-card click.
- Clicking the Bookmark icon toggles it to a filled/solid purple icon (and back to outline on a second click); reloading the page (`Ctrl+R`) keeps the bookmarked card's icon filled (confirms `localStorage` persistence — check the `activibe:bookmarked-events` key in DevTools → Application → Local Storage).
- Clicking the Share icon briefly shows a small "Disalin!" label next to it, and pasting from the clipboard (e.g. into the browser address bar) shows `http://localhost:5173/dashboard?event=<that card's id>`.
- The gap between the title, tag row, description, footer line, and the new actions row all visually look like ~4px (tighter than before).

- [ ] **Step 5: Commit** (only if running under subagent-driven-development; otherwise leave staged)

```bash
git add frontend/src/components/EventListSidebar.tsx frontend/src/components/EventListSidebar.css
git commit -m "feat(frontend): add Detail/Bookmark/Share actions to EventListSidebar cards"
```

---

### Task 3: Make shared event links open the right event

**Files:**
- Modify: `frontend/src/pages/volunteer/FindActivityPage.tsx`

**Interfaces:**
- Consumes: `mockEvents: Event[]` (existing import), `useSearchParams(): [URLSearchParams, ...]` (from `react-router-dom`, already a project dependency).
- Produces: no change to any exported signature — `FindActivityPage` is a page component with no props.

- [ ] **Step 1: Read the `event` query param for the initial selection**

In `frontend/src/pages/volunteer/FindActivityPage.tsx`, change the import on line 2 from:

```tsx
import { useNavigate } from 'react-router-dom'
```

to:

```tsx
import { useNavigate, useSearchParams } from 'react-router-dom'
```

Then change lines 22-29 from:

```tsx
export default function FindActivityPage() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [filters, setFilters] = useState<EventFilters>(EMPTY_FILTERS)
  const [sortBy, setSortBy] = useState<SortOption>('matchScore')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    () => [...mockEvents].sort((a, b) => b.matchScore - a.matchScore)[0]?.id ?? null
  )
```

to:

```tsx
export default function FindActivityPage() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState<EventFilters>(EMPTY_FILTERS)
  const [sortBy, setSortBy] = useState<SortOption>('matchScore')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(() => {
    const sharedEventId = searchParams.get('event')
    if (sharedEventId && mockEvents.some((event) => event.id === sharedEventId)) {
      return sharedEventId
    }
    return [...mockEvents].sort((a, b) => b.matchScore - a.matchScore)[0]?.id ?? null
  })
```

The rest of the file (filtering, sorting, the `useEffect` that re-pins `selectedEventId` when `sortedEvents` changes, and the JSX) is unchanged — it already falls back to `sortedEvents[0]` whenever the current `selectedEventId` isn't in the filtered/sorted list, which also covers an invalid or stale `?event=` value.

- [ ] **Step 2: Type-check**

Run (from `frontend/`): `pnpm exec tsc -b --noEmit`
Expected: PASS — no output, exit code 0.

- [ ] **Step 3: Manual verification in browser**

Run: `cd frontend && pnpm dev` (skip if already running).

1. Open `http://localhost:5173/dashboard` (logged in) and note which card is selected by default.
2. Open `http://localhost:5173/dashboard?event=evt-2` in a new tab (same logged-in session). Confirm the detail panel shows "Mengajar Baca Tulis Anak Pesisir" (evt-2) selected — not the default — and its card is highlighted with the purple ring in the left column.
3. Open `http://localhost:5173/dashboard?event=not-a-real-id`. Confirm it falls back to the same default as step 1 (no crash, no blank panel).
4. From the `?event=evt-2` page, use the Share button on a different card (e.g. evt-4) and confirm pasting the copied link and opening it selects evt-4, end-to-end confirming the full share flow added in Task 2.

- [ ] **Step 4: Commit** (only if running under subagent-driven-development; otherwise leave staged)

```bash
git add frontend/src/pages/volunteer/FindActivityPage.tsx
git commit -m "feat(frontend): read ?event= query param to open a shared event link"
```
