# 🐳 Docker Deployment Guide — ActiVibe

Panduan deploy ActiVibe ke server menggunakan Docker & Docker Compose.

---

## 📦 Arsitektur Container

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network: activibe_net          │
│                                                         │
│  ┌─────────────────┐     ┌──────────────────────────┐  │
│  │   postgres:16   │────▶│  backend (Express+Prisma) │  │
│  │   port 5432     │     │  port 4000                │  │
│  └─────────────────┘     └──────────────┬───────────┘  │
│                                         │               │
│  ┌─────────────────────────────────────▼───────────┐   │
│  │          frontend (Nginx serving 3 portal)       │   │
│  │  :5173 → Volunteer  :5175 → Admin  :5176 → Org  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Volumes
- `postgres_data` → data database PostgreSQL (persisten)
- `uploads_data`  → file upload user: CV, logo org, foto kegiatan (persisten)

---

## 🚀 Cara Deploy

### 1. Prerequisites
- Docker Engine 24+
- Docker Compose v2+
- Git

### 2. Clone & Masuk ke Direktori

```bash
git clone <url-repo>
cd ActiVibe
```

### 3. Siapkan File `.env`

```bash
# Salin template
cp .env.docker .env

# Edit sesuai kebutuhan
nano .env
```

**Variabel WAJIB diisi:**
| Variabel | Keterangan |
|---|---|
| `POSTGRES_PASSWORD` | Password database (buat yang kuat!) |
| `JWT_ACCESS_SECRET` | `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | `openssl rand -base64 32` |
| `FRONTEND_URL` | URL semua portal, dipisah koma |

**Variabel OPSIONAL (ada fallback):**
| Variabel | Default | Keterangan |
|---|---|---|
| `RESEND_API_KEY` | _(kosong)_ | Tanpa ini, OTP di-log ke console |
| `OPENAI_API_KEY` | _(kosong)_ | Tanpa ini, pakai rule-based saja |
| `ANTHROPIC_API_KEY` | _(kosong)_ | AI Claude (opsional) |
| `GEMINI_API_KEY` | _(kosong)_ | AI Gemini (opsional) |
| `VITE_API_URL` | `http://localhost:4000` | URL backend untuk frontend build |

### 4. Build & Jalankan

```bash
# Build semua image & jalankan
docker compose up -d --build

# Lihat log (opsional)
docker compose logs -f
```

Build pertama memakan waktu ~3–5 menit (install deps + compile 3 portal).

### 5. Akses Aplikasi

| Portal | URL |
|---|---|
| 🙋 Volunteer | http://localhost:5173 |
| 🛡️ Admin | http://localhost:5175 |
| 🏢 Organizer | http://localhost:5176 |
| 🔌 Backend API | http://localhost:4000 |

---

## 🗄️ Manajemen Database

### Cek status migrasi

```bash
docker compose exec backend npx prisma migrate status
```

### Jalankan seed data (opsional, hanya sekali)

```bash
docker compose exec backend node prisma/seed.js
```

### Buka Prisma Studio (GUI database)

```bash
docker compose exec backend npx prisma studio
```

> **Catatan:** Migrasi (`prisma migrate deploy`) dijalankan **otomatis** setiap container backend start.

---

## 🔧 Perintah Berguna

```bash
# Restart satu service
docker compose restart backend

# Lihat log backend saja
docker compose logs -f backend

# Masuk ke shell container backend
docker compose exec backend sh

# Lihat semua container yang running
docker compose ps

# Stop semua container (data tetap aman di volume)
docker compose stop

# Hapus container tapi PERTAHANKAN data
docker compose down

# ⚠️ HAPUS SEMUA termasuk data (HATI-HATI!)
docker compose down -v
```

---

## 🌐 Deploy ke VPS / Cloud dengan Domain

**`.env` untuk produksi:**
```env
FRONTEND_URL=https://activibe.yourdomain.com,https://admin.yourdomain.com,https://organizer.yourdomain.com
VOLUNTEER_PORTAL_URL=https://activibe.yourdomain.com
VITE_API_URL=https://api.yourdomain.com
```

**Nginx reverse proxy di host (contoh):**
```nginx
server {
    listen 443 ssl;
    server_name activibe.yourdomain.com;
    location / { proxy_pass http://localhost:5173; }
}
server {
    listen 443 ssl;
    server_name admin.yourdomain.com;
    location / { proxy_pass http://localhost:5175; }
}
server {
    listen 443 ssl;
    server_name organizer.yourdomain.com;
    location / { proxy_pass http://localhost:5176; }
}
server {
    listen 443 ssl;
    server_name api.yourdomain.com;
    location / { proxy_pass http://localhost:4000; }
}
```

---

## ❗ Troubleshooting

| Masalah | Solusi |
|---|---|
| "Missing required environment variable" | Pastikan `.env` ada di root project dan semua variabel wajib diisi |
| Build frontend gagal: "pnpm: not found" | Pastikan Docker Engine versi terbaru |
| 500 error setelah deploy | `docker compose logs backend \| grep migrate` |
| Upload file hilang setelah restart | Pastikan **tidak** pakai `docker compose down -v` |
| Cannot connect to postgres | Tunggu health check selesai (~30 detik) |
