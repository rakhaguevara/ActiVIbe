# Footer Component — Design Spec

> Status: Approved 2026-06-21. Sumber referensi: screenshot mockup footer (newsletter CTA band + footer links + bottom bar) yang diberikan user, dan `docs/design.md`.

## Tujuan

Membuat komponen `Footer` yang reusable, dipakai di banyak halaman (landing page sekarang, dashboard role lain nanti), mereplikasi struktur visual screenshot secara detail sambil tetap 100% mengikuti token desain di `docs/design.md`.

## Lokasi File

- `frontend/src/components/Footer.tsx`
- `frontend/src/components/Footer.css`

Mengikuti pattern `Navbar.tsx` / `Navbar.css` yang sudah ada: self-contained, tanpa props, data hardcoded sebagai konstanta di file (sama seperti `NAV_LINKS` di `Navbar.tsx`). Dipakai cukup dengan `<Footer />`.

## Integrasi

Ditambahkan ke `frontend/src/pages/HomePage.tsx`, dirender sebagai section terakhir setelah section `trust` (Trust Badges) di dalam `<main>`.

## Dependency Baru

`react-icons` ditambahkan ke `frontend/package.json` (`pnpm add react-icons`), dipakai untuk ikon sosial (`react-icons/fa`: `FaYoutube`, `FaFacebookF`, `FaTwitter`, `FaInstagram`, `FaLinkedinIn`).

## Struktur Komponen

`Footer.tsx` merender satu `<footer className="site-footer">` berisi 3 bagian:

### 1. Newsletter CTA Band

Card besar, `border-radius: 24px`, sesuai pola `docs/design.md` §6.7 (Newsletter/CTA Band — Gradient di Atas Ilustrasi):

- Background: reuse `frontend/src/assets/svg/background-1.svg` (illustration hero "Green Lab" — satu-satunya asset full-bleed flat-vector hand-drawn yang tersedia, dipakai ulang sebagai stand-in untuk ilustrasi "Community Action" yang belum ada sebagai asset terpisah)
- Overlay gradient gelap: `linear-gradient(90deg, transparent 0%, rgba(26, 26, 46, 0.75) 60%)` — sisi kanan gelap karena konten teks ada di kanan (sama seperti spec §6.7)
- Konten (rata kanan, `max-width: 480px`, warna `--color-text-on-dark`):
  - Heading: "Subscribe to our newsletter to get updates to our latest activity"
  - Subtext: "Enter your email here and get the most vibes activity ever!"
  - Form: `<input type="email" required>` + button "Subscribe" — `.btn.btn--primary`, pill `999px` (kategori "CTA besar berdiri sendiri" per §6.1 revisi v1.1)
  - Form bersifat controlled (local state), `onSubmit` memanggil `preventDefault()` saja — tidak ada network call karena backend belum diinisialisasi. Tidak ada `onSubscribe` prop (lihat keputusan "tanpa props" di atas); kalau backend sudah siap, wiring ditambahkan langsung di file ini, bukan lewat prop tambahan sekarang (YAGNI).
  - Helper text kecil: "You'll able to unsubscribe at any time"

### 2. Footer Utama (grid)

Layout grid: kolom kiri (logo + deskripsi + social), 4 kolom kanan (link groups).

**Kolom kiri:**
- Logo: reuse `frontend/src/assets/svg/logo.svg` (sama dengan yang dipakai `Navbar.tsx`)
- Tagline: **"Find Your Activity With Vibe"** — dipertahankan dalam Bahasa Inggris (wordplay Activity + Vibe = ActiVibe, bagian dari brand identity, sengaja tidak diterjemahkan)
- Paragraf deskripsi: Lorem Ipsum placeholder (konsisten dengan konvensi placeholder yang sudah dipakai di seluruh `HomePage.tsx` saat ini, menunggu copy asli dari tim konten)
- Social icons: 5 ikon dalam circle (`react-icons/fa`), urutan: YouTube, Facebook, Twitter/X, Instagram, **LinkedIn** (mengganti slot "Google" dari screenshot asli — Google bukan platform sosial yang relevan untuk konteks volunteer/organisasi; LinkedIn lebih relevan). Semua `href="#"` (placeholder, routing belum ada). Styling circle: background `--color-text-heading`, glyph `--color-bg-true`, hover background `--color-primary` (transisi sama seperti pattern hover lain di `Navbar.css`).

**4 kolom kanan** — label diadaptasi ke Bahasa Indonesia & konteks ActiVibe (menggantikan label generik SaaS template seperti "Help Center"/"Webinars"/"Course" dari screenshot asli, sesuai temuan audit template leftover di `docs/design.md` §0):

| Kolom asli (screenshot) | Kolom ActiVibe |
|---|---|
| Company: About Us, Services, Community, Testimonial | **Perusahaan**: Tentang Kami, Karir, Komunitas, Testimoni |
| Support: Help Center, Webians, Feedback | **Bantuan**: Pusat Bantuan, Webinar, Kirim Masukan |
| Links: Course, Services, All in One | **Tautan**: Cara Kerja, Cari Aktivitas, Cari Organisasi (selaras label `NAV_LINKS` di `Navbar.tsx`) |
| Contact Us: phone, email | **Hubungi Kami**: ikon telepon + `0813-8900-8988`, ikon email + `support@activibe.com` |

Semua link kolom pakai `href="#"` (placeholder, belum ada routing aktif).

### 3. Bottom Bar

- Kiri: `© {tahun berjalan, via new Date().getFullYear()} ActiVibe. Semua hak dilindungi.` (mengganti "SawIT" dari screenshot asli — itu nama agency/template asal, bukan brand ActiVibe)
- Kanan: Kebijakan Privasi · Syarat Penggunaan · Legal (semua `href="#"`)

## Yang Sengaja Diabaikan dari Screenshot

- **Garis-garis ungu** di background screenshot — dikonfirmasi user sebagai artefak frame/Figma, bukan elemen desain, tidak diimplementasikan.
- **Wave divider** transisi dari section sebelumnya — tidak ada di screenshot bagian footer, dan `docs/design.md` §4 tidak mewajibkannya di transisi ini (section §0 menyebut Footer sebagai section valid terpisah dari wave pattern).

## Styling — Token yang Dipakai

Semua warna lewat CSS custom property dari `docs/design.md` §1, tidak ada hex baru:
- `--color-primary` (button Subscribe), `--color-text-on-dark` (teks di atas illustration), `--color-bg-true` (input field background), `--color-text-heading`/`--color-text-body`/`--color-text-muted` (teks footer utama & bottom bar), `--color-border-light` (divider antara footer utama & bottom bar)
- Font: heading pakai `--font-display` (Itim), body/link/button pakai `--font-body` (Poppins) — sesuai aturan global di `index.css`
- Spacing: `--space-section-gap` sebagai padding-block section, `--space-lg`/`--space-md` untuk gap internal grid & list

## Responsive

- Desktop (≥768px): newsletter band konten rata kanan di atas illustration; footer utama grid 5 kolom (logo+social mengambil ~2 kolom lebar, 4 link group masing-masing 1 kolom)
- Mobile (≤768px): newsletter band konten full-width, illustration tetap cover tapi gradient overlay disesuaikan agar teks tetap terbaca; footer utama jadi 1 kolom stack (logo+social dulu, lalu 4 link group stack atau 2x2 grid); bottom bar jadi stack vertikal (copyright lalu legal links)

## Testing / Verifikasi

Tidak ada test otomatis untuk styling murni di project ini (belum ada test setup di `frontend/`). Verifikasi dilakukan manual: jalankan `pnpm dev`, render `HomePage`, bandingkan visual terhadap screenshot pada lebar desktop & mobile.
