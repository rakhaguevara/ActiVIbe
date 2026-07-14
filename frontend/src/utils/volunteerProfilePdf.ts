import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import type { OrganizerVolunteer } from '../types/organizer'

const TEXT_COLOR = rgb(0.16, 0.16, 0.16)
const MUTED_COLOR = rgb(0.45, 0.45, 0.45)
const MARGIN = 56

// Ringkasan profil polos (bukan sertifikat, tidak pakai template) — cukup
// blank page + teks, konsisten dgn prinsip "tidak ada data dikarang": semua
// baris di sini langsung dari field OrganizerVolunteer yang sudah tampil di
// drawer, tidak ada angka baru yang dihitung ulang di sini.
export async function generateVolunteerProfilePdf(volunteer: OrganizerVolunteer): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89]) // A4 potrait
  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

  let cursorY = page.getHeight() - MARGIN

  const drawLine = (text: string, size: number, font = bodyFont, color = TEXT_COLOR, gap = 20) => {
    page.drawText(text, { x: MARGIN, y: cursorY, size, font, color })
    cursorY -= gap
  }

  drawLine(volunteer.name, 22, titleFont, TEXT_COLOR, 30)
  drawLine('Ringkasan Profil Volunteer', 12, bodyFont, MUTED_COLOR, 30)

  const attendanceDisplay = volunteer.attendanceRatePercent === null ? '—' : `${volunteer.attendanceRatePercent}%`

  const rows: [string, string][] = [
    ['Email', volunteer.email || '—'],
    ['Telepon', volunteer.phone ?? '—'],
    ['Lokasi', volunteer.location ?? '—'],
    ['Skills', volunteer.skills.length > 0 ? volunteer.skills.join(', ') : 'Belum ada skill tercatat'],
    ['Kegiatan Diikuti', String(volunteer.eventsJoined)],
    ['Jam Kontribusi', `${volunteer.hoursCompleted} jam`],
    ['Tingkat Kehadiran', attendanceDisplay],
  ]

  for (const [label, value] of rows) {
    drawLine(label, 11, titleFont, MUTED_COLOR, 16)
    drawLine(value, 13, bodyFont, TEXT_COLOR, 26)
  }

  return pdfDoc.save()
}
