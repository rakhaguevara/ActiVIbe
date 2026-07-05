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

async function main() {
  for (const [name, category] of interests) {
    await prisma.interest.upsert({ where: { name }, update: { category }, create: { name, category } })
  }

  for (const [name, category] of skills) {
    await prisma.skill.upsert({ where: { name }, update: { category }, create: { name, category } })
  }

  console.log(`Seeded ${interests.length} interests dan ${skills.length} skills.`)

  // Akun organizer demo disediakan supaya ada login siap pakai utk testing
  // alur organizer (buat event, dst) — SENGAJA tidak disertai event/kegiatan
  // apa pun, supaya dashboard volunteer benar-benar kosong sampai organizer
  // membuat & mempublikasikan event sendiri lewat CreateEventPage.
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
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
