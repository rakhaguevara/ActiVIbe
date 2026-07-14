import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib'
import type { ReportsOverview, EventBreakdownRow } from '../lib/reportsApi'
import type { OrganizerVolunteer } from '../types/organizer'

// Reuse download-trigger yang sudah ada (Blob+<a download>, generik bytes+
// filename) — jangan reimplement, lihat certificateGenerator.ts.
export { downloadCertificatePdf as downloadPdf } from './certificateGenerator'

// Escaping CSV plain-string, sama persis toCsvValue di
// frontend/src/pages/admin/ParticipationExportPage.tsx — disalin lokal (bukan
// diimpor lintas folder admin/organizer) krn fungsi murni 2 baris, pola yang
// sama juga dipakai communication-views/CommunicationLogView.tsx.
// Diekspor (bukan cuma lokal) supaya EventsPage.tsx/VolunteersPage.tsx bisa
// reuse langsung utk CSV export event/volunteer list mereka sendiri, bukan
// menduplikasi lagi fungsi 2 baris ini di file ketiga/keempat.
export function toCsvValue(value: string | number) {
  const str = String(value)
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

function buildCsv(header: string[], rows: (string | number)[][]) {
  return [header, ...rows].map((row) => row.map(toCsvValue).join(',')).join('\n')
}

export function downloadCsv(csvString: string, fileName: string) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Laporan Overview bukan data tabular satu bentuk (KPI + recent activity) —
// dua "tabel" digabung satu file CSV dipisah baris kosong, pola paling jujur
// utk merepresentasikan bentuk data aslinya tanpa memaksakan satu tabel.
export function buildOverviewCsv(overview: ReportsOverview): string {
  const kpiRows: (string | number)[][] = [
    ['Kegiatan Aktif', overview.activeEvents],
    ['Pelamar Menunggu', overview.pendingApplicants],
    ['Volunteer Diterima', overview.acceptedVolunteers],
    ['Kegiatan Perlu Ditutup', overview.eventsNeedClosing],
    ['Kehadiran Hari Ini', `${overview.todayAttendance.checkedIn}/${overview.todayAttendance.expected}`],
    ['Total Kegiatan Selesai (Sepanjang Waktu)', overview.totals.eventsCompleted],
    ['Total Volunteer Terjangkau (Sepanjang Waktu)', overview.totals.volunteersReached],
    ['Total Jam Kontribusi (Sepanjang Waktu)', overview.totals.contributionHours],
    [`Impact: ${overview.totals.impact.label}`, `${overview.totals.impact.value} ${overview.totals.impact.unit}`],
    ['Kegiatan Selesai Bulan Ini', overview.thisMonth.eventsCompleted],
    ['Volunteer Terjangkau Bulan Ini', overview.thisMonth.volunteersReached],
    ['Jam Kontribusi Bulan Ini', overview.thisMonth.contributionHours],
  ]
  if (overview.applicantsInRange !== null) {
    kpiRows.push(['Pendaftar Baru pada Rentang Tanggal Terpilih', overview.applicantsInRange])
  }
  const kpiCsv = buildCsv(['Metrik', 'Nilai'], kpiRows)

  const activityRows = overview.recentActivity.map((a) => [
    new Date(a.timestamp).toLocaleString('id-ID'),
    a.action,
    a.targetLabel,
  ])
  const activityCsv = buildCsv(['Waktu', 'Aksi', 'Target'], activityRows)

  return `${kpiCsv}\n\nAktivitas Terbaru\n${activityCsv}`
}

export function buildEventBreakdownCsv(rows: EventBreakdownRow[]): string {
  const header = ['Judul Event', 'Status', 'Kategori', 'Tanggal Mulai', 'Tanggal Selesai', 'Jumlah Pendaftar', 'Diterima', 'Hadir', 'Jam Kontribusi']
  const body = rows.map((r) => [
    r.title,
    r.status,
    r.category ?? '—',
    new Date(r.startDate).toLocaleDateString('id-ID'),
    new Date(r.endDate).toLocaleDateString('id-ID'),
    r.applicantsCount,
    r.acceptedCount,
    r.attendedCount,
    r.contributionHours === null ? '—' : r.contributionHours,
  ])
  return buildCsv(header, body)
}

const TEXT_COLOR = rgb(0.16, 0.16, 0.16)
const MUTED_COLOR = rgb(0.45, 0.45, 0.45)
const MARGIN = 56
const PAGE_HEIGHT = 841.89 // A4 potrait
const PAGE_WIDTH = 595.28 // A4 potrait

// Semua laporan Phase 6 pakai bentuk yang sama: blank page + teks berbaris
// (bukan sertifikat bertemplate) — satu writer paginated dipakai bersama
// (Overview/Event Breakdown/Volunteer List) drpd menduplikasi logic
// ensureSpace/addPage 3x, pola dasarnya sama dgn volunteerProfilePdf.ts.
async function createPaginatedTextPdf() {
  const pdfDoc = await PDFDocument.create()
  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  let cursorY = page.getHeight() - MARGIN

  function drawLine(text: string, size: number, font: PDFFont = bodyFont, color = TEXT_COLOR, gap = 16) {
    if (cursorY - gap < MARGIN) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
      cursorY = page.getHeight() - MARGIN
    }
    page.drawText(text, { x: MARGIN, y: cursorY, size, font, color })
    cursorY -= gap
  }

  return { pdfDoc, titleFont, bodyFont, drawLine }
}

// Laporan overview polos (bukan sertifikat) — blank page + teks berbaris,
// sama pola dgn volunteerProfilePdf.ts. Halaman baru otomatis dibuka kalau
// kursor mendekati bawah, supaya Recent Activity yang panjang tidak terpotong.
export async function buildOverviewReportPdf(overview: ReportsOverview, organizationName: string): Promise<Uint8Array> {
  const { pdfDoc, titleFont, bodyFont, drawLine } = await createPaginatedTextPdf()

  drawLine(`Laporan Ringkasan — ${organizationName}`, 20, titleFont, TEXT_COLOR, 28)
  drawLine(`Dibuat: ${new Date().toLocaleString('id-ID')}`, 11, bodyFont, MUTED_COLOR, 24)
  if (overview.range.from || overview.range.to) {
    drawLine(`Rentang tanggal: ${overview.range.from ?? '—'} s/d ${overview.range.to ?? '—'}`, 11, bodyFont, MUTED_COLOR, 24)
  }

  drawLine('Ringkasan Angka', 14, titleFont, TEXT_COLOR, 22)
  const kpiLines: [string, string][] = [
    ['Kegiatan Aktif', String(overview.activeEvents)],
    ['Pelamar Menunggu', String(overview.pendingApplicants)],
    ['Volunteer Diterima', String(overview.acceptedVolunteers)],
    ['Kegiatan Perlu Ditutup', String(overview.eventsNeedClosing)],
    ['Kehadiran Hari Ini', `${overview.todayAttendance.checkedIn}/${overview.todayAttendance.expected}`],
    ['Total Kegiatan Selesai', String(overview.totals.eventsCompleted)],
    ['Total Volunteer Terjangkau', String(overview.totals.volunteersReached)],
    ['Total Jam Kontribusi', String(overview.totals.contributionHours)],
    [`Impact (${overview.totals.impact.label})`, `${overview.totals.impact.value} ${overview.totals.impact.unit}`],
  ]
  if (overview.applicantsInRange !== null) {
    kpiLines.push(['Pendaftar Baru pada Rentang Terpilih', String(overview.applicantsInRange)])
  }
  for (const [label, value] of kpiLines) {
    drawLine(`${label}: ${value}`, 12, bodyFont, TEXT_COLOR, 18)
  }

  drawLine('Aktivitas Terbaru', 14, titleFont, TEXT_COLOR, 22)
  if (overview.recentActivity.length === 0) {
    drawLine('Belum ada aktivitas.', 11, bodyFont, MUTED_COLOR, 16)
  } else {
    for (const activity of overview.recentActivity) {
      const time = new Date(activity.timestamp).toLocaleString('id-ID')
      const text = `${time} — ${activity.action}${activity.targetLabel ? ` (${activity.targetLabel})` : ''}`
      drawLine(text, 10.5, bodyFont, TEXT_COLOR, 15)
    }
  }

  return pdfDoc.save()
}

// Event Breakdown bentuknya tabular banyak baris — PDF-nya sengaja tetap
// teks-per-baris polos (bukan tabel bergaris pdf-lib yang lebih kompleks),
// CSV tetap jalur yang lebih cocok utk data tabular besar, tapi tombol PDF
// harus tetap berfungsi utk kedua tipe laporan (keputusan produk Phase 6).
export async function buildEventBreakdownPdf(rows: EventBreakdownRow[], organizationName: string): Promise<Uint8Array> {
  const { pdfDoc, titleFont, bodyFont, drawLine } = await createPaginatedTextPdf()

  drawLine(`Laporan Rincian per Event — ${organizationName}`, 16, titleFont, TEXT_COLOR, 26)
  drawLine(`Dibuat: ${new Date().toLocaleString('id-ID')}`, 11, bodyFont, MUTED_COLOR, 22)

  if (rows.length === 0) {
    drawLine('Tidak ada event pada rentang/filter yang dipilih.', 11, bodyFont, MUTED_COLOR, 16)
  } else {
    for (const r of rows) {
      const hours = r.contributionHours === null ? '—' : `${r.contributionHours} jam`
      drawLine(r.title, 12, titleFont, TEXT_COLOR, 16)
      drawLine(`Status: ${r.status} · Pendaftar: ${r.applicantsCount} · Diterima: ${r.acceptedCount} · Hadir: ${r.attendedCount} · Jam Kontribusi: ${hours}`, 10, bodyFont, MUTED_COLOR, 18)
    }
  }

  return pdfDoc.save()
}

// Daftar volunteer (VolunteersPage.tsx "Export Data") — field yang sama
// dgn yang ditampilkan tabel volunteer (OrganizerVolunteer, dari
// GET /organizer/volunteers), bukan angka baru yang dihitung ulang di sini.
export function buildVolunteersCsv(volunteers: OrganizerVolunteer[]): string {
  const header = ['Nama', 'Email', 'Telepon', 'Lokasi', 'Skills', 'Kegiatan Diikuti', 'Jam Kontribusi', 'Tingkat Kehadiran', 'No-show', 'Volunteer Kembali']
  const rows = volunteers.map((v) => [
    v.name,
    v.email,
    v.phone ?? '—',
    v.location ?? '—',
    v.skills.join('; '),
    v.eventsJoined,
    v.hoursCompleted,
    v.attendanceRatePercent === null ? '—' : `${v.attendanceRatePercent}%`,
    v.noShowCount,
    v.returningVolunteer ? 'Ya' : 'Tidak',
  ])
  return buildCsv(header, rows)
}

// "Download Report" (PDF) — ringkasan yang sama isinya dgn CSV di atas,
// disajikan berbaris per volunteer (bukan tabel pdf-lib, sama pola dgn
// buildEventBreakdownPdf).
export async function buildVolunteersListPdf(volunteers: OrganizerVolunteer[], organizationName: string): Promise<Uint8Array> {
  const { pdfDoc, titleFont, bodyFont, drawLine } = await createPaginatedTextPdf()

  drawLine(`Laporan Daftar Volunteer — ${organizationName}`, 16, titleFont, TEXT_COLOR, 26)
  drawLine(`Dibuat: ${new Date().toLocaleString('id-ID')}`, 11, bodyFont, MUTED_COLOR, 22)

  if (volunteers.length === 0) {
    drawLine('Belum ada volunteer.', 11, bodyFont, MUTED_COLOR, 16)
  } else {
    for (const v of volunteers) {
      const attendance = v.attendanceRatePercent === null ? '—' : `${v.attendanceRatePercent}%`
      drawLine(`${v.name} (${v.email})`, 12, titleFont, TEXT_COLOR, 16)
      drawLine(`Kegiatan: ${v.eventsJoined} · Jam: ${v.hoursCompleted} · Kehadiran: ${attendance} · No-show: ${v.noShowCount}`, 10, bodyFont, MUTED_COLOR, 18)
    }
  }

  return pdfDoc.save()
}
