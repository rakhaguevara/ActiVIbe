# ActiVibe — Backend Service

> API service untuk ActiVibe — menangani autentikasi (OTP, registrasi), data pengguna, kegiatan volunteer, dan logika bisnis inti. Dipanggil oleh frontend di folder [`frontend/`](../frontend) (React 19 + TypeScript + Vite) pada monorepo ini.

Status: **Fondasi awal — fitur pertama yang akan dibangun: Register & Login.**

---

## 1. Tech Stack

| Layer | Pilihan | Catatan |
|---|---|---|
| Runtime | Node.js (LTS) | — |
| Framework | Express.js | Dipilih karena tim belum pernah pakai backend framework — learning curve paling landai dibanding NestJS. Bisa migrasi nanti kalau kompleksitas bertambah. |
| Database | PostgreSQL | Data model ActiVibe sangat relational (banyak many-to-many) — lihat PRD v2.0 Section 7.1/8.1. |
| ORM | Prisma | Tim belum pernah pakai ORM — Prisma punya DX & type-safety terbaik untuk pemula. |
| Auth strategy | JWT (access + refresh token) diterbitkan backend ini | Frontend (React) memanggil endpoint backend langsung via HTTP client (fetch/axios) dan menyimpan token di state management pilihan tim — lihat Section 5 & Section 9 (belum diputuskan). |
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
| Simpan & kirim token di tiap request | Frontend (React) — strategi penyimpanan token belum diputuskan, lihat Section 9 |
| Refresh token / access token | Backend menerbitkan; frontend menyimpan & memanggil endpoint refresh saat token expired |

Backend ini **tidak tahu apa-apa soal state management di sisi frontend**. Backend cuma expose REST API biasa (`/auth/register`, `/auth/verify-otp`, `/auth/login`). Frontend yang memanggil endpoint ini langsung lewat HTTP client, lalu menyimpan hasilnya (data user, access/refresh token) ke state management/context yang dipakai tim.

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

Entity inti untuk fitur Register/Login (fase ini):

```prisma
model User {
  id           String   @id @default(uuid())
  name         String
  email        String?  @unique
  phone        String?  @unique
  password     String   // hashed, never plain text
  role         Role     @default(VOLUNTEER)
  isVerified   Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  profile      Profile?
  otpRequests  OtpRequest[]
}

enum Role {
  VOLUNTEER
  ORGANIZER
  ADMIN
}

model OtpRequest {
  id          String   @id @default(uuid())
  userId      String
  code        String
  expiresAt   DateTime
  attempts    Int      @default(0)   // max 3 kali resend (FR-003)
  verifiedAt  DateTime?
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])
}
```

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

## 8. Urutan Implementasi Fitur Pertama (Register & Login)

Mengikuti FR-001 s.d. FR-003 (PRD v2.0):

| Urutan | Endpoint | FR | Catatan |
|---|---|---|---|
| 1 | `POST /auth/register` | FR-001 | Terima email/phone + password, simpan user dengan `isVerified: false` |
| 2 | (internal) Generate & kirim OTP | FR-002 | OTP 6 digit, expiry 5 menit — simpan ke tabel `OtpRequest` |
| 3 | `POST /auth/verify-otp` | FR-002 | Cek expiry & kecocokan kode, set `isVerified: true` |
| 4 | `POST /auth/resend-otp` | FR-003 | Max 3 kali, rate-limited |
| 5 | `POST /auth/login` | — | Validasi kredensial, return access + refresh token |

**Endpoint `/auth/login` inilah yang akan dipanggil langsung dari frontend (React)** — pastikan response-nya konsisten (`{ user, accessToken, refreshToken }`) supaya gampang diintegrasikan ke auth context/state management di sisi frontend.

---

## 9. Yang Belum Diputuskan (Open Decisions)

Sesuai aturan kerja di `CLAUDE.md` — hal ini **jangan diasumsikan sendiri**, konfirmasi dulu sebelum implementasi:

- [ ] **Provider OTP**: SMS gateway (mana?) atau email (pakai apa — Resend/SendGrid/SMTP biasa)?
- [ ] **Password policy**: minimum length, kompleksitas — belum dispesifikasi di PRD.
- [ ] **Rate limiting** di level mana — per IP, per email/phone, atau keduanya?
- [ ] **Refresh token storage** — di database (revocable) atau stateless saja?
- [ ] **Strategi auth di frontend** — token disimpan di mana (memory + httpOnly cookie, atau localStorage), dan dikelola lewat Context API/Zustand/lainnya? Belum ada keputusan karena frontend ini Vite + React biasa (bukan Next.js/NextAuth).

---

## 10. Referensi

- PRD ActiVibe v2.0 (`docs/PRD-ActiVibe-v2.0.md`) — source of truth utama untuk FR & data model
- `docs/design.md` — design system (relevan kalau backend perlu expose data yang punya representasi visual, mis. status enum untuk badge)
- `CLAUDE.md` (root) — aturan kerja project, termasuk kapan harus tanya sebelum eksekusi
