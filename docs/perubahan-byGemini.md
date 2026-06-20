# Catatan Perubahan — by Gemini (ActiVibe Frontend)

> File ini mencatat setiap perubahan yang dilakukan AI (Gemini) pada codebase ActiVibe.
> Tujuannya agar AI lain bisa memahami konteks dan melanjutkan pekerjaan tanpa konflik.

---

## Sesi 1 — 2026-06-20

### Scope: Landing Page — Features Section + Page-load Animation

**Files yang diubah:**
- `frontend/src/pages/HomePage.tsx`
- `frontend/src/pages/HomePage.css`

**Files yang TIDAK diubah (sengaja):**
- `README.md` ← tidak disentuh sesuai instruksi user
- `frontend/src/components/Navbar.tsx` / `Navbar.css`
- `frontend/src/App.tsx`
- `frontend/index.html`
- Semua file `src/assets/svg/`

---

### Perubahan di `HomePage.tsx`

#### 1. Import tambahan (tanpa mengubah yang sudah ada)
```ts
import guitarIcon   from '../assets/svg/guitar.svg'
import fireworkIcon from '../assets/svg/firework 2.svg'
import medalIcon    from '../assets/svg/medal.svg'
import flowerDeco   from '../assets/svg/flower.svg'
import sunDeco      from '../assets/svg/sun.svg'
```

#### 2. Data array `FEATURES` (baru)
3 item dengan icon masing-masing (guitar → firework → medal),
sesuai urutan kartu di screenshot yang diberikan user.

#### 3. Hook `useRevealOnScroll` (baru)
- Generic hook berbasis `IntersectionObserver` untuk trigger animasi saat elemen masuk viewport.
- Dipakai oleh section `features`.

#### 4. State `pageLoaded` (baru di `HomePage`)
- Di-set ke `true` setelah 80ms mount via `setTimeout`.
- Digunakan untuk class `page-main--loaded` yang men-trigger animasi hero saat halaman pertama kali dibuka.

#### 5. JSX — `<main>` wrapper
- Ditambahkan class dinamis: `page-main` + `page-main--loaded`.

#### 6. JSX — Features Section (baru, menggantikan `scroll-placeholder`)
```
<section .features>
  <img .features__deco--flower>   ← dekorasi kiri bawah (flower.svg)
  <img .features__deco--sun>      ← dekorasi kanan bawah (sun.svg)
  <h2 .features__title>           ← heading utama
  <div .features__grid>           ← 3 kartu .feature-card
  <div .features__footer>
    <span .features__diami>       ← teks "Diami..." (italic, abu)
    <a .features__cta>            ← tombol "Cari Aktivitas" (ungu)
  </div>
</section>
```

---

### Perubahan di `HomePage.css`

#### Dihapus
- `.scroll-placeholder` (placeholder sementara, diganti konten nyata)

#### Ditambahkan

| Class / Rule | Fungsi |
|---|---|
| `@keyframes fadeInUp` | Animasi dari bawah ke posisi normal |
| `.page-main .hero__illustration` | State awal opacity 0 (sebelum load) |
| `.page-main--loaded .hero__illustration` | Trigger `fadeInUp` 0.7s delay 0.05s |
| `.page-main--loaded .hero__wave` | Trigger `fadeInUp` 0.65s delay 0.2s |
| `.features` | Background `#f7f5ff`, padding, overflow hidden |
| `.features__deco` / `--flower` / `--sun` | Posisi absolut dekorasi kiri & kanan |
| `.features__title` | Georgia serif, clamp font-size |
| `.features__grid` | CSS grid 3 kolom, max-width 960px |
| `.feature-card` | Putih, border-radius 20px, shadow ungu muda |
| `.feature-card` (initial state) | `opacity: 0; transform: translateY(32px)` |
| `.features--visible .feature-card` | Visible state, staggered via inline `transitionDelay` |
| `.feature-card:hover` | Lift up `-4px`, shadow lebih kuat |
| `.feature-card__icon-wrap` | Container 88×88px |
| `.feature-card__icon` | 80×80px, `object-fit: contain` |
| `.feature-card__title` | 18px semibold |
| `.feature-card__desc` | 14px gray, max-width 240px |
| `.features__footer` | Flexbox, center, gap 32px |
| `.features__diami` | Italic, gray, font 15px |
| `.features__cta` | Tombol ungu `#7c3aed`, hover + active state |
| `@media (max-width: 900px)` | Grid 2 kolom untuk tablet |
| `@media (max-width: 600px)` | Grid 1 kolom, padding dikurangi |
| `@media (prefers-reduced-motion)` | Matikan semua animasi |

---

### SVG Assets yang Digunakan

| File | Digunakan untuk |
|---|---|
| `guitar.svg` | Icon kartu 1 (Social-Impact Activity) |
| `firework 2.svg` | Icon kartu 2 (Social-Impact Activity) |
| `medal.svg` | Icon kartu 3 (Social-Impact Activity) |
| `flower.svg` | Dekorasi kiri bawah section features |
| `sun.svg` | Dekorasi kanan bawah section features |

SVG lain (`background-1.svg`, `wave.svg`, `recruitment 1.svg`, `diversity 1.svg`, `together 1.svg`, `logo.svg`, `logo-utama.svg`) sudah ada sebelumnya dan **tidak diubah**.

---

### Catatan untuk AI Berikutnya

1. **Teks masih placeholder** — `title`, `desc` pada `FEATURES[]` menggunakan lorem ipsum. Tunggu instruksi user sebelum menggantinya dengan konten nyata.
2. **Warna brand utama** — `#7c3aed` (ungu Violet-600 Tailwind) dipakai untuk tombol CTA dan shadow kartu. Konsistenkan warna ini jika menambah elemen baru.
3. **FR yang relevan** — Section features ini belum terhubung ke data nyata. Koneksi ke FR-005 (rekomendasi) dan FR-011 (listing event) akan dilakukan di fase berikutnya.
4. **Nomor FR terakhir di PRD** — FR-027. Jangan menimpa/mengubah nomor yang sudah ada tanpa konfirmasi.
5. **`scroll-placeholder` sudah dihapus** — Jika butuh section baru di bawah features, tambahkan langsung setelah `</section>` features di `HomePage.tsx`.

---

## Sesi 2 — 2026-06-20

### Scope: Landing Page — Join Section ("Bergabung Bersama Activibe")

**Files yang diubah:**
- `frontend/src/pages/HomePage.tsx`
- `frontend/src/pages/HomePage.css`

**Files yang TIDAK diubah (sengaja):**
- `README.md`
- `frontend/src/components/Navbar.tsx` / `Navbar.css`
- `frontend/src/App.tsx`
- Semua file SVG dan PNG yang ada sebelumnya

---

### Perubahan di `HomePage.tsx`

#### 1. Import tambahan (Assets Join Section)
```ts
import waveTop    from '../assets/svg/Vector 2.svg'     // wave atas section
import waveBottom from '../assets/svg/Vector 3.svg'     // wave bawah section
import deco237651 from '../assets/svg/Group 237651.svg' // ikon daun/leaf
import deco29     from '../assets/svg/Group 29.svg'     // ikon branch/cabang
import deco30     from '../assets/svg/Group 30.svg'     // ikon wave sweep
import deco32     from '../assets/svg/Group 32.svg'     // ikon swirl
import deco35     from '../assets/svg/Group 35.svg'     // ikon feather/tall
import pic1       from '../assets/png/pic1 1.png'       // foto utama (kelompok volunteer)
import pic2       from '../assets/png/pic2 1.png'       // foto kecil (volunteer individu)
```

#### 2. Hook `joinReveal` (baru di `HomePage`)
- Menggunakan `useRevealOnScroll(0.08)` yang sudah ada.
- Digunakan untuk trigger animasi slide-in pada foto kiri dan konten kanan.

#### 3. JSX — Join Section (baru, setelah `</section>` features)
```
<section .join>
  <img .join__wave--top>         ← Vector 2.svg (wave putih atas)
  <div .join__bg>
    <img .join__deco--leaf>      ← Group 237651.svg
    <img .join__deco--branch>    ← Group 29.svg
    <img .join__deco--wave-deco> ← Group 30.svg
    <img .join__deco--swirl>     ← Group 32.svg
    <img .join__deco--feather>   ← Group 35.svg
    <img .join__deco--leaf-r>    ← Group 237651.svg (mirror kanan)
    <img .join__deco--swirl-r>   ← Group 32.svg (mirror kanan)
  </div>
  <div .join__inner>
    <div .join__photo-left>
      <img .join__img--main>     ← pic1 1.png (foto besar kiri)
    </div>
    <div .join__content>
      <p .join__eyebrow>         ← "Bergabung dan Berdampak"
      <h2 .join__title>          ← "Bergabung Bersama Activibe"
      <p .join__desc>            ← Lorem ipsum pertama
      <div .join__photo-right>
        <img .join__img--secondary> ← pic2 1.png (foto kecil kanan)
      </div>
      <p .join__desc--sm>        ← Lorem ipsum kedua
      <a .join__cta>             ← Tombol "Mengenal Program" (oranye)
    </div>
  </div>
  <img .join__wave--bottom>      ← Vector 3.svg (wave putih bawah)
</section>
```

---

### Perubahan di `HomePage.css`

#### Ditambahkan (Join Section)

| Class / Rule | Fungsi |
|---|---|
| `.join` | Wrapper section, `overflow: hidden`, `background: transparent` |
| `.join__wave` | Base style untuk kedua wave |
| `.join__wave--top` | Wave putih atas, `z-index: 2`, margin bawah -4px untuk seamless |
| `.join__wave--bottom` | Wave putih bawah, `z-index: 2`, margin atas -4px untuk seamless |
| `.join__bg` | Layer biru `#63C2E0` via `position: absolute; inset: 0` |
| `.join__deco` | Base style semua ikon dekoratif (absolute, no pointer events) |
| `.join__deco--leaf` | Atas-kiri, width 70px, rotate -15deg |
| `.join__deco--branch` | Bawah-kiri, width 80px, rotate 10deg |
| `.join__deco--wave-deco` | Mid-kiri, width 200px, opacity 0.6 |
| `.join__deco--swirl` | Tengah-kiri, width 65px, rotate 5deg |
| `.join__deco--feather` | Kanan-atas, width 120px, opacity 0.55 |
| `.join__deco--leaf-r` | Kanan-atas (mirror), scaleX(-1) |
| `.join__deco--swirl-r` | Kanan-bawah (mirror), scaleX(-1) |
| `.join__inner` | Grid 2 kolom, max-width 1100px, padding 32px 60px |
| `.join__photo-left` | Border-radius 20px, scroll-reveal `translateX(-36px)` |
| `.join--visible .join__photo-left` | Reveal state opacity 1, translateX(0) |
| `.join__img--main` | `height: 320px; object-fit: cover` |
| `.join__content` | Flex column, scroll-reveal `translateX(36px)` |
| `.join--visible .join__content` | Reveal state opacity 1, translateX(0) |
| `.join__eyebrow` | 13px, semi-bold, putih transparan |
| `.join__title` | clamp(22px–36px), bold, putih |
| `.join__desc` | 14px, putih 90% opacity |
| `.join__desc--sm` | 13px, putih 80% opacity |
| `.join__photo-right` | Border-radius 16px, border putih, secondary photo |
| `.join__img--secondary` | `height: 220px; object-fit: cover` |
| `.join__cta` | Tombol oranye `#F47920`, hover + active state |
| `@media (max-width: 900px)` | Grid 1 kolom untuk tablet |
| `@media (max-width: 600px)` | Padding dikurangi, ikon diperkecil |
| `@media (prefers-reduced-motion)` | Matikan animasi join section |

---

### Asset yang Digunakan (Sesi 2)

| File | Peran |
|---|---|
| `Vector 2.svg` | Wave putih bagian atas section |
| `Vector 3.svg` | Wave putih bagian bawah section |
| `Group 237651.svg` | Ikon dekorasi daun (kiri & kanan) |
| `Group 29.svg` | Ikon dekorasi cabang (kiri bawah) |
| `Group 30.svg` | Ikon dekorasi sapuan gelombang (kiri) |
| `Group 32.svg` | Ikon dekorasi swirl (kiri & kanan bawah) |
| `Group 35.svg` | Ikon dekorasi tinggi/feather (kanan atas) |
| `pic1 1.png` | Foto utama (grup volunteer) di kolom kiri |
| `pic2 1.png` | Foto kecil (volunteer individu) di kolom kanan |

---

### Catatan untuk AI Berikutnya

1. **Wave seamless** — `Vector 2.svg` (atas) dan `Vector 3.svg` (bawah) diberi margin `-4px` untuk menghindari celah antara wave dan `join__bg`.
2. **Layer order** — `join__bg` pakai `z-index: 0`, `join__inner` pakai `z-index: 3`, wave pakai `z-index: 2`. Jangan ubah urutan ini.
3. **Warna CTA join** — `#F47920` (oranye), berbeda dari CTA features yang `#6D50A3` (ungu).
4. **Foto placeholder** — `pic1 1.png` dan `pic2 1.png` sudah di `assets/png/`. Ganti dengan gambar nyata sesuai konten jika diperlukan.
5. **Section berikutnya** — Tambahkan setelah `</section>` `.join` di `HomePage.tsx`.

