import { FiMail, FiHelpCircle } from 'react-icons/fi'

import '../organizer/SettingsPage.css'
import './HelpPage.css'

const SUPPORT_EMAIL = 'support@activibe.id'

const FAQ_ITEMS = [
  {
    question: 'Bagaimana cara membuat event baru?',
    answer:
      'Buka menu "Events" di sidebar, lalu klik "Create Event". Isi detail kegiatan, dokumen pendukung, dan PIC penanggung jawab, lalu submit untuk direview admin.',
  },
  {
    question: 'Kenapa sertifikat volunteer belum bisa diterbitkan?',
    answer:
      'Sertifikat baru bisa diterbitkan setelah volunteer di-check-in (status CHECKED_IN/COMPLETED). Cek juga apakah admin sudah mengaktifkan template sertifikat di Certificate Templates.',
  },
  {
    question: 'Bagaimana cara mengundang anggota tim ke organisasi saya?',
    answer:
      'Buka menu "Organization" > "Team", lalu klik "Invite Member". Anggota yang diundang akan menerima email berisi link untuk membuat akun/bergabung.',
  },
  {
    question: 'Kenapa broadcast pesan saya tidak terkirim ke semua volunteer?',
    answer:
      'Broadcast hanya dikirim ke volunteer sesuai target segment yang dipilih (mis. "Semua Volunteer Diterima"). Cek juga kuota broadcast bulanan sesuai tier ActiVibe Plus organisasi Anda.',
  },
  {
    question: 'Bagaimana cara menutup pendaftaran atau menutup event?',
    answer:
      'Di halaman detail event, gunakan tombol "Close Pendaftaran" untuk menghentikan pendaftaran baru, atau "Close Event" untuk menyelesaikan event dan mengisi laporan penutupan.',
  },
]

export default function HelpPage() {
  return (
    <div className="settings-hub">
      <header className="settings-header">
        <div className="settings-header__title">
          <h1>Bantuan &amp; Dukungan</h1>
          <p className="settings-header__subtitle">
            Pertanyaan umum seputar penggunaan dashboard Organizer ActiVibe.
          </p>
        </div>
      </header>

      <section className="help-page__card">
        <h2 className="settings-section-title">
          <FiHelpCircle /> Pertanyaan yang Sering Diajukan
        </h2>
        <div className="help-page__faq-list">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="help-page__faq-item">
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="help-page__card">
        <h2 className="settings-section-title">
          <FiMail /> Masih Butuh Bantuan?
        </h2>
        <p className="help-page__support-text">
          Tim dukungan ActiVibe siap membantu kendala teknis maupun pertanyaan seputar akun organisasi Anda.
        </p>
        <a href={`mailto:${SUPPORT_EMAIL}`} className="btn btn--primary btn--sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: 'fit-content' }}>
          <FiMail /> Hubungi {SUPPORT_EMAIL}
        </a>
      </section>
    </div>
  )
}
