import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const prisma = new PrismaClient()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Sumber foto organizer demo — file asli di-bundle di frontend (aset yang
// sudah ada, bukan foto baru), di-copy ke backend/uploads/organizations supaya
// bisa di-serve lewat express.static('/uploads', ...) sbg Organization.logoUrl.
// Copy dilakukan di sini (bukan manual sekali jalan) supaya seed tetap
// reproducible di clone/environment lain.
const ORGANIZER_PHOTO_SOURCE_DIR = path.join(__dirname, '..', '..', 'frontend', 'src', 'assets', 'data-organizer')
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

  for (const demo of demoOrganizations) {
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
  console.log(`Seeded ${demoOrganizations.length} organizer demo + event (PDF/dokumen pendukung sengaja kosong).`)

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
