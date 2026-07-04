import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

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

// Event evt-1..evt-8 dipilih supaya id-nya SAMA PERSIS dengan
// frontend/src/data/mockEvents.ts — form "Daftar" di FindActivityPage sudah
// live memanggil POST /applications dengan id ini, jadi begitu Application.eventId
// jadi foreign key sungguhan, baris Event ini wajib ada duluan atau alur itu patah.
const events = [
  { id: 'evt-1', title: 'Bersih Pantai Parangtritis', location: 'Parangtritis, Bantul', quota: 30, startDate: '2026-07-12', endDate: '2026-07-12', impactMetricLabel: 'Kg sampah diangkat', impactMetricUnit: 'kg' },
  { id: 'evt-2', title: 'Mengajar Baca Tulis Anak Pesisir', location: 'Tepus, Gunungkidul', quota: 15, startDate: '2026-07-18', endDate: '2026-08-09', impactMetricLabel: 'Jumlah anak diajar', impactMetricUnit: 'anak' },
  { id: 'evt-3', title: 'Posyandu Keliling Desa Sehat', location: 'Dlingo, Bantul', quota: 20, startDate: '2026-07-20', endDate: '2026-07-20', impactMetricLabel: 'Jumlah warga diperiksa', impactMetricUnit: 'orang' },
  { id: 'evt-4', title: 'Dapur Umum Tanggap Bencana', location: 'Sleman', quota: 25, startDate: '2026-07-05', endDate: '2026-07-08', impactMetricLabel: 'Jumlah porsi makanan disalurkan', impactMetricUnit: 'porsi' },
  { id: 'evt-5', title: 'Donor Darah & Edukasi Kesehatan Kampus', location: 'Yogyakarta', quota: 50, startDate: '2026-08-02', endDate: '2026-08-02', impactMetricLabel: 'Jumlah pendonor', impactMetricUnit: 'orang' },
  { id: 'evt-6', title: 'Taman Bacaan Komunitas Malioboro', location: 'Malioboro, Yogyakarta', quota: 12, startDate: '2026-07-11', endDate: '2026-09-26', impactMetricLabel: 'Jumlah pengunjung taman bacaan', impactMetricUnit: 'orang' },
  { id: 'evt-7', title: 'Penghijauan Lereng Merapi', location: 'Cangkringan, Sleman', quota: 40, startDate: '2026-07-26', endDate: '2026-07-26', impactMetricLabel: 'Jumlah bibit ditanam', impactMetricUnit: 'bibit' },
  { id: 'evt-8', title: 'Pendampingan Lansia Panti Wreda', location: 'Bantul', quota: 10, startDate: '2026-08-15', endDate: '2026-08-15', impactMetricLabel: 'Jumlah lansia didampingi', impactMetricUnit: 'orang' },
]

async function main() {
  for (const [name, category] of interests) {
    await prisma.interest.upsert({ where: { name }, update: { category }, create: { name, category } })
  }

  for (const [name, category] of skills) {
    await prisma.skill.upsert({ where: { name }, update: { category }, create: { name, category } })
  }

  console.log(`Seeded ${interests.length} interests dan ${skills.length} skills.`)

  const organizerPassword = await bcrypt.hash('activibe-dev-seed', 10)
  const organizer = await prisma.user.upsert({
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

  try {
    for (const event of events) {
      await prisma.event.upsert({
        where: { id: event.id },
        update: {},
        create: {
          id: event.id,
          organizerId: organizer.id,
          title: event.title,
          description: event.title,
          location: event.location,
          quota: event.quota,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
          status: 'PUBLISHED',
          impactMetricLabel: event.impactMetricLabel,
          impactMetricUnit: event.impactMetricUnit,
        },
      })
    }

    console.log(`Seeded ${events.length} events (evt-1..evt-${events.length}) milik ${organizer.email}.`)
  } catch (err) {
    if (err?.code === 'P2021') {
      console.warn('Skipping event seed because the Event table is not present in this database yet.')
    } else {
      throw err
    }
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
