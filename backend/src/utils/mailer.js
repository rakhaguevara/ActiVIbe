import { Resend } from 'resend'
import { env } from '../config/env.js'

const resendClient = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null

// Tanpa RESEND_API_KEY (dev lokal), jangan gagal keras — log link-nya saja
// ke console supaya flow aktivasi tetap bisa dites manual, sama seperti pola
// fallback AI provider di ai.service.js.
export async function sendOrganizationActivationEmail(to, { organizationName, activationUrl }) {
  if (!resendClient) {
    console.log(`[mailer] RESEND_API_KEY kosong — link aktivasi untuk "${organizationName}" (${to}): ${activationUrl}`)
    return
  }

  await resendClient.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: `Aktivasi pendaftaran organisasi "${organizationName}" di ActiVibe`,
    html: `
      <p>Halo,</p>
      <p>Terima kasih sudah mendaftarkan <strong>${organizationName}</strong> di ActiVibe.</p>
      <p>Klik tombol di bawah untuk mengaktifkan organisasi kamu dan akses dashboard organizer:</p>
      <p><a href="${activationUrl}" style="display:inline-block;padding:12px 20px;background:#5B21B6;color:#fff;border-radius:8px;text-decoration:none;">Aktifkan Organisasi</a></p>
      <p>Link ini berlaku selama 24 jam. Kalau kamu tidak merasa mendaftarkan organisasi ini, abaikan saja email ini.</p>
    `,
  })
}

export async function sendOtpEmail(to, { name, code, expiryMinutes }) {
  if (!resendClient) {
    console.log(`[mailer] RESEND_API_KEY kosong — kode OTP registrasi untuk ${to}: ${code} (berlaku ${expiryMinutes} menit)`)
    return
  }

  await resendClient.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: 'Kode verifikasi registrasi ActiVibe',
    html: `
      <p>Halo ${name},</p>
      <p>Gunakan kode berikut untuk menyelesaikan registrasi akun ActiVibe kamu:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:4px;">${code}</p>
      <p>Kode ini berlaku selama ${expiryMinutes} menit. Kalau kamu tidak merasa mendaftar di ActiVibe, abaikan saja email ini.</p>
    `,
  })
}

function formatDateRange(startDate, endDate) {
  return startDate.toDateString() === endDate.toDateString()
    ? startDate.toLocaleDateString('id-ID', { dateStyle: 'long' })
    : `${startDate.toLocaleDateString('id-ID', { dateStyle: 'long' })} – ${endDate.toLocaleDateString('id-ID', { dateStyle: 'long' })}`
}

// Dikirim begitu volunteer apply, sebelum organizer meninjau — belum ada
// tiket/QR di titik ini (lihat sendEventTicketEmail, dikirim saat ACCEPTED).
export async function sendApplicationPendingEmail(
  to,
  { volunteerName, eventTitle, eventLocation, startDate, endDate, organizerName },
) {
  const dateRange = formatDateRange(startDate, endDate)

  if (!resendClient) {
    console.log(`[mailer] RESEND_API_KEY kosong — konfirmasi pendaftaran "${eventTitle}" untuk ${to} (menunggu tinjauan organizer)`)
    return
  }

  await resendClient.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: `Pendaftaranmu ke "${eventTitle}" sedang ditinjau`,
    html: `
      <p>Halo ${volunteerName},</p>
      <p>Pendaftaranmu ke <strong>${eventTitle}</strong> sudah kami terima dan sedang ditinjau oleh penyelenggara.</p>
      <p>
        <strong>Tanggal:</strong> ${dateRange}<br/>
        <strong>Lokasi:</strong> ${eventLocation}<br/>
        <strong>Penyelenggara:</strong> ${organizerName}
      </p>
      <p>Kamu akan menerima email tiket beserta QR check-in begitu pendaftaranmu diterima.</p>
    `,
  })
}

// qrBuffer = PNG Buffer (QRCode.toBuffer), dikirim sbg attachment inline
// (content_id) bukan data: URI di <img src> — Gmail dkk. memblokir/strip
// data: URI di email HTML, jadi QR tidak pernah tampil kalau di-inline langsung.
export async function sendEventTicketEmail(
  to,
  { volunteerName, eventTitle, eventLocation, startDate, endDate, organizerName, ticketCode, qrBuffer },
) {
  const dateRange = formatDateRange(startDate, endDate)

  if (!resendClient) {
    console.log(`[mailer] RESEND_API_KEY kosong — tiket "${eventTitle}" untuk ${to}, kode tiket: ${ticketCode}`)
    return
  }

  await resendClient.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: `Tiket pendaftaran "${eventTitle}" di ActiVibe`,
    html: `
      <p>Halo ${volunteerName},</p>
      <p>Pendaftaranmu ke <strong>${eventTitle}</strong> diterima. Simpan tiket ini dan tunjukkan QR-nya ke panitia saat check-in di lokasi.</p>
      <p>
        <strong>Tanggal:</strong> ${dateRange}<br/>
        <strong>Lokasi:</strong> ${eventLocation}<br/>
        <strong>Penyelenggara:</strong> ${organizerName}
      </p>
      <p><img src="cid:qr-ticket" alt="QR Tiket" width="200" height="200" /></p>
      <p>Kode tiket: <strong>${ticketCode}</strong> (kalau QR tidak bisa dipindai, panitia bisa input kode ini secara manual)</p>
    `,
    attachments: [
      {
        filename: 'tiket-qr.png',
        content: qrBuffer.toString('base64'),
        contentType: 'image/png',
        contentId: 'qr-ticket',
      },
    ],
  })
}
