# Setup Email (Resend) — Supaya Sama di Semua PC

## Kenapa email jalan di satu PC tapi tidak di PC lain

`backend/.env` **sengaja di-gitignore** (lihat `backend/.gitignore`) — jadi isinya (termasuk `RESEND_API_KEY`) **tidak pernah ikut ter-push/pull lewat git**. Tiap PC punya `.env` lokal sendiri-sendiri. Kalau PC baru cuma `git clone` lalu `pnpm install`, `backend/.env` tidak ada sama sekali — cuma ada `backend/.env.example` (template kosong, ini yang di-commit).

Tanpa `RESEND_API_KEY` terisi, kode di `backend/src/utils/mailer.js` **tidak error** — dia fail-soft, cuma nge-log link/kode ke console (lihat pola `if (!resendClient) { console.log(...); return }` di tiap fungsi kirim email). Jadi gejalanya bukan crash, tapi "kok emailnya gak pernah nyampe" — padahal sebenarnya cuma nge-print ke terminal backend.

## Env var yang wajib sama di semua PC untuk fitur email

Semua ini ada di `backend/.env` (lihat `backend/.env.example` untuk daftar lengkap semua env var, bukan cuma yang email):

| Var | Fungsi |
|---|---|
| `RESEND_API_KEY` | API key dari [resend.com](https://resend.com) → dashboard → API Keys. Kosong = fallback log-to-console (dev mode). |
| `RESEND_FROM_EMAIL` | Alamat pengirim, format `"Nama <email@domain>"`. |
| `BACKEND_URL` | Dipakai untuk link aktivasi organisasi di email (`GET /organizations/activate?token=...`). |
| `ORGANIZER_PORTAL_URL` | Redirect tujuan setelah klik link aktivasi organisasi. |
| `OTP_EXPIRY_MINUTES`, `OTP_MAX_RESEND_ATTEMPTS` | Bukan soal Resend langsung, tapi terkait alur OTP yang emailnya lewat Resend juga (`sendOtpEmail`). |

## Cara menyamakan di PC baru

1. `cd backend && cp .env.example .env`
2. Isi `RESEND_API_KEY` dan var lain (`DATABASE_URL`, `JWT_ACCESS_SECRET`, dst) — **ambil nilainya dari password manager kamu** (1Password/Bitwarden/dll), **bukan dari chat/commit manapun**. Simpan API key Resend ini sebagai satu entry di situ supaya gampang disalin ke PC manapun nanti.
3. Restart `pnpm dev` di `backend/` supaya env var ke-load ulang (env di-baca sekali saat proses start, lihat `backend/src/config/env.js`).
4. Test: daftar akun baru / apply ke event, lalu cek terminal backend — kalau email betulan terkirim, TIDAK ada baris log `[mailer] RESEND_API_KEY kosong — ...`. Kalau baris itu masih muncul, berarti `.env` di PC itu belum ke-load / key masih kosong.

## Gotcha umum Resend (bukan spesifik ActiVibe)

- **Sender default `onboarding@resend.dev`**: kalau `RESEND_FROM_EMAIL` masih pakai domain testing bawaan Resend ini (bukan domain sendiri yang sudah diverifikasi di dashboard Resend), akun Resend **mode sandbox** cuma bisa kirim ke alamat email yang jadi pemilik akun Resend itu sendiri — email ke alamat lain akan gagal terkirim/ditolak diam-diam tergantung mode akun. Ini beda urusan dari `RESEND_API_KEY` kosong (yang fail-soft ke console). Kalau perlu kirim ke banyak alamat penerima berbeda, verifikasi domain sendiri di Resend dashboard → Domains, lalu ganti `RESEND_FROM_EMAIL` ke `"ActiVibe <no-reply@domainmu.id>"`.
- **API key yang salah/revoked**: Resend akan menolak request (biasanya muncul sbg error di log `catch` pemanggil — cek `applyToEvent`/`registerUser` dst, semua fire-and-forget dengan `.catch(err => console.error(...))`), bukan silent fail seperti kasus key kosong.
- Satu akun Resend biasa punya beberapa API key (per environment/project) — pastikan key yang dipakai di tiap PC berasal dari akun Resend yang sama supaya kuota & domain terverifikasi konsisten.

## Yang TIDAK boleh dilakukan

- Jangan taruh nilai asli `RESEND_API_KEY` (atau secret env var apapun) di file yang ter-commit ke git — termasuk file `.md` manapun di repo ini, `docs/` termasuk. File ini sengaja tidak berisi key asli manapun.
- Jangan commit `backend/.env` — sudah di-gitignore, biarkan begitu.
