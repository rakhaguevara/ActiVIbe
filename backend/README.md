# ActiVibe — Backend Service

> API service untuk ActiVibe — menangani autentikasi (OTP, registrasi), data pengguna, kegiatan volunteer, dan logika bisnis inti. Dipanggil oleh frontend di folder [`frontend/`](../frontend) (React 19 + TypeScript + Vite) pada monorepo ini.

Status: **Register & Login sudah dibangun dan diverifikasi end-to-end** (lihat `docs/superpowers/specs/2026-06-24-register-login-activation-design.md` dan plan-nya). OTP (FR-002/FR-003) **belum** diimplementasikan — register saat ini langsung set `isVerified: true` tanpa verifikasi, ditunda sampai provider SMS/email diputuskan (lihat Section 9).

---

## 1. Tech Stack

| Layer | Pilihan | Catatan |
|---|---|---|
| Runtime | Node.js (LTS) | — |
| Framework | Express.js | Dipilih karena tim belum pernah pakai backend framework — learning curve paling landai dibanding NestJS. Bisa migrasi nanti kalau kompleksitas bertambah. |
| Database | PostgreSQL | Data model ActiVibe sangat relational (banyak many-to-many) — lihat PRD v2.0 Section 7.1/8.1. |
| ORM | Prisma | Tim belum pernah pakai ORM — Prisma punya DX & type-safety terbaik untuk pemula. |
| Auth strategy | JWT (access + refresh token) diterbitkan backend ini, dikirim sebagai httpOnly cookie | Frontend (React) memanggil endpoint backend langsung via `fetch` dengan `credentials: 'include'` — frontend tidak pernah pegang token mentah, status login dibaca lewat `AuthContext` + `GET /auth/me`. Lihat Section 9. |
| Hosting | VPS Hostinger, PostgreSQL native install | Backup database **wajib disetup manual** — lihat Section 7. |

---

## 2. Kenapa Arsitektur Ini

Project ActiVibe adalah satu monorepo (lihat [README.md](../README.md) root) dengan pembagian folder:

```
frontend/   — React 19 + TypeScript + Vite (UI)
backend/    — Express.js (API, OTP, business logic) — folder ini
docs/       — Dokumentasi product (PRD, design system, dst.)
```

**Pembagian tanggung jawab auth** (penting dipahami sebelum mulai coding):

| Tugas | Siapa yang pegang |
|---|---|
| Kirim & verifikasi OTP | Backend (folder ini) |
| Simpan password (hashed) | Backend (folder ini) |
| Validasi kredensial saat login | Backend (folder ini) — expose endpoint REST biasa |
| Simpan & kirim token di tiap request | **Browser** (httpOnly cookie) — frontend tidak pegang token mentah, lihat Section 9 |
| Refresh token / access token | Backend menerbitkan via cookie. **Endpoint `/auth/refresh` belum dibangun** — access token cookie umurnya 15 menit, begitu expired user harus login ulang (ditunda sengaja, lihat plan di `docs/superpowers/`). |

Backend ini **tidak tahu apa-apa soal state management di sisi frontend**. Backend expose REST API (`/auth/register`, `/auth/login`, `/auth/me`, `/auth/logout` — lihat Section 8) dan set token sebagai httpOnly cookie. Frontend memanggil endpoint ini lewat `fetch` (`credentials: 'include'`), lalu menyimpan data user (bukan token) ke `AuthContext`.

Kalau ada anggota tim yang bingung "kok auth-nya kepisah backend/frontend?" — jawabannya: cuma ada **satu** sumber kebenaran auth (backend ini). Frontend hanya menyimpan & mengirim token, bukan tempat verifikasi password/OTP.

---

## 3. Struktur Folder

```
backend/
├── src/
│   ├── config/
│   │   ├── env.js              # load & validasi environment variables
│   │   └── prisma.js           # Prisma Client singleton
│   ├── modules/
│   │   └── auth/
│   │       ├── auth.routes.js
│   │       ├── auth.controller.js
│   │       ├── auth.service.js  # logika OTP, hashing, JWT
│   │       └── auth.validation.js
│   ├── middlewares/
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js       # WAJIB untuk endpoint OTP — cegah abuse
│   │   └── validateRequest.js
│   ├── utils/
│   │   ├── otp.js               # generate & cek expiry OTP
│   │   └── jwt.js               # sign & verify token
│   ├── app.js                   # setup Express app, middleware global
│   └── server.js                # entry point, start server
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── .env.example
├── .gitignore
├── package.json
└── README.md                    # file ini
```

> **Catatan struktur:** dibuat per-modul (`modules/auth/...`), bukan per-tipe-file (`controllers/`, `routes/` global). Ini supaya begitu fitur baru ditambah (`modules/event/`, `modules/profile/`, dst — mengikuti FR-004 dst di PRD), strukturnya tetap konsisten dan mudah dinavigasi tim 4 orang.

---

## 4. Data Model Acuan

Schema Prisma **wajib** mengikuti entity di PRD v2.0 Section 7.1/8.1 sebagai source of truth — jangan menambah/mengubah field tanpa update PRD dulu (lihat `CLAUDE.md` Section 3, aturan #4).

Entity yang **benar-benar terimplementasi** ada di `prisma/schema.prisma` (source of truth — jangan duplikasi di sini, supaya tidak drift dari kode asli). Ringkasan perbedaan dari rencana awal:

- `User` — sama seperti rencana awal, plus `refreshTokens RefreshToken[]` (relasi baru). `isVerified` saat ini **selalu `true`** begitu register sukses (OTP di-skip untuk iterasi ini, lihat Status di atas) — bukan `default(false)` seperti rencana awal.
- `OtpRequest` — sudah ada di schema (siap dipakai begitu OTP nyata diimplementasikan), tapi **belum dipakai** oleh kode manapun saat ini. Tambahan dari rencana awal: field `purpose` (enum `OtpPurpose`, default `REGISTER`) supaya tidak perlu migration baru kalau nanti ada OTP reset password.
- `RefreshToken` — **baru, tidak ada di rencana awal**. Dibutuhkan begitu keputusan "refresh token storage" di Section 9 diambil (disimpan di DB, revocable). Simpan `tokenHash` (SHA-256), bukan token mentah.

> Entity `Profile`, `Interest`, `Skill`, dll baru ditambahkan saat mulai kerjakan fitur Onboarding (FR-004, FR-023) — tidak perlu didefinisikan di tahap Register/Login ini supaya schema tidak membengkak prematur.

---

## 5. Environment Variables

Buat `.env` dari `.env.example` — **jangan pernah commit `.env`** ke git.

```bash
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/activivibe_db"

# JWT
JWT_ACCESS_SECRET=""       # generate: openssl rand -base64 32
JWT_REFRESH_SECRET=""      # generate: openssl rand -base64 32
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# OTP
OTP_EXPIRY_MINUTES=5
OTP_MAX_RESEND_ATTEMPTS=3

# Server
PORT=4000
NODE_ENV="development"

# CORS — wajib whitelist domain frontend (Vite dev server), jangan pakai wildcard di production
FRONTEND_URL="http://localhost:5173"

# (Nanti) OTP delivery provider — isi saat integrasi SMS/email gateway
OTP_PROVIDER_API_KEY=""
```

---

## 6. Setup Lokal

```bash
# 1. Install dependencies
npm install

# 2. Copy & isi environment variables
cp .env.example .env

# 3. Generate Prisma Client
npx prisma generate

# 4. Jalankan migration pertama
npx prisma migrate dev --name init

# 5. Jalankan server
npm run dev
```

Server jalan di `http://localhost:4000` (sesuaikan `PORT` di `.env`).

---

## 7. Database PostgreSQL di VPS Hostinger (Native Install)

Karena PostgreSQL di-install langsung di VPS (bukan Docker), ada 3 hal yang **wajib** disetup manual — ini bukan opsional untuk production:

1. **Backup otomatis** — setup cron job `pg_dump` harian, simpan ke storage terpisah (jangan di VPS yang sama saja).
   ```bash
   # Contoh cron job harian jam 2 pagi
   0 2 * * * pg_dump -U activivibe_user activivibe_db > /backups/activivibe_$(date +\%Y\%m\%d).sql
   ```
2. **Firewall** — pastikan port PostgreSQL (5432) **tidak terbuka ke publik**. Backend connect via `localhost` atau internal network VPS, bukan IP publik.
3. **User database terpisah** — jangan pakai superuser `postgres` untuk koneksi aplikasi. Buat role khusus dengan privilege terbatas ke database `activivibe_db` saja.

> Siapa di tim yang pegang akses VPS dan tanggung jawab backup ini perlu disepakati eksplisit — jangan diasumsikan "nanti ada yang urus".

---

## 8. Endpoint Auth — Status Implementasi

| Endpoint | FR | Status | Catatan |
|---|---|---|---|
| `POST /auth/register` | FR-001 | ✅ **Implemented** | Terima `firstName, lastName, email, password`. Set `isVerified: true` langsung (OTP di-skip, lihat Status di atas). Set cookie httpOnly `accessToken`+`refreshToken`. |
| `POST /auth/login` | — | ✅ **Implemented** | Validasi kredensial via bcrypt, set cookie httpOnly sama seperti register. |
| `GET /auth/me` | — | ✅ **Implemented** (tidak ada di rencana awal) | Baca cookie, balas `{ user }` atau 401 — dipakai frontend untuk restore session setelah refresh halaman. |
| `POST /auth/logout` | — | ✅ **Implemented** (tidak ada di rencana awal) | Revoke `RefreshToken` row di DB, clear cookie. |
| (internal) Generate & kirim OTP | FR-002 | ❌ Belum | Model `OtpRequest` sudah siap di schema, logikanya belum dibangun. |
| `POST /auth/verify-otp` | FR-002 | ❌ Belum | — |
| `POST /auth/resend-otp` | FR-003 | ❌ Belum | — |

**Beda dari rencana awal:** token **tidak** dikembalikan di response body (`{ user, accessToken, refreshToken }`) — semua token jadi httpOnly cookie (lihat keputusan di Section 9), response cukup `{ user }`. Frontend tidak pernah pegang token mentah di JS.

---

## 9. Keputusan & Open Decisions

**Sudah diputuskan & terimplementasi** (dikonfirmasi user 2026-06-24, lihat spec/plan di `docs/superpowers/`):

- ✅ **Password policy**: minimum 8 karakter, tanpa syarat kompleksitas tambahan.
- ✅ **Refresh token storage**: di database (tabel `RefreshToken`, revocable saat logout), disimpan sebagai hash SHA-256 — bukan token mentah.
- ✅ **Strategi auth di frontend**: kedua token (access + refresh) jadi **httpOnly cookie** yang di-set backend (bukan disimpan di localStorage/state JS). Frontend baca status login lewat `AuthContext` (React Context API) yang panggil `GET /auth/me` saat mount.

**Masih belum diputuskan** — jangan diasumsikan sendiri, konfirmasi dulu sebelum implementasi:

- [ ] **Provider OTP**: SMS gateway (mana?) atau email (pakai apa — Resend/SendGrid/SMTP biasa)? Blocker utama buat implementasi FR-002/FR-003.
- [ ] **Rate limiting di production** di belakang reverse proxy/load balancer — `express-rate-limit` saat ini pakai key default (`req.ip`), tanpa `app.set('trust proxy', ...)`. Di local dev ini benar (request langsung ke Express, tidak lewat proxy), tapi begitu deploy ke VPS Hostinger (Section 7) di belakang nginx/proxy apa pun, **semua user akan terhitung sebagai 1 IP** (IP si proxy) sampai `trust proxy` dikonfigurasi sesuai topologi network yang sebenarnya. Konfirmasi dulu setup proxy-nya sebelum deploy, baru putuskan nilai `trust proxy` yang benar (ditemukan saat code review 2026-06-24, belum di-fix karena topologi production belum ada).

---

## 10. Referensi

- PRD ActiVibe v2.0 (`docs/PRD-ActiVibe-v2.0.md`) — source of truth utama untuk FR & data model
- `docs/design.md` — design system (relevan kalau backend perlu expose data yang punya representasi visual, mis. status enum untuk badge)
- `CLAUDE.md` (root) — aturan kerja project, termasuk kapan harus tanya sebelum eksekusi
- `docs/superpowers/specs/2026-06-24-register-login-activation-design.md` — design spec lengkap untuk fitur Register & Login yang sudah dibangun (keputusan cookie, OTP-skip, dst.)
- `docs/superpowers/plans/2026-06-24-register-login-activation.md` — implementation plan-nya (kode per task, lengkap dengan fix yang ditemukan saat implementasi/review)
