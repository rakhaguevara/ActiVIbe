# Section "Intip Tampilannya" di /cara-kerja — Design Spec

> Status: Approved 2026-06-27. Konteks: user minta section baru di halaman `/cara-kerja` (`CaraKerjaPage.tsx`) yang menampilkan mockup aplikasi + penjelasan berdasarkan mockup itu, diletakkan tepat di bawah section CTA ungu "Daftar Sekarang" (`cara-kerja-page__cta`) — lebih tepatnya: di ANTARA section Impact Passport (`cara-kerja-page__passport`) dan CTA itu, karena CTA harus tetap jadi penutup halaman sebelum `<Footer/>`.

## Tujuan

Menambahkan satu section baru, `cara-kerja-page__preview`, yang menunjukkan "begini rasanya pakai dashboard ActiVibe" — melengkapi narasi yang sudah dibangun lewat section Alur Volunteer (AI Matching, Onboarding) dan Impact Passport (portofolio dampak), dengan fokus baru: kemudahan mencari dan mendaftar kegiatan dalam satu tampilan.

Tidak ada mockup gambar asli yang tersedia — section ini memakai placeholder visual generik (dibangun dari CSS, bukan image asset baru), karena mockup aplikasi sungguhan belum ada dan akan menyusul nanti.

## 1. Penempatan

Di `CaraKerjaPage.tsx`, section baru disisipkan persis di antara section Impact Passport (`cara-kerja-page__passport`) dan section CTA penutup (`cara-kerja-page__cta`):

```
...
<section className="cara-kerja-page__passport"> ... </section>

<section className="cara-kerja-page__preview"> ... </section>   {/* BARU */}

<section className="cara-kerja-page__cta"> ... </section>
<Footer />
```

Section ini khusus untuk `/cara-kerja` saja — tidak menyentuh `Footer.tsx` (yang dipakai bersama oleh semua halaman publik) maupun `HomePage.tsx`.

## 2. Struktur & Layout

Grid dua kolom, mengikuti pola yang sama dengan section Impact Passport (`cara-kerja-page__passport-body`): teks (eyebrow+judul+desc) di kolom kiri, mockup/visual di kolom kanan. Section baru ini konsisten dengan arah Impact Passport, tidak dibalik — sesuai pilihan user ("Mockup kanan, teks kiri, sama seperti section di atasnya").

```
┌─────────────────────────────┬───────────────────────────────┐
│  Eyebrow: INTIP TAMPILANNYA │                                │
│  Judul: Satu dashboard,     │   ┌─ Browser-frame mockup ──┐  │
│  semua kegiatan yang        │   │ ● ● ●  activibe.id/...  │  │
│  relevan untukmu.           │   │ ▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭ │  │
│                              │   │ ▢▢▢▢▢  ▢▢▢▢▢  ▢▢▢▢▢     │  │
│  Desc: Cari kegiatan,        │   └──────────────────────────┘  │
│  baca detailnya, dan         │                                │
│  daftar — semua dalam        │                                │
│  satu tampilan...            │                                │
└─────────────────────────────┴───────────────────────────────┘
```

Pada breakpoint mobile (≤900px, mengikuti breakpoint yang sudah dipakai `cara-kerja-page__passport-body`), grid jadi satu kolom: teks dulu, mockup di bawahnya.

## 3. Konten Teks

Tidak perlu `const` array baru di `CaraKerjaPage.tsx` (section ini cuma satu blok teks, bukan list berulang) — ditulis inline di JSX, mengikuti pola section CTA (`cara-kerja-page__cta`) yang juga inline:

- Eyebrow: `INTIP TAMPILANNYA`
- Judul: `Satu dashboard, semua kegiatan yang relevan untukmu.`
- Deskripsi: `Cari kegiatan, baca detailnya, dan daftar — semua dalam satu tampilan, tanpa pindah halaman atau mengisi form berlapis. Setiap kegiatan yang muncul sudah disaring AI Matching kami, jadi yang kamu lihat memang relevan dengan minat dan jadwalmu.`

## 4. Mockup Placeholder (CSS-only, tanpa image asset baru)

Sebuah "browser window frame" dibangun murni dari HTML/CSS:

```tsx
<div className="cara-kerja-page__preview-mockup">
  <span className="cara-kerja-page__preview-mockup-tag">Contoh ilustrasi</span>

  <div className="cara-kerja-page__preview-browser">
    <div className="cara-kerja-page__preview-browser-bar">
      <span className="cara-kerja-page__preview-browser-dot" />
      <span className="cara-kerja-page__preview-browser-dot" />
      <span className="cara-kerja-page__preview-browser-dot" />
      <span className="cara-kerja-page__preview-browser-url">activibe.id/dashboard</span>
    </div>

    <div className="cara-kerja-page__preview-browser-body">
      <div className="cara-kerja-page__preview-placeholder-bar" />
      <div className="cara-kerja-page__preview-placeholder-row">
        <div className="cara-kerja-page__preview-placeholder-card" />
        <div className="cara-kerja-page__preview-placeholder-card" />
        <div className="cara-kerja-page__preview-placeholder-card" />
      </div>
    </div>
  </div>
</div>
```

- `cara-kerja-page__preview-mockup-tag`: badge kecil, identik styling-nya dengan `cara-kerja-page__passport-mockup-tag` yang sudah ada (posisi absolute top-right, teks "Contoh ilustrasi") — dipakai ulang sebagai pola, bukan komponen bersama (mengikuti cara `cara-kerja-page__passport-mockup-tag` sendiri juga didefinisikan lokal per section, tidak diekstrak).
- `cara-kerja-page__preview-browser`: container dengan `border-radius: 16px`, `border: 1px solid var(--color-border-light)`, `overflow: hidden`, `box-shadow` setara dengan `cara-kerja-page__flow-image-wrap` (`0 8px 32px rgba(0, 0, 0, 0.12)`) supaya mockup terasa "mengambang" seperti gambar asli di section lain.
- `cara-kerja-page__preview-browser-bar`: strip atas, `background: var(--color-bg-surface)`, `padding: 10px 16px`, `display:flex; align-items:center; gap:8px`. Tiga `-dot` masing-masing lingkaran kecil (`width/height: 8px`, `border-radius:50%`, `background: var(--color-border-medium)`) — generik, BUKAN merah/kuning/hijau (browser asli biasa pakai 3 warna berbeda, tapi itu hex baru yang tidak ada di token kita — pakai satu warna netral existing untuk ketiganya, konsisten dengan aturan "no new hex colors").
- `-browser-url`: teks kecil placeholder, `font-size: 12px`, `color: var(--color-text-muted)`, sisa lebar (`flex:1`), `background: var(--color-bg-true)`, `border-radius: 999px`, `padding: 4px 12px` (kapsul kecil meniru address bar).
- `cara-kerja-page__preview-browser-body`: `background: var(--color-bg-true)`, `padding: 24px`, isi 2 elemen:
  - `-placeholder-bar`: satu bar mewakili topbar, `height: 28px`, `border-radius: 8px`, `background: var(--color-primary-soft)`, `width: 40%`, `margin-bottom: 20px` — generik, tanpa teks/logo di dalamnya.
  - `-placeholder-row`: `display:flex; gap:16px`, isinya 3× `-placeholder-card` (`flex:1`, `height: 90px`, `border-radius: 12px`, `background: var(--color-bg-surface)`, `border: 1px solid var(--color-border-light)`) — generik, tanpa konten di dalamnya (bukan replikasi card asli `EventListSidebar`, sesuai pilihan "placeholder simpel" bukan "dibangun dari UI asli").

Tidak ada hex warna baru di mana pun — semua lewat token yang sudah ada (`--color-bg-surface`, `--color-bg-true`, `--color-border-light`, `--color-border-medium`, `--color-primary-soft`, `--color-text-muted`).

## 5. Responsif

Mengikuti breakpoint yang sudah ada di file ini (900px untuk grid satu-kolom, 600px untuk padding section). Di breakpoint ≤600px, `-placeholder-row` tetap 3 kolom flex (card mengecil proporsional, bukan wrap ke bawah) — supaya mockup tidak jadi terlalu tinggi di mobile; konsisten dengan bagaimana `cara-kerja-page__overview-grid` di file ini menangani sempit-nya layar (lebar mengecil, bukan menambah tinggi card satu-per-satu) sejauh itu match desain section lain — kalau ternyata kepenuhan di layar sangat kecil (<380px), card boleh wrap 2+1, diserahkan ke implementer untuk diuji manual.

## 6. Di Luar Scope (Disengaja)

- Tidak mengganti mockup placeholder ini dengan gambar/screenshot asli — itu pekerjaan terpisah untuk nanti, ketika mockup aplikasi sungguhan sudah ada.
- Tidak menyentuh `Footer.tsx`, `HomePage.tsx`, atau halaman publik lain — section ini eksklusif untuk `/cara-kerja`.
- Tidak menambahkan tombol CTA baru di section ini — section CTA penutup yang sudah ada tepat di bawahnya sudah menangani itu, duplikasi tombol tidak diperlukan.
- Tidak ada animasi scroll-reveal baru (section lain di halaman ini seperti `cara-kerja-page__flow` punya `useRevealOnScroll`, tapi section ini cukup sederhana — statis saja, konsisten dengan section Impact Passport yang juga statis tanpa reveal animation).

## 7. File Plan

| File | Aksi |
|---|---|
| `frontend/src/pages/CaraKerjaPage.tsx` | Modify — sisipkan section baru di antara `cara-kerja-page__passport` dan `cara-kerja-page__cta` |
| `frontend/src/pages/CaraKerjaPage.css` | Modify — tambah semua rule `cara-kerja-page__preview*` |

## Testing / Verifikasi

Tidak ada test otomatis di frontend (konsisten dengan project ini). Verifikasi manual via `pnpm dev`: buka `/cara-kerja` (halaman publik, tidak perlu login) → scroll ke bawah section Impact Passport → section baru "INTIP TAMPILANNYA" muncul dengan browser-frame mockup di kanan, teks di kiri → section CTA ungu tetap muncul tepat di bawahnya, lalu Footer → cek responsif di lebar <900px (grid jadi 1 kolom) dan <600px (padding menyempit, placeholder row tidak overflow).
