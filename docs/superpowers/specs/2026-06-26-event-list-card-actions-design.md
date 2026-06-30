# EventListSidebar Card — Action Buttons (Detail / Bookmark / Share) Design

**Date:** 2026-06-26
**Status:** Approved by user

## Context

`EventListSidebar` cards (left column of `FindActivityPage`, `/dashboard`) were just redesigned
into a hotel-listing-style card per
[2026-06-26-event-list-sidebar-card-design.md](2026-06-26-event-list-sidebar-card-design.md).
That spec's decision #3 said the whole card stays clickable to select an event, with no separate
action buttons. The user now wants 3 explicit icon-buttons (Detail, Bookmark/Save, Share) in the
bottom-right of the card, also adjusted line spacing between the card's text sections to 4px.
**This spec supersedes decision #3 of the prior spec.**

## Decisions (confirmed with user)

1. **Button style:** Bookmark and Share are icon-only, matching the existing icon-button pattern
   already used in `EventDetailPanel.tsx` (`FiShare2`, `FiBookmark`), scaled down (~24px instead of
   36px) to fit the denser sidebar card. **Detail is text-only** ("Detail", no icon) — visually
   distinct from the two icon buttons since it's the primary/most common action.
2. **Card interaction model changes:** the card stops being a single giant `<button>`. Clicking
   anywhere else on the card (image, title, tags, description, footer) no longer selects the
   event. **Only** the new Detail button selects the event (`onSelect(event.id)`), same effect as
   today's whole-card click (renders in `EventDetailPanel` + `EventApplyForm`, no page navigation,
   no new route).
3. **Detail label:** plain text "Detail", no icon (see decision #1).
4. **Bookmark/Save:** `FiBookmark`, toggled per event id, filled when bookmarked / outline when
   not. Persisted to `localStorage` under key `activibe:bookmarked-events` (array of event ids) via
   a new reusable hook `useBookmarkedEvents()` in `frontend/src/hooks/`, so it can be reused later
   (e.g. a future "Saved Events" view) without changes to this component.
5. **Share:** `FiShare2`. On click, copies `${window.location.origin}/dashboard?event=<id>` to the
   clipboard via `navigator.clipboard.writeText`. To make that link actually work when opened,
   `FindActivityPage.tsx` reads the `event` query param on mount and uses it (if it matches an
   existing event id) as the initial `selectedEventId` instead of the current "highest match score"
   default.
6. **Copy feedback:** small inline text ("Disalin!") appears next to/over the Share icon for ~1.5s
   then reverts — local component state per card, no new toast/notification library.
7. **Layout:** new row `.event-list-sidebar__actions` (flex, `justify-content: flex-end`), placed
   as the last child of `.event-list-sidebar__content`, below the existing footer (quota/date) row
   — this is what reads as "bottom-right corner" of the card.
8. **Section spacing:** `.event-list-sidebar__content` gap changed from `6px` to `4px` (token
   `var(--space-2xs)`), tightening spacing between title / tags-row / description / footer /
   actions.

## Component changes — `EventListSidebar.tsx`

- Root element per item changes from `<button class="event-list-sidebar__item ...">` to
  `<div class="event-list-sidebar__item ...">` (no `onClick` on the div itself anymore; no
  `role`/`tabIndex` needed since the div is no longer interactive — all interaction moves to real
  `<button>` descendants).
- Add `.event-list-sidebar__actions` row inside `.event-list-sidebar__content`, after
  `.event-list-sidebar__footer`, containing 3 `<button type="button">` elements:
  - Detail: text-only button labeled "Detail" (no icon), `aria-label="Lihat detail kegiatan"`,
    `onClick={() => onSelect(event.id)}`.
  - Bookmark: `aria-label="Simpan kegiatan"` / `"Hapus dari simpanan"` depending on state, icon
    `FiBookmark` (filled via `fill="currentColor"` when bookmarked), `onClick` toggles via
    `useBookmarkedEvents().toggle(event.id)`.
  - Share: `aria-label="Bagikan kegiatan"`, icon `FiShare2`, `onClick` copies the link and sets
    local `justCopiedId` state for the feedback text.
- New hook `frontend/src/hooks/useBookmarkedEvents.ts`:
  - Reads/writes `localStorage["activibe:bookmarked-events"]` (JSON array of event id strings).
  - Exposes `{ isBookmarked(id), toggle(id) }`.
  - Lazily initializes from `localStorage` on first render; writes through on every toggle.

## Component changes — `FindActivityPage.tsx`

- On mount, read `event` from `useSearchParams()` (or `new URLSearchParams(location.search)`).
  If it matches an id present in `mockEvents`, use it as the initial value for
  `selectedEventId` instead of the current "sort by match score, take first" default. Falls back
  to today's existing default if the param is missing or doesn't match any event.

## Styling — `EventListSidebar.css`

- `.event-list-sidebar__item`: `<button>`-specific resets (e.g. implicit button background/border
  handling) no longer need to apply now that it's a `<div>`; keep existing flex/border/radius/
  padding/hover/selected styles as-is.
- `.event-list-sidebar__content`: `gap: 6px` → `gap: var(--space-2xs)` (4px).
- New `.event-list-sidebar__actions`: `display: flex; align-items: center; justify-content:
  flex-end; gap: 6px;`
- New `.event-list-sidebar__icon-button` (Bookmark, Share): ~24px circular icon button, reusing the
  same visual language as `EventDetailPanel`'s `__icon-button` (1px `var(--color-border-medium)`
  border, `var(--color-bg-true)` background, `var(--color-text-body)` icon color, hover →
  `var(--color-bg-surface)`), just smaller (24px instead of 36px, smaller icon font-size).
- New `.event-list-sidebar__detail-button` (Detail): text-only pill button, `var(--text-body-xs)`
  font, `font-weight: 600`, `var(--color-primary)` text on transparent/soft background (e.g.
  `var(--color-primary-soft)`) so it reads as the primary action next to the two neutral icon
  buttons, small `padding-inline` + pill `border-radius: 999px`, hover → slightly darker/soft bg.
- Bookmarked-active state: icon color switches to `var(--color-primary)` when bookmarked (no new
  color token).
- Copy-feedback text: small absolute/inline label near the Share button, `var(--text-body-xs)` or
  smaller, `var(--color-text-muted)`.

## Out of scope

- No backend/API persistence for bookmarks — `localStorage` only, since there's no per-user
  backend store for this yet.
- No real native share sheet (`navigator.share`) — clipboard copy only, per user's confirmed
  choice.
- No new route/page for event detail — Detail button reuses the existing master-detail panel.
- No new CSS color tokens — only reuses existing `docs/design.md` tokens.
