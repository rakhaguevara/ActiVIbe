# Halaman "Cari Kegiatan Volunteer" (Find Activity) — Design Spec

> Status: Approved 2026-06-24. Konteks: Register & Login sudah jalan end-to-end, tapi setelah sukses login/register, `AuthModal.tsx` sudah `navigate('/dashboard')` — route ini **belum terdaftar** di `AppRoutes.tsx`, jadi user yang baru login selalu mendarat di halaman 404. Backend belum punya model `Event` sama sekali (cuma `User`/`OtpRequest`/`RefreshToken`). Iterasi ini **frontend-only dengan dummy data** — backend `Event` model menyusul di sesi berikutnya.

## Tujuan

Membuat halaman `/dashboard` tempat volunteer yang sudah login menemukan ("find") kegiatan volunteer yang cocok untuknya — versi frontend dari workflow PRD 5.2 (FR-005, FR-006, FR-007): list kegiatan dengan Predictive Match Score + reasoning, detail kegiatan dengan breakdown match, dan form pendaftaran. Halaman ini **mengganti** 404 yang selama ini muncul setelah login berhasil.

Referensi visual yang dipakai user (disesuaikan field-nya ke data model PRD, bukan ditiru 1:1):
1. Layout listing ala booking site (banner ilustrasi atas, list card kiri, panel tengah, sidebar kanan).
2. Search/filter bar ala job-board (dropdown kategori, search keyword, lokasi, pill filter).

## Keputusan Arsitektur

### Routing & Layout — header berbeda per kelompok halaman

Saat ini `Navbar`+`Footer` dirender di `App.tsx` **di luar** `<Routes>`, jadi tampil identik di semua halaman (lihat catatan di `CLAUDE.md`). Halaman dashboard butuh header fungsional (search bar), bukan navbar marketing — ini butuh restrukturisasi minimal:

- `AppRoutes.tsx` dipecah jadi 2 grup route bersarang (react-router-dom v7 nested routes):
  - **`PublicLayout`** (`frontend/src/layouts/PublicLayout.tsx`) — render `Navbar` + `<Outlet />` + (Footer tetap co-located per halaman seperti sekarang, tidak dipindah). Dipakai oleh `/` dan `/tentang-kami`.
  - **`DashboardLayout`** (`frontend/src/layouts/DashboardLayout.tsx`) — render `DashboardHeader` (baru) + `<Outlet />`, tanpa `Footer`. Dipakai oleh `/dashboard` sekarang, dan jadi pola yang sama dipakai ulang nanti untuk dashboard Organizer/Admin (`docs/design.md` §8 — token identik, density beda).
- `App.tsx`: `Navbar` & `AuthModal` state (`authMode`) tetap di `App.tsx` (supaya modal bisa dibuka dari `PublicLayout`), tapi render `<Navbar>` dipindah ke dalam `PublicLayout`, diteruskan lewat props (`onLoginClick`, `onSignupClick`) seperti sekarang.
- `/dashboard` adalah **protected route secara soft**: kalau `user` di `AuthContext` masih `null` setelah `isLoading` selesai, redirect ke `/` (tidak ada halaman dashboard kosong untuk anonymous). Tidak perlu komponen `ProtectedRoute` generik dulu (YAGNI — baru 1 route yang butuh ini), cukup `useEffect` redirect langsung di `FindActivityPage`.

### Komponen Baru

| Komponen | Tanggung jawab |
|---|---|
| `layouts/PublicLayout.tsx` | Wrapper Navbar marketing untuk halaman publik |
| `layouts/DashboardLayout.tsx` | Wrapper `DashboardHeader` untuk halaman dashboard volunteer (dan nanti organizer/admin) |
| `components/DashboardHeader.tsx` | Logo + search bar (keyword, lokasi) + filter pills + nama user & Logout |
| `pages/volunteer/FindActivityPage.tsx` | Page utama: banner, baris hasil, layout 3 kolom |
| `components/EventCard.tsx` | Card kegiatan di list kiri |
| `components/EventDetailPanel.tsx` | Panel tengah — detail kegiatan + Match Score breakdown |
| `components/EventApplyForm.tsx` | Panel kanan — form pendaftaran |
| `types/event.ts` | Interface `Event`, `MatchInfo`, dll |
| `data/mockEvents.ts` | 6–8 dummy event |

## File Plan

| File | Aksi |
|---|---|
| `frontend/src/layouts/PublicLayout.tsx` | Baru — render `Navbar` + `<Outlet />` |
| `frontend/src/layouts/DashboardLayout.tsx` | Baru — render `DashboardHeader` + `<Outlet />` |
| `frontend/src/components/DashboardHeader.tsx` (+ `.css`) | Baru |
| `frontend/src/components/EventCard.tsx` (+ `.css`) | Baru |
| `frontend/src/components/EventDetailPanel.tsx` (+ `.css`) | Baru |
| `frontend/src/components/EventApplyForm.tsx` (+ `.css`) | Baru |
| `frontend/src/pages/volunteer/FindActivityPage.tsx` (+ `.css`) | Baru |
| `frontend/src/types/event.ts` | Baru |
| `frontend/src/data/mockEvents.ts` | Baru |
| `frontend/src/routes/AppRoutes.tsx` | Restrukturisasi jadi 2 grup nested route (`PublicLayout`, `DashboardLayout`); tambah `/dashboard` |
| `frontend/src/App.tsx` | `Navbar` tidak lagi dirender langsung di sini — diteruskan lewat props ke `PublicLayout` via `AppRoutes` |
| `frontend/src/components/Navbar.tsx` | Tidak ada perubahan isi, hanya lokasi render-nya pindah ke dalam `PublicLayout` |
| `CLAUDE.md` | Update catatan routing (lihat bagian Update Dokumentasi) |
| `README.md` | Tambah baris progres |

## Search/Filter Bar (`DashboardHeader`)

Field dipilih hanya yang punya dasar di model PRD (`Event`, `Interest.category`, `Skill`) — field dari referensi visual yang **tidak** ada dasarnya di model (Location Type/online-offline, "Good For", Listing Language) **di-drop**, bukan dikarang:

| Field | Tipe | Sumber data |
|---|---|---|
| Search keyword | text input | match ke `Event.title` / `description` |
| Lokasi | text input | match ke `Event.location` |
| Cause Areas (kategori) | dropdown/pill | `Interest.category` |
| Skills | multi-select pill | `Skill` via `Event_Skills` |
| Tanggal | date range | `Event.start_date` / `end_date` |
| "Hanya 1 hari" | toggle | diturunkan: `start_date == end_date` |

"Recency" dari referensi visual dipindah jadi salah satu opsi **sort** di baris hasil (lihat di bawah), bukan filter pill. Semua filtering/sorting dilakukan client-side terhadap `mockEvents.ts` (tidak ada network call iterasi ini).

## Struktur `FindActivityPage.tsx` (top → bottom)

### 1. Banner

Full-width, reuse `background-1.svg` (tidak nambah aset ilustrasi baru). Sapaan personal: *"Halo, {nama depan user}! Yuk temukan kegiatan volunteer yang cocok buatmu."* (`user.name` dari `useAuth()`, split kata pertama — pola sama seperti `Navbar.tsx` baris 83).

### 2. Baris Hasil

`Kegiatan Volunteer | Total {N} hasil` (kiri) + dropdown sort (kanan): "Match Score Tertinggi" (default), "Tanggal Terdekat", "Terbaru". Tidak ada toggle "Map View" — slot itu tidak relevan untuk kasus ini (lihat poin 3, panel tengah bukan peta).

### 3. Layout 3 Kolom

Default saat halaman dibuka: event dengan Match Score tertinggi di list otomatis terpilih (state `selectedEventId`), jadi panel tengah & kanan langsung terisi — tidak ada empty state kosong.

**Kiri — `EventCard` list (scrollable):**
- Badge Match Score % (dummy, warna `--color-success`/`--color-warning` tergantung skor — reuse token badge §6.3 `design.md`) menggantikan rating bintang di referensi.
- Judul, lokasi (ikon pin), baris ikon kecil: kategori, tanggal mulai, jumlah skill dibutuhkan ("+N more" kalau >3).
- Badge **slot tersisa** (`quota - terisi`, mis. "8 dari 20 slot") menggantikan badge harga/diskon — tidak ada konsep harga di volunteering.
- Klik card mana pun = `setSelectedEventId`, highlight card aktif (border `--color-primary`).
- Tidak ada tombol "Daftar" di card — pendaftaran hanya lewat form di panel kanan (menghindari 2 entry point yang membingungkan untuk 1 aksi).

**Tengah — `EventDetailPanel`:**
- Deskripsi lengkap, kategori (cause area), jadwal (start–end date), lokasi, nama organizer, daftar skill dibutuhkan.
- Breakdown Match Score (PRD workflow 5.2 step 4): list skill yang cocok dengan skill (dummy) user + satu kalimat reasoning.
- **Badge kecocokan profil** — elemen terpisah dari angka Match Score, contoh teks: *"✨ Cocok dengan minat & latar belakangmu"*. Sekarang teksnya statis per-event di `mockEvents.ts`, tapi dibuat sebagai komponen/prop tersendiri (`fitBadgeLabel`) bukan string hardcoded di JSX — supaya pas AI matching real (FR-005) masuk, tinggal isi prop ini dari hasil AI tanpa ubah struktur komponen.

**Kanan — `EventApplyForm`:**
- Ringkasan event terpilih (judul, tanggal) di atas form.
- Data user read-only dari `AuthContext` (nama, email).
- Field tambahan gaya umum form volunteer (dummy/cosmetic, belum ada di model `Application` PRD — sengaja ditandai sementara): No. WhatsApp, motivasi/alasan ikut (textarea), ketersediaan (checkbox weekday/weekend).
- Tombol "Konfirmasi Pendaftaran" (`.btn--primary`, radius 10px sesuai aturan tombol kecil berulang di §6.1 `design.md`) — submit tidak memanggil API (belum ada endpoint `Application`), cukup `setState` lokal menampilkan pesan sukses inline ("Pendaftaran tercatat! (demo, belum tersambung backend)") menggantikan form, mirip pola `auth-modal__success` yang sudah ada di `AuthModal.tsx`.

## Data Model Dummy (`types/event.ts`)

```ts
interface Event {
  id: string
  title: string
  description: string
  location: string
  quota: number
  filledSlots: number
  startDate: string // ISO
  endDate: string   // ISO
  organizerName: string
  category: string        // Interest.category
  skills: string[]        // Skill.name
  matchScore: number      // 0-100, dummy
  matchReasoning: string  // satu kalimat, dummy
  fitBadgeLabel: string   // badge kecocokan profil, dummy — placeholder utk output AI nanti
}
```

6–8 dummy event lintas kategori (Lingkungan, Pendidikan, Kesehatan, Bencana/Sosial) ditulis statis di `data/mockEvents.ts`, tidak ada network call.

## Props / Data Flow

- `FindActivityPage` tidak menerima props dari route (semua data dari `mockEvents.ts` + `useAuth()`).
- State lokal: `selectedEventId`, filter/sort state (di `DashboardHeader`, diteruskan ke `FindActivityPage` lewat context sederhana atau lifted state di `DashboardLayout` — detail teknis ditentukan saat implementasi, tidak perlu state management library baru untuk 1 halaman).
- Tidak ada perubahan ke `lib/api.ts` atau backend di iterasi ini.

## Styling

Tidak ada hex baru. Token dipakai: `.card` (§6.2) untuk `EventCard` & panel, `.badge` (§6.3) untuk Match Score & status slot, `.btn--primary`/`.btn--outline` (§6.1) untuk CTA, radius besar 20px untuk card kegiatan, radius 10px untuk tombol kecil berulang sesuai revisi v1.1. Layout dashboard pakai density Volunteer (illustration-heavy, card besar) sesuai `design.md` §8, **tanpa** wave divider (itu aturan khusus halaman dashboard internal, beda dari Impact Passport publik).

## Update Dokumentasi

- **CLAUDE.md**: update bagian routing — `Navbar`/`AuthModal` tidak lagi 100% "di luar `<Routes>` untuk semua halaman"; sekarang ada pengecualian lewat `PublicLayout`/`DashboardLayout`. Catat juga bahwa `/dashboard` sekarang terisi (bukan 404) dan jadi pola dasar untuk dashboard Organizer/Admin nanti.
- **README.md**: tambah baris progres "Halaman Find Activity (`/dashboard`) — frontend dummy data".

## Testing / Verifikasi

Tidak ada test otomatis untuk halaman ini (konsisten dengan halaman lain di project). Verifikasi manual via `pnpm dev`:
1. Login berhasil → redirect ke `/dashboard`, bukan 404.
2. Header dashboard tampil (bukan Navbar marketing), search/filter berfungsi client-side terhadap dummy data.
3. Klik card berbeda di list → panel tengah & kanan update sesuai event terpilih.
4. Isi & submit form pendaftaran → muncul pesan sukses inline.
5. Akses langsung `/dashboard` tanpa login (logout dulu) → redirect ke `/`.
6. Cek responsive desktop & mobile.
