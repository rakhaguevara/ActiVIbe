# ActiVibe — Design System

> **Status:** v1.0 — disusun dari audit screenshot landing page (`activibve.png`) + palet warna resmi.
> **Tujuan dokumen:** jadi rujukan TUNGGAL untuk styling/warna di seluruh aplikasi ActiVibe — termasuk dashboard Volunteer, Organizer, dan Admin. Jangan biarkan AI/developer nebak-nebak warna sendiri; semua keputusan warna harus balik ke file ini.
>
> **Penting:** dashboard Organizer dan Admin **WAJIB pakai token yang sama** dari file ini (warna, font, radius, shadow, gap). Yang boleh beda hanya density/layout (lihat Section 8 — Mode Per Role), bukan bahasa visualnya.

---

## 0. Temuan Audit dari Screenshot (Penting — Baca Dulu)

Saat membedah `activibve.png`, ditemukan beberapa section yang **bukan identitas asli ActiVibe** — kemungkinan sisa template SaaS generik yang belum diganti:

| Section di screenshot | Masalah | Keputusan |
|---|---|---|
| "ONE PLATFORM. ALL THE FEATURES." (background hitam, card gradient pink/kuning-lemon/ungu pastel) | Gradient pink & kuning-lemon **tidak ada di palet resmi**; konten bicara soal "Funnels, Payments, Website" — tidak relevan untuk platform volunteer | **Tidak dipakai sebagai referensi warna.** Struktur grid kartu boleh dipakai ulang, tapi warna wajib diganti ke token resmi (lihat Section 6.4) |
| "Popular Courses" (card e-learning, harga $, tombol "Enroll Now") | Konteks "kursus berbayar" tidak sesuai produk ActiVibe (volunteer activity, bukan course marketplace) | Struktur card (image-top, badge avatar, CTA kanan-bawah) dipakai ulang untuk card Aktivitas Volunteer, kontennya diganti total |
| "THE MORE INCOME SOURCES, THE MERRIER" (newsletter/coaching pitch) | 100% template SaaS course-creator, tidak relevan ke ActiVibe sama sekali | **Diabaikan total**, tidak masuk design system |
| Heading pakai font serif/handwriting ("Tentang Activibe" underline kuning, "What our customers are saying") | Tidak konsisten dengan aturan font Itim + Poppins | Diseragamkan ke Itim (display) + Poppins (UI/body) di seluruh dokumen ini |

Section yang **valid dan dipakai sebagai basis system** ini: Navbar, Hero illustration, Social-Impact cards, CTA band biru (wave divider), Tentang/About split-content, Stepper "Cara Kerja", Testimonial band oranye, Newsletter/CTA band dengan gradient-on-illustration, Footer.

---

## 1. Color Tokens

Semua warna didefinisikan sebagai CSS custom property di `:root`. **Jangan hardcode hex di komponen** — selalu pakai `var(--token-name)`, supaya kalau ada revisi warna, ganti satu tempat saja.

```css
:root {
  /* ============================================
     1. BASE / NEUTRAL — background & surface
     ============================================ */
  --color-bg-true: #FFFFFF;       /* true white — dipakai utk page background utama */
  --color-bg-surface: #FEFEFE;    /* off-white — dipakai utk card/surface DI ATAS true white, biar ada depth tipis tanpa shadow berat */

  /* ============================================
     2. BRAND PRIMARY — Ungu
     Dipakai di: CTA button utama, logo "Vibe", link aktif,
     active state navigasi, tombol Subscribe
     ============================================ */
  --color-primary: #6D50A3;
  --color-primary-hover: #5E4490;   /* -10% lightness, dipakai saat :hover button primary */
  --color-primary-active: #4F3979;  /* -20% lightness, dipakai saat :active/pressed */
  --color-primary-soft: #EFE9F7;    /* tint sangat muda, dipakai utk background badge/chip ringan bernuansa primary */

  /* ============================================
     3. BRAND SECONDARY — Biru
     Dipakai di: section background besar (band/wave),
     ikon, aksen ilustrasi, BUKAN untuk button utama
     ============================================ */
  --color-secondary: #63C2E0;
  --color-secondary-dark: #4BA9C9;  /* dipakai utk border/shadow tipis di atas secondary, atau hover state elemen secondary */
  --color-secondary-soft: #E5F6FB;  /* tint muda, dipakai utk background section ringan/alternating row di dashboard */

  /* ============================================
     4. ACCENT — Orange
     Dipakai di: CTA sekunder ("Mengenai Program"),
     testimonial card background, badge "baru/populer"
     ============================================ */
  --color-accent-orange: #F36038;
  --color-accent-orange-hover: #DD4F29;
  --color-accent-orange-soft: #FDEAE3;

  /* ============================================
     5. ACCENT — Kuning
     Dipakai HANYA sbg aksen kecil: underline judul,
     doodle/ilustrasi, badge achievement/poin/XP,
     bintang rating. JANGAN dipakai sbg warna teks body.
     ============================================ */
  --color-accent-yellow: #F5C30D;
  --color-accent-yellow-soft: #FEF6DC;

  /* ============================================
     6. TEXT COLORS
     Catatan kontras: --color-secondary dan --color-accent-yellow
     TIDAK lolos WCAG AA jika dipakai sbg warna teks di atas putih.
     Gunakan --color-text-* di bawah ini untuk teks, bukan warna brand mentah.
     ============================================ */
  --color-text-heading: #1A1A2E;    /* navy-black, dipakai utk semua heading (bukan hitam pekat, sesuai gaya "Cara Kerja ActiVibe" di screenshot) */
  --color-text-body: #4A4A5A;       /* abu kebiruan, dipakai utk paragraf/body text */
  --color-text-muted: #8A8A9A;      /* dipakai utk caption, label kecil, placeholder */
  --color-text-on-dark: #FFFFFF;    /* dipakai utk teks di atas background gelap/gradient/illustration */
  --color-text-on-accent: #FFFFFF;  /* dipakai utk teks di atas button primary/orange */

  /* ============================================
     7. SEMANTIC / STATUS
     Dibutuhkan utk dashboard Organizer & Admin (approve/reject,
     status pendaftaran, dsb) — diturunkan dari palet brand
     supaya tetap selaras, BUKAN warna baru.
     ============================================ */
  --color-success: #3FA66B;         /* dipakai utk "Diterima", "Selesai", "Hadir" — sengaja BUKAN turunan kuning krn kuning dipakai utk reward/poin, biar tidak ambigu makna */
  --color-success-soft: #E5F5EC;
  --color-warning: var(--color-accent-yellow); /* dipakai utk "Pending", "Menunggu Review" */
  --color-warning-soft: var(--color-accent-yellow-soft);
  --color-danger: #E14B4B;          /* dipakai utk "Ditolak", "Dihapus", error form */
  --color-danger-soft: #FBE7E7;
  --color-info: var(--color-secondary); /* dipakai utk notifikasi info netral */

  /* ============================================
     8. BORDER & DIVIDER
     ============================================ */
  --color-border-light: #ECECF1;    /* border tipis card, sesuai gaya card "Social-Impact Activity" di screenshot */
  --color-border-medium: #D9D9E3;
}
```

### Aturan pakai warna (wajib dicek tiap kali nambah komponen baru)

1. **`--color-secondary` (#63C2E0) dan `--color-accent-yellow` (#F5C30D) dilarang jadi warna teks** di atas `--color-bg-true`/`--color-bg-surface`. Hanya untuk: background besar, ikon, ilustrasi, border, badge dengan teks gelap di dalamnya.
2. **Tombol CTA utama = selalu `--color-primary`.** Tombol CTA kedua dalam satu section yang sama = `--color-accent-orange`. Jangan pernah dua tombol primary-color berdampingan di section yang sama (akan terlihat tidak ada hirarki).
3. Kalau butuh warna baru yang **tidak ada di list ini** (misal butuh warna ke-7 untuk kategori baru) — **STOP, tanya dulu ke Rakha**, jangan generate hex sembarang. Sertakan rekomendasi 1-2 opsi yang masih selaras (saturasi & lightness mirip palet existing) sebagai starting point diskusi.
4. Kalau ada dua warna brand dipakai berdampingan dan terasa "bertabrakan" (misal orange+kuning solid bersisian tanpa spacing/border), **laporkan dulu sebelum lanjut coding**, beri rekomendasi: kasih `--color-bg-true` sebagai pemisah, atau ubah satu jadi versi `-soft`.

---

## 2. Typography

```css
:root {
  /* ============================================
     FONT FAMILIES
     Itim   = display/heading font, playful & rounded (sesuai vibe
              "Tentang Activibe", brand personality Gen-Z friendly)
     Poppins = UI font, dipakai utk body text, button, form, nav,
               apapun yang butuh keterbacaan tinggi & dashboard density
     ============================================ */
  --font-display: 'Itim', cursive, system-ui, sans-serif;
  --font-body: 'Poppins', system-ui, -apple-system, sans-serif;

  /* ============================================
     FONT SIZE SCALE — mobile-first, sesuaikan dgn clamp()
     biar responsive tanpa banyak media query
     ============================================ */
  --text-display-lg: clamp(2rem, 4vw, 3rem);     /* hero headline ("Find or post jobs...") */
  --text-display-md: clamp(1.5rem, 3vw, 2.25rem); /* section heading ("Tentang Activibe") */
  --text-display-sm: 1.25rem;                      /* sub-heading kecil ("Cara Kerja ActiVibe") */

  --text-body-lg: 1.125rem;   /* lead paragraph */
  --text-body-md: 1rem;       /* paragraf default */
  --text-body-sm: 0.875rem;   /* caption, label form */
  --text-body-xs: 0.75rem;    /* meta text, timestamp */

  --leading-tight: 1.2;   /* dipakai utk heading */
  --leading-normal: 1.6;  /* dipakai utk body text — biar nggak sumpek dibaca */
}
```

**Catatan penting (temuan audit):** beberapa heading di screenshot asli pakai font serif/handwriting (bukan Itim/Poppins). Itu inkonsistensi dari source — di sistem ini **semua heading pakai `--font-display` (Itim)**, semua sisanya pakai `--font-body` (Poppins). Jangan tambah font ke-3 tanpa konfirmasi.

```css
/* Contoh pemakaian */
h1, h2, h3, .heading {
  font-family: var(--font-display);
  color: var(--color-text-heading);
  line-height: var(--leading-tight);
}

body, p, button, input, label {
  font-family: var(--font-body);
  color: var(--color-text-body);
  line-height: var(--leading-normal);
}
```

---

## 3. Spacing & Layout Rhythm

```css
:root {
  /* ============================================
     SECTION GAP — aturan ketat dari Rakha: 40-48px
     antar section. Dipakai sbg vertical padding/margin
     pembatas tiap <section>, BUKAN gap internal antar
     elemen di dalam satu section (lihat --space-inner-*)
     ============================================ */
  --space-section-gap-min: 40px;
  --space-section-gap-max: 48px;
  --space-section-gap: clamp(var(--space-section-gap-min), 4vw, var(--space-section-gap-max));

  /* ============================================
     INNER SPACING — utk gap antar elemen DI DALAM
     satu section (card grid, list item, form field)
     Skala 4px base, konsisten dgn umumnya design system modern
     ============================================ */
  --space-2xs: 4px;
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* ============================================
     CONTAINER
     ============================================ */
  --container-max-width: 1280px;
  --container-padding-inline: 24px; /* padding kiri-kanan biar konten nggak nempel di edge mobile */
}

/* ============================================
   PENERAPAN GAP ANTAR SECTION
   Pakai class ini di setiap <section> utama landing page
   maupun dashboard, supaya rhythm 40-48px konsisten
   ============================================ */
.section {
  padding-block: var(--space-section-gap);
}

/* Kalau dua section saling bersambung tanpa divider visual
   (misal section putih ketemu section putih lagi), gap TETAP
   dipakai via margin-block, jangan dihilangkan demi "hemat space" */
.section + .section {
  margin-top: 0; /* gap sudah dihandle oleh padding-block masing2 section, hindari double-gap */
}
```

---

## 4. Section Divider — Wave/Organic Shape

Pola berulang di screenshot: transisi antar section pakai **wave/blob shape**, bukan garis lurus (lihat transisi putih–biru di CTA band, dan biru–putih sebelum "Tentang Activibe"). Ini elemen signature ActiVibe — wajib dipertahankan, jangan diganti jadi divider lurus polos.

```css
/* ============================================
   WAVE DIVIDER — taruh di top/bottom section yang
   butuh transisi organik (cth: section CTA biru)
   Ganti `fill` sesuai warna section DI BAWAHNYA
   (kalau wave di top section biru, fill = putih,
   karena wave ini "menutup" warna section sebelumnya)
   ============================================ */
.wave-divider {
  position: absolute;
  top: -1px; /* -1px biar nggak ada garis seam tipis akibat sub-pixel rendering */
  left: 0;
  width: 100%;
  line-height: 0;
}

.wave-divider svg {
  width: 100%;
  height: 80px; /* sesuaikan tinggi wave, jangan lebih dari ~120px biar proporsional */
  display: block;
}

/* Contoh: wave putih di atas section biru (--color-secondary) */
.wave-divider--white-on-blue path {
  fill: var(--color-bg-true);
}
```

```html
<!-- Contoh markup pakai -->
<section class="section" style="background: var(--color-secondary); position: relative;">
  <div class="wave-divider wave-divider--white-on-blue">
    <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
      <path d="M0,40 C360,90 1080,0 1440,40 L1440,0 L0,0 Z"></path>
    </svg>
  </div>
  <!-- konten section -->
</section>
```

---

## 5. Gradient Rules (Aturan Ketat dari Rakha)

### 5.1 Gradient tidak boleh "nabrak" antar section

```css
/* ============================================
   ATURAN: kalau dua section berurutan SAMA-SAMA
   pakai gradient, pastikan arah & warna ujung
   gradient saling "nyambung" secara visual, ATAU
   pisahkan dengan solid color band/wave divider
   di antaranya. JANGAN dua gradient beda arah
   bertemu langsung tanpa transisi.
   ============================================ */

/* CONTOH SALAH — dua gradient beda arah nempel langsung */
.section-a-WRONG { background: linear-gradient(180deg, var(--color-secondary), var(--color-bg-true)); }
.section-b-WRONG { background: linear-gradient(0deg, var(--color-accent-orange), var(--color-bg-true)); }
/* ^ titik temu di tengah akan keliatan "patah" karena arah berlawanan ketemu di satu garis */

/* CONTOH BENAR — disisipi solid section atau wave divider sbg buffer */
.section-a-RIGHT { background: linear-gradient(180deg, var(--color-secondary), var(--color-bg-true)); }
.section-buffer  { background: var(--color-bg-true); padding-block: var(--space-section-gap); }
.section-b-RIGHT { background: linear-gradient(0deg, var(--color-accent-orange-soft), var(--color-bg-true)); }
```

**Checklist sebelum kasih section gradient baru:**
- [ ] Apakah section sebelum/sesudahnya juga gradient? Kalau ya — cek arah & warna ujungnya nyambung, atau kasih buffer solid.
- [ ] Apakah kombinasi warnanya ada di palet resmi (Section 1)? Kalau butuh warna luar palet — tanya dulu.

### 5.2 Navbar Sticky — Glass Effect (BUKAN solid putih)

```css
/* ============================================
   NAVBAR DEFAULT (belum sticky / di top halaman)
   ============================================ */
.navbar {
  background: var(--color-bg-true);
  padding-block: var(--space-md);
  transition: background 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease;
}

/* ============================================
   NAVBAR SAAT STICKY + AKTIF (user sudah scroll)
   Aturan ketat: TIDAK BOLEH solid putih polos.
   Pakai glass effect (semi-transparent + blur)
   supaya konten di belakangnya tetap terasa "hidup"
   sesuai vibe playful ActiVibe.
   ============================================ */
.navbar.is-sticky {
  background: rgba(255, 255, 255, 0.65); /* base putih tapi tembus pandang, BUKAN var(--color-bg-true) solid */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px); /* fallback Safari */
  box-shadow: 0 2px 16px rgba(26, 26, 46, 0.08); /* shadow halus, pakai --color-text-heading dgn opacity rendah biar natural bukan abu generik */
  border-bottom: 1px solid rgba(255, 255, 255, 0.3); /* hairline biar ada definisi tepi di atas background ramai */
}

/* Fallback kalau browser tidak support backdrop-filter
   (jangan biarkan navbar transparan polos tanpa fallback) */
@supports not (backdrop-filter: blur(1px)) {
  .navbar.is-sticky {
    background: rgba(255, 255, 255, 0.92);
  }
}
```

```js
// Contoh JS minimal untuk toggle class is-sticky
// (sesuaikan threshold scroll sesuai tinggi hero section)
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('is-sticky', window.scrollY > 80);
});
```

---

## 6. Components

### 6.1 Button

```css
/* ============================================
   BUTTON BASE
   ============================================ */
.btn {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: var(--text-body-md);
  padding: var(--space-sm) var(--space-lg);
  border-radius: 999px; /* full pill, sesuai tombol "Cari Aktifitas" & "Subscribe" di screenshot */
  border: none;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease;
}

.btn:active {
  transform: scale(0.97); /* micro-interaction kecil saat ditekan, sesuai prinsip "playful" */
}

/* ============================================
   BUTTON PRIMARY (ungu) — dipakai utk CTA utama
   Contoh di screenshot: "Cari Aktifitas", "Subscribe"
   ============================================ */
.btn--primary {
  background: var(--color-primary);
  color: var(--color-text-on-accent);
}
.btn--primary:hover { background: var(--color-primary-hover); }
.btn--primary:active { background: var(--color-primary-active); }

/* ============================================
   BUTTON SECONDARY (orange) — CTA kedua dlm satu section
   Contoh di screenshot: "Mengenai Program"
   ============================================ */
.btn--secondary {
  background: var(--color-accent-orange);
  color: var(--color-text-on-accent);
}
.btn--secondary:hover { background: var(--color-accent-orange-hover); }

/* ============================================
   BUTTON OUTLINE — utk aksi tersier/cancel
   (tidak ada di screenshot, ditambahkan utk
   kelengkapan dashboard organizer/admin)
   ============================================ */
.btn--outline {
  background: transparent;
  border: 1.5px solid var(--color-primary);
  color: var(--color-primary);
}
.btn--outline:hover { background: var(--color-primary-soft); }
```

**Revisi v1.1 (keputusan Rakha):** pill 999px untuk SEMUA tombol ternyata kelihatan monoton kalau diterapkan ke seluruh halaman sekaligus (CTA besar, tombol kecil di dalam card, dst jadi kelihatan sama semua). Jadi radius tombol dipecah berdasarkan ukuran/peran:

- **CTA besar berdiri sendiri** (satu tombol penting per section, padding besar ≥`14px 40px`, contoh: "Cari Aktifitas", "Lihat Semua Kegiatan", "Subscribe") → tetap **pill `999px`**.
- **CTA sekunder/inline** (menyatu di tengah konten, padding medium `~12px 32px`, contoh: "Mengenal Program", "More About Us..") → **`12px`**, bukan pill.
- **Tombol kecil berulang di dalam card/grid** (padding kecil `~8px 18px`, contoh: "Daftar Sekarang" di tiap activity card) → **`10px`**.
- Filter/tag pill (Section 6.3-style chip, contoh filter kategori) dan **stepper active pill (Section 6.5)** tetap pill `999px` — itu komponen berbeda dari tombol CTA, bukan bagian dari aturan ini.

### 6.2 Card

```css
/* ============================================
   CARD BASE — sesuai gaya card "Social-Impact Activity"
   di screenshot: border tipis, radius besar, shadow nyaris
   tidak ada (flat), padding lega
   ============================================ */
.card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-light);
  border-radius: 20px; /* radius besar = kesan playful, bukan kaku/korporat */
  padding: var(--space-lg);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-4px); /* micro-interaction lift saat hover */
  box-shadow: 0 12px 24px rgba(26, 26, 46, 0.08);
}

/* ============================================
   CARD ACCENT TOP — strip warna tipis di atas card,
   dipakai utk membedakan kategori (cth: kategori
   aktivitas volunteer: lingkungan/edukasi/sosial)
   ============================================ */
.card--accent-top {
  border-top: 4px solid var(--color-secondary); /* ganti var() sesuai kategori */
  border-radius: 20px 20px 4px 4px; /* radius atas tetap besar, bawah dikecilkan biar strip terlihat menyatu */
}
```

### 6.3 Badge / Pill Status (untuk Dashboard Organizer & Admin)

```css
/* ============================================
   BADGE STATUS — dipakai di dashboard organizer
   (status pendaftaran volunteer) & admin (status akun/event)
   Wajib pakai token semantic dari Section 1.7, JANGAN
   pakai warna brand mentah langsung
   ============================================ */
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2xs);
  font-size: var(--text-body-xs);
  font-weight: 600;
  padding: var(--space-2xs) var(--space-sm);
  border-radius: 999px;
}

.badge--success { background: var(--color-success-soft); color: var(--color-success); }
.badge--warning { background: var(--color-warning-soft); color: #8A6D00; } /* teks digelapkan dari kuning krn kuning gagal kontras (lihat Section 1 aturan #1) */
.badge--danger  { background: var(--color-danger-soft); color: var(--color-danger); }
.badge--info    { background: var(--color-secondary-soft); color: var(--color-secondary-dark); }
```

### 6.4 Feature/Pricing Card Grid (referensi layout dari section "ALL THE FEATURES" — warna diganti total)

```css
/* ============================================
   Struktur grid card ini DIPAKAI ULANG dari screenshot,
   TAPI warna gradient pink/kuning-lemon di source DIBUANG
   total dan diganti token resmi. Background section gelap
   tetap boleh dipakai sbg variasi (mis. utk section
   "kenapa pakai ActiVibe" di landing), asal card di dalamnya
   pakai warna brand, bukan warna sisa template.
   ============================================ */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-md);
}

.feature-card {
  border-radius: 20px;
  padding: var(--space-lg);
  min-height: 280px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Variasi warna card — rotasi 4 token resmi, BUKAN warna baru */
.feature-card:nth-child(4n+1) { background: linear-gradient(180deg, var(--color-primary-soft), var(--color-bg-true)); }
.feature-card:nth-child(4n+2) { background: linear-gradient(180deg, var(--color-secondary-soft), var(--color-bg-true)); }
.feature-card:nth-child(4n+3) { background: linear-gradient(180deg, var(--color-accent-orange-soft), var(--color-bg-true)); }
.feature-card:nth-child(4n+4) { background: linear-gradient(180deg, var(--color-accent-yellow-soft), var(--color-bg-true)); }
```

### 6.5 Stepper (referensi dari "Cara Kerja ActiVibe" — relevan untuk Conversational Onboarding Agent FR-023)

```css
/* ============================================
   STEPPER VERTIKAL — pola ini PAS dipakai utk
   menampilkan progress Conversational Onboarding Agent
   (FR-023) atau 4-Step Close Event Flow organizer (FR-017)
   ============================================ */
.stepper {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  border-left: 2px solid var(--color-border-medium);
  padding-left: var(--space-lg);
}

.stepper__item {
  font-size: var(--text-body-md);
  color: var(--color-text-muted);
  position: relative;
}

/* Step yang sedang aktif — pill highlight orange,
   sesuai step "Pilih Kegiatan Personalmu" di screenshot */
.stepper__item--active {
  background: var(--color-accent-orange);
  color: var(--color-text-on-accent);
  font-weight: 600;
  padding: var(--space-xs) var(--space-md);
  border-radius: 999px;
  width: fit-content;
}

/* Step yang sudah selesai — opsional, beri check icon + warna success */
.stepper__item--done {
  color: var(--color-text-heading);
}
.stepper__item--done::before {
  content: '✓';
  color: var(--color-success);
  margin-right: var(--space-xs);
}
```

### 6.6 Testimonial Card (band solid orange, sesuai screenshot)

```css
.testimonial-band {
  background: var(--color-accent-orange);
  padding-block: var(--space-section-gap);
}

.testimonial-card {
  background: var(--color-accent-orange); /* solid, BUKAN gradient, sesuai source */
  color: var(--color-text-on-dark);
  border-radius: 16px;
  padding: var(--space-lg);
}

.testimonial-card__author {
  font-weight: 700;
  color: var(--color-text-on-dark);
}
.testimonial-card__role {
  font-size: var(--text-body-sm);
  opacity: 0.85; /* sedikit redup utk hierarki vs nama, tanpa nambah warna baru */
}
```

### 6.7 Newsletter/CTA Band — Gradient di Atas Ilustrasi

```css
/* ============================================
   Sesuai footer CTA "Subscribe to our newsletter":
   ilustrasi full-width + gradient overlay gelap di
   bagian kanan biar teks putih tetap terbaca (kontras),
   gradient gelap diturunkan dari --color-secondary,
   BUKAN hitam polos, biar tetap dalam keluarga warna brand
   ============================================ */
.newsletter-band {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  padding: var(--space-xl);
}

.newsletter-band__bg {
  position: absolute;
  inset: 0;
  background-image: url('/illustrations/community-action.svg');
  background-size: cover;
  z-index: 0;
}

.newsletter-band__overlay {
  position: absolute;
  inset: 0;
  /* gradient dari transparan (kiri) ke gelap (kanan) — bukan top-bottom,
     karena teks newsletter di source ada di sisi kanan ilustrasi */
  background: linear-gradient(90deg, transparent 0%, rgba(26, 26, 46, 0.75) 60%);
  z-index: 1;
}

.newsletter-band__content {
  position: relative;
  z-index: 2;
  color: var(--color-text-on-dark);
  max-width: 480px;
  margin-left: auto; /* dorong ke kanan sesuai layout source */
}

.newsletter-band__input-group {
  display: flex;
  background: var(--color-bg-true);
  border-radius: 999px;
  padding: var(--space-2xs);
  margin-top: var(--space-md);
}

.newsletter-band__input-group input {
  flex: 1;
  border: none;
  background: transparent;
  padding-inline: var(--space-md);
  font-family: var(--font-body);
}

.newsletter-band__input-group button {
  /* pakai .btn.btn--primary, pill button ungu sesuai source */
}
```

---

## 7. Iconography & Illustration

- **Ilustrasi hero/footer**: gaya flat-vector hand-drawn (lihat hero "Green Lab" & footer "Community Action") — palet ilustrasi boleh lebih kaya warna (hijau, biru laut, dsb di luar 6 token) **khusus untuk aset ilustrasi besar**, karena itu konteks "dunia/scene", bukan UI chrome. Tapi semua UI chrome (button, card, badge, nav) tetap wajib pakai 6 token resmi.
- **Doodle aksen** (bintang, bunga, garis lengkung tangan): selalu warna `--color-accent-yellow` atau `--color-accent-orange` dengan stroke putih, dipakai sebagai dekorasi sudut section — jangan dipakai berlebihan (maks 1-2 per section).
- **Icon UI** (form, nav, dashboard): pakai outline style konsisten, warna default `--color-text-muted`, berubah `--color-primary` saat active/hover.

---

## 8. Mode Per Role (Volunteer vs Organizer vs Admin)

> Semua tiga role pakai **token warna, font, radius, dan komponen yang identik** dari file ini. Yang membedakan HANYA density layout dan prioritas konten — bukan bahasa visualnya. Ini supaya brand tetap satu kesatuan walau dashboard organizer/admin lebih data-heavy.

| Aspek | Volunteer (mobile-first) | Organizer / Admin (dashboard-style) |
|---|---|---|
| Layout | Card besar, illustration-heavy, 1 kolom di mobile | Table/grid density tinggi, sidebar navigasi tetap |
| Warna dominan | Lebih banyak `--color-secondary` (biru) & `--color-accent-yellow` utk gamifikasi (poin, XP) | Lebih banyak `--color-bg-surface` netral + badge semantic (Section 6.3) utk status data |
| Radius | `20px` (card besar, playful) | Boleh dikecilkan ke `12px` untuk table row/cell agar tidak "membuang" ruang |
| CTA | Pill besar, `.btn--primary` ungu dominan | Pill tetap dipakai, tapi ukuran lebih kecil (`--text-body-sm`) sesuai density |
| Wave divider (Section 4) | Dipakai bebas antar section landing | **Tidak dipakai** di dalam dashboard internal (terlalu playful utk data table); tetap dipakai di halaman publik seperti Impact Passport |

**Aturan tambahan khusus Impact Passport (FR-008):** karena ini halaman publik yang dibagikan ke medsos/CV, treatment visualnya **harus condong ke sisi Volunteer** (playful, illustration-heavy, wave divider boleh), walau diakses lewat link dari dashboard manapun.

---

## 9. Checklist Sebelum Tambah Warna/Style Baru

Sebelum menambahkan style baru ke aplikasi (oleh siapapun — AI atau developer), wajib jawab dulu:

1. Apakah warna ini sudah ada di Section 1 (Color Tokens)? Kalau tidak ada — **tanya dulu**, jangan pakai hex baru.
2. Kalau ini section dengan gradient, apakah sudah dicek terhadap section sebelum/sesudahnya (Section 5.1)?
3. Kalau ini teks, apakah warnanya lolos kontras WCAG AA di atas background-nya? (Khususnya hindari `--color-secondary` & `--color-accent-yellow` sebagai warna teks body)
4. Apakah gap antar section ini sudah 40-48px (`--space-section-gap`)?
5. Apakah komponen ini dipakai juga di role lain (Organizer/Admin)? Kalau ya, pastikan dari file ini, jangan duplikat definisi di tempat lain.

---

*Dokumen ini hidup berdampingan dengan `CLAUDE.md` dan `PRD-ActiVibe-v2.0.md` — kalau ada keputusan desain baru yang signifikan diambil di chat manapun, update file ini juga supaya tidak hilang konteksnya di sesi berikutnya.*
