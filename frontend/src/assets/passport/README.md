# Impact Passport — aset desain

Folder ini tempat naruh aset visual final untuk komponen `PassportBook`
(lihat `frontend/src/components/passport-book/`). Belum ada desain final di
sini — yang ada baru fondasi/prototype-nya (animasi buka-tutup + mekanisme
flip halaman), jadi folder ini masih kosong dan siap diisi.

## Rasio & ukuran acuan

Satu halaman buku mengikuti rasio potret ~7:10 (mendekati proporsi halaman
paspor fisik, 88mm x 125mm):

- Desktop (referensi): 420px x 600px
- Mobile: turun proporsional, ~300px x 430px (auto lewat mode portrait
  react-pageflip, tidak perlu breakpoint terpisah)

## Cover (sampul tertutup)

Taruh file dengan nama `cover.png`, `cover.jpg`, atau `cover.svg` (pilih salah
satu ekstensi) di folder ini. `PassportBook` men-scan folder ini otomatis
lewat `import.meta.glob` — begitu file `cover.*` ada, dia langsung dipakai
menggantikan skeleton placeholder, **tanpa perlu ubah kode apa pun**.

Spek cover:
- Rasio 7:10 (contoh: 420x600px atau kelipatannya, mis. 840x1200 utk retina)
- Sisi depan saja (flat) — efek ketebalan buku, shadow, dan tilt saat hover
  sudah ditangani lewat CSS di komponen, bukan bagian dari file gambar

## Halaman isi (bab per event)

Belum ada konvensi nama file untuk halaman isi — ini menunggu template
desain final (background/frame per halaman, slot foto, slot kutipan
organizer, slot kutipan penerima manfaat, dst). Begitu template-nya siap,
update bagian ini + komponen `PassportBook` menyesuaikan.

Struktur konten per bab (satu event) sudah dipecah jadi beberapa halaman
berurutan di `frontend/src/components/passport-book/ChapterPages.tsx`:
1. Foto kegiatan + tombol share (LinkedIn/Instagram/Facebook)
2. Ringkasan kegiatan + angka dampak (hero stat)
3. Dampak lingkungan (kategori Lingkungan) ATAU kata dari yang terdampak
   (kategori Kemanusiaan) — salah satu, otomatis dipilih dari `Event.category`
4. Galeri foto (maks 5, PNG/JPG)
5. Kesan & pesan volunteer

## Margin konten (WAJIB diikuti desain custom)

Semua halaman punya margin **16px dari tepi ke tepi** (`var(--space-md)`,
lihat `.passport-book__page` di `PassportBook.css`) — kalau kamu menempel
desain/background sendiri di sini, ikuti margin yang sama supaya konten
antar-halaman (punyaku dan punyamu) rapat ke tepi yang konsisten, tidak ada
yang kepotong atau nabrak tepi buku.
