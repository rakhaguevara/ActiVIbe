# Event Detail — Halaman Lebar (Airbnb-style) — Design Spec

> Status: Approved 2026-06-25. Konteks: `EventDetailPanel` (dibangun di plan `2026-06-24-find-activity-page.md`, Task 4) saat ini cuma 1 panel kompak di kolom tengah dari layout 3-kolom (list | detail | form), semuanya tampil sejajar dengan lebar mirip. User minta kolom tengah ini diperkaya jadi setara halaman listing Airbnb (judul, galeri, host info, amenities, kalender, rating & review, lokasi+map, profil organizer lengkap, kebijakan) — referensi: screenshot listing Airbnb "Numa castle. City view & garden".

## Tujuan

Mengubah pengalaman "pilih kegiatan" dari panel kompak statis jadi halaman detail kaya yang setara listing Airbnb, tetap dalam satu halaman `/dashboard` (bukan route baru), dengan list kegiatan menyusut jadi sidebar tipis dan form pendaftaran sticky di kanan.

## 1. Page State Model (perubahan dari plan sebelumnya)

Saat ini (`FindActivityPage.tsx`): 3 kolom sejajar lebar mirip — list (`EventCard` penuh) | `EventDetailPanel` (kompak) | `EventApplyForm`. Karena selalu ada 1 event terpilih secara default, **tidak ada state baru** yang perlu ditambah — proporsi & isi 3 kolom yang berubah:

| Kolom | Sebelum | Sesudah |
|---|---|---|
| Kiri | `EventCard` penuh (judul, lokasi, skill, slot, dll), lebar `minmax(320px, 380px)` | `EventListSidebar` — baris ringkas (ikon kategori kecil + judul + badge Match Score kecil), lebar `minmax(220px, 260px)` |
| Tengah | `EventDetailPanel` kompak (badge, deskripsi, facts grid 4 item, skill tags, 1 paragraf reasoning) | `EventDetailPanel` jadi orchestrator 15 sub-section (detail di bawah), `1fr`, jadi jauh lebih tinggi — scroll bersama halaman |
| Kanan | `EventApplyForm` statis | `EventApplyForm` sama, ditambah `position: sticky; top: 24px; align-self: start;` supaya tetap terlihat saat kolom tengah di-scroll |

`EventCard.tsx`/`.css` **dihapus** (sudah tidak dipakai di manapun setelah `EventListSidebar` menggantikannya) — bukan oversight, memang sengaja diretire karena tidak ada konsumer lain.

## 2. Urutan Section di `EventDetailPanel` (top → bottom)

Setiap section = 1 komponen baru (kecuali yang ditandai "tetap di EventDetailPanel"), supaya tiap unit punya tanggung jawab tunggal dan bisa di-test/dibaca independen.

| # | Section | Komponen | Sumber data |
|---|---|---|---|
| 1 | Judul + icon Share/Save (non-fungsional) | tetap di `EventDetailPanel` | `event.title` |
| 2 | Galeri hero (1 gambar besar placeholder) | `EventGalleryHero` | kategori → ikon+token warna (lihat §3) |
| 3 | Subtitle: lokasi · slot tersisa · "★ rating · N ulasan" (link anchor ke section 11) | tetap di `EventDetailPanel` | `event.location`, `quota-filledSlots`, `event.rating`, `event.reviewCount` |
| 4 | Strip organizer ringkas (avatar inisial + "Diselenggarakan oleh X" + stats kecil) | `EventOrganizerStrip` | `event.organizerName`, `organizerEventsCount`, `organizerRating` |
| 5 | Badge Match Score + Fit badge (existing concept, dipindah ke sini) | tetap di `EventDetailPanel` | `event.matchScore`, `event.fitBadgeLabel` |
| 6 | 3 highlight statis (Sertifikat Digital, Dampak Terukur, Didampingi Panitia) — **sama untuk semua event, bukan data per-event** | `EventHighlights` | konstanta statis di komponennya sendiri |
| 7 | Deskripsi + toggle "Tampilkan lebih banyak/sedikit" | tetap di `EventDetailPanel` | `event.description` |
| 8 | "Apa yang Disediakan" (grid ikon+label) | `EventAmenities` | `event.provisions[]` (baru) |
| 9 | "Skill yang Dibutuhkan" (tag list, existing concept) | tetap di `EventDetailPanel` | `event.skills[]` |
| 10 | Kalender read-only menyorot tanggal kegiatan | `EventScheduleCalendar` | `event.startDate`, `event.endDate` |
| 11 | Rating keseluruhan + breakdown kategori (`id="reviews"` utk anchor dari #3) | `EventRatingSummary` | `event.rating`, `event.ratingBreakdown[]` (baru) |
| 12 | Kartu review (3 per event) | `EventReviewList` | `event.reviews[]` (baru) |
| 13 | "Di Mana Kegiatan Berlangsung" — teks lokasi + placeholder map statis | `EventLocationMap` | `event.location` |
| 14 | Profil organizer lengkap (avatar besar, badge "Terverifikasi", stats, bio, tombol "Hubungi Penyelenggara" non-fungsional) | `OrganizerProfileCard` | `event.organizerName`, `organizerBio`, `organizerEventsCount`, `organizerRating`, `organizerYearsActive` |
| 15 | "Hal yang Perlu Diketahui" — 3 kolom (Kebijakan Pembatalan, Aturan Kegiatan, Keamanan) + link "Pelajari lebih lanjut" non-fungsional | `EventPolicies` | `event.cancellationPolicy`, `eventRules`, `safetyInfo` (baru, per-event) |

**Catatan duplikasi organizer (#4 dan #14) — disengaja**, bukan bug: referensi Airbnb juga melakukan ini (sebutan singkat host di atas, profil lengkap di bawah).

**Catatan penghapusan facts grid lama:** `EventDetailPanel` versi sebelumnya punya `<dl>` 4-fakta (Lokasi, Jadwal, Diselenggarakan oleh, Slot tersisa). Section ini **dihapus total** — keempat faktanya sekarang masing-masing punya section yang lebih kaya (lokasi→#13, jadwal→#10, organizer→#4/#14, slot→dilipat ke subtitle #3), jadi tidak perlu ditampilkan dua kali dalam bentuk plain text.

## 3. Galeri Hero — Placeholder per Kategori (bukan aset gambar baru)

Sesuai keputusan user (placeholder ilustrasi per kategori, tanpa nambah aset baru): blok background gradient-soft + ikon besar + label kategori di tengah, **reuse pola yang SUDAH ADA** di `docs/design.md` §6.4 (Feature Card Grid — "rotasi 4 token resmi"), bukan warna baru:

| Kategori | Token background | Ikon (react-icons/fi, sudah jadi dependency) |
|---|---|---|
| Lingkungan | `--color-secondary-soft` | `FiGlobe` |
| Pendidikan | `--color-primary-soft` | `FiBookOpen` |
| Kesehatan | `--color-accent-orange-soft` | `FiHeart` |
| Bencana & Sosial | `--color-accent-yellow-soft` | `FiUsers` |

Mapping ini ditulis sekali sebagai lookup di `frontend/src/utils/categoryStyle.ts`, dipakai bersama oleh `EventGalleryHero` (ikon besar) dan `EventListSidebar` (ikon kecil per baris) — satu sumber kebenaran, tidak didefinisikan dua kali.

## 4. Kalender Read-Only — Aturan Render

`EventScheduleCalendar` penuh logika tanggal murni (testable independen dari UI), di `frontend/src/utils/calendarGrid.ts`: fungsi generate grid minggu (7 kolom, Minggu–Sabtu, padding sel kosong di luar bulan) untuk 1 bulan tertentu.

- Kalau `startDate` dan `endDate` di bulan yang sama → render **1 grid bulan**, sorot semua tanggal dari start s.d. end.
- Kalau beda bulan → render **2 grid bulan berdampingan** (bulan-mulai, bulan-selesai) — sorot dari `startDate` s.d. akhir bulan-mulai di grid pertama, dari awal bulan-selesai s.d. `endDate` di grid kedua. **Bulan di antaranya (kalau event berlangsung >2 bulan, cth. event Jul–Sep) tidak ditampilkan** — sengaja dibatasi 2 grid maksimal, sama seperti pola check-in/check-out Airbnb yang juga cuma tampilkan 2 bulan.

## 5. Rating & Review — Data per Event (bukan pool bersama)

**Revisi dari diskusi awal:** sebelumnya dibahas "pool ~6 review dipakai ulang lintas event". Setelah dipikir ulang saat menulis spec ini — review yang sama persis muncul di beberapa event yang topiknya beda-beda akan terlihat seperti bug, bukan data dummy yang masuk akal. Diganti jadi: **setiap event punya `reviews: ReviewEntry[]` sendiri, 3 entri, ditulis langsung** (bukan referensi ke pool bersama) — totalnya 24 review pendek (1-2 kalimat), tetap ringan untuk data dummy tapi tidak terasa copy-paste.

## 6. Data Model — Field Baru di `Event`

```ts
export interface RatingBreakdownItem {
  label: string
  score: number // 0-5
}

export interface ReviewEntry {
  reviewerName: string
  timeAgo: string   // cth. "2 bulan lalu"
  rating: number     // 0-5
  text: string
}

// Field BARU ditambahkan ke interface Event yang sudah ada:
rating: number              // 0-5, overall
reviewCount: number
ratingBreakdown: RatingBreakdownItem[]   // 4 kategori: Koordinasi Panitia, Kejelasan Informasi, Dampak yang Dirasakan, Lokasi & Logistik
reviews: ReviewEntry[]      // 3 per event
provisions: string[]        // "Apa yang Disediakan"
organizerBio: string
organizerEventsCount: number
organizerRating: number     // 0-5
organizerYearsActive: number
cancellationPolicy: string  // per-event
eventRules: string          // per-event
safetyInfo: string          // per-event
```

Nilai literal untuk ke-8 event ditulis saat implementation plan (mengikuti pola spec sebelumnya — spec mendefinisikan bentuk, plan mengisi konten persis).

Semua nilai `rating`/`organizerRating`/tiap `ratingBreakdown[].score` dirender dengan 1 desimal (`.toFixed(1)`, cth. "4.7") di seluruh komponen yang menampilkannya — konsisten, tidak ada komponen yang membulatkan ke integer.

## 7. File Plan

| File | Aksi |
|---|---|
| `frontend/src/types/event.ts` | Modify — tambah field & 2 interface baru di atas |
| `frontend/src/data/mockEvents.ts` | Modify — isi field baru utk 8 event |
| `frontend/src/utils/categoryStyle.ts` | Baru — lookup kategori → ikon + token warna |
| `frontend/src/utils/calendarGrid.ts` | Baru — fungsi generate grid kalender bulanan |
| `frontend/src/components/EventListSidebar.tsx` (+`.css`) | Baru — pengganti `EventCard` di kolom kiri |
| `frontend/src/components/EventCard.tsx`, `.css` | **Delete** — sudah tidak dipakai |
| `frontend/src/components/EventGalleryHero.tsx` (+`.css`) | Baru |
| `frontend/src/components/EventOrganizerStrip.tsx` (+`.css`) | Baru |
| `frontend/src/components/EventHighlights.tsx` (+`.css`) | Baru |
| `frontend/src/components/EventAmenities.tsx` (+`.css`) | Baru |
| `frontend/src/components/EventScheduleCalendar.tsx` (+`.css`) | Baru |
| `frontend/src/components/EventRatingSummary.tsx` (+`.css`) | Baru |
| `frontend/src/components/EventReviewList.tsx` (+`.css`) | Baru |
| `frontend/src/components/EventLocationMap.tsx` (+`.css`) | Baru |
| `frontend/src/components/OrganizerProfileCard.tsx` (+`.css`) | Baru |
| `frontend/src/components/EventPolicies.tsx` (+`.css`) | Baru |
| `frontend/src/components/EventDetailPanel.tsx` (+`.css`) | Modify total — jadi orchestrator, render semua section di atas dalam urutan §2 |
| `frontend/src/pages/volunteer/FindActivityPage.tsx` (+`.css`) | Modify — ganti `EventCard`→`EventListSidebar`, ubah `grid-template-columns`, tambah CSS sticky utk kolom form |

## 8. Styling

Semua warna lewat token (§3 di atas pakai token yang sudah ada, tidak ada hex baru). Radius/card/badge tetap reuse pola BEM scoped per-komponen yang sudah berjalan di project ini (tidak ada class `.card`/`.btn` global). Sticky form: `position: sticky; top: 24px; align-self: start;` pada elemen `EventApplyForm` (grid child langsung, supaya konteks scroll-nya kolom grid, bukan window).

## 9. Update Dokumentasi

Tidak ada keputusan struktural baru yang perlu masuk `CLAUDE.md` (masih halaman `/dashboard` yang sama, bukan route/layout baru). README cukup update 1 baris progres setelah implementasi selesai.

## Testing / Verifikasi

Tidak ada test otomatis di frontend (konsisten dengan project ini). Verifikasi manual via `pnpm dev` + Playwright (pola sama seperti plan sebelumnya): klik event di sidebar → semua 15 section render dengan data event yang benar dan berubah saat ganti event; scroll kolom tengah → form kanan tetap terlihat (sticky); klik link "N ulasan" di subtitle → scroll ke section rating; toggle "Tampilkan lebih banyak" pada deskripsi.
