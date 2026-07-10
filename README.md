<div align="center">
  <img src="docs/assets/logo-placeholder.png" alt="ActiVibe Logo" width="1000" height="400"/>
  <p><strong>Platform Volunteer Berbasis AI untuk Personalisasi Minat & Dampak Sosial</strong></p>
</div>

## 🌟 About ActiVibe

**ActiVibe** adalah platform volunteer yang mempertemukan relawan (Volunteer) dengan organisasi/NGO (Organizer) lewat rekomendasi kegiatan yang dipersonalisasi AI (**Predictive Match Score**). Setiap relawan mendapat skor kecocokan kegiatan berdasarkan skill, minat, motivasi, ketersediaan, dan lokasi — dikombinasikan dengan lapisan AI multi-provider (Claude, ChatGPT, Gemini) untuk penilaian & narasi yang lebih tajam. Di sisi lain, Organizer mendapat dashboard lengkap untuk mengelola kegiatan, pendaftar, presensi, hingga laporan dampak — dan Admin mengawasi keseluruhan platform lewat panel verifikasi & moderasi.

<div align="center">
  <img src="docs/assets/banner-placeholder.png" alt="ActiVibe UI" width="1000" height="500"/>
</div>

## 🖼️ Background & Motivation

Banyak calon relawan kesulitan menemukan kegiatan volunteer yang benar-benar sesuai minat, skill, dan waktu luang mereka, sementara organisasi/NGO kesulitan menjangkau relawan yang tepat dan mengelola proses pendaftaran-presensi-pelaporan secara manual (spreadsheet, WhatsApp, form terpisah). **ActiVibe** dibangun sebagai platform web tiga peran (Volunteer, Organizer, Admin) yang menyatukan proses ini dalam satu sistem: rekomendasi kegiatan dipersonalisasi AI, alur pendaftaran-tiket-presensi digital (QR code), hingga "Impact Passport" sebagai portofolio kontribusi relawan yang bisa diverifikasi.

## 💡 Key Features

### 🎯 Predictive Match Score (AI Personalization)
- Skor kecocokan kegiatan berbasis aturan (skill, minat, motivasi, ketersediaan, lokasi) dipadukan lapisan AI multi-provider (Claude / ChatGPT / Gemini) dengan fallback otomatis ke rule-based kalau AI tidak tersedia.
- Sinyal perilaku (kegiatan yang dibuka/disimpan) ikut menyesuaikan rekomendasi berikutnya (behavioral boost).
- Hasil onboarding ditampilkan sebagai analisis AI + rekomendasi top-3 kegiatan begitu relawan selesai mengisi profil.

### 🎫 Pendaftaran & Tiket Digital
- Alur daftar kegiatan → ditinjau organizer → tiket digital dengan QR code (bisa dilihat di app & dikirim via email).
- Check-in di lokasi lewat scan QR atau input kode tiket manual oleh panitia.

### 📔 Impact Passport
- "Buku" digital hasil kontribusi relawan — total jam, jumlah kegiatan, level/XP skill, dan ringkasan naratif per kegiatan yang sudah selesai — bisa dibagikan sebagai portofolio.

### 🏢 Dashboard Organizer
- Kelola kegiatan (draft → pengajuan → publish → tutup), role & shift relawan, dokumen pendukung/legal, galeri.
- Pipeline pendaftar (review, terima/tolak, assign shift), presensi (manual & scan QR), laporan penutupan kegiatan dengan metrik dampak per kategori.
- Dashboard ringkasan real-time (KPI, grafik, AI insight, "Ask AI" chat) yang tersambung langsung ke database.

### 🛡️ Dashboard Admin
- Verifikasi & moderasi akun, review pengajuan kegiatan (approve/reject), log aktivitas platform, distribusi region, dan AI insight untuk pengambilan keputusan.

## 🧰 Technology Stack

<div align="center">
  <br>
  <img src="docs/assets/tech-placeholder.png" alt="React" height="60"/>
  <img src="docs/assets/tech-placeholder.png" alt="TypeScript" height="60"/>
  <img src="docs/assets/tech-placeholder.png" alt="Vite" height="60"/>
  <img src="docs/assets/tech-placeholder.png" alt="Express.js" height="60"/>
  <img src="docs/assets/tech-placeholder.png" alt="PostgreSQL" height="60"/>
  <img src="docs/assets/tech-placeholder.png" alt="Prisma" height="60"/>
  <img src="docs/assets/tech-placeholder.png" alt="Claude" height="60"/>
  <img src="docs/assets/tech-placeholder.png" alt="OpenAI" height="60"/>
  <img src="docs/assets/tech-placeholder.png" alt="Gemini" height="60"/>
  <br><br>
</div>

| Layer | Teknologi |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router, TanStack Query |
| Backend | Express.js, PostgreSQL, Prisma ORM, JWT (httpOnly cookie) |
| AI (multi-provider) | Claude (Anthropic SDK), OpenAI (ChatGPT), Google Gemini — dengan fallback deterministik |
| Lainnya | Resend (email/OTP), `qrcode` & `qr-scanner` (tiket & check-in QR) |

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ & `pnpm` (frontend), `npm` (backend)
- PostgreSQL (lokal atau hosted)
- API key AI (opsional, minimal salah satu): Claude / OpenAI / Gemini
- API key Resend (opsional, untuk kirim email OTP — kalau kosong, fallback ke `console.log`)

### Clone Project

```bash
git clone <url-repo-ini>
cd ActiVibe
```

### Setup Backend

```bash
cd backend
npm install
# salin & isi .env (lihat docs/EMAIL_SETUP.md untuk konfigurasi email/OTP)
cp .env.example .env

npm run db:migrate     # jalankan migrasi Prisma
npm run db:seed        # (opsional) isi data demo
npm run dev            # jalan di http://localhost:3000 (default)
```

### Setup Frontend

```bash
cd frontend
pnpm install
pnpm dev               # portal Volunteer — http://localhost:5173
pnpm dev:organizer     # portal Organizer
pnpm dev:admin         # portal Admin
```

> Frontend punya 3 mode build/dev terpisah (Volunteer, Organizer, Admin) — masing-masing portal berjalan di port berbeda tapi berbagi satu backend API yang sama.

## 📂 Project Structure

```
ActiVibe/
├── frontend/                     # React + TypeScript + Vite (pnpm)
│   └── src/
│       ├── components/           # Komponen UI reusable
│       ├── layouts/              # Layout wrapper per role (Public/Dashboard/Organizer/Admin)
│       ├── routes/                # Konfigurasi routing (react-router-dom)
│       ├── contexts/             # React Context (mis. OrganizerDataContext)
│       ├── hooks/                 # Custom hooks
│       ├── lib/                  # API client per domain (fetch ke backend)
│       ├── services/             # Pemanggilan API (recommendation, passport, dll.)
│       ├── types/                # TypeScript types
│       ├── utils/                 # Helper/utility
│       └── pages/
│           ├── auth/              # Login & Signup (Organizer/Admin portal)
│           ├── onboarding/        # Wizard onboarding + hasil personalisasi AI
│           ├── volunteer/         # Halaman peran Volunteer
│           ├── organizer/         # Halaman peran Organizer
│           └── admin/             # Halaman peran Admin
│
├── backend/                      # Express.js + PostgreSQL + Prisma (npm)
│   ├── prisma/                   # Schema database & seed data
│   └── src/
│       ├── modules/              # Satu folder per domain fitur
│       │   ├── auth/              # Register, login, OTP verifikasi
│       │   ├── profile/           # Profil & skill/minat volunteer
│       │   ├── events/            # CRUD kegiatan, role & shift, presensi
│       │   ├── applications/      # Pendaftaran, tiket QR, pipeline pelamar
│       │   ├── recommendations/   # Predictive Match Score (rule-based + AI)
│       │   ├── organizations/     # Data organisasi/NGO
│       │   ├── subOrganizers/     # Kontak PIC reusable
│       │   ├── passport/          # Impact Passport
│       │   ├── admin/             # Dashboard & moderasi Admin
│       │   ├── organizerOverview/ # Dashboard ringkasan Organizer
│       │   └── location/          # Data wilayah/lokasi
│       ├── middlewares/          # Auth guard, role guard, validasi request
│       └── config/                # Koneksi Prisma, env, dsb.
│
└── docs/                         # Dokumentasi produk (PRD, design system, setup)
```

## 🧭 Fitur per Role

| Fitur | 👤 Volunteer | 🏢 Organizer | 🛡️ Admin |
|---|:---:|:---:|:---:|
| Registrasi & login (dengan verifikasi OTP email) | ✅ | ✅ (login-only, akun dibuat lewat pendaftaran organisasi) | ✅ (login-only) |
| Onboarding profil (minat, skill, motivasi, ketersediaan) + hasil analisis AI | ✅ | – | – |
| Cari kegiatan dengan Predictive Match Score (AI) | ✅ | – | – |
| Simpan/like kegiatan & riwayat lihat (personalisasi berkelanjutan) | ✅ | – | – |
| Cari & lihat direktori organisasi (NGO) terverifikasi | ✅ | – | – |
| Daftar kegiatan + tiket digital (QR) | ✅ | – | – |
| Riwayat pendaftaran & status (pipeline) | ✅ | – | – |
| Impact Passport (portofolio kontribusi) | ✅ | – | – |
| Info kenyamanan peserta perempuan ("Women Respect") | ✅ | – | – |
| Buat & kelola kegiatan (draft → ajukan → publish → tutup) | – | ✅ | – |
| Kelola role & shift relawan per kegiatan | – | ✅ | – |
| Kelola Sub Organizer (kontak PIC reusable) | – | ✅ | – |
| Review & kelola pipeline pelamar (terima/tolak/assign) | – | ✅ | – |
| Presensi kehadiran (manual & scan QR) | – | ✅ | – |
| Tutup kegiatan + laporan dampak per kategori | – | ✅ | – |
| Dashboard ringkasan real-time + AI insight & chat | – | ✅ | ✅ |
| Review & moderasi pengajuan kegiatan (approve/reject) | – | – | ✅ |
| Kelola/verifikasi akun pengguna | – | – | ✅ |
| Log aktivitas & distribusi region platform | – | – | ✅ |

## 📊 Progres Pengerjaan

| Modul / Fitur | Status | Keterangan |
|---|:---:|---|
| Landing page & halaman publik | ✅ Selesai | Hero, fitur, "Tentang Kami", "Cara Kerja" |
| Autentikasi (register/login/logout + OTP email) | ✅ Selesai | End-to-end, cookie httpOnly |
| Onboarding & hasil analisis AI | ✅ Selesai | Wizard chat + modal hasil personalisasi 2 tahap |
| Predictive Match Score (rule-based + AI) | ✅ Selesai | Multi-provider AI dengan fallback otomatis |
| Cari Kegiatan (list/detail/swipe, filter, bookmark) | ✅ Selesai | Data kegiatan sudah dari database |
| Pendaftaran kegiatan + tiket digital QR | ✅ Selesai | Tiket di app & email, check-in via scan/kode |
| Cari Organisasi (direktori NGO) | ✅ Selesai | |
| Impact Passport | ✅ Selesai | Data 100% dari database, tanpa data karangan |
| Dashboard Organizer — kelola kegiatan, role & shift | ✅ Selesai | |
| Dashboard Organizer — pipeline pelamar & presensi | ✅ Selesai | |
| Dashboard Organizer — tutup kegiatan & laporan dampak | ✅ Selesai | |
| Dashboard Organizer — ringkasan/overview real-time + AI | ✅ Selesai | |
| Dashboard Admin — moderasi kegiatan & user | ✅ Selesai | |
| Dashboard Admin — ringkasan/overview real-time + AI | ✅ Selesai | |
| Communication Center (broadcast pesan ke relawan) | 🚧 Sebagian | UI sudah ada, data masih statis (belum tersambung backend) |
| Sertifikat kegiatan (generate & kelola) | 🚧 Sebagian | Sebagian alur sudah ada, sebagian masih placeholder |
| Laporan/analitik lanjutan (export, unduh laporan) | 🚧 Sebagian | Sebagian tampilan masih placeholder, belum ada fitur generate laporan |

## 👨‍💻 Contributors

- Guevara
- daffaadp

## 📄 License

Tugas Besar mata kuliah **Pengembangan Sistem Informasi** — Semester 4.

## 🙏 Acknowledgements

Mata Kuliah Pengembangan Sistem Informasi — Semester 4
