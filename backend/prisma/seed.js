import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const prisma = new PrismaClient()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Sumber foto organizer demo — awalnya dibaca langsung dari
// frontend/src/assets/data-organizer, TAPI itu di luar build context Docker
// backend (docker-compose.yml build context backend cuma folder ./backend,
// Docker tidak bisa akses file di luar context-nya sama sekali) sehingga di
// production/container path itu selalu "tidak ditemukan" dan logo/galeri jadi
// kosong untuk SEMUA organizer demo. Fix (2026-07-13): foto di-duplikasi ke
// backend/prisma/seed-assets/data-organizer supaya ikut ke-COPY oleh
// `COPY prisma ./prisma` di Dockerfile dan seed tetap reproducible baik di
// lokal maupun di container manapun.
const ORGANIZER_PHOTO_SOURCE_DIR = path.join(__dirname, 'seed-assets', 'data-organizer')
const ORGANIZER_PHOTO_TARGET_DIR = path.join(__dirname, '..', 'uploads', 'organizations')
// Belum ada aset foto "kegiatan/event" tersendiri di repo — reuse foto
// organizer (11)..(24).jpg yang belum kepakai jadi Organization.logoUrl
// (yang (1)..(10) sudah jadi logo) sbg galeri dokumentasi event demo, supaya
// event.photos tidak kosong (keputusan Rakha, drpd biarkan placeholder ikon
// kategori terus — lihat EventGalleryHero fallback di EventDetailPanel.tsx).
const EVENT_GALLERY_TARGET_DIR = path.join(__dirname, '..', 'uploads', 'event-gallery')

function copyDemoPhoto(num, targetDir, targetFileName) {
  const sourcePath = path.join(ORGANIZER_PHOTO_SOURCE_DIR, `organizer (${num}).jpg`)
  const targetPath = path.join(targetDir, targetFileName)
  if (!fs.existsSync(sourcePath)) {
    console.warn(`[seed] Foto demo tidak ditemukan, dilewati: ${sourcePath}`)
    return null
  }
  fs.mkdirSync(targetDir, { recursive: true })
  fs.copyFileSync(sourcePath, targetPath)
  return targetPath
}

function copyOrganizerPhoto(targetFileName) {
  // targetFileName demo pakai "organizer-N.jpg" (URL-safe) — petakan ke file
  // asli "organizer (N).jpg" (spasi + kurung) by nomor.
  const num = targetFileName.match(/(\d+)/)?.[1]
  const copied = copyDemoPhoto(num, ORGANIZER_PHOTO_TARGET_DIR, targetFileName)
  return copied ? `/uploads/organizations/${targetFileName}` : null
}

function copyEventGalleryPhoto(num, targetFileName) {
  const copied = copyDemoPhoto(num, EVENT_GALLERY_TARGET_DIR, targetFileName)
  return copied ? `/uploads/event-gallery/${targetFileName}` : null
}

// Data taxonomy placeholder — dipakai supaya onboarding wizard (FR-023)
// punya opsi buat ditampilkan di dev/lokal. Bukan copy final, cuma cukup
// buat testing end-to-end sampai ada daftar resmi dari produk. Kalau butuh
// tambah/ubah minat, edit array ini lalu jalankan ulang `prisma db seed`
// (upsert by name, jadi aman dijalankan berkali-kali).
const interests = [
  ['Lingkungan', 'Lingkungan'],
  ['Konservasi Satwa', 'Lingkungan'],
  ['Daur Ulang & Zero Waste', 'Lingkungan'],
  ['Bencana Alam', 'Kemanusiaan'],
  ['Kesehatan Masyarakat', 'Kemanusiaan'],
  ['Bantuan Pengungsi', 'Kemanusiaan'],
  ['Edukasi Anak', 'Sosial'],
  ['Pemberdayaan Komunitas', 'Sosial'],
  ['Pengentasan Kemiskinan', 'Sosial'],
  ['Kesetaraan & Inklusi', 'Sosial'],
  ['Fotografi', 'Kreatif'],
  ['Desain Grafis', 'Kreatif'],
  ['Menulis & Konten Kreatif', 'Kreatif'],
  ['Musik & Pertunjukan', 'Kreatif'],
  ['Teknologi untuk Sosial', 'Teknologi'],
  ['Literasi Digital', 'Teknologi'],
  ['Kesejahteraan Hewan', 'Hewan'],
  ['Olahraga & Kebugaran', 'Olahraga'],
  ['Seni & Budaya Lokal', 'Seni & Budaya'],
  ['Kegiatan Keagamaan', 'Keagamaan'],
]

const skills = [
  ['Mengajar', 'Edukasi'],
  ['Fasilitator Workshop', 'Edukasi'],
  ['First Aid / P3K', 'Kesehatan'],
  ['Fotografi', 'Kreatif'],
  ['Copywriting', 'Kreatif'],
  ['Manajemen Acara', 'Organisasi'],
  ['Public Speaking', 'Organisasi'],
]

// 10 organizer + 1 event demo per organizer (2026-07-08) — supaya dashboard
// volunteer (FindActivityPage/FindOrganizationPage) & Predictive Match Score
// punya katalog nyata utk demo/testing, tanpa perlu organizer beneran isi
// manual satu-satu. SEMUA dokumen pendukung (proposal/rundown/poster/surat
// dll — lihat Event.*DocUrl) & EventLegalDocument SENGAJA dikosongkan (null),
// bukan lupa — field-nya tetap ada di skema, cuma isinya kosong sesuai
// keputusan Rakha. organizationEntityType tetap diisi (YAYASAN/ORGANISASI)
// krn itu cuma label snapshot, tidak memaksa upload dokumen apa pun di jalur
// seed langsung (validasi wajib-upload cuma jalan di controller submit event).
const demoOrganizations = [
  {
    ownerName: 'Dewi Anggraini',
    ownerEmail: 'dewi.hijaulestari@activibe-demo.com',
    orgName: 'Yayasan Hijau Lestari',
    shortProfile: 'Yayasan yang fokus pada pelestarian lingkungan dan penghijauan kota.',
    location: 'Jakarta',
    phone: '081234500001',
    causeAreas: ['Lingkungan'],
    entityType: 'YAYASAN',
    photoFile: 'organizer-1.jpg',
    event: {
      title: 'Aksi Tanam 1000 Pohon Mangrove',
      description:
        'Kegiatan penanaman mangrove bersama warga pesisir untuk mencegah abrasi dan menjaga ekosistem laut.',
      location: 'Pantai Indah Kapuk, Jakarta Utara',
      category: 'Lingkungan',
      skills: ['Manajemen Acara'],
      interests: ['Lingkungan', 'Konservasi Satwa'],
      motivationTags: ['VALUES'],
      dayType: 'WEEKEND',
      quota: 40,
      impactMetricLabel: 'Pohon mangrove ditanam',
      impactMetricUnit: 'pohon',
      start: '2026-08-01T08:00:00+07:00',
      end: '2026-08-01T14:00:00+07:00',
      galleryPhotoNums: [11, 12],
    },
  },
  {
    ownerName: 'Budi Santoso',
    ownerEmail: 'budi.pedulipendidikan@activibe-demo.com',
    orgName: 'Komunitas Peduli Pendidikan',
    shortProfile: 'Komunitas relawan pendidikan yang membantu anak-anak kurang mampu mendapat akses belajar.',
    location: 'Bandung',
    phone: '081234500002',
    causeAreas: ['Pendidikan', 'Edukasi Publik'],
    entityType: 'ORGANISASI',
    photoFile: 'organizer-2.jpg',
    event: {
      title: 'Kelas Membaca untuk Anak Jalanan',
      description: 'Sesi belajar membaca dan menulis untuk anak-anak jalanan di sekitar Kota Bandung.',
      location: 'Taman Kota Bandung',
      category: 'Pendidikan',
      skills: ['Mengajar'],
      interests: ['Edukasi Anak'],
      motivationTags: ['SOCIAL', 'VALUES'],
      dayType: 'WEEKEND',
      quota: 20,
      impactMetricLabel: 'Anak terbantu belajar',
      impactMetricUnit: 'anak',
      start: '2026-08-08T09:00:00+07:00',
      end: '2026-08-08T12:00:00+07:00',
      galleryPhotoNums: [13, 14],
    },
  },
  {
    ownerName: 'Siti Rahmawati',
    ownerEmail: 'siti.sehatbersama@activibe-demo.com',
    orgName: 'Yayasan Sehat Bersama',
    shortProfile: 'Yayasan yang menyediakan layanan kesehatan gratis untuk masyarakat kurang mampu.',
    location: 'Surabaya',
    phone: '081234500003',
    causeAreas: ['Kesehatan'],
    entityType: 'YAYASAN',
    photoFile: 'organizer-3.jpg',
    event: {
      title: 'Skrining Kesehatan Gratis Warga',
      description: 'Pemeriksaan kesehatan dasar gratis (tensi, gula darah, kolesterol) untuk warga sekitar.',
      location: 'Balai RW Surabaya Timur',
      category: 'Kesehatan',
      skills: ['First Aid / P3K'],
      interests: ['Kesehatan Masyarakat'],
      motivationTags: ['VALUES'],
      dayType: 'WEEKDAY',
      quota: 25,
      impactMetricLabel: 'Warga diperiksa',
      impactMetricUnit: 'orang',
      start: '2026-08-05T08:00:00+07:00',
      end: '2026-08-05T13:00:00+07:00',
      galleryPhotoNums: [15, 16],
    },
  },
  {
    ownerName: 'Rina Wijaya',
    ownerEmail: 'rina.rumahbelajar@activibe-demo.com',
    orgName: 'Rumah Belajar Anak Nusantara',
    shortProfile: 'Rumah belajar nonformal untuk anak-anak dan remaja di lingkungan padat penduduk.',
    location: 'Yogyakarta',
    phone: '081234500004',
    causeAreas: ['Anak & Remaja', 'Pendidikan'],
    entityType: 'ORGANISASI',
    photoFile: 'organizer-4.jpg',
    event: {
      title: 'Pendampingan Belajar Anak Panti Asuhan',
      description: 'Kegiatan bimbingan belajar dan bermain kreatif untuk anak-anak panti asuhan.',
      location: 'Panti Asuhan Kasih Yogyakarta',
      category: 'Pendidikan',
      skills: ['Mengajar', 'Fasilitator Workshop'],
      interests: ['Edukasi Anak', 'Pemberdayaan Komunitas'],
      motivationTags: ['SOCIAL'],
      dayType: 'WEEKEND',
      quota: 15,
      impactMetricLabel: 'Anak terdampingi',
      impactMetricUnit: 'anak',
      start: '2026-08-15T09:00:00+07:00',
      end: '2026-08-15T12:00:00+07:00',
      galleryPhotoNums: [17, 18],
    },
  },
  {
    ownerName: 'Ahmad Fauzi',
    ownerEmail: 'ahmad.siagabencana@activibe-demo.com',
    orgName: 'Tim Siaga Bencana Indonesia',
    shortProfile: 'Relawan tanggap bencana yang aktif dalam pelatihan mitigasi dan evakuasi.',
    location: 'Padang',
    phone: '081234500005',
    causeAreas: ['Kebencanaan', 'Mitigasi Bencana'],
    entityType: 'ORGANISASI',
    photoFile: 'organizer-5.jpg',
    event: {
      title: 'Pelatihan Siaga Bencana & Evakuasi Mandiri',
      description: 'Pelatihan dasar tanggap bencana gempa dan tsunami untuk warga pesisir Padang.',
      location: 'Pantai Padang',
      category: 'Sosial',
      skills: ['First Aid / P3K', 'Manajemen Acara'],
      interests: ['Bencana Alam'],
      motivationTags: ['SKILL_GROWTH', 'VALUES'],
      dayType: 'WEEKEND',
      quota: 30,
      impactMetricLabel: 'Warga terlatih',
      impactMetricUnit: 'orang',
      start: '2026-08-22T08:00:00+07:00',
      end: '2026-08-22T15:00:00+07:00',
      galleryPhotoNums: [19, 20],
    },
  },
  {
    ownerName: 'Maria Ginting',
    ownerEmail: 'maria.kasihsosial@activibe-demo.com',
    orgName: 'Yayasan Kasih Sosial',
    shortProfile: 'Yayasan penyalur bantuan sosial untuk keluarga prasejahtera.',
    location: 'Medan',
    phone: '081234500006',
    causeAreas: ['Bantuan Sosial'],
    entityType: 'YAYASAN',
    photoFile: 'organizer-6.jpg',
    event: {
      title: 'Bagi Sembako untuk Keluarga Prasejahtera',
      description: 'Penyaluran paket sembako untuk keluarga prasejahtera di Kota Medan.',
      location: 'Gudang Yayasan Kasih Sosial, Medan',
      category: 'Sosial',
      skills: ['Manajemen Acara'],
      interests: ['Pengentasan Kemiskinan'],
      motivationTags: ['VALUES'],
      dayType: 'WEEKDAY',
      quota: 25,
      impactMetricLabel: 'Keluarga terbantu',
      impactMetricUnit: 'keluarga',
      start: '2026-07-30T08:00:00+07:00',
      end: '2026-07-30T12:00:00+07:00',
      galleryPhotoNums: [21, 22],
    },
  },
  {
    ownerName: 'Nurul Hasanah',
    ownerEmail: 'nurul.perempuanberdaya@activibe-demo.com',
    orgName: 'Gerakan Perempuan Berdaya',
    shortProfile: 'Gerakan yang memberdayakan perempuan lewat pelatihan kewirausahaan.',
    location: 'Semarang',
    phone: '081234500007',
    causeAreas: ['Pemberdayaan Perempuan'],
    entityType: 'ORGANISASI',
    photoFile: 'organizer-7.jpg',
    event: {
      title: 'Pelatihan Kewirausahaan Perempuan',
      description: 'Workshop dasar kewirausahaan dan pengelolaan keuangan untuk ibu rumah tangga.',
      location: 'Balai Kelurahan Semarang',
      category: 'Sosial',
      skills: ['Fasilitator Workshop', 'Public Speaking'],
      interests: ['Pemberdayaan Komunitas', 'Kesetaraan & Inklusi'],
      motivationTags: ['SKILL_GROWTH'],
      dayType: 'WEEKEND',
      quota: 20,
      impactMetricLabel: 'Peserta terlatih',
      impactMetricUnit: 'orang',
      start: '2026-08-12T09:00:00+07:00',
      end: '2026-08-12T15:00:00+07:00',
      galleryPhotoNums: [23, 24],
    },
  },
  {
    ownerName: 'Aditya Pratama',
    ownerEmail: 'aditya.kreatifnusantara@activibe-demo.com',
    orgName: 'Komunitas Kreatif Nusantara',
    shortProfile: 'Komunitas yang mewadahi anak muda kreatif lewat seni dan ekonomi kreatif.',
    location: 'Malang',
    phone: '081234500008',
    causeAreas: ['Ekonomi Kreatif', 'Seni & Budaya'],
    entityType: 'ORGANISASI',
    photoFile: 'organizer-8.jpg',
    event: {
      title: 'Pameran Karya Kreatif Anak Muda',
      description: 'Pameran dan bazar karya seni & produk kreatif hasil karya anak muda lokal.',
      location: 'Alun-Alun Kota Malang',
      category: 'Seni & Budaya',
      skills: ['Fotografi', 'Copywriting'],
      interests: ['Desain Grafis', 'Musik & Pertunjukan'],
      motivationTags: ['CAREER', 'SOCIAL'],
      dayType: 'WEEKEND',
      quota: 35,
      impactMetricLabel: 'Karya dipamerkan',
      impactMetricUnit: 'karya',
      start: '2026-08-19T10:00:00+07:00',
      end: '2026-08-19T18:00:00+07:00',
      galleryPhotoNums: [11, 13],
    },
  },
  {
    ownerName: 'Rizky Ramadhan',
    ownerEmail: 'rizky.pemudapemimpin@activibe-demo.com',
    orgName: 'Forum Pemuda Pemimpin Bangsa',
    shortProfile: 'Forum yang membina jiwa kepemimpinan pemuda lewat kegiatan sosial.',
    location: 'Makassar',
    phone: '081234500009',
    causeAreas: ['Kepemimpinan Pemuda'],
    entityType: 'ORGANISASI',
    photoFile: 'organizer-9.jpg',
    event: {
      title: 'Leadership Camp untuk Pemuda',
      description: 'Camp kepemimpinan 1 hari berisi pelatihan public speaking dan kerja tim.',
      location: 'Pantai Losari, Makassar',
      category: 'Sosial',
      skills: ['Public Speaking', 'Manajemen Acara'],
      interests: ['Pemberdayaan Komunitas'],
      motivationTags: ['SKILL_GROWTH', 'CAREER'],
      dayType: 'WEEKEND',
      quota: 30,
      impactMetricLabel: 'Pemuda terlatih',
      impactMetricUnit: 'orang',
      start: '2026-08-26T08:00:00+07:00',
      end: '2026-08-26T16:00:00+07:00',
      galleryPhotoNums: [12, 14],
    },
  },
  {
    ownerName: 'Wayan Kusuma',
    ownerEmail: 'wayan.sanggarbudaya@activibe-demo.com',
    orgName: 'Sanggar Budaya Indonesia',
    shortProfile: 'Sanggar yang melestarikan seni tari dan budaya tradisional Indonesia.',
    location: 'Denpasar',
    phone: '081234500010',
    causeAreas: ['Pertukaran Budaya', 'Seni & Budaya'],
    entityType: 'ORGANISASI',
    photoFile: 'organizer-10.jpg',
    event: {
      title: 'Festival Budaya Nusantara',
      description: 'Pertunjukan tari dan musik tradisional dari berbagai daerah di Indonesia.',
      location: 'Taman Budaya Denpasar',
      category: 'Seni & Budaya',
      skills: ['Manajemen Acara', 'Fotografi'],
      interests: ['Seni & Budaya Lokal', 'Musik & Pertunjukan'],
      motivationTags: ['SOCIAL', 'VALUES'],
      dayType: 'WEEKEND',
      quota: 50,
      impactMetricLabel: 'Penonton hadir',
      impactMetricUnit: 'orang',
      start: '2026-09-05T15:00:00+07:00',
      end: '2026-09-05T20:00:00+07:00',
      galleryPhotoNums: [15, 17],
    },
  },
]

// 40 organisasi+event tambahan (2026-07-13) — supaya katalog demo produksi
// punya minimal 50 organisasi & 50 event (bukan cuma 10), dibuat programatik
// lewat buildBulkOrg() drpd 40 objek literal penuh spy tetap ringkas & mudah
// diaudit. Pola/field persis sama dgn demoOrganizations di atas (upsert by
// ownerEmail/title, jadi aman dijalankan berkali-kali). Nama organisasi
// sengaja terinspirasi yayasan/CSR yang sudah dikenal luas di Indonesia
// (Paragon, Danone, Tanoto Foundation, dst) supaya katalog demo terasa nyata
// — bukan klaim afiliasi resmi, murni data seed lokal utk keperluan tubes.
const BULK_EVENT_BASE_TIMESTAMP = new Date('2026-08-02T08:00:00+07:00').getTime()
const DAY_MS = 24 * 60 * 60 * 1000

function buildBulkOrg(idx, cfg) {
  const photoNum = (idx % 24) + 1
  const galleryA = ((idx + 5) % 24) + 1
  const galleryB = ((idx + 11) % 24) + 1
  const slug = cfg.orgName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  const start = new Date(BULK_EVENT_BASE_TIMESTAMP + idx * 3 * DAY_MS)
  const end = new Date(start.getTime() + (cfg.durationHours ?? 5) * 60 * 60 * 1000)

  return {
    ownerName: cfg.ownerName,
    ownerEmail: `${slug}@activibe-demo.com`,
    orgName: cfg.orgName,
    shortProfile: cfg.shortProfile,
    location: cfg.city,
    phone: `0812346${String(100 + idx).padStart(5, '0')}`,
    causeAreas: cfg.causeAreas,
    entityType: cfg.entityType,
    photoFile: `organizer-${photoNum}.jpg`,
    event: {
      title: cfg.eventTitle,
      description: cfg.eventDescription,
      location: cfg.eventLocation,
      category: cfg.category,
      skills: cfg.skills,
      interests: cfg.interests,
      motivationTags: cfg.motivationTags,
      dayType: cfg.dayType,
      quota: cfg.quota,
      impactMetricLabel: cfg.impactMetricLabel,
      impactMetricUnit: cfg.impactMetricUnit,
      start,
      end,
      galleryPhotoNums: [galleryA, galleryB],
    },
  }
}

const bulkOrganizationConfigs = [
  { ownerName: 'Melati Kusuma', orgName: 'Yayasan Paragon', shortProfile: 'Yayasan CSR yang fokus pada keberlanjutan lingkungan dan daur ulang kemasan kosmetik.', city: 'Jakarta', causeAreas: ['Lingkungan', 'Kecantikan Berkelanjutan'], entityType: 'YAYASAN', category: 'Lingkungan', skills: ['Manajemen Acara'], interests: ['Lingkungan', 'Daur Ulang & Zero Waste'], motivationTags: ['VALUES'], dayType: 'WEEKEND', quota: 30, impactMetricLabel: 'Kg kemasan terkumpul', impactMetricUnit: 'kg', durationHours: 4, eventTitle: 'Recycle for Life: Kumpul Kemasan Kosmetik Kosong', eventDescription: 'Mengumpulkan kemasan kosmetik bekas dari masyarakat untuk didaur ulang jadi produk ramah lingkungan.', eventLocation: 'Mall Kota Kasablanka, Jakarta Selatan' },
  { ownerName: 'Bayu Prasetyo', orgName: 'Yayasan Danone Indonesia', shortProfile: 'Yayasan CSR yang berfokus pada konservasi air bersih dan kesehatan masyarakat.', city: 'Bandung', causeAreas: ['Lingkungan', 'Konservasi Air'], entityType: 'YAYASAN', category: 'Lingkungan', skills: ['Manajemen Acara'], interests: ['Lingkungan', 'Konservasi Satwa'], motivationTags: ['VALUES', 'SOCIAL'], dayType: 'WEEKEND', quota: 45, impactMetricLabel: 'Kg sampah terangkut', impactMetricUnit: 'kg', durationHours: 4, eventTitle: 'Aksi Bersih Sungai Citarum Harum', eventDescription: 'Membersihkan sampah di bantaran Sungai Citarum bersama komunitas lokal dan edukasi konservasi air.', eventLocation: 'Bantaran Sungai Citarum, Bandung' },
  { ownerName: 'Hendra Wibowo', orgName: 'Tanoto Foundation', shortProfile: 'Yayasan yang berfokus pada pemerataan akses pendidikan bagi anak kurang mampu.', city: 'Pekanbaru', causeAreas: ['Pendidikan'], entityType: 'YAYASAN', category: 'Pendidikan', skills: ['Mengajar'], interests: ['Edukasi Anak'], motivationTags: ['SOCIAL', 'VALUES'], dayType: 'WEEKDAY', quota: 25, impactMetricLabel: 'Siswa terdampingi', impactMetricUnit: 'siswa', durationHours: 4, eventTitle: 'Bimbingan Belajar & Beasiswa Siswa SMA', eventDescription: 'Pendampingan belajar dan sosialisasi beasiswa pendidikan tinggi untuk siswa SMA kurang mampu.', eventLocation: 'SMAN 5 Pekanbaru' },
  { ownerName: 'Ratna Sari', orgName: 'Putera Sampoerna Foundation', shortProfile: 'Yayasan yang berfokus pada peningkatan kualitas pendidik di daerah tertinggal.', city: 'Surabaya', causeAreas: ['Pendidikan'], entityType: 'YAYASAN', category: 'Pendidikan', skills: ['Mengajar', 'Fasilitator Workshop'], interests: ['Edukasi Anak', 'Pemberdayaan Komunitas'], motivationTags: ['SKILL_GROWTH'], dayType: 'WEEKEND', quota: 30, impactMetricLabel: 'Guru terlatih', impactMetricUnit: 'guru', durationHours: 6, eventTitle: 'Pelatihan Guru Daerah 3T', eventDescription: 'Workshop peningkatan kompetensi mengajar untuk guru-guru dari daerah tertinggal, terdepan, dan terluar.', eventLocation: 'Universitas Ciputra, Surabaya' },
  { ownerName: 'Fitriani Anwar', orgName: 'Yayasan Unilever Indonesia', shortProfile: 'Yayasan CSR yang menggerakkan edukasi kesehatan dan kebersihan masyarakat.', city: 'Jakarta', causeAreas: ['Kesehatan', 'Lingkungan'], entityType: 'YAYASAN', category: 'Kesehatan', skills: ['Mengajar'], interests: ['Kesehatan Masyarakat'], motivationTags: ['VALUES'], dayType: 'WEEKDAY', quota: 20, impactMetricLabel: 'Siswa teredukasi', impactMetricUnit: 'siswa', durationHours: 3, eventTitle: 'Gerakan Cuci Tangan Pakai Sabun Sekolah Dasar', eventDescription: 'Edukasi kebiasaan cuci tangan pakai sabun untuk siswa sekolah dasar di wilayah Jakarta.', eventLocation: 'SDN Cipinang, Jakarta Timur' },
  { ownerName: 'Yusuf Maulana', orgName: 'Rumah Zakat', shortProfile: 'Lembaga filantropi yang menyalurkan bantuan gizi dan pendidikan bagi anak yatim.', city: 'Bandung', causeAreas: ['Bantuan Sosial'], entityType: 'YAYASAN', category: 'Sosial', skills: ['Manajemen Acara'], interests: ['Pengentasan Kemiskinan'], motivationTags: ['VALUES'], dayType: 'WEEKDAY', quota: 20, impactMetricLabel: 'Anak terbantu', impactMetricUnit: 'anak', durationHours: 3, eventTitle: 'Distribusi Paket Gizi untuk Anak Yatim', eventDescription: 'Penyaluran paket gizi dan susu untuk anak-anak yatim binaan Rumah Zakat.', eventLocation: 'Panti Asuhan Bandung Timur' },
  { ownerName: 'Halimah Zubaidah', orgName: 'Dompet Dhuafa', shortProfile: 'Lembaga filantropi yang menyediakan layanan kesehatan gratis bagi warga dhuafa.', city: 'Jakarta', causeAreas: ['Kesehatan', 'Bantuan Sosial'], entityType: 'YAYASAN', category: 'Kesehatan', skills: ['First Aid / P3K'], interests: ['Kesehatan Masyarakat'], motivationTags: ['VALUES'], dayType: 'WEEKDAY', quota: 30, impactMetricLabel: 'Pasien dilayani', impactMetricUnit: 'orang', durationHours: 5, eventTitle: 'Layanan Kesehatan Keliling untuk Dhuafa', eventDescription: 'Pemeriksaan kesehatan gratis dan pembagian obat untuk warga dhuafa di permukiman padat.', eventLocation: 'Kampung Rawa, Jakarta Pusat' },
  { ownerName: 'Fajar Nugroho', orgName: 'Aksi Cepat Tanggap', shortProfile: 'Organisasi kemanusiaan yang bergerak cepat dalam penanganan bencana.', city: 'Jakarta', causeAreas: ['Kebencanaan'], entityType: 'ORGANISASI', category: 'Sosial', skills: ['First Aid / P3K', 'Manajemen Acara'], interests: ['Bencana Alam'], motivationTags: ['VALUES', 'SKILL_GROWTH'], dayType: 'WEEKEND', quota: 35, impactMetricLabel: 'Keluarga terbantu', impactMetricUnit: 'keluarga', durationHours: 6, eventTitle: 'Siaga Bencana Banjir Jabodetabek', eventDescription: 'Pelatihan tanggap darurat dan penyaluran bantuan logistik untuk korban banjir Jabodetabek.', eventLocation: 'Posko ACT Jakarta Timur' },
  { ownerName: 'Dian Puspitasari', orgName: 'WWF Indonesia', shortProfile: 'Organisasi konservasi alam yang melindungi satwa liar dan habitatnya.', city: 'Bogor', causeAreas: ['Konservasi Alam'], entityType: 'ORGANISASI', category: 'Lingkungan', skills: ['Fotografi'], interests: ['Konservasi Satwa', 'Lingkungan'], motivationTags: ['VALUES'], dayType: 'WEEKEND', quota: 20, impactMetricLabel: 'Peserta teredukasi', impactMetricUnit: 'orang', durationHours: 6, eventTitle: 'Konservasi Satwa Liar Taman Nasional', eventDescription: 'Kegiatan patroli edukatif dan edukasi konservasi satwa liar bersama ranger Taman Nasional.', eventLocation: 'Taman Nasional Gunung Halimun, Bogor' },
  { ownerName: 'Reza Firmansyah', orgName: 'Greenpeace Indonesia', shortProfile: 'Organisasi lingkungan yang mengkampanyekan pengurangan plastik sekali pakai.', city: 'Jakarta', causeAreas: ['Lingkungan'], entityType: 'ORGANISASI', category: 'Lingkungan', skills: ['Public Speaking', 'Copywriting'], interests: ['Lingkungan', 'Daur Ulang & Zero Waste'], motivationTags: ['VALUES', 'SOCIAL'], dayType: 'WEEKEND', quota: 40, impactMetricLabel: 'Tanda tangan petisi', impactMetricUnit: 'tanda tangan', durationHours: 4, eventTitle: 'Kampanye Kurangi Plastik Sekali Pakai', eventDescription: 'Aksi edukasi publik dan petisi untuk mendorong pengurangan plastik sekali pakai di area publik.', eventLocation: 'Bundaran HI, Jakarta' },
  { ownerName: 'Agus Setiawan', orgName: 'Habitat for Humanity Indonesia', shortProfile: 'Organisasi yang membangun rumah layak huni untuk keluarga kurang mampu.', city: 'Yogyakarta', causeAreas: ['Bantuan Sosial'], entityType: 'ORGANISASI', category: 'Sosial', skills: ['Manajemen Acara'], interests: ['Pengentasan Kemiskinan', 'Pemberdayaan Komunitas'], motivationTags: ['VALUES', 'SOCIAL'], dayType: 'WEEKEND', quota: 25, impactMetricLabel: 'Rumah direnovasi', impactMetricUnit: 'rumah', durationHours: 8, eventTitle: 'Bangun Rumah Layak Huni Warga Kurang Mampu', eventDescription: 'Gotong royong membangun dan merenovasi rumah layak huni untuk keluarga kurang mampu.', eventLocation: 'Desa Sewon, Bantul, Yogyakarta' },
  { ownerName: 'Intan Permata', orgName: 'Indonesia Mengajar', shortProfile: 'Gerakan pengajar muda yang ditempatkan di pelosok Indonesia.', city: 'Maumere', causeAreas: ['Pendidikan'], entityType: 'ORGANISASI', category: 'Pendidikan', skills: ['Mengajar', 'Public Speaking'], interests: ['Edukasi Anak'], motivationTags: ['SOCIAL', 'VALUES'], dayType: 'WEEKDAY', quota: 20, impactMetricLabel: 'Siswa terinspirasi', impactMetricUnit: 'siswa', durationHours: 4, eventTitle: 'Kelas Inspirasi Pengajar Muda NTT', eventDescription: 'Sesi inspirasi karier dan motivasi belajar untuk siswa SD di pelosok Nusa Tenggara Timur.', eventLocation: 'SDN Wolomarang, Maumere' },
  { ownerName: 'Cahyo Nugraha', orgName: 'Palang Merah Indonesia Kota Semarang', shortProfile: 'Organisasi kepalangmerahan yang menyelenggarakan donor darah dan tanggap darurat.', city: 'Semarang', causeAreas: ['Kesehatan'], entityType: 'ORGANISASI', category: 'Kesehatan', skills: ['First Aid / P3K', 'Manajemen Acara'], interests: ['Kesehatan Masyarakat'], motivationTags: ['VALUES'], dayType: 'WEEKEND', quota: 50, impactMetricLabel: 'Kantong darah terkumpul', impactMetricUnit: 'kantong', durationHours: 5, eventTitle: 'Donor Darah Massal PMI', eventDescription: 'Kegiatan donor darah massal untuk memenuhi kebutuhan stok darah PMI Kota Semarang.', eventLocation: 'GOR Tri Lomba Juang, Semarang' },
  { ownerName: 'Sutrisno Hadi', orgName: 'Yayasan BUMN Untuk Negeri', shortProfile: 'Yayasan gabungan BUMN yang menyalurkan bantuan sosial ke masyarakat.', city: 'Jakarta', causeAreas: ['Bantuan Sosial'], entityType: 'YAYASAN', category: 'Sosial', skills: ['Manajemen Acara'], interests: ['Pengentasan Kemiskinan'], motivationTags: ['VALUES', 'SOCIAL'], dayType: 'WEEKEND', quota: 60, impactMetricLabel: 'Warga terbantu', impactMetricUnit: 'orang', durationHours: 6, eventTitle: 'Bakti Sosial BUMN Hadir untuk Negeri', eventDescription: 'Kegiatan bakti sosial gabungan BUMN berupa pembagian sembako dan layanan kesehatan gratis.', eventLocation: 'Lapangan Monas, Jakarta' },
  { ownerName: 'Yuliana Dewi', orgName: 'Yayasan Cinta Anak Bangsa', shortProfile: 'Yayasan yang menghadirkan akses literasi untuk anak-anak pinggiran kota.', city: 'Depok', causeAreas: ['Pendidikan', 'Anak & Remaja'], entityType: 'YAYASAN', category: 'Pendidikan', skills: ['Mengajar'], interests: ['Edukasi Anak'], motivationTags: ['SOCIAL'], dayType: 'WEEKEND', quota: 15, impactMetricLabel: 'Anak terlayani', impactMetricUnit: 'anak', durationHours: 3, eventTitle: 'Taman Baca Keliling untuk Anak Pinggiran', eventDescription: 'Menghadirkan perpustakaan keliling dan sesi mendongeng untuk anak-anak di kawasan pinggiran kota.', eventLocation: 'Kampung Lio, Depok' },
  { ownerName: 'Dedi Kurniawan', orgName: 'Bakti Barito', shortProfile: 'Yayasan CSR yang fokus pada restorasi lahan gambut dan pencegahan karhutla.', city: 'Jakarta', causeAreas: ['Lingkungan'], entityType: 'YAYASAN', category: 'Lingkungan', skills: ['Manajemen Acara'], interests: ['Lingkungan', 'Konservasi Satwa'], motivationTags: ['VALUES'], dayType: 'WEEKDAY', quota: 20, impactMetricLabel: 'Hektar lahan direstorasi', impactMetricUnit: 'hektar', durationHours: 6, eventTitle: 'Restorasi Lahan Gambut Kalimantan', eventDescription: 'Kegiatan restorasi lahan gambut dan edukasi pencegahan kebakaran hutan bersama warga lokal.', eventLocation: 'Kabupaten Katingan, Kalimantan Tengah' },
  { ownerName: 'Prasetyo Adi', orgName: 'Yayasan Astra untuk Indonesia', shortProfile: 'Yayasan CSR yang mendorong digitalisasi UMKM binaan.', city: 'Jakarta', causeAreas: ['Pemberdayaan UMKM', 'Teknologi'], entityType: 'YAYASAN', category: 'Teknologi', skills: ['Fasilitator Workshop'], interests: ['Teknologi untuk Sosial', 'Literasi Digital'], motivationTags: ['SKILL_GROWTH', 'CAREER'], dayType: 'WEEKDAY', quota: 25, impactMetricLabel: 'UMKM terlatih', impactMetricUnit: 'UMKM', durationHours: 5, eventTitle: 'Pelatihan Digitalisasi UMKM Astra', eventDescription: 'Workshop pemasaran digital dan pembukuan sederhana untuk pelaku UMKM binaan Astra.', eventLocation: 'Astra Biz Center, Jakarta' },
  { ownerName: 'Wahyu Setiadi', orgName: 'Djarum Foundation', shortProfile: 'Yayasan CSR yang menggerakkan penghijauan jalur Pantura sejak lama.', city: 'Kudus', causeAreas: ['Lingkungan'], entityType: 'YAYASAN', category: 'Lingkungan', skills: ['Manajemen Acara'], interests: ['Lingkungan'], motivationTags: ['VALUES'], dayType: 'WEEKEND', quota: 40, impactMetricLabel: 'Pohon ditanam', impactMetricUnit: 'pohon', durationHours: 5, eventTitle: 'Trees for Life: Penghijauan Jalur Pantura', eventDescription: 'Penanaman pohon trembesi di sepanjang jalur Pantura untuk peneduh dan penyerap emisi karbon.', eventLocation: 'Jalur Pantura Kudus-Demak' },
  { ownerName: 'Nining Kurnia', orgName: 'Bank Sampah Indonesia', shortProfile: 'Organisasi yang mengedukasi pemilahan dan pengelolaan sampah rumah tangga.', city: 'Malang', causeAreas: ['Lingkungan', 'Daur Ulang'], entityType: 'ORGANISASI', category: 'Lingkungan', skills: ['Fasilitator Workshop'], interests: ['Daur Ulang & Zero Waste'], motivationTags: ['SKILL_GROWTH', 'VALUES'], dayType: 'WEEKDAY', quota: 20, impactMetricLabel: 'Peserta terlatih', impactMetricUnit: 'orang', durationHours: 3, eventTitle: 'Edukasi Bank Sampah untuk Ibu PKK', eventDescription: 'Pelatihan pemilahan sampah dan pengelolaan bank sampah tingkat RW bersama ibu-ibu PKK.', eventLocation: 'Balai RW Sukun, Malang' },
  { ownerName: 'Gunawan Santosa', orgName: 'Coca-Cola Foundation Indonesia', shortProfile: 'Yayasan CSR yang mendukung program konservasi air bersih di perkotaan.', city: 'Bekasi', causeAreas: ['Lingkungan', 'Konservasi Air'], entityType: 'YAYASAN', category: 'Lingkungan', skills: ['Manajemen Acara'], interests: ['Lingkungan'], motivationTags: ['VALUES'], dayType: 'WEEKEND', quota: 25, impactMetricLabel: 'Sumur resapan dibangun', impactMetricUnit: 'unit', durationHours: 5, eventTitle: 'Program Konservasi Air Bersih Warga', eventDescription: 'Pembangunan sumur resapan dan edukasi hemat air bersih untuk warga bantaran kali.', eventLocation: 'Bantaran Kali Bekasi' },
  { ownerName: 'Lestari Ningrum', orgName: 'Sinar Mas Peduli', shortProfile: 'Yayasan CSR yang tanggap terhadap bencana kabut asap dan bantuan sosial.', city: 'Jakarta', causeAreas: ['Bantuan Sosial', 'Kebencanaan'], entityType: 'YAYASAN', category: 'Sosial', skills: ['Manajemen Acara'], interests: ['Bencana Alam'], motivationTags: ['VALUES'], dayType: 'WEEKDAY', quota: 30, impactMetricLabel: 'Warga terbantu', impactMetricUnit: 'orang', durationHours: 4, eventTitle: 'Sinar Mas Peduli Bencana Kabut Asap', eventDescription: 'Distribusi masker dan oksigen portable untuk warga terdampak kabut asap kebakaran hutan.', eventLocation: 'Kabupaten Siak, Riau' },
  { ownerName: 'Anisa Rahmadani', orgName: 'Yayasan Kitabisa Peduli', shortProfile: 'Yayasan penggalang dana kemanusiaan berbasis komunitas digital.', city: 'Jakarta', causeAreas: ['Bantuan Sosial'], entityType: 'YAYASAN', category: 'Sosial', skills: ['Copywriting', 'Manajemen Acara'], interests: ['Pemberdayaan Komunitas'], motivationTags: ['SOCIAL', 'VALUES'], dayType: 'WEEKEND', quota: 20, impactMetricLabel: 'Dana terkumpul', impactMetricUnit: 'donasi', durationHours: 4, eventTitle: 'Galang Dana Kemanusiaan untuk Panti Jompo', eventDescription: 'Kegiatan penggalangan dana dan kunjungan sosial ke panti jompo kurang mampu.', eventLocation: 'Panti Wreda Kasih, Jakarta Selatan' },
  { ownerName: 'Taufik Hidayat', orgName: 'Komunitas 1000 Guru Bandung', shortProfile: 'Komunitas relawan yang mengekspedisikan pengajaran ke pelosok daerah.', city: 'Bandung', causeAreas: ['Pendidikan'], entityType: 'ORGANISASI', category: 'Pendidikan', skills: ['Mengajar', 'Fotografi'], interests: ['Edukasi Anak'], motivationTags: ['SOCIAL', 'SKILL_GROWTH'], dayType: 'WEEKEND', quota: 20, impactMetricLabel: 'Siswa terdampingi', impactMetricUnit: 'siswa', durationHours: 8, eventTitle: 'Ekspedisi Mengajar ke Pelosok Garut', eventDescription: 'Ekspedisi relawan mengajar dan berbagi keceriaan untuk siswa SD di pelosok Kabupaten Garut.', eventLocation: 'SDN Cikajang, Garut' },
  { ownerName: 'Sri Wahyuni', orgName: 'Yayasan Plan International Indonesia', shortProfile: 'Yayasan yang bergerak dalam perlindungan anak dan kesetaraan gender.', city: 'Jakarta', causeAreas: ['Perlindungan Anak', 'Kesetaraan Gender'], entityType: 'YAYASAN', category: 'Sosial', skills: ['Fasilitator Workshop', 'Public Speaking'], interests: ['Kesetaraan & Inklusi', 'Edukasi Anak'], motivationTags: ['VALUES', 'SOCIAL'], dayType: 'WEEKDAY', quota: 25, impactMetricLabel: 'Peserta teredukasi', impactMetricUnit: 'orang', durationHours: 4, eventTitle: 'Sosialisasi Perlindungan Anak dan Remaja', eventDescription: 'Sosialisasi pencegahan kekerasan pada anak dan remaja untuk orang tua dan guru.', eventLocation: 'Balai Warga Cakung, Jakarta Timur' },
  { ownerName: 'Nadia Putri', orgName: 'Save the Children Indonesia', shortProfile: 'Organisasi internasional yang fokus pada gizi dan kesehatan anak Indonesia.', city: 'Jakarta', causeAreas: ['Kesehatan Anak', 'Pendidikan'], entityType: 'ORGANISASI', category: 'Kesehatan', skills: ['First Aid / P3K'], interests: ['Kesehatan Masyarakat'], motivationTags: ['VALUES'], dayType: 'WEEKDAY', quota: 20, impactMetricLabel: 'Balita terlayani', impactMetricUnit: 'balita', durationHours: 3, eventTitle: 'Program Gizi Anak Indonesia', eventDescription: 'Penyuluhan gizi seimbang dan pembagian makanan tambahan untuk balita stunting.', eventLocation: 'Posyandu Melati, Jakarta Utara' },
  { ownerName: 'Yoga Pratama', orgName: 'Yayasan Bakti BCA', shortProfile: 'Yayasan CSR yang mendukung pendidikan vokasi bagi lulusan SMK kurang mampu.', city: 'Jakarta', causeAreas: ['Pendidikan Vokasi'], entityType: 'YAYASAN', category: 'Pendidikan', skills: ['Fasilitator Workshop'], interests: ['Pemberdayaan Komunitas'], motivationTags: ['SKILL_GROWTH'], dayType: 'WEEKDAY', quota: 20, impactMetricLabel: 'Peserta terlatih', impactMetricUnit: 'orang', durationHours: 6, eventTitle: 'Bakti BCA untuk Pendidikan Vokasi', eventDescription: 'Pelatihan keterampilan vokasi (perbengkelan, tata boga) untuk lulusan SMK kurang mampu.', eventLocation: 'Bakti BCA Learning Center, Jakarta' },
  { ownerName: 'Indra Gunawan', orgName: 'Telkomsel Jaga Rasa', shortProfile: 'Program CSR yang mendorong literasi digital bagi kelompok rentan.', city: 'Jakarta', causeAreas: ['Teknologi', 'Lansia'], entityType: 'ORGANISASI', category: 'Teknologi', skills: ['Fasilitator Workshop'], interests: ['Literasi Digital'], motivationTags: ['SKILL_GROWTH', 'VALUES'], dayType: 'WEEKDAY', quota: 15, impactMetricLabel: 'Lansia teredukasi', impactMetricUnit: 'orang', durationHours: 3, eventTitle: 'Literasi Digital untuk Lansia', eventDescription: 'Pelatihan penggunaan smartphone dan waspada penipuan digital untuk warga lanjut usia.', eventLocation: 'Posyandu Lansia Kemang, Jakarta' },
  { ownerName: 'Bambang Irawan', orgName: 'Pertamina Foundation', shortProfile: 'Yayasan CSR yang mendukung program dekarbonisasi lewat penanaman mangrove.', city: 'Balikpapan', causeAreas: ['Lingkungan'], entityType: 'YAYASAN', category: 'Lingkungan', skills: ['Manajemen Acara'], interests: ['Lingkungan', 'Konservasi Satwa'], motivationTags: ['VALUES'], dayType: 'WEEKEND', quota: 35, impactMetricLabel: 'Pohon mangrove ditanam', impactMetricUnit: 'pohon', durationHours: 5, eventTitle: 'Pertamina Hijau: Tanam Mangrove Kalimantan', eventDescription: 'Penanaman mangrove di pesisir Kalimantan untuk mendukung program dekarbonisasi Pertamina.', eventLocation: 'Pesisir Manggar, Balikpapan' },
  { ownerName: 'Retno Wulandari', orgName: 'Yayasan Bakrie untuk Negeri', shortProfile: 'Yayasan yang membina anak muda putus sekolah lewat pelatihan kewirausahaan.', city: 'Jakarta', causeAreas: ['Pendidikan'], entityType: 'YAYASAN', category: 'Pendidikan', skills: ['Public Speaking', 'Fasilitator Workshop'], interests: ['Edukasi Anak', 'Pemberdayaan Komunitas'], motivationTags: ['SKILL_GROWTH', 'CAREER'], dayType: 'WEEKEND', quota: 25, impactMetricLabel: 'Peserta terinspirasi', impactMetricUnit: 'orang', durationHours: 5, eventTitle: 'Kelas Inspirasi Anak Muda Berkarya', eventDescription: 'Sesi motivasi dan pelatihan kewirausahaan untuk anak muda putus sekolah.', eventLocation: 'Rumah Pintar Bakrie, Jakarta' },
  { ownerName: 'Arif Rahman', orgName: 'GoTo Impact Foundation', shortProfile: 'Yayasan CSR yang mendorong digitalisasi dan literasi keuangan UMKM.', city: 'Jakarta', causeAreas: ['Teknologi', 'UMKM'], entityType: 'YAYASAN', category: 'Teknologi', skills: ['Fasilitator Workshop'], interests: ['Teknologi untuk Sosial', 'Literasi Digital'], motivationTags: ['SKILL_GROWTH'], dayType: 'WEEKDAY', quota: 30, impactMetricLabel: 'UMKM onboarded', impactMetricUnit: 'UMKM', durationHours: 5, eventTitle: 'Pelatihan Digitalisasi UMKM GoTo', eventDescription: 'Pelatihan onboarding UMKM ke platform digital dan literasi keuangan digital.', eventLocation: 'GoTo Campus, Jakarta Selatan' },
  { ownerName: 'Winda Astuti', orgName: 'Blibli Peduli', shortProfile: 'Yayasan CSR yang mendukung inklusi digital bagi penyandang disabilitas.', city: 'Jakarta', causeAreas: ['Disabilitas', 'Sosial'], entityType: 'YAYASAN', category: 'Sosial', skills: ['Fasilitator Workshop'], interests: ['Kesetaraan & Inklusi'], motivationTags: ['VALUES', 'SOCIAL'], dayType: 'WEEKDAY', quota: 20, impactMetricLabel: 'Peserta terbantu', impactMetricUnit: 'orang', durationHours: 4, eventTitle: 'Blibli Berbagi untuk Sahabat Difabel', eventDescription: 'Pelatihan keterampilan digital dan bantuan alat bantu untuk penyandang disabilitas.', eventLocation: 'Blibli Tower, Jakarta' },
  { ownerName: 'Doni Saputra', orgName: 'Traveloka untuk Indonesia', shortProfile: 'Program CSR yang mempromosikan pariwisata lokal berkelanjutan.', city: 'Jakarta', causeAreas: ['Pariwisata Berkelanjutan'], entityType: 'YAYASAN', category: 'Seni & Budaya', skills: ['Fotografi', 'Copywriting'], interests: ['Seni & Budaya Lokal'], motivationTags: ['CAREER', 'SOCIAL'], dayType: 'WEEKEND', quota: 25, impactMetricLabel: 'UMKM terpromosikan', impactMetricUnit: 'UMKM', durationHours: 6, eventTitle: 'Dukung Pariwisata Lokal Berkelanjutan', eventDescription: 'Promosi wisata dan budaya lokal bersama pelaku UMKM pariwisata di kawasan Malioboro.', eventLocation: 'Malioboro, Yogyakarta' },
  { ownerName: 'Lina Marlina', orgName: 'BenihBaik.com', shortProfile: 'Platform filantropi yang membantu biaya pengobatan anak kurang mampu.', city: 'Jakarta', causeAreas: ['Kesehatan'], entityType: 'YAYASAN', category: 'Kesehatan', skills: ['Manajemen Acara'], interests: ['Kesehatan Masyarakat'], motivationTags: ['VALUES'], dayType: 'WEEKDAY', quota: 15, impactMetricLabel: 'Anak terbantu', impactMetricUnit: 'anak', durationHours: 4, eventTitle: 'Bantu Biaya Pengobatan Anak Kurang Mampu', eventDescription: 'Penggalangan dana dan pendampingan administrasi rumah sakit untuk anak penderita penyakit kronis.', eventLocation: 'RSUD Kota Jakarta Timur' },
  { ownerName: 'Eko Prabowo', orgName: 'Komunitas Peduli Difabel Nusantara', shortProfile: 'Komunitas yang melatih keterampilan bagi penyandang disabilitas.', city: 'Solo', causeAreas: ['Disabilitas'], entityType: 'ORGANISASI', category: 'Sosial', skills: ['Fasilitator Workshop'], interests: ['Kesetaraan & Inklusi'], motivationTags: ['SKILL_GROWTH', 'VALUES'], dayType: 'WEEKDAY', quota: 15, impactMetricLabel: 'Peserta terlatih', impactMetricUnit: 'orang', durationHours: 5, eventTitle: 'Pelatihan Keterampilan untuk Sahabat Difabel', eventDescription: 'Pelatihan menjahit dan kerajinan tangan untuk penyandang disabilitas di Kota Solo.', eventLocation: 'Balai Difabel Solo' },
  { ownerName: 'Made Sujana', orgName: 'Yayasan Peduli Lansia Sejahtera', shortProfile: 'Yayasan yang menyediakan layanan kesehatan rutin bagi warga lanjut usia.', city: 'Denpasar', causeAreas: ['Kesehatan Lansia'], entityType: 'YAYASAN', category: 'Kesehatan', skills: ['First Aid / P3K'], interests: ['Kesehatan Masyarakat'], motivationTags: ['VALUES'], dayType: 'WEEKDAY', quota: 25, impactMetricLabel: 'Lansia diperiksa', impactMetricUnit: 'orang', durationHours: 4, eventTitle: 'Posyandu Lansia Keliling', eventDescription: 'Pemeriksaan kesehatan rutin dan senam sehat untuk warga lanjut usia di Denpasar.', eventLocation: 'Balai Banjar Denpasar' },
  { ownerName: 'Galih Purnomo', orgName: 'Komunitas Musik Jalanan Positif', shortProfile: 'Komunitas musisi jalanan yang menggalang dana lewat konser amal.', city: 'Yogyakarta', causeAreas: ['Seni & Budaya'], entityType: 'ORGANISASI', category: 'Seni & Budaya', skills: ['Manajemen Acara'], interests: ['Musik & Pertunjukan'], motivationTags: ['SOCIAL'], dayType: 'WEEKEND', quota: 30, impactMetricLabel: 'Dana terkumpul', impactMetricUnit: 'donasi', durationHours: 5, eventTitle: 'Konser Amal Musisi Jalanan', eventDescription: 'Konser amal musisi jalanan untuk menggalang dana pendidikan anak jalanan.', eventLocation: 'Titik Nol Kilometer, Yogyakarta' },
  { ownerName: 'Asih Rahayu', orgName: 'Sanggar Tari Nusantara Muda', shortProfile: 'Sanggar yang melestarikan tari tradisional lewat pergelaran antar sekolah.', city: 'Solo', causeAreas: ['Seni & Budaya'], entityType: 'ORGANISASI', category: 'Seni & Budaya', skills: ['Fotografi', 'Manajemen Acara'], interests: ['Seni & Budaya Lokal'], motivationTags: ['VALUES', 'SOCIAL'], dayType: 'WEEKEND', quota: 40, impactMetricLabel: 'Penampil terlibat', impactMetricUnit: 'orang', durationHours: 6, eventTitle: 'Pergelaran Tari Tradisional Antar Sekolah', eventDescription: 'Pergelaran tari tradisional antar sekolah untuk melestarikan budaya lokal Jawa.', eventLocation: 'Taman Budaya Surakarta' },
  { ownerName: 'Rudi Hartono', orgName: 'Komunitas Baca Yuk', shortProfile: 'Komunitas yang menggerakkan wakaf buku untuk perpustakaan desa.', city: 'Malang', causeAreas: ['Literasi'], entityType: 'ORGANISASI', category: 'Pendidikan', skills: ['Mengajar'], interests: ['Edukasi Anak'], motivationTags: ['SOCIAL'], dayType: 'WEEKEND', quota: 20, impactMetricLabel: 'Buku terkumpul', impactMetricUnit: 'buku', durationHours: 4, eventTitle: 'Gerakan Wakaf Buku untuk Desa', eventDescription: 'Pengumpulan dan distribusi buku bacaan layak untuk perpustakaan desa terpencil.', eventLocation: 'Balai Desa Poncokusumo, Malang' },
  { ownerName: 'Ika Nurjanah', orgName: 'Yayasan Peduli Difabel Olahraga', shortProfile: 'Yayasan yang menggalang dana alat bantu gerak lewat kegiatan olahraga amal.', city: 'Bandung', causeAreas: ['Olahraga', 'Disabilitas'], entityType: 'YAYASAN', category: 'Umum', skills: ['Manajemen Acara'], interests: ['Olahraga & Kebugaran', 'Kesetaraan & Inklusi'], motivationTags: ['SOCIAL', 'VALUES'], dayType: 'WEEKEND', quota: 60, impactMetricLabel: 'Dana terkumpul', impactMetricUnit: 'donasi', durationHours: 5, eventTitle: 'Fun Run Amal untuk Sahabat Difabel', eventDescription: 'Lari amal 5K untuk menggalang dana alat bantu gerak penyandang disabilitas.', eventLocation: 'Gasibu, Bandung' },
  { ownerName: 'Putu Wirawan', orgName: 'Komunitas Pecinta Satwa Liar', shortProfile: 'Komunitas yang mengedukasi pelajar tentang konservasi satwa liar Indonesia.', city: 'Bogor', causeAreas: ['Konservasi Satwa'], entityType: 'ORGANISASI', category: 'Lingkungan', skills: ['Fotografi'], interests: ['Konservasi Satwa', 'Kesejahteraan Hewan'], motivationTags: ['VALUES'], dayType: 'WEEKDAY', quota: 25, impactMetricLabel: 'Pelajar teredukasi', impactMetricUnit: 'orang', durationHours: 3, eventTitle: 'Edukasi Konservasi Satwa Liar untuk Pelajar', eventDescription: 'Edukasi pengenalan satwa liar Indonesia dan bahaya perdagangan satwa ilegal untuk pelajar.', eventLocation: 'Kebun Raya Bogor' },
]

const bulkOrganizations = bulkOrganizationConfigs.map((cfg, idx) => buildBulkOrg(idx, cfg))
const allOrganizations = [...demoOrganizations, ...bulkOrganizations]

async function main() {
  for (const [name, category] of interests) {
    await prisma.interest.upsert({ where: { name }, update: { category }, create: { name, category } })
  }

  for (const [name, category] of skills) {
    await prisma.skill.upsert({ where: { name }, update: { category }, create: { name, category } })
  }

  console.log(`Seeded ${interests.length} interests dan ${skills.length} skills.`)

  // Akun organizer demo disediakan supaya ada login siap pakai utk testing
  // alur organizer (buat event, dst) — akun ini sendiri sengaja tidak disertai
  // event (organizer.demo login lalu buat event sendiri lewat CreateEventPage
  // utk testing alur submit/approval). 10 organizer+event demo di bawah
  // (demoOrganizations) TERPISAH dari akun ini — dibuat langsung PUBLISHED
  // supaya dashboard volunteer & Predictive Match Score punya katalog nyata
  // dari awal, tanpa perlu isi manual satu-satu (keputusan Rakha, 2026-07-08).
  const organizerPassword = await bcrypt.hash('activibe-dev-seed', 10)
  await prisma.user.upsert({
    where: { email: 'organizer.demo@activibe.com' },
    update: {},
    create: {
      name: 'Organizer Demo ActiVibe',
      email: 'organizer.demo@activibe.com',
      password: organizerPassword,
      role: 'ORGANIZER',
      isVerified: true,
    },
  })

  const skillsByName = new Map((await prisma.skill.findMany()).map((s) => [s.name, s.id]))
  const interestsByName = new Map((await prisma.interest.findMany()).map((i) => [i.name, i.id]))

  for (const demo of allOrganizations) {
    const owner = await prisma.user.upsert({
      where: { email: demo.ownerEmail },
      update: { name: demo.ownerName, role: 'ORGANIZER' },
      create: {
        name: demo.ownerName,
        email: demo.ownerEmail,
        password: organizerPassword,
        role: 'ORGANIZER',
        isVerified: true,
      },
    })

    const logoUrl = copyOrganizerPhoto(demo.photoFile)
    const orgData = {
      name: demo.orgName,
      logoUrl,
      shortProfile: demo.shortProfile,
      location: demo.location,
      email: demo.ownerEmail,
      phone: demo.phone,
      causeAreas: demo.causeAreas,
      status: 'ACTIVE',
    }

    const existingOrg = await prisma.organization.findFirst({ where: { ownerId: owner.id } })
    const organization = existingOrg
      ? await prisma.organization.update({ where: { id: existingOrg.id }, data: orgData })
      : await prisma.organization.create({ data: { ownerId: owner.id, ...orgData } })

    // Galeri foto event — reuse foto organizer (11)..(24).jpg yang belum
    // kepakai jadi logo (lihat komentar EVENT_GALLERY_TARGET_DIR di atas),
    // supaya event.photos tidak kosong & tidak fallback ke EventGalleryHero.
    const galleryImages = demo.event.galleryPhotoNums
      .map((num, index) => {
        const fileName = `event-${demo.event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${num}.jpg`
        const imageUrl = copyEventGalleryPhoto(num, fileName)
        return imageUrl ? { imageUrl, fileName, sortOrder: index } : null
      })
      .filter(Boolean)

    const existingEvent = await prisma.event.findFirst({ where: { title: demo.event.title } })
    if (existingEvent) {
      // Event demo sudah ada dari run seed sebelumnya (mis. sebelum galeri foto
      // ditambahkan ke seed ini) — lengkapi galerinya kalau masih kosong, tanpa
      // bikin ulang event-nya (supaya interaksi/applications yg mungkin sudah
      // ada tidak ikut kehapus).
      const hasGallery = await prisma.eventGalleryImage.count({ where: { eventId: existingEvent.id } })
      if (hasGallery === 0 && galleryImages.length > 0) {
        await prisma.eventGalleryImage.createMany({
          data: galleryImages.map((g) => ({ ...g, eventId: existingEvent.id })),
        })
      }
      continue
    }

    const skillIds = demo.event.skills.map((name) => skillsByName.get(name)).filter(Boolean)
    const interestIds = demo.event.interests.map((name) => interestsByName.get(name)).filter(Boolean)

    // Dokumen pendukung (proposal/rundown/poster/surat dll) & EventLegalDocument
    // SENGAJA tidak diisi sama sekali di sini — tetap null/default, sesuai
    // keputusan Rakha (data PDF dikosongkan dulu utk 10 event demo ini).
    await prisma.event.create({
      data: {
        organizerId: owner.id,
        organizationId: organization.id,
        title: demo.event.title,
        description: demo.event.description,
        location: demo.event.location,
        quota: demo.event.quota,
        startDate: new Date(demo.event.start),
        endDate: new Date(demo.event.end),
        status: 'PUBLISHED',
        impactMetricLabel: demo.event.impactMetricLabel,
        impactMetricUnit: demo.event.impactMetricUnit,
        category: demo.event.category,
        motivationTags: demo.event.motivationTags,
        dayType: demo.event.dayType,
        eventMode: 'OFFLINE',
        organizationEntityType: demo.entityType,
        eventSkills: { create: skillIds.map((skillId) => ({ skillId })) },
        eventInterests: { create: interestIds.map((interestId) => ({ interestId })) },
        galleryImages: { create: galleryImages },
      },
    })
  }
  console.log(`Seeded ${allOrganizations.length} organizer demo + event (PDF/dokumen pendukung sengaja kosong).`)

  const adminPassword = await bcrypt.hash('12345678', 10)
  await prisma.user.upsert({
    where: { email: 'admin1@gmail.com' },
    update: {
      name: 'Admin ActiVibe',
      password: adminPassword,
      role: 'ADMIN',
      isVerified: true,
    },
    create: {
      name: 'Admin ActiVibe',
      email: 'admin1@gmail.com',
      password: adminPassword,
      role: 'ADMIN',
      isVerified: true,
    },
  })
  console.log('Seeded admin account admin1@gmail.com.')

  const admin = await prisma.user.findUnique({ where: { email: 'admin1@gmail.com' } })
  await prisma.certificateTemplate.upsert({
    where: { id: 'cert-template-default' },
    update: {},
    create: {
      id: 'cert-template-default',
      name: 'Sertifikat Volunteer (Default)',
      fileUrl: '/uploads/certificate-templates/default-template.pdf',
      isActive: true,
      uploadedById: admin.id,
    },
  })
  console.log('Seeded default active CertificateTemplate.')
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
