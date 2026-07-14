import { Resend } from 'resend'
import { readFile } from 'fs/promises'
import { env } from '../config/env.js'

const resendClient = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null

// SDK `resend` TIDAK melempar exception kalau Resend menolak pengiriman
// (mis. 403 batas sandbox "cuma bisa kirim ke email pemilik akun") — dia
// resolve dengan `{ data: null, error: {...} }`. Tanpa dicek, kode pemanggil
// terlihat "sukses" padahal emailnya tidak pernah terkirim (beda kasus dari
// RESEND_API_KEY kosong di atas, yang memang sengaja fail-soft). Helper ini
// cuma log jelas ke console, sengaja TIDAK throw — biar fail-soft juga
// (registrasi/OTP/tiket tetap sukses secara data), tapi developer bisa lihat
// kegagalannya alih2 diam-diam menghilang.
function logSendResult(context, { error }) {
  if (error) {
    console.error(`[mailer] Resend menolak pengiriman (${context}):`, error.message ?? error)
  }
}

// Email pertama alur "Daftarkan Organisasimu" (lihat organization.service.js
// registerOrganization) — SATU alur untuk semua pendaftar, tidak peduli sudah
// punya akun ActiVibe atau belum (login state tidak lagi relevan di sini).
// Klik link -> SetOrganizationPasswordPage (frontend) -> isi password &
// konfirmasi -> baru di titik itu OTP dikirim (lihat sendOrganizationActivationOtpEmail)
// sbg pembuktian pemilik email sebelum password beneran disimpan & organisasi aktif.
export async function sendOrganizationSetPasswordEmail(
  to,
  { organizationName, contactName, setPasswordUrl, existingAccount = false },
) {
  // existingAccount=true = email ini sudah punya akun ActiVibe aktif —
  // beri peringatan eksplisit di sini karena melanjutkan akan MENGGANTI
  // password akun itu & menambahkan akses organizer (lihat
  // verifyOrganizationActivationOtp di organization.service.js).
  const warningHtml = existingAccount
    ? `<p style="padding:12px 16px;background:#FEF3C7;border-radius:8px;color:#92400E;"><strong>Perhatian:</strong> email ini sudah terhubung ke akun ActiVibe yang sudah ada. Melanjutkan proses ini akan <strong>mengganti password akun tersebut</strong> dan menambahkan akses organizer padanya.</p>`
    : ''
  const warningText = existingAccount
    ? `\nPerhatian: email ini sudah terhubung ke akun ActiVibe yang sudah ada. Melanjutkan proses ini akan MENGGANTI PASSWORD akun tersebut dan menambahkan akses organizer padanya.\n`
    : ''

  if (!resendClient) {
    console.log(`[mailer] RESEND_API_KEY kosong — link atur password utk "${organizationName}" (${to}): ${setPasswordUrl}${existingAccount ? ' [existingAccount=true]' : ''}`)
    return
  }

  const result = await resendClient.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: `Atur password & aktifkan organisasi "${organizationName}" di ActiVibe`,
    html: `
      <p>Halo ${contactName},</p>
      <p>Terima kasih sudah mendaftarkan <strong>${organizationName}</strong> di ActiVibe.</p>
      ${warningHtml}
      <p>Klik tombol di bawah untuk mengatur password akunmu sekaligus mengaktifkan organisasi:</p>
      <p><a href="${setPasswordUrl}" style="display:inline-block;padding:12px 20px;background:#5B21B6;color:#fff;border-radius:8px;text-decoration:none;">Atur Password & Aktifkan</a></p>
      <p>Setelah ini kamu bisa login sebagai organizer memakai email <strong>${to}</strong> dan password yang kamu atur.</p>
      <p>Link ini berlaku selama 24 jam. Kalau kamu tidak merasa mendaftarkan organisasi ini, abaikan saja email ini.</p>
    `,
    text: `Halo ${contactName},

Terima kasih sudah mendaftarkan ${organizationName} di ActiVibe.
${warningText}
Buka link berikut untuk mengatur password akunmu sekaligus mengaktifkan organisasi:
${setPasswordUrl}

Setelah ini kamu bisa login sebagai organizer memakai email ${to} dan password yang kamu atur.

Link ini berlaku selama 24 jam. Kalau kamu tidak merasa mendaftarkan organisasi ini, abaikan saja email ini.`,
  })
  logSendResult(`atur password organisasi -> ${to}`, result)
}

// Langkah ke-2 alur set-password organisasi: dikirim setelah user submit
// password+konfirmasi di SetOrganizationPasswordPage (lihat
// organization.service.js requestOrganizationActivationOtp) — kode ini yang
// jadi pembuktian pemilik email sebelum password beneran disimpan.
export async function sendOrganizationActivationOtpEmail(to, { organizationName, code, expiryMinutes }) {
  if (!resendClient) {
    console.log(`[mailer] RESEND_API_KEY kosong — kode OTP aktivasi organisasi "${organizationName}" utk ${to}: ${code} (berlaku ${expiryMinutes} menit)`)
    return
  }

  const result = await resendClient.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: `Kode verifikasi aktivasi organisasi "${organizationName}"`,
    html: `
      <p>Halo,</p>
      <p>Gunakan kode berikut untuk menyelesaikan pengaturan password & aktivasi <strong>${organizationName}</strong>:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:4px;">${code}</p>
      <p>Kode ini berlaku selama ${expiryMinutes} menit. Kalau kamu tidak merasa mendaftarkan organisasi ini, abaikan saja email ini.</p>
    `,
    text: `Halo,

Gunakan kode berikut untuk menyelesaikan pengaturan password & aktivasi ${organizationName}:

${code}

Kode ini berlaku selama ${expiryMinutes} menit. Kalau kamu tidak merasa mendaftarkan organisasi ini, abaikan saja email ini.`,
  })
  logSendResult(`OTP aktivasi organisasi -> ${to}`, result)
}

export async function sendOtpEmail(to, { name, code, expiryMinutes }) {
  if (!resendClient) {
    console.log(`[mailer] RESEND_API_KEY kosong — kode OTP registrasi untuk ${to}: ${code} (berlaku ${expiryMinutes} menit)`)
    return
  }

  const result = await resendClient.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: 'Kode verifikasi registrasi ActiVibe',
    html: `
      <p>Halo ${name},</p>
      <p>Gunakan kode berikut untuk menyelesaikan registrasi akun ActiVibe kamu:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:4px;">${code}</p>
      <p>Kode ini berlaku selama ${expiryMinutes} menit. Kalau kamu tidak merasa mendaftar di ActiVibe, abaikan saja email ini.</p>
    `,
    text: `Halo ${name},

Gunakan kode berikut untuk menyelesaikan registrasi akun ActiVibe kamu:

${code}

Kode ini berlaku selama ${expiryMinutes} menit. Kalau kamu tidak merasa mendaftar di ActiVibe, abaikan saja email ini.`,
  })
  logSendResult(`OTP registrasi -> ${to}`, result)
}

// Form "Lupa password?" (AuthModal / LoginPage) — auth.service.js
// requestPasswordResetOtp(). Kode ini yang jadi pembuktian pemilik email
// sebelum password beneran diganti (lihat resetPasswordWithOtp), pola sama
// OTP registrasi/aktivasi organisasi, cuma purpose beda (PASSWORD_RESET).
export async function sendPasswordResetOtpEmail(to, { name, code, expiryMinutes }) {
  if (!resendClient) {
    console.log(`[mailer] RESEND_API_KEY kosong — kode OTP reset password untuk ${to}: ${code} (berlaku ${expiryMinutes} menit)`)
    return
  }

  const result = await resendClient.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: 'Kode verifikasi reset password ActiVibe',
    html: `
      <p>Halo ${name},</p>
      <p>Gunakan kode berikut untuk mengatur ulang password akun ActiVibe kamu:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:4px;">${code}</p>
      <p>Kode ini berlaku selama ${expiryMinutes} menit. Kalau kamu tidak meminta reset password, abaikan saja email ini — password akunmu tidak akan berubah.</p>
    `,
    text: `Halo ${name},

Gunakan kode berikut untuk mengatur ulang password akun ActiVibe kamu:

${code}

Kode ini berlaku selama ${expiryMinutes} menit. Kalau kamu tidak meminta reset password, abaikan saja email ini — password akunmu tidak akan berubah.`,
  })
  logSendResult(`OTP reset password -> ${to}`, result)
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

  const result = await resendClient.emails.send({
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
    text: `Halo ${volunteerName},

Pendaftaranmu ke ${eventTitle} sudah kami terima dan sedang ditinjau oleh penyelenggara.

Tanggal: ${dateRange}
Lokasi: ${eventLocation}
Penyelenggara: ${organizerName}

Kamu akan menerima email tiket beserta QR check-in begitu pendaftaranmu diterima.`,
  })
  logSendResult(`konfirmasi pendaftaran "${eventTitle}" -> ${to}`, result)
}

// qrBuffer = PNG Buffer (QRCode.toBuffer), dikirim sbg attachment inline
// (content_id) bukan data: URI di <img src> — Gmail dkk. memblokir/strip
// data: URI di email HTML, jadi QR tidak pernah tampil kalau di-inline langsung.
export async function sendEventTicketEmail(
  to,
  {
    volunteerName,
    eventTitle,
    eventLocation,
    startDate,
    endDate,
    organizerName,
    ticketCode,
    qrBuffer,
    coordinatorName,
    coordinatorPhone,
    coordinatorEmail,
  },
) {
  const dateRange = formatDateRange(startDate, endDate)
  // Event lama (sebelum PIC wajib diisi email+WA) bisa saja belum punya
  // coordinatorName — tampilkan blok kontak PIC cuma kalau datanya ada.
  const coordinatorHtml = coordinatorName
    ? `<p>
        <strong>Kontak PIC/koordinator kegiatan:</strong> ${coordinatorName}${coordinatorPhone ? ` — WA: ${coordinatorPhone}` : ''}${coordinatorEmail ? ` — Email: ${coordinatorEmail}` : ''}
      </p>`
    : ''
  const coordinatorText = coordinatorName
    ? `\nKontak PIC/koordinator kegiatan: ${coordinatorName}${coordinatorPhone ? ` — WA: ${coordinatorPhone}` : ''}${coordinatorEmail ? ` — Email: ${coordinatorEmail}` : ''}\n`
    : ''

  if (!resendClient) {
    console.log(`[mailer] RESEND_API_KEY kosong — tiket "${eventTitle}" untuk ${to}, kode tiket: ${ticketCode}`)
    return
  }

  const result = await resendClient.emails.send({
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
      ${coordinatorHtml}
    `,
    text: `Halo ${volunteerName},

Pendaftaranmu ke ${eventTitle} diterima. Tunjukkan kode tiket ini ke panitia saat check-in di lokasi (QR ada di versi HTML email ini).

Tanggal: ${dateRange}
Lokasi: ${eventLocation}
Penyelenggara: ${organizerName}

Kode tiket: ${ticketCode}
${coordinatorText}`,
    attachments: [
      {
        filename: 'tiket-qr.png',
        content: qrBuffer.toString('base64'),
        contentType: 'image/png',
        contentId: 'qr-ticket',
      },
    ],
  })
  logSendResult(`tiket "${eventTitle}" -> ${to}`, result)
}

// Dikirim admin lewat panel "Penutupan Dini" (admin.service.js sendOrganizerWarning)
// setelah organizer menutup event sebelum endDate lewat dgn partisipasi rendah
// (lihat Event.closedBeforeSchedule). Bukan strike/suspend otomatis — murni
// pesan tercatat, organizer tetap bisa beroperasi normal.
export async function sendOrganizerWarningEmail(to, { organizerName, eventTitle, message, participationRatePercent }) {
  if (!resendClient) {
    console.log(`[mailer] RESEND_API_KEY kosong — peringatan penutupan dini "${eventTitle}" utk ${to}: ${message}`)
    return
  }

  const result = await resendClient.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: `Peringatan: penutupan dini "${eventTitle}"`,
    html: `
      <p>Halo ${organizerName},</p>
      <p>Event <strong>${eventTitle}</strong> tercatat ditutup sebelum jadwal selesai dengan partisipasi baru mencapai <strong>${participationRatePercent}%</strong> dari kuota.</p>
      <p style="padding:12px 16px;background:#FBE7E7;border-radius:8px;color:#8A2C2C;"><strong>Pesan dari Admin:</strong><br/>${message}</p>
      <p>Mohon perhatikan perencanaan jadwal & rekrutmen volunteer untuk kegiatan berikutnya.</p>
    `,
    text: `Halo ${organizerName},

Event ${eventTitle} tercatat ditutup sebelum jadwal selesai dengan partisipasi baru mencapai ${participationRatePercent}% dari kuota.

Pesan dari Admin:
${message}

Mohon perhatikan perencanaan jadwal & rekrutmen volunteer untuk kegiatan berikutnya.`,
  })
  logSendResult(`peringatan penutupan dini "${eventTitle}" -> ${to}`, result)
}

// Dikirim sistem (bukan organizer) begitu aplikasi volunteer otomatis
// dibatalkan krn bentrok jadwal dgn event lain yang lebih dulu ACCEPTED
// (lihat application.service.js cancelOverlappingPendingApplications).
export async function sendApplicationAutoCancelledEmail(to, { volunteerName, cancelledEventTitle, acceptedEventTitle }) {
  if (!resendClient) {
    console.log(`[mailer] RESEND_API_KEY kosong — pendaftaran "${cancelledEventTitle}" utk ${to} otomatis dibatalkan (bentrok dgn "${acceptedEventTitle}")`)
    return
  }

  const result = await resendClient.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: `Pendaftaranmu ke "${cancelledEventTitle}" dibatalkan otomatis`,
    html: `
      <p>Halo ${volunteerName},</p>
      <p>Pendaftaranmu ke <strong>${cancelledEventTitle}</strong> dibatalkan otomatis karena jadwalnya bentrok dengan <strong>${acceptedEventTitle}</strong>, yang sudah lebih dulu menerima pendaftaranmu.</p>
      <p>Kamu tetap bisa mendaftar ke kegiatan lain yang jadwalnya tidak bentrok.</p>
    `,
    text: `Halo ${volunteerName},

Pendaftaranmu ke ${cancelledEventTitle} dibatalkan otomatis karena jadwalnya bentrok dengan ${acceptedEventTitle}, yang sudah lebih dulu menerima pendaftaranmu.

Kamu tetap bisa mendaftar ke kegiatan lain yang jadwalnya tidak bentrok.`,
  })
  logSendResult(`pembatalan otomatis "${cancelledEventTitle}" -> ${to}`, result)
}

// broadcastTitle/message datang dari input bebas organizer (Compose Broadcast
// di BroadcastView.tsx) dan dikirim ke banyak volunteer sekaligus — beda dari
// field admin/organizer lain di file ini yang cuma dilihat 1 penerima, jadi
// di-escape sebelum masuk HTML supaya organizer tidak bisa menyisipkan markup
// (link palsu, dst.) ke email volunteer lain.
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Communication Center broadcast (FR-041) — komunikasi.service.js sendBroadcast()
// memanggil ini sekali per penerima (bukan 1 panggilan `to: [...]` ke Resend)
// supaya penerima tidak saling melihat alamat email satu sama lain.
export async function sendBroadcastEmail(
  to,
  { volunteerName, eventTitle, organizerName, broadcastTitle, message },
) {
  const safeTitle = escapeHtml(broadcastTitle)
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>')

  if (!resendClient) {
    console.log(`[mailer] RESEND_API_KEY kosong — broadcast "${broadcastTitle}" (event "${eventTitle}") utk ${to}`)
    return
  }

  const result = await resendClient.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: `[${eventTitle}] ${broadcastTitle}`,
    html: `
      <p>Halo ${volunteerName},</p>
      <p>Pesan dari penyelenggara <strong>${organizerName}</strong> soal kegiatan <strong>${eventTitle}</strong>:</p>
      <p style="padding:12px 16px;background:#F3F0FF;border-radius:8px;">
        <strong>${safeTitle}</strong><br/><br/>
        ${safeMessage}
      </p>
    `,
    text: `Halo ${volunteerName},

Pesan dari penyelenggara ${organizerName} soal kegiatan ${eventTitle}:

${broadcastTitle}

${message}`,
  })
  logSendResult(`broadcast "${broadcastTitle}" -> ${to}`, result)
}

// "Send Test Email" di BrandingView (organization.service.js
// sendMyOrganizationTestEmail) — email contoh yang menunjukkan bagaimana
// header/warna/footer branding organisasi akan tampil kalau dipakai di email
// nyata (broadcast/tiket). headerImagePath = path file lokal di disk (bukan
// URL publik — dibaca & dilampirkan sbg inline attachment CID, pola sama
// persis QR tiket di sendEventTicketEmail, krn Gmail dkk. bisa memblokir
// data:/URL publik yang tidak stabil).
export async function sendBrandingTestEmail(to, { organizationName, headerImagePath, primaryColor, footerText }) {
  const accentColor = primaryColor || '#5B21B6'
  const safeFooter = footerText ? escapeHtml(footerText).replace(/\n/g, '<br/>') : ''

  if (!resendClient) {
    console.log(`[mailer] RESEND_API_KEY kosong — test email branding "${organizationName}" utk ${to}${headerImagePath ? ' (dgn header image)' : ''}`)
    return
  }

  let headerImageBuffer = null
  if (headerImagePath) {
    headerImageBuffer = await readFile(headerImagePath).catch(() => null)
  }
  const headerHtml = headerImageBuffer
    ? `<p><img src="cid:branding-header" alt="Header ${organizationName}" style="max-width:100%;" /></p>`
    : ''
  const footerHtml = safeFooter
    ? `<p style="margin-top:24px;padding-top:12px;border-top:1px solid #E5E7EB;font-size:12px;color:#6B7280;">${safeFooter}</p>`
    : ''

  const result = await resendClient.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: `Contoh email branding "${organizationName}"`,
    html: `
      ${headerHtml}
      <p>Halo,</p>
      <p>Ini adalah email contoh untuk melihat bagaimana identitas visual organisasi <strong>${organizationName}</strong> akan tampil di email nyata (broadcast/tiket).</p>
      <p style="padding:12px 20px;background:${accentColor};color:#fff;border-radius:8px;display:inline-block;">Contoh tombol dengan warna utama organisasi</p>
      ${footerHtml}
    `,
    text: `Halo,

Ini adalah email contoh untuk melihat bagaimana identitas visual organisasi ${organizationName} akan tampil di email nyata (broadcast/tiket).
${footerText ? `\n${footerText}` : ''}`,
    ...(headerImageBuffer
      ? {
          attachments: [
            {
              filename: 'header-branding.png',
              content: headerImageBuffer.toString('base64'),
              contentType: 'image/png',
              contentId: 'branding-header',
            },
          ],
        }
      : {}),
  })
  logSendResult(`test email branding "${organizationName}" -> ${to}`, result)
}

const MEMBER_ROLE_LABELS = {
  OWNER: 'Owner',
  ADMINISTRATOR: 'Administrator',
  COORDINATOR: 'Coordinator',
}

// Undangan bergabung ke tim organisasi (TeamMembersView / organizationMembers.service.js
// inviteMember & resendInvite) — link mengarah ke AcceptTeamInvitePage di
// portal organizer (beda dari sendOrganizationSetPasswordEmail yang mengarah
// ke portal volunteer krn origin registrasi organisasi memang di sana; di sini
// pengundangnya sudah organizer, jadi link accept-nya wajar tinggal di portal
// yang sama).
export async function sendOrganizationMemberInviteEmail(to, { inviterName, organizationName, role, inviteUrl }) {
  const roleLabel = MEMBER_ROLE_LABELS[role] ?? role

  if (!resendClient) {
    console.log(`[mailer] RESEND_API_KEY kosong — undangan tim "${organizationName}" (role ${roleLabel}) utk ${to}: ${inviteUrl}`)
    return
  }

  const result = await resendClient.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: `${inviterName} mengundangmu bergabung ke tim "${organizationName}" di ActiVibe`,
    html: `
      <p>Halo,</p>
      <p><strong>${escapeHtml(inviterName)}</strong> mengundangmu bergabung sebagai <strong>${escapeHtml(roleLabel)}</strong> di tim organisasi <strong>${escapeHtml(organizationName)}</strong> pada ActiVibe.</p>
      <p>Klik tombol di bawah untuk mengatur password dan mengaktifkan aksesmu:</p>
      <p><a href="${inviteUrl}" style="display:inline-block;padding:12px 20px;background:#5B21B6;color:#fff;border-radius:8px;text-decoration:none;">Terima Undangan</a></p>
      <p>Link ini berlaku selama 7 hari. Kalau kamu tidak merasa diundang, abaikan saja email ini.</p>
    `,
    text: `Halo,

${inviterName} mengundangmu bergabung sebagai ${roleLabel} di tim organisasi ${organizationName} pada ActiVibe.

Buka link berikut untuk mengatur password dan mengaktifkan aksesmu:
${inviteUrl}

Link ini berlaku selama 7 hari. Kalau kamu tidak merasa diundang, abaikan saja email ini.`,
  })
  logSendResult(`undangan tim "${organizationName}" -> ${to}`, result)
}
