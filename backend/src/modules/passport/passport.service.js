// Impact Passport (frontend: components/passport-book/PassportBook.tsx) —
// satu-satunya sumber data untuk buku ini. Semua angka di bawah dihitung
// langsung dari data real (Application COMPLETED milik user + Event terkait),
// TIDAK ada field yang dikarang/dummy. Kalau suatu data belum punya sumber
// backend (mis. galeri foto per-volunteer, catatan dampak lingkungan bebas
// teks, kata dari penerima manfaat), field itu sengaja tidak diisi apa pun
// (undefined) — frontend (buildPages di PassportBook.tsx) yang memutuskan
// untuk skip halaman terkait, bukan backend menampilkan placeholder karangan.
import { prisma } from '../../config/prisma.js'
import { deriveSkillXp } from './skillXp.js'

// Formula gamifikasi "Poin Reward" — tidak ada konsep poin di backend sama
// sekali, jadi diturunkan deterministik dari 2 angka real yang sudah ada
// (jam kontribusi & jumlah kegiatan selesai), bukan angka yang dikarang per
// user. Konstanta ini murni presentasi, aman diubah kapan saja tanpa migrasi.
const POINTS_PER_HOUR = 10
const POINTS_PER_EVENT = 50

function hoursBetween(startDate, endDate) {
  const ms = new Date(endDate).getTime() - new Date(startDate).getTime()
  return Math.max(0, ms / (1000 * 60 * 60))
}

export async function getMyPassport(userId) {
  const applications = await prisma.application.findMany({
    where: { userId, status: 'COMPLETED' },
    select: {
      id: true,
      eventId: true,
      event: {
        select: {
          title: true,
          description: true,
          location: true,
          category: true,
          startDate: true,
          endDate: true,
          organizationId: true,
          organizer: { select: { name: true } },
          eventSkills: { select: { skill: { select: { name: true } } } },
          // Galeri dokumentasi event asli (milik organizer, bukan per-
          // volunteer — belum ada model upload foto per-volunteer di backend)
          // dipakai sbg foto chapter: real, bukan foto punya volunteer itu
          // sendiri, tapi tetap foto asli kegiatan yang sama.
          galleryImages: { orderBy: { sortOrder: 'asc' }, select: { imageUrl: true } },
          // Laporan penutupan kegiatan organizer (EventCloseReport) — arsip
          // resmi "apa yang sebenarnya terjadi", dipakai sbg fallback summary
          // & tambahan foto chapter. SENGAJA cuma field organizer-authored ini
          // yang di-select di sini — feedback.rating/comment (volunteer-
          // authored) tetap dari relasi `feedback` terpisah di bawah, tidak
          // pernah ditimpa oleh data organizer.
          closeReport: { select: { narrativeSummary: true, impactSummary: true, photoUrls: true } },
        },
      },
      impactLog: { select: { metricLabel: true, value: true, unit: true, aiHeadline: true } },
      feedback: { select: { rating: true, comment: true } },
    },
    orderBy: { event: { startDate: 'asc' } },
  })

  // NB: EventCloseReport.totalContributionHours (kalau ada) adalah AGREGAT
  // level-event (total jam semua volunteer digabung, diisi organizer sekali
  // per event) — bukan angka per-volunteer, jadi TIDAK BOLEH dipakai di sini
  // menggantikan hoursBetween() per-application (kalau iya, setiap volunteer
  // salah dikreditkan total jam seluruh event).
  const totalHours = applications.reduce(
    (sum, app) => sum + hoursBetween(app.event.startDate, app.event.endDate),
    0,
  )
  const eventsCompleted = applications.length
  const ngoCount = new Set(
    applications.map((app) => app.event.organizationId ?? app.event.organizer.name),
  ).size
  const points = Math.round(totalHours * POINTS_PER_HOUR + eventsCompleted * POINTS_PER_EVENT)

  // Urutan skill: yang paling sering muncul di kegiatan selesai duluan
  // (paling "dikuasai"), bukan alfabetis — count-nya sekaligus menentukan
  // xpTotal jadi urutan ini otomatis konsisten dgn level/xp yang ditampilkan.
  const skillEventCounts = new Map()
  applications.forEach((app) => {
    app.event.eventSkills.forEach(({ skill }) => {
      skillEventCounts.set(skill.name, (skillEventCounts.get(skill.name) ?? 0) + 1)
    })
  })
  const skills = Array.from(skillEventCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, ...deriveSkillXp(count) }))

  const chapters = applications.map((app) => {
    // closeReport.photoUrls (dokumentasi yang di-upload organizer saat close
    // event) digabung ke galeri event asli — keduanya sama-sama foto
    // organizer-authored, cuma sumber upload-nya beda titik waktu.
    const galleryPhotos = [
      ...app.event.galleryImages.map((image) => image.imageUrl),
      ...(app.event.closeReport?.photoUrls ?? []),
    ]
    return {
      id: app.id,
      eventId: app.eventId,
      eventTitle: app.event.title,
      organizerName: app.event.organizer.name,
      location: app.event.location,
      date: app.event.startDate.toISOString(),
      category: app.event.category ?? 'Umum',
      heroPhotoUrl: galleryPhotos[0],
      // Narasi AI (ImpactLog.aiHeadline) kalau ada, jatuh ke ringkasan
      // laporan penutupan organizer (EventCloseReport.narrativeSummary, lebih
      // spesifik drpd deskripsi event generik), lalu deskripsi event sbg
      // fallback terakhir — semuanya data real, bukan teks karangan generik.
      summary: app.impactLog?.aiHeadline ?? app.event.closeReport?.narrativeSummary ?? app.event.description,
      // Catatan dampak bebas teks dari laporan penutupan organizer (mis.
      // "berapa pohon ditanam", "dampak keberhasilan acara") — murni
      // additive, tidak mengganti `impact` (angka ImpactLog) di bawah.
      impactNarrative: app.event.closeReport?.impactSummary ?? undefined,
      impact: app.impactLog
        ? {
            metricLabel: app.impactLog.metricLabel,
            value: app.impactLog.value,
            unit: app.impactLog.unit,
          }
        : undefined,
      galleryPhotos,
      // Rating & komentar dari volunteer sendiri (EventFeedback) — TIDAK
      // PERNAH diisi/ditimpa dari EventCloseReport (yang organizer-authored),
      // ini batasan eksplisit "kecuali bagian yang user isi sendiri".
      feedback: app.feedback
        ? { rating: app.feedback.rating, comment: app.feedback.comment ?? '' }
        : undefined,
    }
  })

  return {
    stats: {
      totalHours: Math.round(totalHours * 10) / 10,
      eventsCompleted,
      ngoCount,
      points,
    },
    skills,
    chapters,
  }
}
