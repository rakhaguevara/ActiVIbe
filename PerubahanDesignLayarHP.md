# Perubahan Desain Layar HP (Mobile View) ala Airbnb

Dokumen ini menjelaskan perubahan yang telah dilakukan pada branch `phone` untuk mengadaptasi tampilan antarmuka volunteer agar responsif dan mengikuti pola desain Airbnb pada perangkat mobile.

## 1. Navigasi Bawah (Bottom Navigation)
- Dibuat komponen baru `MobileBottomNav.tsx` yang muncul khusus di mode mobile (max-width: 768px).
- Bottom Navigation kini memiliki 5 tab utama:
  - **Explore**: Mengarahkan ke halaman `/dashboard` (pencarian aktivitas).
  - **Wishlists**: Mengarahkan ke halaman `/dashboard/saved` (aktivitas yang disimpan).
  - **Impact Passport**: Mengarahkan ke `/dashboard/passport`.
  - **Application History**: Mengarahkan ke `/dashboard/history`.
  - **Profile**: Mengarahkan ke halaman `/dashboard/profile` penuh.
- Komponen topbar standar (`AppTopbar`) disembunyikan pada mobile di `DashboardLayout`.

## 2. Header Pencarian Mobile
- Dibuat `MobileSearchHeader.tsx`, sebuah tombol "pill" di bagian atas halaman yang bertuliskan "Start your search" atau "Cari kegiatan...".
- Saat ditekan, tombol ini akan membuka `MobileSearchModal.tsx`.

## 3. Modal Pencarian (Mobile Search Modal)
- `MobileSearchModal.tsx` merupakan modal fullscreen yang meniru desain Airbnb.
- Memiliki bagian "Where?" untuk mencari lokasi dan bagian lainnya.
- Modal ini diintegrasikan dengan state pencarian pada `FindActivityPage.tsx`.

## 4. Perubahan User Flow Kartu Kegiatan
- Di desktop, saat kartu kegiatan ditekan, detail akan muncul di panel sebelah kanannya.
- Pada desain mobile terbaru ini, agar user flow tidak berantakan, jika kartu ditekan pada layar mobile, pengguna akan **diarahkan ke halaman terpisah** (`/dashboard/activity/:id`).
- Halaman terpisah ini dibuat dalam file baru `ActivityDetailPage.tsx`.
- Rute baru ini didaftarkan di `AppRoutes.tsx`.

## 5. Halaman Profil & Wishlist
- `MobileProfilePage.tsx` adalah halaman tersendiri dengan ikon lonceng notifikasi dan tautan pengaturan (dapat diakses lewat Bottom Nav).
- `SavedItemsPage.css` disesuaikan agar pada mobile, tab pencarian tersembunyi sehingga bersih seperti Wishlists milik Airbnb.

## 6. Halaman Auth (Masuk & Daftar)
- `AuthPage.css` diupdate agar panel formulir menjadi bersih tanpa background maupun shadow di versi layar kecil, menyerupai desain Airbnb.

## 7. Komponen Baru yang Ditambahkan / Diubah:
- `src/components/MobileBottomNav.tsx` & `.css`
- `src/components/MobileSearchHeader.tsx` & `.css`
- `src/components/MobileSearchModal.tsx` & `.css`
- `src/pages/volunteer/ActivityDetailPage.tsx` & `.css`
- `src/pages/volunteer/MobileProfilePage.tsx` & `.css`
*(MobileProfileMenu yang lama berupa pop-up bawah telah dihapus).*

*Semua perubahan styling menggunakan CSS murni (Vanilla CSS) agar sesuai dengan struktur gaya yang ada dan menjaga estetika premium (animasi halus, shadow, warna terkurasi).*
