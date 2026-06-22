# ActiVibe

Platform volunteer berbasis AI untuk personalisasi minat dalam melakukan volunteer.

Lihat [docs/PRD-ActiVibe-v2.0.md](docs/PRD-ActiVibe-v2.0.md) untuk detail produk lengkap (problem statement, FR-001–FR-027, data model, roadmap).

## Struktur Repo

Monorepo dengan 3 bagian utama:

- `frontend/` — Web app (React 19 + TypeScript + Vite)
- `backend/` — API & services (belum diinisialisasi — rencana arsitektur sudah ada di [backend/README.md](backend/README.md): Express.js + PostgreSQL + Prisma + JWT)
- `docs/` — Dokumentasi product (PRD, dst.)

### Struktur `frontend/src`

Folder disusun per aktor sesuai PRD (Volunteer, Organizer, Admin). `routes/` dan `hooks/` sudah mulai terisi (routing & `useRevealOnScroll`), sisanya masih skeleton kosong:

```
src/
├── App.tsx
├── main.tsx
├── index.css
├── assets/
├── components/      # komponen UI reusable
├── layouts/          # nav-body & layout wrapper per role
├── routes/            # konfigurasi routing (AppRoutes.tsx — react-router-dom)
├── hooks/             # custom hooks reusable (cth. useRevealOnScroll)
├── services/         # pemanggilan API
├── types/
├── utils/
└── pages/
    ├── auth/
    ├── onboarding/
    ├── volunteer/
    ├── organizer/
    └── admin/
```

## Menjalankan Secara Lokal

```bash
cd frontend
pnpm install
pnpm dev
```

Project menggunakan `pnpm`, jalankan command dari dalam `frontend/` (bukan dari root), karena `package.json` ada di sana.

## Progres

- [x] Bersihkan boilerplate template Vite/React (komponen demo, aset logo, styling default)
- [x] Restruktur repo jadi monorepo (`frontend/`, `backend/`, `docs/`)
- [x] Buat skeleton folder `frontend/src` per aktor (auth, onboarding, volunteer, organizer, admin)
- [x] Landing Page — Hero section dengan animasi page-load
- [x] Landing Page — Stats card dengan counter animation (scroll-triggered)
- [x] Landing Page — Features section (3 kartu, scroll-reveal, dekorasi flower & sun)
- [x] Landing Page — Join section "Bergabung Bersama Activibe" (background biru #63C2E0, wave top/bottom, ikon dekoratif SVG, 2 foto PNG, tombol CTA oranye)
- [x] Modal Login & Sign Up (`AuthModal`), dipicu dari tombol Masuk/Daftar di Navbar
- [x] Routing pertama di project (`react-router-dom`) — Halaman "Tentang Kami" (`/tentang-kami`) berisi cerita, timeline, visi-misi, dan tim
- [ ] Bangun layout nav-body
- [ ] Inisialisasi `backend/`

