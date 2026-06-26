import Footer from '../components/Footer'
import './CaraKerjaPage.css'

interface CaraKerjaPageProps {
  onSignupClick: () => void
}

const OVERVIEW_PHASES = [
  {
    label: 'Daftar & Kenali Diri',
    desc: 'Buat akun dan lewati Conversational Onboarding — ActiVibe mengenali minat, skill, dan jadwalmu lewat percakapan singkat, bukan formulir panjang.',
  },
  {
    label: 'Temukan & Terhubung',
    desc: 'AI Matching kami mencocokkan profilmu dengan kegiatan volunteer yang paling relevan, lengkap dengan Predictive Match Score dan alasan kenapa kegiatan itu cocok untukmu.',
  },
  {
    label: 'Beraksi Bersama',
    desc: 'Daftar ke kegiatan, dapatkan tiket konfirmasi digital, dan jalani kegiatan bersama organisasi serta volunteer lain yang sama-sama terverifikasi.',
  },
  {
    label: 'Catat & Bagikan Dampak',
    desc: 'Setiap kontribusi otomatis tercatat — sertifikat digital terbit otomatis, dan dampakmu terkumpul jadi Impact Passport yang bisa dibagikan.',
  },
]

export default function CaraKerjaPage({ onSignupClick }: CaraKerjaPageProps) {
  return (
    <main className="cara-kerja-page">
      <section className="cara-kerja-page__hero">
        <p className="cara-kerja-page__hero-eyebrow">Cara Kerja ActiVibe</p>
        <h1 className="cara-kerja-page__hero-title">
          Satu platform, satu alur jelas — dari daftar sampai dampak nyata.
        </h1>
        <p className="cara-kerja-page__hero-desc">
          ActiVibe menghubungkan volunteer dan organisasi lewat AI, supaya setiap orang menemukan
          kegiatan yang benar-benar cocok, dan setiap kontribusi tercatat jadi bukti dampak yang
          bisa dibanggakan.
        </p>
      </section>

      <section className="cara-kerja-page__overview">
        <div className="cara-kerja-page__overview-inner">
          <p className="cara-kerja-page__overview-eyebrow">Gambaran Besar</p>
          <h2 className="cara-kerja-page__overview-title">
            Empat fase, satu pengalaman yang terhubung.
          </h2>
          <div className="cara-kerja-page__overview-grid">
            {OVERVIEW_PHASES.map((phase, i) => (
              <div key={phase.label} className="cara-kerja-page__overview-item">
                <span className="cara-kerja-page__overview-badge">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="cara-kerja-page__overview-item-title">{phase.label}</h3>
                <p className="cara-kerja-page__overview-item-desc">{phase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cara-kerja-page__cta">
        <h2 className="cara-kerja-page__cta-title">Siap mulai perjalanan volunteering-mu?</h2>
        <p className="cara-kerja-page__cta-desc">
          Buat akun gratis dan biarkan AI ActiVibe mencarikan kegiatan yang paling cocok untukmu.
        </p>
        <button type="button" className="cara-kerja-page__cta-button" onClick={onSignupClick}>
          Daftar Sekarang
        </button>
      </section>

      <Footer />
    </main>
  )
}
