# ActiVibe

Platform volunteer berbasis AI untuk personalisasi minat dalam melakukan volunteer.

Lihat [docs/PRD-ActiVibe-v2.0.md](docs/PRD-ActiVibe-v2.0.md) untuk detail produk lengkap (problem statement, FR-001–FR-027, data model, roadmap).

## Struktur Repo

Monorepo dengan 3 bagian utama:

- `frontend/` — Web app (React 19 + TypeScript + Vite)
- `backend/` — API & services (belum diinisialisasi)
- `docs/` — Dokumentasi product (PRD, dst.)

### Struktur `frontend/src`

Folder disusun per aktor sesuai PRD (Volunteer, Organizer, Admin), saat ini masih berupa skeleton kosong:

```
src/
├── App.tsx
├── main.tsx
├── index.css
├── assets/
├── components/      # komponen UI reusable
├── layouts/          # nav-body & layout wrapper per role
├── routes/            # konfigurasi routing
├── hooks/
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
- [ ] Bangun layout nav-body
- [ ] Inisialisasi `backend/`
