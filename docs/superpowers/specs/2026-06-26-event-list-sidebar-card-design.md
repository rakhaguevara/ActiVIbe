# EventListSidebar → Activity Card Design

**Date:** 2026-06-26
**Status:** Approved by user

## Context

`EventListSidebar` (left column of `FindActivityPage`, `/dashboard`) currently renders each
event as a single compact row: category icon, title (ellipsis-truncated), match score as plain
green text. The user wants this restyled to look like a reference hotel-listing UI they
screenshotted — image thumbnail + title + brief description + tags + rating-style badge — adapted
to ActiVibe's volunteer-matching domain instead of hotel booking, per the PRD.

## Decisions (confirmed with user)

1. **Image source:** no per-event photo exists today. Reuse the two existing generic stock photos
   (`pic1 1.png`, `pic2 1.png`, already used on `HomePage` for Gallery/Testimonials), cycling by
   index (`index % 2`). No new image assets.
2. **"Price" slot equivalent:** ActiVibe has no monetary transaction for volunteers. Replaced with
   **both** remaining quota (`filledSlots/quota`) and the event date range.
3. **Click interaction:** unchanged from today — clicking anywhere on the card selects the event,
   which renders `EventDetailPanel` + `EventApplyForm` in the middle/right columns (no page
   navigation, no separate "View Details"/"Book Now" buttons).
4. **Description source:** `event.description` (the activity's own description), not
   `matchReasoning`. Clamped to 2 lines.
5. **Match score badge:** `matchScore` (already PRD-aligned via FR-005 "Predictive Match Score
   (%) dan reasoning") shown as a pill badge overlapping the top-right corner of the image
   (replacing the old plain-text `%`), instead of inline text.
6. **Tag row:** category icon (existing `getCategoryStyle` — globe/book/heart/users) + up to 2
   skill chips from `event.skills`, with a `+N` chip if more remain.

## Data model changes

`frontend/src/types/event.ts` — add one field to `Event`:

```ts
imageUrl: string
```

`frontend/src/data/mockEvents.ts` — import `pic1`/`pic2` (same assets `HomePage.tsx` imports) and
set `imageUrl: i % 2 === 0 ? pic1 : pic2` per event when building the array (or per-entry,
alternating manually since the array is hand-written, not generated).

## Component changes — `EventListSidebar.tsx`

Each `<button class="event-list-sidebar__item">` becomes a two-region layout instead of a single
row:

```
<button class="event-list-sidebar__item">
  <div class="event-list-sidebar__image-wrap">
    <img class="event-list-sidebar__image" src={imageUrl} alt="" />
    <span class="event-list-sidebar__badge">{matchScore}%</span>
  </div>
  <div class="event-list-sidebar__content">
    <span class="event-list-sidebar__title">{title}</span>
    <div class="event-list-sidebar__tags-row">
      <Icon class="event-list-sidebar__icon" />
      {skills.slice(0, 2).map(skill => <span class="event-list-sidebar__skill-chip">{skill}</span>)}
      {skills.length > 2 && <span class="event-list-sidebar__skill-chip">+{skills.length - 2}</span>}
    </div>
    <p class="event-list-sidebar__desc">{description}</p>
    <div class="event-list-sidebar__footer">
      <span class="event-list-sidebar__quota">{filledSlots}/{quota} slot</span>
      <span class="event-list-sidebar__date">{formatDateShort(startDate)} – {formatDateShort(endDate)}</span>
    </div>
  </div>
</button>
```

`formatDateShort` reused from `utils/formatDate.ts` (same pattern already used in
`EventApplyForm.tsx`).

## Styling — `EventListSidebar.css`

- `.event-list-sidebar__item`: switch from single-row flex to `align-items: flex-start`, two
  regions side by side (image fixed width ~96px, content `flex: 1`), taller padding to fit the
  extra rows.
- `__image-wrap`: `position: relative`, fixed size, `border-radius` matching design system card
  radius convention, `overflow: hidden`.
- `__image`: `width/height: 100%; object-fit: cover`.
- `__badge`: `position: absolute; top/right: 6px`, pill shape, `var(--color-primary)` background,
  white text — same purple already used for the selected-item border, so the badge reads as "the
  AI matched this for you" without introducing a new color.
- `__tags-row`: flex, small gap, wraps category icon (reusing existing `__icon` sizing) + skill
  chips.
- `__skill-chip`: small pill, soft background token (e.g. `var(--color-secondary-soft)`), tiny
  font size matching other chip patterns already in the design system.
- `__desc`: `display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow:
  hidden`.
- `__footer`: flex, `justify-content: space-between`, muted small text (`var(--color-text-muted)`).
- Remove `.event-list-sidebar__score` (superseded by `__badge`).
- Keep everything else from the previous turn unchanged: sticky positioning on the column wrapper
  (`FindActivityPage.css`), purple scrollbar, no title truncation.

## Out of scope

- No new image assets / no AI-generated photos — explicitly deferred to the user providing real
  per-event photos later if desired.
- No change to `EventDetailPanel`, `EventApplyForm`, or the click-to-select interaction model.
- No new CSS color tokens — only reuses existing `docs/design.md` tokens.
