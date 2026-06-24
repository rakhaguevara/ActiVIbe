# Aktivasi Register & Login — Design Spec

> Status: Approved 2026-06-24. Lanjutan dari setup database (`backend/prisma/schema.prisma`, model `User`/`OtpRequest`/`RefreshToken`, sudah di-migrate ke PostgreSQL lokal sebelum spec ini ditulis).

## Tujuan

Membuat alur Register & Login benar-benar berfungsi end-to-end: backend Express baru (belum ada sama sekali sebelumnya) yang terhubung ke database PostgreSQL yang sudah dibuat, dan frontend (`AuthModal.tsx`, yang `handleSubmit`-nya saat ini kosong) terhubung ke API itu. Plus halaman 404 sebagai catch-all sekaligus placeholder tujuan setelah login/register (karena dashboard sungguhan belum dibangun).

## Scope & Keputusan Kunci

- **OTP di-skip untuk iterasi ini.** README backend mensyaratkan flow register → OTP → verify → login (FR-001/002/003), tapi provider OTP (SMS/email) belum diputuskan dan `AuthModal` belum punya UI input kode OTP. Register langsung set `isVerified: true` dan langsung login (set cookie token), tanpa langkah verifikasi. OTP nyata (dengan provider asli) menyusul di iterasi lain begitu providernya diputuskan — model `OtpRequest` sudah ada di schema dan tidak perlu diubah saat itu terjadi.
- **Token disimpan sebagai httpOnly cookie**, bukan di body response yang disimpan ke localStorage. Frontend tidak pernah pegang token mentah di JS.
- **Field `location` di form signup dibiarkan ada di UI, tapi diabaikan backend** — `Profile` entity (tempat seharusnya `location` disimpan) belum dibangun.
- **Tujuan setelah login/register sukses: `/dashboard`**, route yang **sengaja tidak didaftarkan** sehingga jatuh ke catch-all 404. Begitu dashboard asli ada, cukup daftarkan route-nya — redirect ini otomatis berhenti nyasar ke 404.
- **Di luar scope** (sengaja ditunda, bukan terlupa): `/auth/verify-otp`, `/auth/resend-otp`, `/auth/refresh` (access token cookie 15 menit, expired → user login ulang), reset password, penyimpanan `location`/`Profile`.

## 1. Backend — Struktur Proyek

Backend (`backend/`) saat ini baru berisi `package.json`, `.env`, `prisma/`. Bagian ini menambahkan struktur Express sesuai `backend/README.md` Section 3:

```
backend/src/
├── config/
│   ├── env.js        # load & validasi env vars (DATABASE_URL, JWT_*, PORT, FRONTEND_URL)
│   └── prisma.js      # PrismaClient singleton
├── modules/auth/
│   ├── auth.routes.js
│   ├── auth.controller.js
│   ├── auth.service.js      # hashing, query Prisma, sign token
│   └── auth.validation.js   # validasi manual (bukan library), dipakai middleware validateRequest
├── middlewares/
│   ├── errorHandler.js      # format error jadi { error: { message } }
│   ├── rateLimiter.js       # express-rate-limit, dipasang di /auth/login & /auth/register
│   └── validateRequest.js
├── utils/
│   └── jwt.js          # sign/verify access & refresh token
├── app.js              # express(), cors, cookie-parser, mount routes, errorHandler
└── server.js            # listen di PORT
```

Dependency baru ditambahkan ke `backend/package.json`:

| Package | Alasan |
|---|---|
| `express` | Web framework (sudah diputuskan di README) |
| `cors` | CORS dengan `credentials: true`, origin dibatasi ke `FRONTEND_URL` |
| `cookie-parser` | Baca `req.cookies` (Express tidak punya built-in parser untuk membaca cookie masuk) |
| `bcryptjs` | Hash password — versi pure-JS dipilih (bukan `bcrypt`) supaya tidak butuh native build tools di Windows dev machine |
| `jsonwebtoken` | Sign & verify JWT access/refresh token |
| `express-rate-limit` | Rate limit dasar per-IP di endpoint auth |
| `dotenv` | Load `.env` |
| `nodemon` (devDependency) | Auto-restart saat development, dipakai di script `npm run dev` |

## 2. Endpoint

| Endpoint | Body / Auth | Perilaku |
|---|---|---|
| `POST /auth/register` | `{ firstName, lastName, email, password }` (`location` diterima tapi diabaikan, tidak divalidasi/disimpan) | Cek email belum terdaftar (409 kalau sudah). Hash password (bcryptjs). Buat `User` dengan `name = `${firstName} ${lastName}`.trim()`, `isVerified: true`. Sign access+refresh token, simpan hash refresh token ke tabel `RefreshToken`. Set cookie `accessToken` & `refreshToken`. Balas `200 { user: { id, name, email, role } }`. |
| `POST /auth/login` | `{ email, password }` | Cari `User` by email. Kalau tidak ada atau password salah → `401 { error: "Email atau password salah" }` (pesan generik, tidak bocorin mana yang salah). Kalau valid → sama seperti register: sign token, simpan refresh token hash, set cookie, balas `{ user }`. |
| `GET /auth/me` | Cookie `accessToken` | Verify JWT dari cookie. Valid → `200 { user }`. Tidak ada/invalid/expired → `401`. Dipakai frontend saat app pertama mount untuk restore session setelah refresh halaman. |
| `POST /auth/logout` | Cookie `refreshToken` | Cari row `RefreshToken` cocok (by hash), set `revokedAt`. Clear kedua cookie. Balas `200`. |

**Validasi (`auth.validation.js`, manual, tanpa library):**
- `email`: format email valid (regex sederhana), required.
- `password`: minimum 8 karakter, required. Tidak ada syarat kompleksitas tambahan untuk iterasi ini.
- `firstName`, `lastName`: required, non-empty string.

## 3. Cookie & Token

- `accessToken`: JWT, payload `{ userId, role }`, expiry `JWT_ACCESS_EXPIRES_IN` (15m, dari `.env`). Cookie: `httpOnly: true, sameSite: 'lax', secure: false` (dev, http localhost — `secure: true` saat production via HTTPS), `maxAge` matching expiry, `path: '/'`.
- `refreshToken`: JWT random/opaque, expiry `JWT_REFRESH_EXPIRES_IN` (7d). Hash SHA-256-nya disimpan di kolom `RefreshToken.tokenHash` (bukan nilai mentah — keputusan ini sudah diambil saat desain schema). Cookie sama sifatnya dengan accessToken, `maxAge` 7 hari.
- Karena frontend (`localhost:5173`) dan backend (`localhost:4000`) beda port tapi sama host, ini dianggap *same-site* oleh browser — `sameSite: 'lax'` cukup, tidak perlu `secure: true`/`sameSite: 'none'` di development.
- CORS: `cors({ origin: process.env.FRONTEND_URL, credentials: true })` — origin eksplisit, bukan wildcard (sesuai catatan keamanan README).
- Middleware auth (dipakai `GET /auth/me`, dan nanti endpoint lain yang butuh login): baca `req.cookies.accessToken`, verify JWT, attach `req.user`.

## 4. Frontend — Wiring

### API client
`frontend/src/lib/api.ts` — fetch wrapper kecil:
- Base URL dari `import.meta.env.VITE_API_URL` (env baru: `frontend/.env` → `VITE_API_URL=http://localhost:4000`).
- Semua call pakai `credentials: 'include'`.
- Fungsi: `registerRequest(data)`, `loginRequest(data)`, `logoutRequest()`, `meRequest()`. Masing-masing return parsed JSON atau throw `Error` dengan message dari `{ error }` response kalau status bukan 2xx.

### AuthContext
`frontend/src/contexts/AuthContext.tsx`:
- State: `user: User | null`, `isLoading: boolean`.
- Saat mount: panggil `meRequest()`. Sukses → set `user`. Gagal (401) → `user` tetap `null`, bukan error yang ditampilkan ke UI.
- `login(email, password)`, `register(data)`: panggil API, set `user` dari response, return hasilnya supaya caller (AuthModal) bisa tahu sukses/gagal.
- `logout()`: panggil `logoutRequest()`, lalu set `user` ke `null`.
- Dibungkus sebagai `<AuthProvider>` di `App.tsx`, membungkus `BrowserRouter` (atau di dalamnya, tidak masalah selama semua komponen yang butuh `useAuth()` ada di dalamnya).

### AuthModal.tsx
- `handleSubmit` baca `FormData` dari form, panggil `register()`/`login()` dari `useAuth()` sesuai `mode`.
- State baru: `error: string | null`, `status: 'idle' | 'submitting' | 'success'`.
- Error dari API → set `error`, tampilkan inline di bawah form (elemen baru `<p className="auth-modal__error">`, styling ringan mengikuti BEM pattern yang sudah ada di `AuthModal.css`).
- Sukses → `status = 'success'`, form area diganti pesan singkat ("Berhasil masuk!" / "Berhasil daftar!") selama ~1.2 detik (`setTimeout`), lalu `onClose()` dipanggil dan `navigate('/dashboard')` (dari `useNavigate`, `react-router-dom`).
- Field `location` tetap di form (tidak dihapus dari UI), tapi tidak disertakan saat memanggil `register()` — cukup tidak dibaca dari `FormData` itu.

### Navbar.tsx
- Baca `user` dari `useAuth()`.
- `user` ada → render nama (atau nama depan, split dari `user.name`) + tombol "Logout" (memanggil `logout()` lalu `navigate('/')`), menggantikan posisi tombol Masuk/Daftar.
- `user` null → tombol Masuk/Daftar seperti sekarang (tidak berubah).

## 5. Halaman 404 & Routing

- `frontend/src/pages/NotFoundPage.tsx` + `.css` — halaman minimal: heading "404", teks singkat "Halaman tidak ditemukan", link kembali ke beranda (`<Link to="/">`). Styling ringan pakai token dari `docs/design.md` (font Itim untuk heading, Poppins untuk body, warna dari palet resmi) — tidak ada layout kompleks karena memang dimaksud sebagai halaman kosong/placeholder.
- `frontend/src/routes/AppRoutes.tsx`: tambah `<Route path="*" element={<NotFoundPage />} />` di akhir daftar route.
- Tidak ada route `/dashboard` didaftarkan — navigasi ke sana sengaja jatuh ke catch-all di atas.

## 6. Error Handling

- `middlewares/errorHandler.js`: menangkap semua error (termasuk dari Prisma, mis. unique constraint violation kalau ada race condition di pengecekan email), balas format konsisten `{ error: { message } }` dengan status code yang sesuai (400 validasi, 401 auth, 409 conflict, 500 default).
- Validation middleware (`validateRequest.js`) jalan sebelum controller, balas `400` kalau body tidak valid — controller tidak perlu cek ulang.

## Testing Manual (Definition of Done)

- `npm run dev` di `backend/` jalan tanpa error, connect ke `activivibe_db`.
- Dari UI: isi form Daftar (signup) di `AuthModal` → submit → row baru muncul di tabel `User` (cek via Prisma Studio) dengan `isVerified: true`, password ter-hash (bukan plaintext) → modal nutup, redirect ke `/dashboard` → muncul halaman 404 → Navbar tampilkan nama user + Logout.
- Refresh halaman browser → status login tetap ada (Navbar tetap tampilkan nama, bukan balik ke Masuk/Daftar) — membuktikan `GET /auth/me` & cookie bekerja.
- Klik Logout → Navbar balik ke Masuk/Daftar, cek row `RefreshToken` terkait punya `revokedAt` terisi.
- Coba login dengan email yang sama tapi password salah → muncul pesan error inline "Email atau password salah", tidak ada redirect.
- Coba register dengan email yang sudah dipakai → muncul pesan error inline "Email sudah terdaftar".
