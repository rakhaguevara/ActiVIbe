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

export default function AboutPage() {
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

      <Footer />
    </main>
  )
}
