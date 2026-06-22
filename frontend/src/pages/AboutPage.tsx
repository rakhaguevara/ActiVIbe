import wave from '../assets/svg/wave.svg'
import storyIllustration from '../assets/svg/logo-utama.svg'
import Footer from '../components/Footer'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll'
import './AboutPage.css'

const TIMELINE = [
  {
    label: 'Riset & Insight',
    desc: 'Mengamati langsung masalah mismatch volunteer di lapangan, mengumpulkan data dan feedback dari calon volunteer maupun organisasi penyelenggara.',
    active: false,
  },
  {
    label: 'Ide ActiVibe Lahir',
    desc: 'Tim Saw iT merancang konsep platform matching berbasis AI sebagai jawaban atas masalah yang ditemukan.',
    active: false,
  },
  {
    label: 'Penyusunan PRD & Design System',
    desc: 'Menyusun dokumen produk lengkap (problem statement hingga FR-027) dan sistem desain yang konsisten di seluruh platform.',
    active: false,
  },
  {
    label: 'MVP Landing Page',
    desc: 'Landing page, autentikasi, dan fondasi desain ActiVibe yang sedang kamu lihat ini.',
    active: true,
  },
  {
    label: 'Next: Peluncuran Beta',
    desc: 'Conversational Onboarding, Smart AI Matching, dan Impact Passport masuk ke tahap pengembangan penuh.',
    active: false,
  },
] as const

const MISSION_POINTS = [
  {
    icon: '01',
    title: 'Memudahkan Pencarian',
    desc: 'Mengurangi proses coba-coba lewat rekomendasi kegiatan yang relevan dengan minat dan kemampuan setiap volunteer.',
  },
  {
    icon: '02',
    title: 'Mendukung Organisasi',
    desc: 'Membantu NGO dan komunitas menjangkau volunteer yang tepat, lebih cepat, dan lebih efisien dari proses manual.',
  },
  {
    icon: '03',
    title: 'Transparansi Dampak',
    desc: 'Mencatat setiap kontribusi volunteer lewat Impact Passport digital yang bisa dibagikan dan dibanggakan.',
  },
] as const

const TEAM = [
  { name: 'Rakha Dzikra Guevara', role: 'Product Owner', initial: 'R' },
  { name: 'Haikal', role: 'Co-Founder & Tim Pengembang', initial: 'H' },
  { name: 'Daffa', role: 'Co-Founder & Tim Pengembang', initial: 'D' },
  { name: 'Abiem', role: 'Co-Founder & Tim Pengembang', initial: 'A' },
] as const

interface AboutPageProps {
  onSignupClick: () => void
}

export default function AboutPage({ onSignupClick }: AboutPageProps) {
  const storyReveal = useRevealOnScroll(0.1)

  return (
    <main className="about-page">
      <section className="about-page__hero">
        <p className="about-page__hero-eyebrow">Tentang ActiVibe</p>
        <h1 className="about-page__hero-title">Perjalanan Kami Membangun ActiVibe</h1>
        <p className="about-page__hero-desc">
          ActiVibe lahir dari satu pertanyaan sederhana: kenapa masih sulit menemukan kegiatan
          volunteer yang benar-benar cocok dengan minat dan kemampuan kita? Ini cerita tentang
          bagaimana kami mencoba menjawabnya.
        </p>
        <img src={wave} alt="" className="about-page__hero-wave" aria-hidden="true" />
      </section>

      <section
        ref={storyReveal.ref as React.RefObject<HTMLElement>}
        className={`about-page__story${storyReveal.visible ? ' about-page__story--visible' : ''}`}
      >
        <div className="about-page__story-grid">
          <div className="about-page__story-illustration-wrap">
            <img
              src={storyIllustration}
              alt="Ilustrasi komunitas ActiVibe"
              className="about-page__story-illustration"
            />
          </div>

          <div className="about-page__story-content">
            <h2 className="about-page__story-title">Cerita Kami</h2>
            <p className="about-page__story-desc">
              Di Indonesia, partisipasi sosial masyarakatnya tinggi — tapi sebagian besar kegiatan
              volunteer masih dicari secara manual, tanpa rekomendasi yang benar-benar memahami
              minat dan skill masing-masing orang. Akibatnya, tingkat ketidaksesuaian antara
              volunteer dan kegiatan yang mereka ikuti diperkirakan mencapai 40–60%. Banyak yang
              berhenti setelah satu kali coba, dan organisasi kesulitan menjaring volunteer yang
              benar-benar relevan.
            </p>
            <p className="about-page__story-desc">
              Dari situ, tim kami — Saw iT — mulai merancang ActiVibe: platform volunteer yang
              menggunakan AI untuk mencocokkan minat, skill, dan jadwal seseorang dengan kegiatan
              yang paling sesuai untuk mereka. Bukan sekadar daftar kegiatan, tapi pengalaman
              volunteering yang personal, terukur, dan punya jejak dampak yang bisa dibanggakan
              lewat Impact Passport.
            </p>
          </div>
        </div>
      </section>

      <section className="about-page__timeline">
        <div className="about-page__timeline-inner">
          <p className="about-page__timeline-eyebrow">Timeline Perjalanan</p>
          <h2 className="about-page__timeline-title">Dari Ide Sampai ke Sini</h2>

          <div className="about-page__timeline-list">
            {TIMELINE.map((item) => (
              <div
                key={item.label}
                className={`about-page__timeline-item${item.active ? ' about-page__timeline-item--active' : ''}`}
              >
                <span className="about-page__timeline-rail" aria-hidden="true" />
                <div className="about-page__timeline-body">
                  <span className="about-page__timeline-label">{item.label}</span>
                  <p className="about-page__timeline-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-page__vision">
        <div className="about-page__vision-inner">
          <p className="about-page__vision-eyebrow">Visi & Misi</p>
          <h2 className="about-page__vision-statement">
            Menjadi platform volunteer paling terpercaya di Indonesia, tempat setiap orang bisa
            menemukan kegiatan sosial yang benar-benar sesuai dengan minat dan potensinya.
          </h2>

          <div className="about-page__mission-grid">
            {MISSION_POINTS.map(({ icon, title, desc }) => (
              <div key={title} className="about-page__mission-item">
                <span className="about-page__mission-badge" aria-hidden="true">{icon}</span>
                <h3 className="about-page__mission-title">{title}</h3>
                <p className="about-page__mission-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-page__team">
        <div className="about-page__team-inner">
          <p className="about-page__team-eyebrow">Tim Kami</p>
          <h2 className="about-page__team-title">Orang-Orang di Balik ActiVibe</h2>

          <div className="about-page__team-grid">
            {TEAM.map(({ name, role, initial }) => (
              <div key={name} className="about-page__team-card">
                <span className="about-page__team-avatar" aria-hidden="true">{initial}</span>
                <p className="about-page__team-name">{name}</p>
                <p className="about-page__team-role">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-page__cta">
        <h2 className="about-page__cta-title">Jadi Bagian dari Perjalanan Ini</h2>
        <p className="about-page__cta-desc">
          Mulai langkah pertamamu bersama ActiVibe — baik sebagai volunteer yang ingin
          berdampak, atau organisasi yang ingin menjangkau lebih banyak relawan.
        </p>
        <button type="button" className="about-page__cta-button" onClick={onSignupClick}>
          Daftar Sekarang
        </button>
      </section>

      <Footer />
    </main>
  )
}
