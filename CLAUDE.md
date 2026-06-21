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
- `backend/` — API & services (belum diinisialisasi — rencana arsitektur: Express.js + PostgreSQL + Prisma + JWT, lihat [backend/README.md](backend/README.md). Auth dipanggil langsung dari frontend lewat REST API, **bukan** Next.js/NextAuth)
- `docs/` — Dokumentasi product (PRD, design system, dst.)

Lihat [README.md](README.md) dan [docs/PRD-ActiVibe-v2.0.md](docs/PRD-ActiVibe-v2.0.md) untuk detail produk lengkap.

## Menjaga File Ini Tetap Up to Date

File ini **wajib diperbarui** setiap kali ada keputusan struktural/desain baru yang signifikan (struktur folder berubah, aturan styling baru, role/flow baru ditambahkan), supaya sesi Claude berikutnya tidak kehilangan konteks. Jangan biarkan isi file ini basi dibanding kondisi repo yang sebenarnya — kalau ada perubahan besar di `docs/design.md`, `docs/PRD-ActiVibe-v2.0.md`, atau struktur repo, update referensi di sini juga.
