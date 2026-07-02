import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Data taxonomy placeholder — dipakai supaya onboarding wizard (FR-023)
// punya opsi buat ditampilkan di dev/lokal. Bukan copy final, cuma cukup
// buat testing end-to-end sampai ada daftar resmi dari produk.
const interests = [
  ['Lingkungan', 'Lingkungan'],
  ['Konservasi Satwa', 'Lingkungan'],
  ['Bencana Alam', 'Kemanusiaan'],
  ['Kesehatan Masyarakat', 'Kemanusiaan'],
  ['Edukasi Anak', 'Sosial'],
  ['Pemberdayaan Komunitas', 'Sosial'],
  ['Fotografi', 'Kreatif'],
  ['Desain Grafis', 'Kreatif'],
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
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
