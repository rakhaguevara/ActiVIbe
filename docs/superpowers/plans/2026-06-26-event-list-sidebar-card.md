# EventListSidebar → Activity Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the `EventListSidebar` items on `/dashboard` (Find Activity page) from a compact icon+title+score row into a richer activity card with an image, AI match-score badge, skill tags, a description excerpt, and quota/date info — per the approved spec at `docs/superpowers/specs/2026-06-26-event-list-sidebar-card-design.md`.

**Architecture:** Two-task change. Task 1 adds an `imageUrl` field to the `Event` data model and populates it in the hand-written mock data (alternating the two existing stock photos). Task 2 restructures `EventListSidebar.tsx`'s JSX into a two-region (image | content) layout and adds the matching CSS classes to `EventListSidebar.css`, removing the now-superseded `__score` class.

**Tech Stack:** React 19 + TypeScript, Vite, plain CSS (BEM-style classes, CSS custom properties from `docs/design.md`). No test runner is configured in this project (`frontend/package.json` has no `test` script and no `*.test.*` files exist) — verification is type safety plus a manual visual check in the browser, consistent with how prior changes in this codebase have been verified.

**Type-check command — read before running any verification step:** `frontend/tsconfig.json` is a solution-style config (`"files": []`, only `"references"`). Plain `tsc --noEmit` against it type-checks **zero files** and silently exits 0 even with real type errors present — confirmed by reproducing this task's own Step 2 with both commands. Always use **`pnpm exec tsc -b --noEmit`** (build mode, follows the project references) instead. If a stale `.tsbuildinfo` cache is suspected, clear it first: `rm -f frontend/node_modules/.tmp/tsconfig.app.tsbuildinfo frontend/node_modules/.tmp/tsconfig.node.tsbuildinfo`.

## Global Constraints

- No new color hex values — every color must be an existing `var(--token-name)` from `docs/design.md` (CLAUDE.md design-system rule).
- No new npm dependencies (no test framework to add) — YAGNI, this is a content/styling change.
- No new image assets — reuse `frontend/src/assets/png/pic1 1.png` and `pic2 1.png` (already imported elsewhere, e.g. `HomePage.tsx`), per the spec's confirmed decision.
- Do not change the click-to-select interaction (whole card click still calls `onSelect(event.id)`; no separate "View Details"/"Book Now" buttons) — confirmed in the spec.
- Do not commit automatically. Per this project's CLAUDE.md, commits in the main session require an explicit user request; the per-task "Commit" step below only applies if this plan is executed via `superpowers:subagent-driven-development` (where the project's documented exception allows subagents to commit locally as an internal mechanism). If executed inline in the main session, skip the commit step and leave changes staged for the user.

---

### Task 1: Add `imageUrl` to the Event data model

**Files:**
- Modify: `frontend/src/types/event.ts`
- Modify: `frontend/src/data/mockEvents.ts`

**Interfaces:**
- Produces: `Event.imageUrl: string` — every object in `mockEvents` array must have this field populated (no optional/undefined; Task 2's JSX passes it straight to an `<img src>` with no fallback).

- [ ] **Step 1: Add the field to the `Event` interface**

In `frontend/src/types/event.ts`, add `imageUrl` right after `title`:

```ts
export interface Event {
  id: string
  title: string
  imageUrl: string
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
  rating: number
  reviewCount: number
  ratingBreakdown: RatingBreakdownItem[]
  reviews: ReviewEntry[]
  provisions: string[]
  organizerBio: string
  organizerEventsCount: number
  organizerRating: number
  organizerYearsActive: number
  cancellationPolicy: string
  eventRules: string
  safetyInfo: string
}
```

- [ ] **Step 2: Run the type checker to confirm the new required field surfaces every call site that needs updating**

Run: `cd frontend && pnpm exec tsc -b --noEmit` (NOT plain `tsc --noEmit` — see the Tech Stack note above; it silently no-ops on this project's solution-style tsconfig)
Expected: FAIL — errors on every object literal in `mockEvents.ts` (8 of them) saying `Property 'imageUrl' is missing in type...`. This confirms the field is wired into the type system before you populate the data.

- [ ] **Step 3: Import the two stock photos in `mockEvents.ts` and add `imageUrl` to each of the 8 events, alternating**

At the top of `frontend/src/data/mockEvents.ts`, add the imports (same assets already used by `frontend/src/pages/HomePage.tsx`):

```ts
import type { Event } from '../types/event'
import pic1 from '../assets/png/pic1 1.png'
import pic2 from '../assets/png/pic2 1.png'
```

Then add one `imageUrl` line directly after each `title:` line, alternating `pic1`/`pic2` by position in the array (evt-1, 3, 5, 7 → `pic1`; evt-2, 4, 6, 8 → `pic2`):

```ts
    id: 'evt-1',
    title: 'Bersih Pantai Parangtritis',
    imageUrl: pic1,
```
```ts
    id: 'evt-2',
    title: 'Mengajar Baca Tulis Anak Pesisir',
    imageUrl: pic2,
```
```ts
    id: 'evt-3',
    title: 'Posyandu Keliling Desa Sehat',
    imageUrl: pic1,
```
```ts
    id: 'evt-4',
    title: 'Dapur Umum Tanggap Bencana',
    imageUrl: pic2,
```
```ts
    id: 'evt-5',
    title: 'Donor Darah & Edukasi Kesehatan Kampus',
    imageUrl: pic1,
```
```ts
    id: 'evt-6',
    title: 'Taman Bacaan Komunitas Malioboro',
    imageUrl: pic2,
```
```ts
    id: 'evt-7',
    title: 'Penghijauan Lereng Merapi',
    imageUrl: pic1,
```
```ts
    id: 'evt-8',
    title: 'Pendampingan Lansia Panti Wreda',
    imageUrl: pic2,
```

- [ ] **Step 4: Run the type checker again to confirm it's clean**

Run: `cd frontend && pnpm exec tsc -b --noEmit` (NOT plain `tsc --noEmit` — see the Tech Stack note above; it silently no-ops on this project's solution-style tsconfig)
Expected: PASS — no output, exit code 0.

- [ ] **Step 5: Commit** (only if running under subagent-driven-development; otherwise leave staged)

```bash
git add frontend/src/types/event.ts frontend/src/data/mockEvents.ts
git commit -m "feat(frontend): add imageUrl field to Event model and mock data"
```

---

### Task 2: Redesign EventListSidebar into an activity card

**Files:**
- Modify: `frontend/src/components/EventListSidebar.tsx`
- Modify: `frontend/src/components/EventListSidebar.css`

**Interfaces:**
- Consumes: `Event.imageUrl: string` (Task 1), `getCategoryStyle(category: string): { icon: IconType, bgToken: string }` (existing, `frontend/src/utils/categoryStyle.ts`), `formatDateShort(iso: string): string` (existing, `frontend/src/utils/formatDate.ts`, same usage pattern as `frontend/src/components/EventApplyForm.tsx:39`).
- Produces: no change to the component's public props (`EventListSidebarProps` stays `{ events, selectedEventId, onSelect }`) — this is a pure internal-rendering change, so `FindActivityPage.tsx` (the only consumer) needs no edits.

- [ ] **Step 1: Replace the component body in `EventListSidebar.tsx`**

```tsx
import { getCategoryStyle } from '../utils/categoryStyle'
import { formatDateShort } from '../utils/formatDate'
import type { Event } from '../types/event'
import './EventListSidebar.css'

interface EventListSidebarProps {
  events: Event[]
  selectedEventId: string | null
  onSelect: (id: string) => void
}

export default function EventListSidebar({ events, selectedEventId, onSelect }: EventListSidebarProps) {
  return (
    <div className="event-list-sidebar">
      {events.map((event) => {
        const { icon: Icon } = getCategoryStyle(event.category)
        const isSelected = event.id === selectedEventId
        const visibleSkills = event.skills.slice(0, 2)
        const extraSkillCount = event.skills.length - visibleSkills.length

        return (
          <button
            key={event.id}
            type="button"
            className={`event-list-sidebar__item${isSelected ? ' event-list-sidebar__item--selected' : ''}`}
            onClick={() => onSelect(event.id)}
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
            </div>
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Replace `EventListSidebar.css` with the card layout**

```css
.event-list-sidebar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: calc(100vh - 280px);
  overflow-y: auto;
  scrollbar-color: var(--color-primary) var(--color-primary-soft);
}

.event-list-sidebar::-webkit-scrollbar {
  width: 8px;
}

.event-list-sidebar::-webkit-scrollbar-track {
  background: var(--color-primary-soft);
  border-radius: 8px;
}

.event-list-sidebar::-webkit-scrollbar-thumb {
  background: var(--color-primary);
  border-radius: 8px;
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
  cursor: pointer;
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
  gap: 6px;
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
```

Note: this fully replaces the old file content, including removing the old `.event-list-sidebar__score` rule (superseded by `__badge`) and the old single-line `.event-list-sidebar__title` truncation rule (already removed in a prior change — confirm it's not reintroduced).

- [ ] **Step 3: Type-check**

Run: `cd frontend && pnpm exec tsc -b --noEmit` (NOT plain `tsc --noEmit` — see the Tech Stack note above; it silently no-ops on this project's solution-style tsconfig)
Expected: PASS — no output, exit code 0.

- [ ] **Step 4: Manual visual verification**

Run: `cd frontend && pnpm dev` (skip if already running), then open `http://localhost:5173/dashboard` in a browser (must be logged in — redirects to `/` otherwise per `FindActivityPage.tsx:31-35`).

Expected, for each of the 8 items in the left column:
- An 88×88px photo (alternating between the two stock photos) with a small purple pill in its top-right corner showing the match score (e.g. `95%`).
- Title shown in full (no `...` truncation).
- A row with the category icon (globe/book/heart/users) followed by 1–2 small skill chips, and a `+N` chip if the event has more than 2 skills.
- A 2-line-clamped description excerpt.
- A footer line showing `filledSlots/quota slot` on the left and the formatted date range on the right.
- Clicking anywhere on a card still selects it (purple ring border) and updates `EventDetailPanel`/`EventApplyForm` in the other two columns — interaction unchanged from before.
- The list's scrollbar (if content overflows `max-height`) is still purple.

- [ ] **Step 5: Commit** (only if running under subagent-driven-development; otherwise leave staged)

```bash
git add frontend/src/components/EventListSidebar.tsx frontend/src/components/EventListSidebar.css
git commit -m "feat(frontend): redesign EventListSidebar as activity cards with image, tags, and description"
```
