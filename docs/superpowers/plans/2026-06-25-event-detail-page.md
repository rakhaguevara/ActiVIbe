# Event Detail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the compact `EventDetailPanel` (middle column of `/dashboard`) into a 15-section Airbnb-listing-style detail view, with the event list shrinking into a thin icon+title sidebar and the apply form becoming sticky.

**Architecture:** No new routes/state — same `FindActivityPage`. `EventCard` is retired and replaced by `EventListSidebar` (compact rows) in the left grid column. `EventDetailPanel` becomes an orchestrator that renders 15 ordered sections — some are existing logic repositioned (title, subtitle, match badges, description, skills), the rest are brand-new focused sub-components (gallery, organizer strip, highlights, amenities, calendar, rating, reviews, location map, organizer profile, policies). The apply form gets `position: sticky` from the page's grid CSS.

**Tech Stack:** React 19, TypeScript (strict — `noUnusedLocals`/`noUnusedParameters` are **on**), Vite 8, plain CSS (BEM, no shared `.btn`/`.card`/`.badge` classes), `react-icons/fi`.

**Spec:** `docs/superpowers/specs/2026-06-25-event-detail-page-design.md`

## Global Constraints

- No hardcoded hex colors — every color goes through `var(--token-name)` from `frontend/src/index.css`, EXCEPT the already-established `#8A6D00` warning-badge-text exception (`docs/design.md` §6.3) reused verbatim where it already appears.
- No shared `.btn`/`.card`/`.badge` utility classes — every component defines its own scoped BEM-style classes using the tokens directly.
- `tsconfig.app.json` has `"noUnusedLocals": true` and `"noUnusedParameters": true` — never add a prop/import before the same task uses it.
- No automated frontend test runner — verification is `pnpm build` plus a Playwright check for any task that changes rendered UI.
- Do not add new image/illustration assets — category placeholders are CSS gradient-soft blocks + `react-icons/fi` icons only (already a dependency), per spec §3.
- All `rating`/`organizerRating`/`ratingBreakdown[].score` values render with 1 decimal (`.toFixed(1)`) everywhere they appear — never rounded to an integer.
- Ratings are 0-5 scale (not 0-100, that's `matchScore` which is unrelated and unchanged).
- **Commit policy:** if executed via `superpowers:subagent-driven-development`, each task's implementer commits locally at the end of the task. Never `git push`. If executed inline (no subagents), do not commit — leave the working tree for the user.
- This work happens on a feature branch (create one before starting implementation, e.g. `feature/event-detail-page`) — never commit directly to `main`.

### Test user + dev servers (reused from the prior plan, same servers/credentials)

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

### Task 1: Data model — `Event` fields, `categoryStyle`, `calendarGrid`

**Files:**
- Modify: `frontend/src/types/event.ts`
- Create: `frontend/src/utils/categoryStyle.ts`
- Create: `frontend/src/utils/calendarGrid.ts`

**Interfaces:**
- Produces: `RatingBreakdownItem { label: string; score: number }`, `ReviewEntry { reviewerName: string; timeAgo: string; rating: number; text: string }`, and `Event` gains: `rating: number`, `reviewCount: number`, `ratingBreakdown: RatingBreakdownItem[]`, `reviews: ReviewEntry[]`, `provisions: string[]`, `organizerBio: string`, `organizerEventsCount: number`, `organizerRating: number`, `organizerYearsActive: number`, `cancellationPolicy: string`, `eventRules: string`, `safetyInfo: string`.
- Produces: `getCategoryStyle(category: string): { icon: IconType; bgToken: string }` from `categoryStyle.ts`.
- Produces: `CalendarDay { day: number | null; isoDate: string | null; isHighlighted: boolean }`, `CalendarMonth { year: number; month: number; monthLabel: string; weeks: CalendarDay[][] }`, `buildEventCalendarMonths(startDateIso: string, endDateIso: string): CalendarMonth[]` from `calendarGrid.ts`.

- [ ] **Step 1: Add the new fields to `Event`**

Replace the full contents of `frontend/src/types/event.ts`:

```ts
export interface RatingBreakdownItem {
  label: string
  score: number
}

export interface ReviewEntry {
  reviewerName: string
  timeAgo: string
  rating: number
  text: string
}

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

- [ ] **Step 2: Create the category icon/color lookup**

Create `frontend/src/utils/categoryStyle.ts`:

```ts
import type { IconType } from 'react-icons'
import { FiGlobe, FiBookOpen, FiHeart, FiUsers } from 'react-icons/fi'

export interface CategoryStyle {
  icon: IconType
  bgToken: string
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  'Lingkungan': { icon: FiGlobe, bgToken: 'var(--color-secondary-soft)' },
  'Pendidikan': { icon: FiBookOpen, bgToken: 'var(--color-primary-soft)' },
  'Kesehatan': { icon: FiHeart, bgToken: 'var(--color-accent-orange-soft)' },
  'Bencana & Sosial': { icon: FiUsers, bgToken: 'var(--color-accent-yellow-soft)' },
}

const DEFAULT_STYLE: CategoryStyle = { icon: FiGlobe, bgToken: 'var(--color-secondary-soft)' }

export function getCategoryStyle(category: string): CategoryStyle {
  return CATEGORY_STYLES[category] ?? DEFAULT_STYLE
}
```

- [ ] **Step 3: Create the calendar grid builder**

Create `frontend/src/utils/calendarGrid.ts`:

```ts
export interface CalendarDay {
  day: number | null
  isoDate: string | null
  isHighlighted: boolean
}

export interface CalendarMonth {
  year: number
  month: number
  monthLabel: string
  weeks: CalendarDay[][]
}

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

function parseIsoDate(iso: string): { year: number; month: number; day: number } {
  const [year, month, day] = iso.split('-').map(Number)
  return { year, month: month - 1, day }
}

function toIsoDate(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

export function buildCalendarMonth(
  year: number,
  month: number,
  highlightStartIso: string,
  highlightEndIso: string
): CalendarMonth {
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: CalendarDay[] = []
  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ day: null, isoDate: null, isHighlighted: false })
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const isoDate = toIsoDate(year, month, day)
    cells.push({
      day,
      isoDate,
      isHighlighted: isoDate >= highlightStartIso && isoDate <= highlightEndIso,
    })
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: null, isoDate: null, isHighlighted: false })
  }

  const weeks: CalendarDay[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  return { year, month, monthLabel: `${MONTH_NAMES_ID[month]} ${year}`, weeks }
}

export function buildEventCalendarMonths(startDateIso: string, endDateIso: string): CalendarMonth[] {
  const start = parseIsoDate(startDateIso)
  const end = parseIsoDate(endDateIso)

  const startMonth = buildCalendarMonth(start.year, start.month, startDateIso, endDateIso)

  const sameMonth = start.year === end.year && start.month === end.month
  if (sameMonth) {
    return [startMonth]
  }

  const endMonth = buildCalendarMonth(end.year, end.month, startDateIso, endDateIso)
  return [startMonth, endMonth]
}
```

`parseIsoDate` deliberately avoids `new Date(isoString)` for year/month extraction — parsing an ISO date string with the built-in constructor treats it as UTC midnight, which can read back as the previous day in negative-UTC-offset timezones. Splitting the string manually sidesteps that entirely.

- [ ] **Step 4: Verify build**

```bash
cd "d:\smester-4\tubes\ActiVIbe\frontend" && pnpm build
```

Expected: **fails** — `frontend/src/data/mockEvents.ts`'s 8 event literals no longer satisfy the `Event` interface (missing the new required fields). This is expected; Task 2 fixes it. Confirm the error is specifically about missing properties on the `mockEvents` array, not something else.

- [ ] **Step 5: Commit**

```bash
cd "d:\smester-4\tubes\ActiVIbe" && git add frontend/src/types/event.ts frontend/src/utils/categoryStyle.ts frontend/src/utils/calendarGrid.ts
git commit -m "Add Event detail fields, categoryStyle, and calendarGrid utils"
```

No `git push`.

---

### Task 2: Fill new fields for all 8 mock events

**Files:**
- Modify: `frontend/src/data/mockEvents.ts`

**Interfaces:**
- Consumes: `Event`, `RatingBreakdownItem`, `ReviewEntry` (Task 1).
- Produces: nothing new — same `mockEvents: Event[]` export, now fully satisfying the expanded interface.

- [ ] **Step 1: Replace the full file**

Replace the full contents of `frontend/src/data/mockEvents.ts`:

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
    rating: 4.7,
    reviewCount: 18,
    ratingBreakdown: [
      { label: 'Koordinasi Panitia', score: 4.6 },
      { label: 'Kejelasan Informasi', score: 4.8 },
      { label: 'Dampak yang Dirasakan', score: 4.9 },
      { label: 'Lokasi & Logistik', score: 4.4 },
    ],
    reviews: [
      { reviewerName: 'Dian P.', timeAgo: '2 bulan lalu', rating: 5, text: 'Acaranya seru dan terorganisir, sampah yang terkumpul beneran banyak!' },
      { reviewerName: 'Fajar R.', timeAgo: '3 bulan lalu', rating: 4, text: 'Lokasi agak jauh dari parkiran, tapi worth it lihat pantai jadi bersih.' },
      { reviewerName: 'Made A.', timeAgo: '5 bulan lalu', rating: 5, text: 'Panitia ramah, perlengkapan kebersihan lengkap disediakan.' },
    ],
    provisions: ['Perlengkapan kebersihan', 'Konsumsi siang', 'Asuransi kegiatan', 'Sertifikat digital'],
    organizerBio: 'Komunitas Laut Lestari aktif menjaga kebersihan pesisir selatan Yogyakarta sejak 2019, fokus pada edukasi pengelolaan sampah pantai.',
    organizerEventsCount: 24,
    organizerRating: 4.7,
    organizerYearsActive: 5,
    cancellationPolicy: 'Bisa membatalkan pendaftaran gratis sampai 24 jam sebelum kegiatan dimulai.',
    eventRules: 'Wajib pakai sepatu tertutup dan sunblock, datang 15 menit sebelum briefing dimulai.',
    safetyInfo: 'P3K tersedia di lokasi, ada petugas keamanan pantai selama kegiatan berlangsung.',
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
    rating: 4.9,
    reviewCount: 12,
    ratingBreakdown: [
      { label: 'Koordinasi Panitia', score: 4.8 },
      { label: 'Kejelasan Informasi', score: 4.9 },
      { label: 'Dampak yang Dirasakan', score: 5.0 },
      { label: 'Lokasi & Logistik', score: 4.6 },
    ],
    reviews: [
      { reviewerName: 'Sinta W.', timeAgo: '1 bulan lalu', rating: 5, text: 'Anak-anaknya antusias banget, jadi makin semangat ngajar tiap minggu.' },
      { reviewerName: 'Yoga P.', timeAgo: '2 bulan lalu', rating: 5, text: 'Modul ajar sudah disiapkan organizer, jadi tinggal eksekusi di lapangan.' },
      { reviewerName: 'Maya K.', timeAgo: '4 bulan lalu', rating: 4, text: 'Perjalanan ke lokasi cukup jauh, tapi sambutan warga sangat hangat.' },
    ],
    provisions: ['Modul & alat ajar', 'Transportasi dari titik kumpul', 'Konsumsi', 'Sertifikat digital'],
    organizerBio: 'Yayasan Cahaya Pesisir fokus pada akses pendidikan dasar untuk anak-anak nelayan di pesisir selatan Gunungkidul sejak 2017.',
    organizerEventsCount: 16,
    organizerRating: 4.8,
    organizerYearsActive: 7,
    cancellationPolicy: 'Pembatalan gratis sampai 48 jam sebelum sesi pertama, setelah itu dianggap mengundurkan diri dari program.',
    eventRules: 'Komitmen hadir minimal 3 dari 4 sesi akhir pekan, datang tepat waktu sesuai jadwal yang disepakati.',
    safetyInfo: 'Pendamping dari yayasan selalu hadir di setiap sesi, lokasi belajar berada di balai desa yang aman.',
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
    rating: 4.5,
    reviewCount: 9,
    ratingBreakdown: [
      { label: 'Koordinasi Panitia', score: 4.4 },
      { label: 'Kejelasan Informasi', score: 4.5 },
      { label: 'Dampak yang Dirasakan', score: 4.7 },
      { label: 'Lokasi & Logistik', score: 4.2 },
    ],
    reviews: [
      { reviewerName: 'Putri N.', timeAgo: '3 bulan lalu', rating: 5, text: 'Tim medis sangat membantu menjelaskan tugas volunteer di lapangan.' },
      { reviewerName: 'Bagas S.', timeAgo: '4 bulan lalu', rating: 4, text: 'Jalan ke desa cukup menantang, siapkan kendaraan yang sesuai.' },
      { reviewerName: 'Wulan D.', timeAgo: '6 bulan lalu', rating: 4, text: 'Koordinasi cukup baik walau pesertanya banyak dari berbagai latar belakang.' },
    ],
    provisions: ['Alat kesehatan dasar', 'Konsumsi', 'Transportasi keliling desa', 'Sertifikat digital'],
    organizerBio: 'Puskesmas Dlingo menjalankan program posyandu keliling untuk menjangkau desa-desa terpencil di wilayah Bantul selatan.',
    organizerEventsCount: 31,
    organizerRating: 4.6,
    organizerYearsActive: 9,
    cancellationPolicy: 'Pembatalan gratis sampai 24 jam sebelum kegiatan, mendadak akan dicatat sebagai tidak hadir.',
    eventRules: 'Wajib memakai APD yang disediakan, mengikuti arahan tenaga medis sepanjang kegiatan.',
    safetyInfo: 'Tenaga medis profesional standby penuh, tersedia kotak P3K dan jalur evakuasi darurat.',
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
    rating: 4.6,
    reviewCount: 14,
    ratingBreakdown: [
      { label: 'Koordinasi Panitia', score: 4.7 },
      { label: 'Kejelasan Informasi', score: 4.5 },
      { label: 'Dampak yang Dirasakan', score: 4.9 },
      { label: 'Lokasi & Logistik', score: 4.3 },
    ],
    reviews: [
      { reviewerName: 'Hendra T.', timeAgo: '1 bulan lalu', rating: 5, text: 'Tim posko sangat siap, semua peran sudah jelas sejak briefing awal.' },
      { reviewerName: 'Lestari A.', timeAgo: '2 bulan lalu', rating: 4, text: 'Jam piket cukup padat, tapi memang situasinya darurat jadi maklum.' },
      { reviewerName: 'Andre F.', timeAgo: '3 bulan lalu', rating: 5, text: 'Senang bisa langsung berkontribusi nyata untuk korban terdampak.' },
    ],
    provisions: ['Perlengkapan dapur umum', 'Konsumsi relawan', 'Asuransi kegiatan', 'Sertifikat digital'],
    organizerBio: 'Posko Tanggap Bencana Sleman mengoordinasikan respons cepat untuk kejadian bencana di wilayah Sleman dan sekitarnya.',
    organizerEventsCount: 19,
    organizerRating: 4.6,
    organizerYearsActive: 4,
    cancellationPolicy: 'Karena sifatnya darurat, pembatalan mendadak dimaklumi tapi mohon konfirmasi secepatnya lewat kontak posko.',
    eventRules: 'Siap bekerja dalam shift bergilir, mengikuti arahan koordinator lapangan setiap saat.',
    safetyInfo: 'Jalur evakuasi dan titik kumpul darurat sudah ditentukan, ada koordinator keselamatan di lokasi.',
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
    rating: 4.3,
    reviewCount: 21,
    ratingBreakdown: [
      { label: 'Koordinasi Panitia', score: 4.4 },
      { label: 'Kejelasan Informasi', score: 4.3 },
      { label: 'Dampak yang Dirasakan', score: 4.5 },
      { label: 'Lokasi & Logistik', score: 4.0 },
    ],
    reviews: [
      { reviewerName: 'Citra M.', timeAgo: '2 minggu lalu', rating: 4, text: 'Tugasnya ringan, cocok buat yang baru pertama kali jadi volunteer.' },
      { reviewerName: 'Reza B.', timeAgo: '1 bulan lalu', rating: 4, text: 'Booth edukasi ramai pengunjung, jadi cukup sibuk tapi seru.' },
      { reviewerName: 'Niken S.', timeAgo: '2 bulan lalu', rating: 5, text: 'PMI sangat profesional dalam mengarahkan tugas volunteer.' },
    ],
    provisions: ['Konsumsi', 'Kaos volunteer', 'Sertifikat digital'],
    organizerBio: 'PMI Cabang Yogyakarta rutin mengadakan acara donor darah dan edukasi kesehatan di berbagai kampus di Yogyakarta.',
    organizerEventsCount: 45,
    organizerRating: 4.5,
    organizerYearsActive: 12,
    cancellationPolicy: 'Pembatalan gratis kapan saja sebelum hari kegiatan.',
    eventRules: 'Datang sesuai jam shift yang dipilih, menjaga kerapian booth edukasi selama acara.',
    safetyInfo: 'Tenaga medis PMI selalu hadir penuh selama acara donor darah berlangsung.',
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
    rating: 4.8,
    reviewCount: 27,
    ratingBreakdown: [
      { label: 'Koordinasi Panitia', score: 4.7 },
      { label: 'Kejelasan Informasi', score: 4.8 },
      { label: 'Dampak yang Dirasakan', score: 4.9 },
      { label: 'Lokasi & Logistik', score: 4.7 },
    ],
    reviews: [
      { reviewerName: 'Galih P.', timeAgo: '3 minggu lalu', rating: 5, text: 'Anak-anaknya lucu-lucu, mendongeng jadi momen favorit setiap minggu.' },
      { reviewerName: 'Ayu R.', timeAgo: '1 bulan lalu', rating: 5, text: 'Komunitasnya solid, koordinasi jadwal jaga taman bacaan sangat rapi.' },
      { reviewerName: 'Doni K.', timeAgo: '2 bulan lalu', rating: 4, text: 'Lokasi strategis di Malioboro, gampang diakses kapan saja.' },
    ],
    provisions: ['Buku & alat baca', 'Snack untuk anak-anak', 'Sertifikat digital'],
    organizerBio: 'Gerakan Literasi Yogyakarta mengelola beberapa taman bacaan komunitas untuk meningkatkan minat baca anak-anak kota.',
    organizerEventsCount: 38,
    organizerRating: 4.8,
    organizerYearsActive: 6,
    cancellationPolicy: 'Bisa batal jaga taman bacaan dengan info ke koordinator minimal 1 hari sebelumnya.',
    eventRules: 'Jaga kebersihan dan kerapian buku, dampingi anak-anak dengan sabar selama sesi mendongeng.',
    safetyInfo: 'Lokasi taman bacaan berada di area ramai dan terpantau, aman untuk kegiatan anak-anak.',
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
    rating: 4.4,
    reviewCount: 16,
    ratingBreakdown: [
      { label: 'Koordinasi Panitia', score: 4.3 },
      { label: 'Kejelasan Informasi', score: 4.4 },
      { label: 'Dampak yang Dirasakan', score: 4.8 },
      { label: 'Lokasi & Logistik', score: 4.0 },
    ],
    reviews: [
      { reviewerName: 'Bima S.', timeAgo: '1 bulan lalu', rating: 4, text: 'Medan agak menanjak, siapkan fisik dan sepatu yang nyaman.' },
      { reviewerName: 'Tasya L.', timeAgo: '2 bulan lalu', rating: 5, text: 'Pemandangan lereng Merapi luar biasa, capek tapi puas.' },
      { reviewerName: 'Irfan H.', timeAgo: '4 bulan lalu', rating: 4, text: 'Bibit pohon dan alat sudah disiapkan, tinggal datang dan tanam.' },
    ],
    provisions: ['Bibit pohon & alat tanam', 'Konsumsi', 'Transportasi dari titik kumpul', 'Sertifikat digital'],
    organizerBio: 'Komunitas Hijau Merapi menjalankan program konservasi area resapan air di lereng Merapi sejak pasca-erupsi 2010.',
    organizerEventsCount: 22,
    organizerRating: 4.5,
    organizerYearsActive: 8,
    cancellationPolicy: 'Pembatalan gratis sampai 2 hari sebelum kegiatan karena perlu pengaturan logistik bibit.',
    eventRules: 'Wajib pakai sepatu gunung/tertutup, ikuti jalur pendakian yang sudah ditentukan panitia.',
    safetyInfo: 'Tim medis lapangan standby, kondisi cuaca dipantau sebelum kegiatan dimulai.',
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
    rating: 4.6,
    reviewCount: 8,
    ratingBreakdown: [
      { label: 'Koordinasi Panitia', score: 4.5 },
      { label: 'Kejelasan Informasi', score: 4.6 },
      { label: 'Dampak yang Dirasakan', score: 4.9 },
      { label: 'Lokasi & Logistik', score: 4.4 },
    ],
    reviews: [
      { reviewerName: 'Salsa F.', timeAgo: '2 bulan lalu', rating: 5, text: 'Opa-oma di panti sangat senang ada yang menemani, bikin terharu.' },
      { reviewerName: 'Rian D.', timeAgo: '3 bulan lalu', rating: 4, text: 'Kegiatannya santai, cocok buat yang suka interaksi langsung.' },
      { reviewerName: 'Eka W.', timeAgo: '5 bulan lalu', rating: 5, text: 'Pengasuh panti ramah dan membantu volunteer baru beradaptasi.' },
    ],
    provisions: ['Konsumsi', 'Perlengkapan senam ringan', 'Sertifikat digital'],
    organizerBio: 'Panti Wreda Sejahtera menyediakan perawatan jangka panjang untuk lansia dan rutin membuka program pendampingan volunteer.',
    organizerEventsCount: 11,
    organizerRating: 4.7,
    organizerYearsActive: 10,
    cancellationPolicy: 'Pembatalan gratis sampai 24 jam sebelum kegiatan, mohon info lebih awal kalau bisa.',
    eventRules: 'Bersikap sabar dan ramah kepada lansia, mengikuti arahan pengasuh panti selama kegiatan.',
    safetyInfo: 'Pengasuh panti selalu mendampingi, tersedia P3K untuk kebutuhan darurat ringan.',
  },
]
```

- [ ] **Step 2: Verify build**

```bash
cd "d:\smester-4\tubes\ActiVIbe\frontend" && pnpm build
```

Expected: exits 0 (the missing-fields error from Task 1 is now resolved).

- [ ] **Step 3: Commit**

```bash
cd "d:\smester-4\tubes\ActiVIbe" && git add frontend/src/data/mockEvents.ts
git commit -m "Fill rating, reviews, provisions, organizer, and policy fields for all 8 mock events"
```

No `git push`.

---

### Task 3: `EventListSidebar` (replaces `EventCard`), grid + sticky CSS

**Files:**
- Create: `frontend/src/components/EventListSidebar.tsx`
- Create: `frontend/src/components/EventListSidebar.css`
- Delete: `frontend/src/components/EventCard.tsx`
- Delete: `frontend/src/components/EventCard.css`
- Modify: `frontend/src/pages/volunteer/FindActivityPage.tsx`
- Modify: `frontend/src/pages/volunteer/FindActivityPage.css`

**Interfaces:**
- Consumes: `Event` (existing), `getCategoryStyle` (Task 1).
- Produces: `EventListSidebar({ events, selectedEventId, onSelect }: { events: Event[]; selectedEventId: string | null; onSelect: (id: string) => void })`, default export — same `onSelect`/`selectedEventId` contract `EventCard` used, so `FindActivityPage`'s existing state wiring doesn't change shape.

- [ ] **Step 1: Create `EventListSidebar`**

Create `frontend/src/components/EventListSidebar.css`:

```css
.event-list-sidebar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: calc(100vh - 280px);
  overflow-y: auto;
}

.event-list-sidebar__item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  text-align: left;
  background: var(--color-bg-true);
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  padding: 10px 12px;
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

.event-list-sidebar__icon {
  flex-shrink: 0;
  color: var(--color-text-muted);
  font-size: 16px;
}

.event-list-sidebar__title {
  flex: 1;
  font-size: var(--text-body-xs);
  font-weight: 600;
  color: var(--color-text-heading);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-list-sidebar__score {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-success);
}
```

Create `frontend/src/components/EventListSidebar.tsx`:

```tsx
import { getCategoryStyle } from '../utils/categoryStyle'
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
        return (
          <button
            key={event.id}
            type="button"
            className={`event-list-sidebar__item${isSelected ? ' event-list-sidebar__item--selected' : ''}`}
            onClick={() => onSelect(event.id)}
          >
            <Icon className="event-list-sidebar__icon" aria-hidden="true" />
            <span className="event-list-sidebar__title">{event.title}</span>
            <span className="event-list-sidebar__score">{event.matchScore}%</span>
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Delete `EventCard`**

```bash
cd "d:\smester-4\tubes\ActiVIbe" && rm frontend/src/components/EventCard.tsx frontend/src/components/EventCard.css
```

- [ ] **Step 3: Wire `EventListSidebar` into `FindActivityPage`, shrink/grow grid columns**

In `frontend/src/pages/volunteer/FindActivityPage.tsx`, change the import block from:

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
```

to:

```tsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import EventListSidebar from '../../components/EventListSidebar'
import EventDetailPanel from '../../components/EventDetailPanel'
import EventApplyForm from '../../components/EventApplyForm'
import VolunteerSearchBar, { type EventFilters } from '../../components/VolunteerSearchBar'
import { mockEvents } from '../../data/mockEvents'
import banner from '../../assets/svg/background-1.svg'
import './FindActivityPage.css'
```

Change the columns JSX from:

```tsx
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
```

to:

```tsx
      <div className="find-activity-page__columns">
        {sortedEvents.length === 0 ? (
          <p className="find-activity-page__empty">Tidak ada kegiatan yang cocok dengan filter ini.</p>
        ) : (
          <EventListSidebar
            events={sortedEvents}
            selectedEventId={selectedEventId}
            onSelect={setSelectedEventId}
          />
        )}

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
```

- [ ] **Step 4: Shrink the left column, add sticky CSS for the form column**

In `frontend/src/pages/volunteer/FindActivityPage.css`, change:

```css
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
```

to:

```css
.find-activity-page__columns {
  display: grid;
  grid-template-columns: minmax(220px, 260px) 1fr minmax(320px, 380px);
  gap: 24px;
  padding: 24px 48px;
  align-items: start;
}

.find-activity-page__columns > .event-apply-form {
  position: sticky;
  top: 24px;
  align-self: start;
}

@media (max-width: 1024px) {
  .find-activity-page__columns {
    grid-template-columns: 1fr;
  }

  .find-activity-page__columns > .event-apply-form {
    position: static;
  }
}
```

(`.find-activity-page__list` is removed entirely — `EventListSidebar` is now the direct grid child and manages its own `max-height`/`overflow-y` internally, same as `EventDetailPanel`/`EventApplyForm` already do. Sticky is disabled below the 1024px breakpoint since the layout collapses to a single column there and a sticky form would float awkwardly over stacked content.)

- [ ] **Step 5: Verify build**

```bash
cd "d:\smester-4\tubes\ActiVIbe\frontend" && pnpm build
```

Expected: exits 0.

- [ ] **Step 6: Verify visually**

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

  console.log('SIDEBAR_ITEM_COUNT:', await page.locator('.event-list-sidebar__item').count())
  const titleBefore = await page.locator('.event-detail-panel__title').textContent()
  await page.locator('.event-list-sidebar__item').nth(2).click()
  const titleAfter = await page.locator('.event-detail-panel__title').textContent()
  console.log('DETAIL_CHANGED_ON_SIDEBAR_CLICK:', titleBefore !== titleAfter)

  await page.screenshot({ path: 'd:/tmp/event-detail-shell.png', fullPage: true })
  console.log('CONSOLE_ERRORS:', JSON.stringify(errors))
  await browser.close()
})
"
```

Expected: `SIDEBAR_ITEM_COUNT: 8`, `DETAIL_CHANGED_ON_SIDEBAR_CLICK: true`, `CONSOLE_ERRORS: []`. Read `d:/tmp/event-detail-shell.png` to confirm the sidebar is now noticeably narrower and the (still old-format) detail panel sits beside it, then delete the screenshot. Full sticky-scroll behavior isn't meaningfully visible yet (the detail panel is still short) — that gets a dedicated check in Task 14 once the page has real height.

- [ ] **Step 7: Commit**

```bash
cd "d:\smester-4\tubes\ActiVIbe" && git add frontend/src/components/EventListSidebar.tsx frontend/src/components/EventListSidebar.css frontend/src/pages/volunteer/FindActivityPage.tsx frontend/src/pages/volunteer/FindActivityPage.css
git rm frontend/src/components/EventCard.tsx frontend/src/components/EventCard.css
git commit -m "Replace EventCard with EventListSidebar, shrink list column, prep sticky apply form"
```

No `git push`.

---

### Task 4: Reorder `EventDetailPanel` into the new section order (existing content only)

**Files:**
- Modify: `frontend/src/components/EventDetailPanel.tsx`
- Modify: `frontend/src/components/EventDetailPanel.css`

**Interfaces:**
- Consumes: `Event` (Task 2's new `rating`/`reviewCount` fields), `getMatchTier` (existing util).
- Produces: no new exports — same `EventDetailPanel({ event: Event })` signature. Tasks 5-14 each insert one more section between existing pieces in this file; they rely on the exact block order/class names this task establishes.

This task moves things into spec §2's order (title+actions, subtitle, badges+reasoning, description+toggle, skills) and **removes the old facts `<dl>`** — its 4 facts are redistributed to dedicated sections in later tasks (Lokasi→Task 12, Jadwal→Task 9, Diselenggarakan oleh→Tasks 6 & 13, Slot tersisa→folded into the new subtitle here). No new sub-components yet — gallery/organizer-strip/highlights/amenities/calendar/rating/reviews/map/organizer-profile/policies are added one at a time in Tasks 5-14, each inserting at the correct position.

- [ ] **Step 1: Replace `EventDetailPanel.css`**

Replace the full contents of `frontend/src/components/EventDetailPanel.css`:

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

.event-detail-panel__title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.event-detail-panel__title {
  font-size: 22px;
  margin: 0;
}

.event-detail-panel__title-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.event-detail-panel__icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--color-border-medium);
  background: var(--color-bg-true);
  color: var(--color-text-body);
  cursor: pointer;
  transition: background 0.15s ease;
}

.event-detail-panel__icon-button:hover {
  background: var(--color-bg-surface);
}

.event-detail-panel__subtitle {
  font-size: var(--text-body-sm);
  color: var(--color-text-body);
  margin: 0;
}

.event-detail-panel__subtitle a {
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
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

.event-detail-panel__match-reasoning {
  font-size: var(--text-body-sm);
  color: var(--color-text-body);
  margin: 0;
}

.event-detail-panel__desc {
  font-size: var(--text-body-md);
  color: var(--color-text-body);
  line-height: var(--leading-normal);
  margin: 0;
}

.event-detail-panel__desc--clamped {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-detail-panel__desc-toggle {
  margin-top: 6px;
  background: none;
  border: none;
  padding: 0;
  font-family: var(--font-body);
  font-size: var(--text-body-sm);
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: underline;
  cursor: pointer;
}

.event-detail-panel__skills h3 {
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
```

- [ ] **Step 2: Replace `EventDetailPanel.tsx`**

Replace the full contents of `frontend/src/components/EventDetailPanel.tsx`:

```tsx
import { useState } from 'react'
import { FiShare2, FiBookmark } from 'react-icons/fi'
import type { Event } from '../types/event'
import { getMatchTier } from '../utils/matchScore'
import './EventDetailPanel.css'

interface EventDetailPanelProps {
  event: Event
}

export default function EventDetailPanel({ event }: EventDetailPanelProps) {
  const [showFullDescription, setShowFullDescription] = useState(false)
  const slotsLeft = event.quota - event.filledSlots

  return (
    <div className="event-detail-panel">
      <div className="event-detail-panel__title-row">
        <h2 className="event-detail-panel__title">{event.title}</h2>
        <div className="event-detail-panel__title-actions">
          <button type="button" className="event-detail-panel__icon-button" aria-label="Bagikan kegiatan">
            <FiShare2 />
          </button>
          <button type="button" className="event-detail-panel__icon-button" aria-label="Simpan kegiatan">
            <FiBookmark />
          </button>
        </div>
      </div>

      <p className="event-detail-panel__subtitle">
        {event.category} · {event.location} · {slotsLeft} dari {event.quota} slot · ★ {event.rating.toFixed(1)} ·{' '}
        <a href="#reviews">{event.reviewCount} ulasan</a>
      </p>

      <div className="event-detail-panel__badges">
        <span className={`event-detail-panel__match-badge event-detail-panel__match-badge--${getMatchTier(event.matchScore)}`}>
          {event.matchScore}% Match Score
        </span>
        <span className="event-detail-panel__fit-badge">✨ {event.fitBadgeLabel}</span>
      </div>
      <p className="event-detail-panel__match-reasoning">{event.matchReasoning}</p>

      <div className="event-detail-panel__description-block">
        <p className={`event-detail-panel__desc${showFullDescription ? '' : ' event-detail-panel__desc--clamped'}`}>
          {event.description}
        </p>
        <button
          type="button"
          className="event-detail-panel__desc-toggle"
          onClick={() => setShowFullDescription((prev) => !prev)}
        >
          {showFullDescription ? 'Tampilkan lebih sedikit' : 'Tampilkan lebih banyak'}
        </button>
      </div>

      <div className="event-detail-panel__skills">
        <h3>Skill yang Dibutuhkan</h3>
        <div className="event-detail-panel__skill-list">
          {event.skills.map((skill) => (
            <span key={skill} className="event-detail-panel__skill-tag">{skill}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
```

The `href="#reviews"` anchor has no matching `id` yet — harmless no-op until Task 10 adds `id="reviews"` to `EventRatingSummary`.

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

  console.log('OLD_FACTS_GRID_GONE:', await page.locator('.event-detail-panel__facts').count())
  console.log('SUBTITLE_TEXT:', await page.locator('.event-detail-panel__subtitle').textContent())
  console.log('DESC_CLAMPED_INITIALLY:', await page.locator('.event-detail-panel__desc--clamped').count())
  await page.click('.event-detail-panel__desc-toggle')
  console.log('DESC_EXPANDED_AFTER_CLICK:', await page.locator('.event-detail-panel__desc--clamped').count())

  await page.screenshot({ path: 'd:/tmp/event-detail-reorder.png', fullPage: true })
  console.log('CONSOLE_ERRORS:', JSON.stringify(errors))
  await browser.close()
})
"
```

Expected: `OLD_FACTS_GRID_GONE: 0`, `SUBTITLE_TEXT` contains the category, location, slot count, a `★`, and "ulasan", `DESC_CLAMPED_INITIALLY: 1`, `DESC_EXPANDED_AFTER_CLICK: 0`, `CONSOLE_ERRORS: []`.

- [ ] **Step 5: Commit**

```bash
cd "d:\smester-4\tubes\ActiVIbe" && git add frontend/src/components/EventDetailPanel.tsx frontend/src/components/EventDetailPanel.css
git commit -m "Reorder EventDetailPanel into new section order, remove old facts grid"
```

No `git push`.

---

### Task 5: `EventGalleryHero` — category placeholder image

**Files:**
- Create: `frontend/src/components/EventGalleryHero.tsx`
- Create: `frontend/src/components/EventGalleryHero.css`
- Modify: `frontend/src/components/EventDetailPanel.tsx`

**Interfaces:**
- Consumes: `getCategoryStyle` (Task 1).
- Produces: `EventGalleryHero({ category: string })`, default export.

- [ ] **Step 1: Create `EventGalleryHero`**

Create `frontend/src/components/EventGalleryHero.css`:

```css
.event-gallery-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 220px;
  border-radius: 16px;
}

.event-gallery-hero__icon {
  font-size: 48px;
  color: var(--color-text-heading);
  opacity: 0.6;
}

.event-gallery-hero__label {
  font-family: var(--font-display);
  font-size: 18px;
  color: var(--color-text-heading);
}
```

Create `frontend/src/components/EventGalleryHero.tsx`:

```tsx
import { getCategoryStyle } from '../utils/categoryStyle'
import './EventGalleryHero.css'

interface EventGalleryHeroProps {
  category: string
}

export default function EventGalleryHero({ category }: EventGalleryHeroProps) {
  const { icon: Icon, bgToken } = getCategoryStyle(category)

  return (
    <div className="event-gallery-hero" style={{ background: bgToken }}>
      <Icon className="event-gallery-hero__icon" aria-hidden="true" />
      <span className="event-gallery-hero__label">{category}</span>
    </div>
  )
}
```

- [ ] **Step 2: Insert it at the top of `EventDetailPanel`**

In `frontend/src/components/EventDetailPanel.tsx`, change the import block from:

```tsx
import { useState } from 'react'
import { FiShare2, FiBookmark } from 'react-icons/fi'
import type { Event } from '../types/event'
import { getMatchTier } from '../utils/matchScore'
import './EventDetailPanel.css'
```

to:

```tsx
import { useState } from 'react'
import { FiShare2, FiBookmark } from 'react-icons/fi'
import type { Event } from '../types/event'
import { getMatchTier } from '../utils/matchScore'
import EventGalleryHero from './EventGalleryHero'
import './EventDetailPanel.css'
```

Change:

```tsx
    <div className="event-detail-panel">
      <div className="event-detail-panel__title-row">
```

to:

```tsx
    <div className="event-detail-panel">
      <EventGalleryHero category={event.category} />

      <div className="event-detail-panel__title-row">
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

  console.log('GALLERY_PRESENT:', await page.locator('.event-gallery-hero').count())
  const labelBefore = await page.locator('.event-gallery-hero__label').textContent()
  await page.locator('.event-list-sidebar__item').nth(2).click()
  const labelAfter = await page.locator('.event-gallery-hero__label').textContent()
  console.log('LABEL_CHANGED_ON_SWITCH:', labelBefore !== labelAfter)

  await page.screenshot({ path: 'd:/tmp/event-gallery.png', fullPage: true })
  console.log('CONSOLE_ERRORS:', JSON.stringify(errors))
  await browser.close()
})
"
```

Expected: `GALLERY_PRESENT: 1`, `LABEL_CHANGED_ON_SWITCH: true`, `CONSOLE_ERRORS: []`.

- [ ] **Step 5: Commit**

```bash
cd "d:\smester-4\tubes\ActiVIbe" && git add frontend/src/components/EventGalleryHero.tsx frontend/src/components/EventGalleryHero.css frontend/src/components/EventDetailPanel.tsx
git commit -m "Add EventGalleryHero category placeholder to EventDetailPanel"
```

No `git push`.

---

### Task 6: `EventOrganizerStrip` — compact organizer mention

**Files:**
- Create: `frontend/src/components/EventOrganizerStrip.tsx`
- Create: `frontend/src/components/EventOrganizerStrip.css`
- Modify: `frontend/src/components/EventDetailPanel.tsx`

**Interfaces:**
- Consumes: `Event` (Task 2's `organizerName`, `organizerEventsCount`, `organizerRating`).
- Produces: `EventOrganizerStrip({ event: Event })`, default export.

- [ ] **Step 1: Create `EventOrganizerStrip`**

Create `frontend/src/components/EventOrganizerStrip.css`:

```css
.event-organizer-strip {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border-light);
}

.event-organizer-strip__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-text-on-accent);
  font-family: var(--font-display);
  font-size: 18px;
  flex-shrink: 0;
}

.event-organizer-strip__name {
  font-size: var(--text-body-sm);
  font-weight: 700;
  color: var(--color-text-heading);
  margin: 0;
}

.event-organizer-strip__meta {
  font-size: var(--text-body-xs);
  color: var(--color-text-muted);
  margin: 2px 0 0;
}
```

Create `frontend/src/components/EventOrganizerStrip.tsx`:

```tsx
import type { Event } from '../types/event'
import './EventOrganizerStrip.css'

interface EventOrganizerStripProps {
  event: Event
}

export default function EventOrganizerStrip({ event }: EventOrganizerStripProps) {
  const initial = event.organizerName.charAt(0).toUpperCase()

  return (
    <div className="event-organizer-strip">
      <span className="event-organizer-strip__avatar" aria-hidden="true">{initial}</span>
      <div className="event-organizer-strip__info">
        <p className="event-organizer-strip__name">Diselenggarakan oleh {event.organizerName}</p>
        <p className="event-organizer-strip__meta">
          {event.organizerEventsCount} kegiatan diselenggarakan · ★ {event.organizerRating.toFixed(1)}
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Insert it after the subtitle, before the match badges**

In `frontend/src/components/EventDetailPanel.tsx`, change the import block from:

```tsx
import { useState } from 'react'
import { FiShare2, FiBookmark } from 'react-icons/fi'
import type { Event } from '../types/event'
import { getMatchTier } from '../utils/matchScore'
import EventGalleryHero from './EventGalleryHero'
import './EventDetailPanel.css'
```

to:

```tsx
import { useState } from 'react'
import { FiShare2, FiBookmark } from 'react-icons/fi'
import type { Event } from '../types/event'
import { getMatchTier } from '../utils/matchScore'
import EventGalleryHero from './EventGalleryHero'
import EventOrganizerStrip from './EventOrganizerStrip'
import './EventDetailPanel.css'
```

Change:

```tsx
        <a href="#reviews">{event.reviewCount} ulasan</a>
      </p>

      <div className="event-detail-panel__badges">
```

to:

```tsx
        <a href="#reviews">{event.reviewCount} ulasan</a>
      </p>

      <EventOrganizerStrip event={event} />

      <div className="event-detail-panel__badges">
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

  console.log('ORGANIZER_NAME_TEXT:', await page.locator('.event-organizer-strip__name').textContent())

  await page.screenshot({ path: 'd:/tmp/event-organizer-strip.png', fullPage: true })
  console.log('CONSOLE_ERRORS:', JSON.stringify(errors))
  await browser.close()
})
"
```

Expected: `ORGANIZER_NAME_TEXT` starts with "Diselenggarakan oleh " followed by the top-match event's organizer name (`Gerakan Literasi Yogyakarta`, since `evt-6` has the highest `matchScore`), `CONSOLE_ERRORS: []`.

- [ ] **Step 5: Commit**

```bash
cd "d:\smester-4\tubes\ActiVIbe" && git add frontend/src/components/EventOrganizerStrip.tsx frontend/src/components/EventOrganizerStrip.css frontend/src/components/EventDetailPanel.tsx
git commit -m "Add EventOrganizerStrip compact organizer mention to EventDetailPanel"
```

No `git push`.

---

### Task 7: `EventHighlights` — 3 static perks

**Files:**
- Create: `frontend/src/components/EventHighlights.tsx`
- Create: `frontend/src/components/EventHighlights.css`
- Modify: `frontend/src/components/EventDetailPanel.tsx`

**Interfaces:**
- Consumes: nothing — fully static, no props.
- Produces: `EventHighlights()`, default export.

- [ ] **Step 1: Create `EventHighlights`**

Create `frontend/src/components/EventHighlights.css`:

```css
.event-highlights {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.event-highlights__item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.event-highlights__icon {
  font-size: 22px;
  color: var(--color-primary);
  flex-shrink: 0;
  margin-top: 2px;
}

.event-highlights__title {
  font-size: var(--text-body-sm);
  font-weight: 700;
  color: var(--color-text-heading);
  margin: 0 0 2px;
}

.event-highlights__desc {
  font-size: var(--text-body-xs);
  color: var(--color-text-muted);
  margin: 0;
}
```

Create `frontend/src/components/EventHighlights.tsx`:

```tsx
import { FiAward, FiTrendingUp, FiUserCheck } from 'react-icons/fi'
import './EventHighlights.css'

const HIGHLIGHTS = [
  {
    icon: FiAward,
    title: 'Sertifikat Digital',
    desc: 'Dapatkan sertifikat digital otomatis setelah kegiatan selesai.',
  },
  {
    icon: FiTrendingUp,
    title: 'Dampak Terukur',
    desc: 'Kontribusimu tercatat di Impact Passport sebagai jejak dampak yang bisa dibagikan.',
  },
  {
    icon: FiUserCheck,
    title: 'Didampingi Panitia',
    desc: 'Panitia dari penyelenggara mendampingi selama kegiatan berlangsung.',
  },
] as const

export default function EventHighlights() {
  return (
    <div className="event-highlights">
      {HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="event-highlights__item">
          <Icon className="event-highlights__icon" aria-hidden="true" />
          <div>
            <p className="event-highlights__title">{title}</p>
            <p className="event-highlights__desc">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Insert it after the match badges/reasoning, before the description**

In `frontend/src/components/EventDetailPanel.tsx`, change the import block from:

```tsx
import { useState } from 'react'
import { FiShare2, FiBookmark } from 'react-icons/fi'
import type { Event } from '../types/event'
import { getMatchTier } from '../utils/matchScore'
import EventGalleryHero from './EventGalleryHero'
import EventOrganizerStrip from './EventOrganizerStrip'
import './EventDetailPanel.css'
```

to:

```tsx
import { useState } from 'react'
import { FiShare2, FiBookmark } from 'react-icons/fi'
import type { Event } from '../types/event'
import { getMatchTier } from '../utils/matchScore'
import EventGalleryHero from './EventGalleryHero'
import EventOrganizerStrip from './EventOrganizerStrip'
import EventHighlights from './EventHighlights'
import './EventDetailPanel.css'
```

Change:

```tsx
      <p className="event-detail-panel__match-reasoning">{event.matchReasoning}</p>

      <div className="event-detail-panel__description-block">
```

to:

```tsx
      <p className="event-detail-panel__match-reasoning">{event.matchReasoning}</p>

      <EventHighlights />

      <div className="event-detail-panel__description-block">
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

  console.log('HIGHLIGHT_COUNT:', await page.locator('.event-highlights__item').count())

  await page.screenshot({ path: 'd:/tmp/event-highlights.png', fullPage: true })
  console.log('CONSOLE_ERRORS:', JSON.stringify(errors))
  await browser.close()
})
"
```

Expected: `HIGHLIGHT_COUNT: 3`, `CONSOLE_ERRORS: []`.

- [ ] **Step 5: Commit**

```bash
cd "d:\smester-4\tubes\ActiVIbe" && git add frontend/src/components/EventHighlights.tsx frontend/src/components/EventHighlights.css frontend/src/components/EventDetailPanel.tsx
git commit -m "Add EventHighlights static perks to EventDetailPanel"
```

No `git push`.

---

### Task 8: `EventAmenities` — "Apa yang Disediakan"

**Files:**
- Create: `frontend/src/components/EventAmenities.tsx`
- Create: `frontend/src/components/EventAmenities.css`
- Modify: `frontend/src/components/EventDetailPanel.tsx`

**Interfaces:**
- Consumes: `event.provisions` (Task 2).
- Produces: `EventAmenities({ provisions: string[] })`, default export.

- [ ] **Step 1: Create `EventAmenities`**

Create `frontend/src/components/EventAmenities.css`:

```css
.event-amenities h3 {
  font-size: var(--text-body-md);
  margin: 0 0 10px;
}

.event-amenities__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.event-amenities__item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--text-body-sm);
  color: var(--color-text-body);
}

.event-amenities__icon {
  color: var(--color-success);
  flex-shrink: 0;
}
```

Create `frontend/src/components/EventAmenities.tsx`:

```tsx
import { FiCheckCircle } from 'react-icons/fi'
import './EventAmenities.css'

interface EventAmenitiesProps {
  provisions: string[]
}

export default function EventAmenities({ provisions }: EventAmenitiesProps) {
  return (
    <div className="event-amenities">
      <h3>Apa yang Disediakan</h3>
      <div className="event-amenities__grid">
        {provisions.map((item) => (
          <span key={item} className="event-amenities__item">
            <FiCheckCircle className="event-amenities__icon" aria-hidden="true" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Insert it after the description, before the skills section**

In `frontend/src/components/EventDetailPanel.tsx`, change the import block from:

```tsx
import { useState } from 'react'
import { FiShare2, FiBookmark } from 'react-icons/fi'
import type { Event } from '../types/event'
import { getMatchTier } from '../utils/matchScore'
import EventGalleryHero from './EventGalleryHero'
import EventOrganizerStrip from './EventOrganizerStrip'
import EventHighlights from './EventHighlights'
import './EventDetailPanel.css'
```

to:

```tsx
import { useState } from 'react'
import { FiShare2, FiBookmark } from 'react-icons/fi'
import type { Event } from '../types/event'
import { getMatchTier } from '../utils/matchScore'
import EventGalleryHero from './EventGalleryHero'
import EventOrganizerStrip from './EventOrganizerStrip'
import EventHighlights from './EventHighlights'
import EventAmenities from './EventAmenities'
import './EventDetailPanel.css'
```

Change:

```tsx
        </button>
      </div>

      <div className="event-detail-panel__skills">
```

to:

```tsx
        </button>
      </div>

      <EventAmenities provisions={event.provisions} />

      <div className="event-detail-panel__skills">
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

  console.log('AMENITY_COUNT:', await page.locator('.event-amenities__item').count())

  await page.screenshot({ path: 'd:/tmp/event-amenities.png', fullPage: true })
  console.log('CONSOLE_ERRORS:', JSON.stringify(errors))
  await browser.close()
})
"
```

Expected: `AMENITY_COUNT: 3` (`evt-6`, the default-selected event, has 3 provisions: buku & alat baca, snack, sertifikat digital), `CONSOLE_ERRORS: []`.

- [ ] **Step 5: Commit**

```bash
cd "d:\smester-4\tubes\ActiVIbe" && git add frontend/src/components/EventAmenities.tsx frontend/src/components/EventAmenities.css frontend/src/components/EventDetailPanel.tsx
git commit -m "Add EventAmenities provisions grid to EventDetailPanel"
```

No `git push`.

---

### Task 9: `EventScheduleCalendar` — read-only month grid(s)

**Files:**
- Create: `frontend/src/components/EventScheduleCalendar.tsx`
- Create: `frontend/src/components/EventScheduleCalendar.css`
- Modify: `frontend/src/components/EventDetailPanel.tsx`

**Interfaces:**
- Consumes: `buildEventCalendarMonths` (Task 1).
- Produces: `EventScheduleCalendar({ startDate: string; endDate: string })`, default export.

- [ ] **Step 1: Create `EventScheduleCalendar`**

Create `frontend/src/components/EventScheduleCalendar.css`:

```css
.event-schedule-calendar h3 {
  font-size: var(--text-body-md);
  margin: 0 0 10px;
}

.event-schedule-calendar__months {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.event-schedule-calendar__month {
  flex: 1;
  min-width: 220px;
}

.event-schedule-calendar__month-label {
  font-size: var(--text-body-sm);
  font-weight: 700;
  color: var(--color-text-heading);
  margin: 0 0 8px;
  text-align: center;
}

.event-schedule-calendar__weekdays,
.event-schedule-calendar__week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.event-schedule-calendar__weekdays span {
  font-size: 11px;
  color: var(--color-text-muted);
  text-align: center;
  padding-bottom: 4px;
}

.event-schedule-calendar__day {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  font-size: var(--text-body-xs);
  color: var(--color-text-body);
  border-radius: 50%;
}

.event-schedule-calendar__day--highlighted {
  background: var(--color-primary);
  color: var(--color-text-on-accent);
  font-weight: 700;
}

@media (max-width: 600px) {
  .event-schedule-calendar__months {
    flex-direction: column;
  }
}
```

Create `frontend/src/components/EventScheduleCalendar.tsx`:

```tsx
import { buildEventCalendarMonths } from '../utils/calendarGrid'
import './EventScheduleCalendar.css'

interface EventScheduleCalendarProps {
  startDate: string
  endDate: string
}

const WEEKDAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

export default function EventScheduleCalendar({ startDate, endDate }: EventScheduleCalendarProps) {
  const months = buildEventCalendarMonths(startDate, endDate)

  return (
    <div className="event-schedule-calendar">
      <h3>Jadwal Kegiatan</h3>
      <div className="event-schedule-calendar__months">
        {months.map((month) => (
          <div key={`${month.year}-${month.month}`} className="event-schedule-calendar__month">
            <p className="event-schedule-calendar__month-label">{month.monthLabel}</p>
            <div className="event-schedule-calendar__weekdays">
              {WEEKDAY_LABELS.map((label, index) => (
                <span key={`${label}-${index}`}>{label}</span>
              ))}
            </div>
            {month.weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="event-schedule-calendar__week">
                {week.map((day, dayIndex) => (
                  <span
                    key={day.isoDate ?? `empty-${dayIndex}`}
                    className={`event-schedule-calendar__day${day.isHighlighted ? ' event-schedule-calendar__day--highlighted' : ''}`}
                  >
                    {day.day ?? ''}
                  </span>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Insert it after the skills section**

In `frontend/src/components/EventDetailPanel.tsx`, change the import block from:

```tsx
import { useState } from 'react'
import { FiShare2, FiBookmark } from 'react-icons/fi'
import type { Event } from '../types/event'
import { getMatchTier } from '../utils/matchScore'
import EventGalleryHero from './EventGalleryHero'
import EventOrganizerStrip from './EventOrganizerStrip'
import EventHighlights from './EventHighlights'
import EventAmenities from './EventAmenities'
import './EventDetailPanel.css'
```

to:

```tsx
import { useState } from 'react'
import { FiShare2, FiBookmark } from 'react-icons/fi'
import type { Event } from '../types/event'
import { getMatchTier } from '../utils/matchScore'
import EventGalleryHero from './EventGalleryHero'
import EventOrganizerStrip from './EventOrganizerStrip'
import EventHighlights from './EventHighlights'
import EventAmenities from './EventAmenities'
import EventScheduleCalendar from './EventScheduleCalendar'
import './EventDetailPanel.css'
```

Change:

```tsx
          ))}
        </div>
      </div>
    </div>
  )
}
```

to:

```tsx
          ))}
        </div>
      </div>

      <EventScheduleCalendar startDate={event.startDate} endDate={event.endDate} />
    </div>
  )
}
```

(This is the last `</div>` block in the file — the one closing `.event-detail-panel__skills` followed by the one closing `.event-detail-panel` itself. Confirm you're editing that exact pair, not an earlier closing-div pair in the file.)

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
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } })
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push(String(e)))

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
  await page.click('button.navbar__login')
  await page.fill('#email', 'find-activity-test@example.com')
  await page.fill('#password', 'Password123!')
  await page.click('button.auth-modal__submit')
  await page.waitForURL('**/dashboard', { timeout: 8000 })

  // Default-selected event is evt-6 (highest matchScore): 2026-07-11 to 2026-09-26 — spans 2 different months.
  console.log('MONTH_GRID_COUNT:', await page.locator('.event-schedule-calendar__month').count())
  console.log('HIGHLIGHTED_DAY_COUNT:', await page.locator('.event-schedule-calendar__day--highlighted').count())
  console.log('FIRST_MONTH_LABEL:', await page.locator('.event-schedule-calendar__month-label').nth(0).textContent())
  console.log('SECOND_MONTH_LABEL:', await page.locator('.event-schedule-calendar__month-label').nth(1).textContent())

  await page.screenshot({ path: 'd:/tmp/event-calendar.png', fullPage: true })
  console.log('CONSOLE_ERRORS:', JSON.stringify(errors))
  await browser.close()
})
"
```

Expected: `MONTH_GRID_COUNT: 2`, `HIGHLIGHTED_DAY_COUNT` greater than 0, `FIRST_MONTH_LABEL: Juli 2026`, `SECOND_MONTH_LABEL: September 2026` (August is correctly skipped per spec §4). Read `d:/tmp/event-calendar.png` to visually confirm the highlighted days look correct (July 11 onward in the first grid, through September 26 in the second), then delete the screenshot.

- [ ] **Step 5: Commit**

```bash
cd "d:\smester-4\tubes\ActiVIbe" && git add frontend/src/components/EventScheduleCalendar.tsx frontend/src/components/EventScheduleCalendar.css frontend/src/components/EventDetailPanel.tsx
git commit -m "Add EventScheduleCalendar read-only month grid to EventDetailPanel"
```

No `git push`.

---

### Task 10: `EventRatingSummary` — overall rating + category breakdown

**Files:**
- Create: `frontend/src/components/EventRatingSummary.tsx`
- Create: `frontend/src/components/EventRatingSummary.css`
- Modify: `frontend/src/components/EventDetailPanel.tsx`

**Interfaces:**
- Consumes: `RatingBreakdownItem` (Task 1), `event.rating`/`reviewCount`/`ratingBreakdown` (Task 2).
- Produces: `EventRatingSummary({ rating: number; reviewCount: number; ratingBreakdown: RatingBreakdownItem[] })`, default export. Renders `id="reviews"` on its root — this is the anchor target the subtitle's `#reviews` link (Task 4) jumps to.

- [ ] **Step 1: Create `EventRatingSummary`**

Create `frontend/src/components/EventRatingSummary.css`:

```css
.event-rating-summary h3 {
  font-size: var(--text-body-md);
  margin: 0 0 14px;
}

.event-rating-summary__breakdown {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.event-rating-summary__row {
  display: grid;
  grid-template-columns: 140px 1fr 32px;
  align-items: center;
  gap: 10px;
}

.event-rating-summary__label {
  font-size: var(--text-body-xs);
  color: var(--color-text-body);
}

.event-rating-summary__bar {
  height: 6px;
  border-radius: 999px;
  background: var(--color-border-light);
  overflow: hidden;
}

.event-rating-summary__bar-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 999px;
}

.event-rating-summary__score {
  font-size: var(--text-body-xs);
  font-weight: 600;
  color: var(--color-text-heading);
  text-align: right;
}

@media (max-width: 600px) {
  .event-rating-summary__row {
    grid-template-columns: 100px 1fr 28px;
  }
}
```

Create `frontend/src/components/EventRatingSummary.tsx`:

```tsx
import type { RatingBreakdownItem } from '../types/event'
import './EventRatingSummary.css'

interface EventRatingSummaryProps {
  rating: number
  reviewCount: number
  ratingBreakdown: RatingBreakdownItem[]
}

export default function EventRatingSummary({ rating, reviewCount, ratingBreakdown }: EventRatingSummaryProps) {
  return (
    <div id="reviews" className="event-rating-summary">
      <h3>★ {rating.toFixed(1)} · {reviewCount} ulasan</h3>
      <div className="event-rating-summary__breakdown">
        {ratingBreakdown.map((item) => (
          <div key={item.label} className="event-rating-summary__row">
            <span className="event-rating-summary__label">{item.label}</span>
            <div className="event-rating-summary__bar">
              <div className="event-rating-summary__bar-fill" style={{ width: `${(item.score / 5) * 100}%` }} />
            </div>
            <span className="event-rating-summary__score">{item.score.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Insert it after the calendar**

In `frontend/src/components/EventDetailPanel.tsx`, change the import block from:

```tsx
import { useState } from 'react'
import { FiShare2, FiBookmark } from 'react-icons/fi'
import type { Event } from '../types/event'
import { getMatchTier } from '../utils/matchScore'
import EventGalleryHero from './EventGalleryHero'
import EventOrganizerStrip from './EventOrganizerStrip'
import EventHighlights from './EventHighlights'
import EventAmenities from './EventAmenities'
import EventScheduleCalendar from './EventScheduleCalendar'
import './EventDetailPanel.css'
```

to:

```tsx
import { useState } from 'react'
import { FiShare2, FiBookmark } from 'react-icons/fi'
import type { Event } from '../types/event'
import { getMatchTier } from '../utils/matchScore'
import EventGalleryHero from './EventGalleryHero'
import EventOrganizerStrip from './EventOrganizerStrip'
import EventHighlights from './EventHighlights'
import EventAmenities from './EventAmenities'
import EventScheduleCalendar from './EventScheduleCalendar'
import EventRatingSummary from './EventRatingSummary'
import './EventDetailPanel.css'
```

Change:

```tsx
      <EventScheduleCalendar startDate={event.startDate} endDate={event.endDate} />
    </div>
  )
}
```

to:

```tsx
      <EventScheduleCalendar startDate={event.startDate} endDate={event.endDate} />

      <EventRatingSummary
        rating={event.rating}
        reviewCount={event.reviewCount}
        ratingBreakdown={event.ratingBreakdown}
      />
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
cd "d:\smester-4\tubes\ActiVIbe\frontend" && pnpm build
```

Expected: exits 0.

- [ ] **Step 4: Verify visually, including the subtitle's anchor link**

```bash
cd "d:\smester-4\tubes\ActiVIbe\frontend" && node -e "
import('file:///C:/Users/rakha/AppData/Local/npm-cache/_npx/48b1ca104c3549f4/node_modules/playwright/index.mjs').then(async ({ chromium }) => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } })
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push(String(e)))

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
  await page.click('button.navbar__login')
  await page.fill('#email', 'find-activity-test@example.com')
  await page.fill('#password', 'Password123!')
  await page.click('button.auth-modal__submit')
  await page.waitForURL('**/dashboard', { timeout: 8000 })

  console.log('BREAKDOWN_ROW_COUNT:', await page.locator('.event-rating-summary__row').count())
  console.log('REVIEWS_ANCHOR_PRESENT:', await page.locator('#reviews').count())

  await page.click('.event-detail-panel__subtitle a')
  await page.waitForTimeout(300)
  console.log('URL_AFTER_ANCHOR_CLICK:', page.url())

  await page.screenshot({ path: 'd:/tmp/event-rating-summary.png', fullPage: true })
  console.log('CONSOLE_ERRORS:', JSON.stringify(errors))
  await browser.close()
})
"
```

Expected: `BREAKDOWN_ROW_COUNT: 4`, `REVIEWS_ANCHOR_PRESENT: 1`, `URL_AFTER_ANCHOR_CLICK` ends with `#reviews`, `CONSOLE_ERRORS: []`.

- [ ] **Step 5: Commit**

```bash
cd "d:\smester-4\tubes\ActiVIbe" && git add frontend/src/components/EventRatingSummary.tsx frontend/src/components/EventRatingSummary.css frontend/src/components/EventDetailPanel.tsx
git commit -m "Add EventRatingSummary with category breakdown to EventDetailPanel"
```

No `git push`.

---

### Task 11: `EventReviewList` — review cards

**Files:**
- Create: `frontend/src/components/EventReviewList.tsx`
- Create: `frontend/src/components/EventReviewList.css`
- Modify: `frontend/src/components/EventDetailPanel.tsx`

**Interfaces:**
- Consumes: `ReviewEntry` (Task 1), `event.reviews` (Task 2).
- Produces: `EventReviewList({ reviews: ReviewEntry[] })`, default export.

- [ ] **Step 1: Create `EventReviewList`**

Create `frontend/src/components/EventReviewList.css`:

```css
.event-review-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.event-review-list__card {
  border: 1px solid var(--color-border-light);
  border-radius: 14px;
  padding: 14px;
}

.event-review-list__header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.event-review-list__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-secondary-soft);
  color: var(--color-secondary-dark);
  font-family: var(--font-display);
  font-size: 14px;
  flex-shrink: 0;
}

.event-review-list__name {
  font-size: var(--text-body-xs);
  font-weight: 700;
  color: var(--color-text-heading);
  margin: 0;
}

.event-review-list__time {
  font-size: 11px;
  color: var(--color-text-muted);
  margin: 0;
}

.event-review-list__rating {
  color: var(--color-accent-yellow);
  font-size: 13px;
  margin: 0 0 6px;
}

.event-review-list__text {
  font-size: var(--text-body-xs);
  color: var(--color-text-body);
  line-height: var(--leading-normal);
  margin: 0;
}
```

Create `frontend/src/components/EventReviewList.tsx`:

```tsx
import type { ReviewEntry } from '../types/event'
import './EventReviewList.css'

interface EventReviewListProps {
  reviews: ReviewEntry[]
}

export default function EventReviewList({ reviews }: EventReviewListProps) {
  return (
    <div className="event-review-list">
      {reviews.map((review) => {
        const fullStars = Math.round(review.rating)
        return (
          <div key={`${review.reviewerName}-${review.timeAgo}`} className="event-review-list__card">
            <div className="event-review-list__header">
              <span className="event-review-list__avatar" aria-hidden="true">{review.reviewerName.charAt(0)}</span>
              <div>
                <p className="event-review-list__name">{review.reviewerName}</p>
                <p className="event-review-list__time">{review.timeAgo}</p>
              </div>
            </div>
            <p className="event-review-list__rating">{'★'.repeat(fullStars)}{'☆'.repeat(5 - fullStars)}</p>
            <p className="event-review-list__text">{review.text}</p>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Insert it after the rating summary**

In `frontend/src/components/EventDetailPanel.tsx`, change the import block from:

```tsx
import { useState } from 'react'
import { FiShare2, FiBookmark } from 'react-icons/fi'
import type { Event } from '../types/event'
import { getMatchTier } from '../utils/matchScore'
import EventGalleryHero from './EventGalleryHero'
import EventOrganizerStrip from './EventOrganizerStrip'
import EventHighlights from './EventHighlights'
import EventAmenities from './EventAmenities'
import EventScheduleCalendar from './EventScheduleCalendar'
import EventRatingSummary from './EventRatingSummary'
import './EventDetailPanel.css'
```

to:

```tsx
import { useState } from 'react'
import { FiShare2, FiBookmark } from 'react-icons/fi'
import type { Event } from '../types/event'
import { getMatchTier } from '../utils/matchScore'
import EventGalleryHero from './EventGalleryHero'
import EventOrganizerStrip from './EventOrganizerStrip'
import EventHighlights from './EventHighlights'
import EventAmenities from './EventAmenities'
import EventScheduleCalendar from './EventScheduleCalendar'
import EventRatingSummary from './EventRatingSummary'
import EventReviewList from './EventReviewList'
import './EventDetailPanel.css'
```

Change:

```tsx
      <EventRatingSummary
        rating={event.rating}
        reviewCount={event.reviewCount}
        ratingBreakdown={event.ratingBreakdown}
      />
    </div>
  )
}
```

to:

```tsx
      <EventRatingSummary
        rating={event.rating}
        reviewCount={event.reviewCount}
        ratingBreakdown={event.ratingBreakdown}
      />

      <EventReviewList reviews={event.reviews} />
    </div>
  )
}
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
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } })
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push(String(e)))

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
  await page.click('button.navbar__login')
  await page.fill('#email', 'find-activity-test@example.com')
  await page.fill('#password', 'Password123!')
  await page.click('button.auth-modal__submit')
  await page.waitForURL('**/dashboard', { timeout: 8000 })

  console.log('REVIEW_CARD_COUNT:', await page.locator('.event-review-list__card').count())

  await page.screenshot({ path: 'd:/tmp/event-reviews.png', fullPage: true })
  console.log('CONSOLE_ERRORS:', JSON.stringify(errors))
  await browser.close()
})
"
```

Expected: `REVIEW_CARD_COUNT: 3`, `CONSOLE_ERRORS: []`.

- [ ] **Step 5: Commit**

```bash
cd "d:\smester-4\tubes\ActiVIbe" && git add frontend/src/components/EventReviewList.tsx frontend/src/components/EventReviewList.css frontend/src/components/EventDetailPanel.tsx
git commit -m "Add EventReviewList review cards to EventDetailPanel"
```

No `git push`.

---

### Task 12: `EventLocationMap` — location text + static map placeholder

**Files:**
- Create: `frontend/src/components/EventLocationMap.tsx`
- Create: `frontend/src/components/EventLocationMap.css`
- Modify: `frontend/src/components/EventDetailPanel.tsx`

**Interfaces:**
- Consumes: `event.location` (existing field).
- Produces: `EventLocationMap({ location: string })`, default export.

- [ ] **Step 1: Create `EventLocationMap`**

Create `frontend/src/components/EventLocationMap.css`:

```css
.event-location-map h3 {
  font-size: var(--text-body-md);
  margin: 0 0 8px;
}

.event-location-map__address {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-body-sm);
  color: var(--color-text-body);
  margin: 0 0 12px;
}

.event-location-map__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 180px;
  border-radius: 14px;
  background: var(--color-bg-surface);
  border: 1px dashed var(--color-border-medium);
  color: var(--color-text-muted);
  font-size: var(--text-body-sm);
}
```

Create `frontend/src/components/EventLocationMap.tsx`:

```tsx
import { FiMapPin } from 'react-icons/fi'
import './EventLocationMap.css'

interface EventLocationMapProps {
  location: string
}

export default function EventLocationMap({ location }: EventLocationMapProps) {
  return (
    <div className="event-location-map">
      <h3>Di Mana Kegiatan Berlangsung</h3>
      <p className="event-location-map__address">
        <FiMapPin aria-hidden="true" /> {location}
      </p>
      <div className="event-location-map__placeholder">Peta interaktif segera hadir</div>
    </div>
  )
}
```

- [ ] **Step 2: Insert it after the review list**

In `frontend/src/components/EventDetailPanel.tsx`, change the import block from:

```tsx
import { useState } from 'react'
import { FiShare2, FiBookmark } from 'react-icons/fi'
import type { Event } from '../types/event'
import { getMatchTier } from '../utils/matchScore'
import EventGalleryHero from './EventGalleryHero'
import EventOrganizerStrip from './EventOrganizerStrip'
import EventHighlights from './EventHighlights'
import EventAmenities from './EventAmenities'
import EventScheduleCalendar from './EventScheduleCalendar'
import EventRatingSummary from './EventRatingSummary'
import EventReviewList from './EventReviewList'
import './EventDetailPanel.css'
```

to:

```tsx
import { useState } from 'react'
import { FiShare2, FiBookmark } from 'react-icons/fi'
import type { Event } from '../types/event'
import { getMatchTier } from '../utils/matchScore'
import EventGalleryHero from './EventGalleryHero'
import EventOrganizerStrip from './EventOrganizerStrip'
import EventHighlights from './EventHighlights'
import EventAmenities from './EventAmenities'
import EventScheduleCalendar from './EventScheduleCalendar'
import EventRatingSummary from './EventRatingSummary'
import EventReviewList from './EventReviewList'
import EventLocationMap from './EventLocationMap'
import './EventDetailPanel.css'
```

Change:

```tsx
      <EventReviewList reviews={event.reviews} />
    </div>
  )
}
```

to:

```tsx
      <EventReviewList reviews={event.reviews} />

      <EventLocationMap location={event.location} />
    </div>
  )
}
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
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } })
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push(String(e)))

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
  await page.click('button.navbar__login')
  await page.fill('#email', 'find-activity-test@example.com')
  await page.fill('#password', 'Password123!')
  await page.click('button.auth-modal__submit')
  await page.waitForURL('**/dashboard', { timeout: 8000 })

  console.log('MAP_PLACEHOLDER_PRESENT:', await page.locator('.event-location-map__placeholder').count())

  await page.screenshot({ path: 'd:/tmp/event-location-map.png', fullPage: true })
  console.log('CONSOLE_ERRORS:', JSON.stringify(errors))
  await browser.close()
})
"
```

Expected: `MAP_PLACEHOLDER_PRESENT: 1`, `CONSOLE_ERRORS: []`.

- [ ] **Step 5: Commit**

```bash
cd "d:\smester-4\tubes\ActiVIbe" && git add frontend/src/components/EventLocationMap.tsx frontend/src/components/EventLocationMap.css frontend/src/components/EventDetailPanel.tsx
git commit -m "Add EventLocationMap location text and placeholder to EventDetailPanel"
```

No `git push`.

---

### Task 13: `OrganizerProfileCard` — full organizer profile

**Files:**
- Create: `frontend/src/components/OrganizerProfileCard.tsx`
- Create: `frontend/src/components/OrganizerProfileCard.css`
- Modify: `frontend/src/components/EventDetailPanel.tsx`

**Interfaces:**
- Consumes: `Event` (Task 2's `organizerBio`/`organizerEventsCount`/`organizerRating`/`organizerYearsActive`).
- Produces: `OrganizerProfileCard({ event: Event })`, default export.

- [ ] **Step 1: Create `OrganizerProfileCard`**

Create `frontend/src/components/OrganizerProfileCard.css`:

```css
.organizer-profile-card h3 {
  font-size: var(--text-body-md);
  margin: 0 0 14px;
}

.organizer-profile-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.organizer-profile-card__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-text-on-accent);
  font-family: var(--font-display);
  font-size: 22px;
  flex-shrink: 0;
}

.organizer-profile-card__name {
  font-size: var(--text-body-sm);
  font-weight: 700;
  color: var(--color-text-heading);
  margin: 0 0 4px;
}

.organizer-profile-card__badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-success);
  background: var(--color-success-soft);
  padding: 3px 10px;
  border-radius: 999px;
}

.organizer-profile-card__stats {
  font-size: var(--text-body-xs);
  color: var(--color-text-muted);
  margin: 0 0 10px;
}

.organizer-profile-card__bio {
  font-size: var(--text-body-sm);
  color: var(--color-text-body);
  line-height: var(--leading-normal);
  margin: 0 0 14px;
}

.organizer-profile-card__contact-button {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: var(--text-body-sm);
  color: var(--color-primary);
  background: var(--color-primary-soft);
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.organizer-profile-card__contact-button:hover {
  opacity: 0.85;
}
```

Create `frontend/src/components/OrganizerProfileCard.tsx`:

```tsx
import type { Event } from '../types/event'
import './OrganizerProfileCard.css'

interface OrganizerProfileCardProps {
  event: Event
}

export default function OrganizerProfileCard({ event }: OrganizerProfileCardProps) {
  const initial = event.organizerName.charAt(0).toUpperCase()

  return (
    <div className="organizer-profile-card">
      <h3>Tentang Penyelenggara</h3>
      <div className="organizer-profile-card__header">
        <span className="organizer-profile-card__avatar" aria-hidden="true">{initial}</span>
        <div>
          <p className="organizer-profile-card__name">{event.organizerName}</p>
          <span className="organizer-profile-card__badge">Penyelenggara Terverifikasi</span>
        </div>
      </div>
      <p className="organizer-profile-card__stats">
        {event.organizerEventsCount} kegiatan · ★ {event.organizerRating.toFixed(1)} · {event.organizerYearsActive} tahun aktif
      </p>
      <p className="organizer-profile-card__bio">{event.organizerBio}</p>
      <button type="button" className="organizer-profile-card__contact-button">
        Hubungi Penyelenggara
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Insert it after the location map**

In `frontend/src/components/EventDetailPanel.tsx`, change the import block from:

```tsx
import { useState } from 'react'
import { FiShare2, FiBookmark } from 'react-icons/fi'
import type { Event } from '../types/event'
import { getMatchTier } from '../utils/matchScore'
import EventGalleryHero from './EventGalleryHero'
import EventOrganizerStrip from './EventOrganizerStrip'
import EventHighlights from './EventHighlights'
import EventAmenities from './EventAmenities'
import EventScheduleCalendar from './EventScheduleCalendar'
import EventRatingSummary from './EventRatingSummary'
import EventReviewList from './EventReviewList'
import EventLocationMap from './EventLocationMap'
import './EventDetailPanel.css'
```

to:

```tsx
import { useState } from 'react'
import { FiShare2, FiBookmark } from 'react-icons/fi'
import type { Event } from '../types/event'
import { getMatchTier } from '../utils/matchScore'
import EventGalleryHero from './EventGalleryHero'
import EventOrganizerStrip from './EventOrganizerStrip'
import EventHighlights from './EventHighlights'
import EventAmenities from './EventAmenities'
import EventScheduleCalendar from './EventScheduleCalendar'
import EventRatingSummary from './EventRatingSummary'
import EventReviewList from './EventReviewList'
import EventLocationMap from './EventLocationMap'
import OrganizerProfileCard from './OrganizerProfileCard'
import './EventDetailPanel.css'
```

Change:

```tsx
      <EventLocationMap location={event.location} />
    </div>
  )
}
```

to:

```tsx
      <EventLocationMap location={event.location} />

      <OrganizerProfileCard event={event} />
    </div>
  )
}
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
  const page = await browser.newPage({ viewport: { width: 1440, height: 1600 } })
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push(String(e)))

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
  await page.click('button.navbar__login')
  await page.fill('#email', 'find-activity-test@example.com')
  await page.fill('#password', 'Password123!')
  await page.click('button.auth-modal__submit')
  await page.waitForURL('**/dashboard', { timeout: 8000 })

  console.log('ORGANIZER_CARD_NAME:', await page.locator('.organizer-profile-card__name').textContent())
  console.log('CONTACT_BUTTON_PRESENT:', await page.locator('.organizer-profile-card__contact-button').count())

  await page.screenshot({ path: 'd:/tmp/event-organizer-card.png', fullPage: true })
  console.log('CONSOLE_ERRORS:', JSON.stringify(errors))
  await browser.close()
})
"
```

Expected: `ORGANIZER_CARD_NAME: Gerakan Literasi Yogyakarta` (the default-selected `evt-6`'s organizer), `CONTACT_BUTTON_PRESENT: 1`, `CONSOLE_ERRORS: []`.

- [ ] **Step 5: Commit**

```bash
cd "d:\smester-4\tubes\ActiVIbe" && git add frontend/src/components/OrganizerProfileCard.tsx frontend/src/components/OrganizerProfileCard.css frontend/src/components/EventDetailPanel.tsx
git commit -m "Add OrganizerProfileCard full profile section to EventDetailPanel"
```

No `git push`.

---

### Task 14: `EventPolicies` — "Hal yang Perlu Diketahui" (last section)

**Files:**
- Create: `frontend/src/components/EventPolicies.tsx`
- Create: `frontend/src/components/EventPolicies.css`
- Modify: `frontend/src/components/EventDetailPanel.tsx`

**Interfaces:**
- Consumes: `Event` (Task 2's `cancellationPolicy`/`eventRules`/`safetyInfo`).
- Produces: `EventPolicies({ event: Event })`, default export. This is the final section in `EventDetailPanel`'s render order — no task inserts anything after this one.

- [ ] **Step 1: Create `EventPolicies`**

Create `frontend/src/components/EventPolicies.css`:

```css
.event-policies h3 {
  font-size: var(--text-body-md);
  margin: 0 0 14px;
}

.event-policies__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.event-policies__item {
  display: flex;
  flex-direction: column;
}

.event-policies__icon {
  font-size: 22px;
  color: var(--color-primary);
  margin-bottom: 8px;
}

.event-policies__title {
  font-size: var(--text-body-sm);
  font-weight: 700;
  color: var(--color-text-heading);
  margin: 0 0 6px;
}

.event-policies__desc {
  font-size: var(--text-body-xs);
  color: var(--color-text-body);
  line-height: var(--leading-normal);
  margin: 0 0 8px;
}

.event-policies__link {
  font-size: var(--text-body-xs);
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: underline;
}
```

Create `frontend/src/components/EventPolicies.tsx`:

```tsx
import { FiXCircle, FiClipboard, FiShield } from 'react-icons/fi'
import type { Event } from '../types/event'
import './EventPolicies.css'

interface EventPoliciesProps {
  event: Event
}

const POLICY_SECTIONS = [
  { icon: FiXCircle, title: 'Kebijakan Pembatalan', key: 'cancellationPolicy' as const },
  { icon: FiClipboard, title: 'Aturan Kegiatan', key: 'eventRules' as const },
  { icon: FiShield, title: 'Keamanan & Keselamatan', key: 'safetyInfo' as const },
]

export default function EventPolicies({ event }: EventPoliciesProps) {
  return (
    <div className="event-policies">
      <h3>Hal yang Perlu Diketahui</h3>
      <div className="event-policies__grid">
        {POLICY_SECTIONS.map(({ icon: Icon, title, key }) => (
          <div key={key} className="event-policies__item">
            <Icon className="event-policies__icon" aria-hidden="true" />
            <p className="event-policies__title">{title}</p>
            <p className="event-policies__desc">{event[key]}</p>
            <a href="#" className="event-policies__link">Pelajari lebih lanjut</a>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Insert it as the final section**

In `frontend/src/components/EventDetailPanel.tsx`, change the import block from:

```tsx
import { useState } from 'react'
import { FiShare2, FiBookmark } from 'react-icons/fi'
import type { Event } from '../types/event'
import { getMatchTier } from '../utils/matchScore'
import EventGalleryHero from './EventGalleryHero'
import EventOrganizerStrip from './EventOrganizerStrip'
import EventHighlights from './EventHighlights'
import EventAmenities from './EventAmenities'
import EventScheduleCalendar from './EventScheduleCalendar'
import EventRatingSummary from './EventRatingSummary'
import EventReviewList from './EventReviewList'
import EventLocationMap from './EventLocationMap'
import OrganizerProfileCard from './OrganizerProfileCard'
import './EventDetailPanel.css'
```

to:

```tsx
import { useState } from 'react'
import { FiShare2, FiBookmark } from 'react-icons/fi'
import type { Event } from '../types/event'
import { getMatchTier } from '../utils/matchScore'
import EventGalleryHero from './EventGalleryHero'
import EventOrganizerStrip from './EventOrganizerStrip'
import EventHighlights from './EventHighlights'
import EventAmenities from './EventAmenities'
import EventScheduleCalendar from './EventScheduleCalendar'
import EventRatingSummary from './EventRatingSummary'
import EventReviewList from './EventReviewList'
import EventLocationMap from './EventLocationMap'
import OrganizerProfileCard from './OrganizerProfileCard'
import EventPolicies from './EventPolicies'
import './EventDetailPanel.css'
```

Change:

```tsx
      <OrganizerProfileCard event={event} />
    </div>
  )
}
```

to:

```tsx
      <OrganizerProfileCard event={event} />

      <EventPolicies event={event} />
    </div>
  )
}
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
  const page = await browser.newPage({ viewport: { width: 1440, height: 1800 } })
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push(String(e)))

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
  await page.click('button.navbar__login')
  await page.fill('#email', 'find-activity-test@example.com')
  await page.fill('#password', 'Password123!')
  await page.click('button.auth-modal__submit')
  await page.waitForURL('**/dashboard', { timeout: 8000 })

  console.log('POLICY_ITEM_COUNT:', await page.locator('.event-policies__item').count())

  await page.screenshot({ path: 'd:/tmp/event-policies.png', fullPage: true })
  console.log('CONSOLE_ERRORS:', JSON.stringify(errors))
  await browser.close()
})
"
```

Expected: `POLICY_ITEM_COUNT: 3`, `CONSOLE_ERRORS: []`.

- [ ] **Step 5: Commit**

```bash
cd "d:\smester-4\tubes\ActiVIbe" && git add frontend/src/components/EventPolicies.tsx frontend/src/components/EventPolicies.css frontend/src/components/EventDetailPanel.tsx
git commit -m "Add EventPolicies as the final EventDetailPanel section"
```

No `git push`.

---

### Task 15: Verify sticky apply form end-to-end, update README

**Files:**
- Modify: `README.md`

All 15 sections now exist, so this task's only job is the integration check that wasn't meaningfully testable until now (sticky behavior needs real page height) plus the docs update. No new component code.

- [ ] **Step 1: Verify the apply form stays visible while the detail panel scrolls**

```bash
cd "d:\smester-4\tubes\ActiVIbe\frontend" && node -e "
import('file:///C:/Users/rakha/AppData/Local/npm-cache/_npx/48b1ca104c3549f4/node_modules/playwright/index.mjs').then(async ({ chromium }) => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push(String(e)))

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
  await page.click('button.navbar__login')
  await page.fill('#email', 'find-activity-test@example.com')
  await page.fill('#password', 'Password123!')
  await page.click('button.auth-modal__submit')
  await page.waitForURL('**/dashboard', { timeout: 8000 })

  const titleBoxBefore = await page.locator('.event-detail-panel__title').boundingBox()
  const formBoxBefore = await page.locator('.event-apply-form').boundingBox()
  console.log('FORM_TOP_BEFORE_SCROLL:', Math.round(formBoxBefore.y))

  await page.mouse.wheel(0, 1200)
  await page.waitForTimeout(200)

  const titleBoxAfter = await page.locator('.event-detail-panel__title').boundingBox()
  const formBoxAfter = await page.locator('.event-apply-form').boundingBox()
  console.log('TITLE_SCROLLED_AWAY:', titleBoxAfter === null || Math.abs(titleBoxAfter.y - titleBoxBefore.y) > 500)
  console.log('FORM_TOP_AFTER_SCROLL:', Math.round(formBoxAfter.y))
  console.log('FORM_STAYED_NEAR_TOP:', formBoxAfter.y >= 0 && formBoxAfter.y <= 80)

  console.log('CONSOLE_ERRORS:', JSON.stringify(errors))
  await browser.close()
})
"
```

Expected: `TITLE_SCROLLED_AWAY: true` (the title — near the top of a now-very-tall middle column — has moved far out of its original position after scrolling), `FORM_STAYED_NEAR_TOP: true` (the sticky form is pinned around `top: 24px`, not scrolling away with the rest of the page), `CONSOLE_ERRORS: []`. If `FORM_STAYED_NEAR_TOP` is false, the sticky CSS from Task 3 isn't taking effect — check that `.event-apply-form` is still a direct child of `.find-activity-page__columns` (sticky requires no intervening wrapper with `overflow` set) and that no ancestor between it and the scroll container has `overflow: hidden`.

- [ ] **Step 2: Update README**

In `README.md`, find:

```markdown
- [x] Halaman Find Activity (`/dashboard`) — list/detail/form 3 kolom kegiatan volunteer dengan Match Score, search & filter; data masih dummy (`mockEvents.ts`), backend `Event` model menyusul
- [ ] Bangun layout nav-body
```

Replace it with:

```markdown
- [x] Halaman Find Activity (`/dashboard`) — list/detail/form 3 kolom kegiatan volunteer dengan Match Score, search & filter; data masih dummy (`mockEvents.ts`), backend `Event` model menyusul
- [x] Event Detail diperluas jadi halaman 15-section ala listing Airbnb (galeri kategori, organizer, amenities, kalender, rating & review, lokasi, profil organizer, kebijakan) — list menyusut jadi sidebar tipis, form pendaftaran sticky
- [ ] Bangun layout nav-body
```

(If Task 7 of the prior plan already checked off "Bangun layout nav-body" by the time this runs, read the file first and adjust the find/replace to match whatever the surrounding lines actually are — the new bullet still goes directly after the Find Activity line.)

- [ ] **Step 3: Verify build**

```bash
cd "d:\smester-4\tubes\ActiVIbe\frontend" && pnpm build
```

Expected: exits 0 (docs-only change, but confirms nothing else broke).

- [ ] **Step 4: Commit**

```bash
cd "d:\smester-4\tubes\ActiVIbe" && git add README.md
git commit -m "Update README for the Event Detail page expansion"
```

No `git push`.

---

## Self-Review Notes

- **Spec coverage:** Page state model (sidebar + wide detail + sticky form) ✓ Task 3 + Task 15's verification. All 15 sections from spec §2 ✓ Tasks 4 (existing-content reorder, 5 of the 15) + Tasks 5-14 (10 new sub-components, one per task). Category placeholder mapping ✓ Task 1. Calendar 1-or-2-month rule ✓ Task 1 + Task 9. Per-event reviews (revised from pooled, per spec §5) ✓ Task 2. New `Event` fields ✓ Task 1/2. Docs update ✓ Task 15.
- **Placeholder scan:** none — every step has literal code/exact find-replace blocks and concrete expected command output.
- **Type consistency:** `Event` (Task 1) is consumed identically by every later task's props (`EventOrganizerStrip`/`OrganizerProfileCard`/`EventPolicies` all take `event: Event`; `EventAmenities`/`EventScheduleCalendar`/`EventLocationMap`/`EventGalleryHero` take the narrower individual fields they actually need, never the whole object, since they don't need anything else). `RatingBreakdownItem`/`ReviewEntry` defined once in Task 1, consumed identically by `EventRatingSummary`/`EventReviewList` in Tasks 10-11. `getCategoryStyle` (Task 1) is consumed identically by `EventListSidebar` (Task 3) and `EventGalleryHero` (Task 5) — single source of truth, never redefined.
