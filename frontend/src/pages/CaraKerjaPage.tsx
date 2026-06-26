import { useState } from 'react'
import flowerDeco from '../assets/svg/flower.svg'
import pic1 from '../assets/png/pic1 1.png'
import pic2 from '../assets/png/pic2 1.png'
import Footer from '../components/Footer'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll'
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

const VOLUNTEER_FLOW_STEPS = [
  {
    label: 'Conversational Onboarding',
    image: pic1,
    desc: 'Alih-alih formulir panjang, ActiVibe mengenalimu lewat percakapan santai dengan AI Onboarding Agent. Dalam hitungan menit, sistem sudah tahu minat, skill, dan jadwalmu — siap dipakai untuk mencarikan kegiatan yang paling cocok.',
  },
  {
    label: 'Smart AI Matching',
    image: pic2,
    desc: 'Berdasarkan hasil onboarding, AI kami menyusun rekomendasi kegiatan volunteer yang dipersonalisasi lengkap dengan Predictive Match Score (%) dan alasan di baliknya — supaya kamu tahu persis kenapa sebuah kegiatan direkomendasikan untukmu.',
  },
  {
    label: 'Pilih Kegiatan Personalmu',
    image: pic1,
    desc: 'Telusuri daftar rekomendasi, bandingkan match score-nya, lalu daftar ke kegiatan yang paling sesuai dengan satu klik. Tiket konfirmasi digital berisi detail lengkap kegiatan langsung terbit setelah pendaftaranmu berhasil.',
  },
  {
    label: 'Beraksi & Beri Dampak',
    image: pic2,
    desc: 'Datang dan jalani kegiatan bersama organisasi serta volunteer lain. Setelah kegiatan selesai, beri feedback dan rating — masukanmu jadi sinyal yang membuat rekomendasi AI berikutnya makin akurat.',
  },
  {
    label: 'Track Your Impact',
    image: pic1,
    desc: 'Begitu organizer menutup kegiatan, sistem otomatis menerbitkan sertifikat digital personal dan memperbarui Skill Progress Tracker-mu. Semua tercatat rapi di Impact Passport — siap dibagikan kapan saja.',
  },
]

export default function CaraKerjaPage({ onSignupClick }: CaraKerjaPageProps) {
  const flowReveal = useRevealOnScroll(0.1)
  const [activeStep, setActiveStep] = useState(0)

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

      <section
        id="alur-volunteer"
        ref={flowReveal.ref as React.RefObject<HTMLElement>}
        className={`cara-kerja-page__flow${flowReveal.visible ? ' cara-kerja-page__flow--visible' : ''}`}
      >
        <img src={flowerDeco} alt="" className="cara-kerja-page__flow-deco" aria-hidden="true" />

        <div className="cara-kerja-page__flow-inner">
          <div className="cara-kerja-page__flow-eyebrow-row">
            <span className="cara-kerja-page__flow-eyebrow">Alur Volunteer</span>
            <span className="cara-kerja-page__flow-eyebrow-line" aria-hidden="true" />
          </div>

          <h2 className="cara-kerja-page__flow-title">
            Lima langkah dari kenalan AI sampai dampak tercatat.
          </h2>

          <div className="cara-kerja-page__flow-grid">
            <div className="cara-kerja-page__flow-nav-wrap">
              <span className="cara-kerja-page__flow-counter" aria-hidden="true">
                {String(activeStep + 1).padStart(2, '0')}/{String(VOLUNTEER_FLOW_STEPS.length).padStart(2, '0')}
              </span>
              <span
                className="cara-kerja-page__flow-rail"
                aria-hidden="true"
                style={{ '--progress': `${Math.round(((activeStep + 1) / VOLUNTEER_FLOW_STEPS.length) * 100)}%` } as React.CSSProperties}
              />

              <ul className="cara-kerja-page__flow-nav">
                {VOLUNTEER_FLOW_STEPS.map(({ label }, i) => (
                  <li key={label}>
                    <button
                      type="button"
                      className={`cara-kerja-page__flow-nav-item${i === activeStep ? ' cara-kerja-page__flow-nav-item--active' : ''}`}
                      onClick={() => setActiveStep(i)}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="cara-kerja-page__flow-content">
              <div className="cara-kerja-page__flow-image-wrap">
                <img
                  key={activeStep}
                  src={VOLUNTEER_FLOW_STEPS[activeStep].image}
                  alt={VOLUNTEER_FLOW_STEPS[activeStep].label}
                  className="cara-kerja-page__flow-image"
                />
              </div>
              <p key={`desc-${activeStep}`} className="cara-kerja-page__flow-desc">
                {VOLUNTEER_FLOW_STEPS[activeStep].desc}
              </p>
            </div>
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
