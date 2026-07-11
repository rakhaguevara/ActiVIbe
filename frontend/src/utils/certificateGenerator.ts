import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { resolveAssetUrl } from '../lib/assetUrl'

export interface CertificateData {
  participantName: string
  eventTitle: string
  // URL template (dari CertificateTemplate admin-managed, lihat
  // backend/src/modules/admin/admin.service.js) — beda sertifikat bisa
  // dirender dari template yang beda persis (snapshot historis, lihat
  // CertificateVersion), makanya wajib dioper eksplisit tiap panggilan,
  // tidak lagi hardcode 1 file statis.
  templateUrl: string
  // Logo organizer, opsional — kalau organizer belum upload logo, tidak
  // ada placeholder yang di-render (bukan fabrikasi data).
  organizationLogoUrl?: string | null
}

const TEXT_COLOR = rgb(0.16, 0.16, 0.16)

const templateByteCache = new Map<string, Promise<ArrayBuffer>>()

async function loadBytes(url: string): Promise<ArrayBuffer> {
  const resolved = resolveAssetUrl(url)
  let cached = templateByteCache.get(resolved)
  if (!cached) {
    cached = fetch(resolved).then((res) => res.arrayBuffer())
    templateByteCache.set(resolved, cached)
  }
  return cached
}

const PAGE_MARGIN = 60
const MIN_FONT_SIZE = 10

// Nama/judul kegiatan panjangnya tidak bisa diprediksi (input organizer
// bebas) — font mengecil bertahap dulu sebelum ditulis supaya tidak
// meluber keluar halaman, bukan dipotong (truncate akan menghilangkan
// info, mengecilkan ukuran tidak).
function drawCentered(
  page: import('pdf-lib').PDFPage,
  text: string,
  y: number,
  font: import('pdf-lib').PDFFont,
  maxSize: number,
) {
  const maxWidth = page.getWidth() - PAGE_MARGIN * 2
  let size = maxSize
  while (size > MIN_FONT_SIZE && font.widthOfTextAtSize(text, size) > maxWidth) {
    size -= 1
  }
  const width = font.widthOfTextAtSize(text, size)
  page.drawText(text, {
    x: page.getWidth() / 2 - width / 2,
    y,
    size,
    font,
    color: TEXT_COLOR,
  })
}

// Koordinat dikalibrasi manual terhadap Sertifikat-template1.pdf (halaman
// A4 landscape, 842.25 x 595.5 pt) — nama diisi di atas garis bawah tanda
// tangan "Diberikan kepada:", nama kegiatan di bawah baris
// "Telah Menjadi Volunteer pada kegiatan:", logo organizer di celah bersih
// pojok kanan bawah (di antara ujung crayon & daun ilustrasi). Kalau admin
// upload template baru dgn layout beda, ketiga koordinat ini perlu
// dikalibrasi ulang (render → screenshot → sesuaikan, lihat riwayat kalibrasi
// awal di percakapan/komentar PR).
const NAME_Y = 240
const EVENT_TITLE_Y = 140
const LOGO_X = 745
const LOGO_Y = 95
const LOGO_SIZE = 55

export async function generateCertificatePdf({
  participantName,
  eventTitle,
  templateUrl,
  organizationLogoUrl,
}: CertificateData): Promise<Uint8Array> {
  const templateBytes = await loadBytes(templateUrl)
  const pdfDoc = await PDFDocument.load(templateBytes)
  const page = pdfDoc.getPages()[0]

  const nameFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const eventFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  drawCentered(page, participantName, NAME_Y, nameFont, 22)
  drawCentered(page, eventTitle, EVENT_TITLE_Y, eventFont, 16)

  if (organizationLogoUrl) {
    const logoBytes = await loadBytes(organizationLogoUrl)
    const isPng = organizationLogoUrl.toLowerCase().endsWith('.png')
    const logoImage = isPng ? await pdfDoc.embedPng(logoBytes) : await pdfDoc.embedJpg(logoBytes)
    page.drawImage(logoImage, { x: LOGO_X, y: LOGO_Y, width: LOGO_SIZE, height: LOGO_SIZE })
  }

  return pdfDoc.save()
}

export function downloadCertificatePdf(bytes: Uint8Array, fileName: string) {
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
