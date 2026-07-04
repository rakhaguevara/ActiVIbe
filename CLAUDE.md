# ActiVibe — Instruksi untuk Claude

## Design System (WAJIB DIBACA SEBELUM EDIT UI/STYLE)

Semua styling (warna, font, spacing, radius, komponen) di seluruh aplikasi — landing page, dashboard Volunteer, Organizer, maupun Admin — **wajib mengikuti [docs/design.md](docs/design.md)**. Dokumen itu adalah rujukan tunggal untuk keputusan visual.

Sebelum menambah atau mengubah style:
- Jangan hardcode hex warna baru di komponen — pakai CSS custom property (`var(--token-name)`) yang sudah didefinisikan di `docs/design.md` Section 1.
- Kalau butuh warna yang tidak ada di palet resmi, **berhenti dan tanya dulu ke user**, jangan menebak hex sendiri.
- Section gap konsisten 40-48px (`--space-section-gap`), radius card besar 20px (12px khusus table density di dashboard Organizer/Admin), font heading = Itim, font body = Poppins.
- Dashboard Organizer dan Admin pakai token yang **identik** dengan Volunteer — yang boleh beda hanya density layout, bukan bahasa visualnya (lihat Section 8 di `docs/design.md`).
- Cek checklist di Section 9 `docs/design.md` sebelum menambahkan warna/style baru.

## Struktur Repo

Monorepo dengan 3 bagian utama:
- `frontend/` — Web app (React 19 + TypeScript + Vite, pakai `pnpm`)
- `backend/` — API & services (Express.js + PostgreSQL + Prisma + JWT — lihat [backend/README.md](backend/README.md)). Register & Login (`/auth/register`, `/auth/login`, `/auth/me`, `/auth/logout`) sudah dibangun & diverifikasi end-to-end; OTP (FR-002/003) belum. Auth dipanggil langsung dari frontend lewat REST API (`fetch`, `credentials: 'include'`), **bukan** Next.js/NextAuth — token disimpan sebagai httpOnly cookie, frontend tidak pegang token mentah (lihat `frontend/src/contexts/AuthContext.tsx`).
- `docs/` — Dokumentasi product (PRD, design system, dst.)

Lihat [README.md](README.md) dan [docs/PRD-ActiVibe-v2.0.md](docs/PRD-ActiVibe-v2.0.md) untuk detail produk lengkap. Untuk requirement detail dashboard Organizer/NGO (role & shift, pipeline applicant, attendance, close-event flow, dst — FR-028 s.d. FR-052), lihat addendum [docs/PRD-ActiVibe-v2.1-Organizer-Addendum.md](docs/PRD-ActiVibe-v2.1-Organizer-Addendum.md).

**Routing:** `frontend/` pakai `react-router-dom` (dikonfigurasi di `frontend/src/routes/AppRoutes.tsx`, dibungkus `<BrowserRouter>` di `App.tsx`). Routing terbagi 2 grup nested route lewat layout wrapper (`<Outlet />`): `PublicLayout` (dipakai `/`, `/tentang-kami`, `/cara-kerja`) dan `DashboardLayout` (dipakai `/dashboard`, dan jadi pola yang akan dipakai ulang untuk dashboard Organizer/Admin nanti). Topbar-nya sendiri ada di komponen bersama `AppTopbar` (`frontend/src/components/AppTopbar.tsx`) — logo, nav link, mega-menu "Cari Aktivitas"/"Cari Organisasi", dropdown notifikasi & user, hamburger mobile. `DashboardLayout` selalu render `AppTopbar`; `PublicLayout` render `AppTopbar` juga TAPI HANYA kalau `user` (dari `useAuth()`) sudah login — kalau belum login (atau masih `isLoading`), `PublicLayout` render `Navbar` marketing biasa (Masuk/Daftar) sebagai gantinya. Jadi begitu user login, navbar-nya konsisten "dashboard-style" di halaman publik manapun, bukan cuma di `/dashboard`. `AuthModal` tetap di `App.tsx` di luar kedua layout (state modal lintas-halaman). Kalau menambah halaman publik baru, daftarkan di bawah `PublicLayout` di `AppRoutes.tsx`; kalau halaman dashboard baru, di bawah `DashboardLayout` (atau layout dashboard role lain kalau sudah dibuat).

## Personalisasi AI (FR-005) — `backend/src/modules/recommendations/`

Endpoint `GET /recommendations` (auth cookie) menghasilkan daftar event dengan **Predictive Match Score** dua lapis:

1. **Rule-based** (`matchScore.js`) — bobot: skill 40%, minat 30%, motivasi 15% (dikunci di `backend/README.md`, jangan diubah sepihak), availability 10%, lokasi 5%. Data profil yang belum diisi dinilai netral 50% (tidak menghukum profil belum lengkap). Ada unit test `matchScore.test.js`.
2. **Layer AI multi-provider** (`ai.service.js` = orkestrator; implementasi per mesin di `providers/`: Claude `claude-opus-4-8`, ChatGPT/OpenAI default `gpt-4o-mini`, Gemini default `gemini-2.5-flash` — semua pakai structured/JSON output dengan schema yang sama) — memberi rating final (maks ±10 poin dari skor rule-based, di-clamp server), `matchReasoning` 1 kalimat, `fitBadgeLabel`, dan `symbol` emoji. Pemilihan mesin lewat env `AI_PROVIDER` (`claude|openai|gemini|auto`; `auto` = provider pertama yang API key-nya terisi, urutan claude → openai → gemini). Kalau tidak ada key / API error, otomatis fallback ke rule-based + reasoning template (`aiGenerated: false`, `aiProvider: null`) — flow tidak pernah gagal karena AI. API key semua provider hanya di `backend/.env` (gitignored), JANGAN pernah di-hardcode atau di-commit.

Data event masih **dummy server-side** (`recommendation.data.js`, bentuk field disamakan dengan `frontend/src/types/event.ts` + tag matching tambahan) — nanti diganti query `Event` status PUBLISHED begitu tag skill/interest event di-seed. Client frontend: `frontend/src/services/recommendation.service.ts` (fetch + `credentials: 'include'`, pola sama dengan `lib/api.ts`). Dashboard volunteer (`FindActivityPage`) **sudah dialihkan** ke endpoint ini lewat hook `frontend/src/hooks/useRecommendations.ts`: hook memetakan response API ke tipe `Event` UI — field presentasi yang belum ada di API (foto, rating, ulasan, profil organizer, kebijakan) di-merge dari `mockEvents.ts` kalau judul sama, atau diisi default generik (hapus lapisan merge ini saat API event lengkap). Kalau fetch gagal (backend mati), hook fallback ke `mockEvents` supaya dashboard tidak kosong. Simbol emoji hasil AI tampil di badge Match Score card (`EventListSidebar`) dan fit badge panel detail; baris status di bawah jumlah hasil menunjukkan apakah personalisasi AI aktif. **Alur pasca-onboarding:** selesai wizard `OnboardingModal`, `DashboardLayout` menampilkan `PersonalizationResultModal` **2 tahap** sebelum user dilepas ke dashboard: Card 1 = hasil analisis AI (narasi hobi/jurusan/minat → `analysis.recommendedRole` + lokasi, plus grafik bar afinitas kategori dari `analysis.chart` — dihitung deterministik di backend, bukan oleh AI); Card 2 = top-3 kegiatan + CTA "Daftar Sekarang" → navigate `/dashboard?event=<id>`. **Aturan tier kecocokan (keputusan produk, sumber tunggal: `getRelevance()` di backend `recommendation.service.js`):** 0–49 "Kurang Cocok", 50–79 "Sedikit Relevan", 80–100 "Sangat Relevan & Cocok" — frontend menampilkan `relevanceLabel` dari API apa adanya; `utils/matchScore.ts` memetakan ambang yang sama ke warna badge (success/info/warning). Hasil fetch di-cache module-level (TTL 5 menit + dedupe in-flight) di `recommendation.service.ts` — panggil `invalidateRecommendations()` setiap profil berubah. Backend melewati panggilan AI kalau profil belum punya sinyal apa pun (belum onboarding) supaya dashboard cepat.

## Git Commit & Push

Jangan pernah menjalankan `git commit` atau `git push` (lewat tool apa pun) di sesi utama tanpa diminta eksplisit oleh user di pesan itu juga. Cukup siapkan perubahan di working tree (`git add` boleh, atau tidak sama sekali), lalu biarkan user yang melakukan commit & push sendiri.

**Pengecualian (dikonfirmasi user 2026-06-22):** kalau user secara eksplisit memilih menjalankan `superpowers:subagent-driven-development` (atau skill lain yang mekanismenya butuh commit antar-task untuk diff review), implementer **subagent** boleh commit lokal per task sebagai mekanisme internal proses — bukan final history. Tidak ada `git push` dalam kondisi apa pun. User tetap pegang kendali penuh untuk review/reset/squash semua commit itu sebelum push sendiri. Di luar konteks ini (misal menulis spec/plan doc biasa di sesi utama), tetap jangan commit tanpa diminta.

## Menjaga File Ini Tetap Up to Date

File ini **wajib diperbarui** setiap kali ada keputusan struktural/desain baru yang signifikan (struktur folder berubah, aturan styling baru, role/flow baru ditambahkan), supaya sesi Claude berikutnya tidak kehilangan konteks. Jangan biarkan isi file ini basi dibanding kondisi repo yang sebenarnya — kalau ada perubahan besar di `docs/design.md`, `docs/PRD-ActiVibe-v2.0.md`, atau struktur repo, update referensi di sini juga.
