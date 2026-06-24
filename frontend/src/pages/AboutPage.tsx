import storyIllustration from '../assets/svg/logo-utama.svg'
import pic1 from '../assets/png/pic1 1.png'
import pic2 from '../assets/png/pic2 1.png'
import Footer from '../components/Footer'
import Masonry from '../components/Masonry'
import ChromaGrid from '../components/ChromaGrid'
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
  {
    image: 'https://i.pravatar.cc/300?img=12',
    title: 'Rakha Dzikra Guevara',
    subtitle: 'Product Owner',
    handle: '@rakha.dzikra',
    borderColor: '#6D50A3',
    gradient: 'linear-gradient(155deg, #6D50A3 0%, #2a1a45 100%)',
  },
  {
    image: 'https://i.pravatar.cc/300?img=53',
    title: 'Haikal',
    subtitle: 'Co-Founder & Tim Pengembang',
    handle: '@haikal',
    borderColor: '#63C2E0',
    gradient: 'linear-gradient(155deg, #63C2E0 0%, #0a2a3a 100%)',
  },
  {
    image: 'https://i.pravatar.cc/300?img=68',
    title: 'Daffa',
    subtitle: 'Co-Founder & Tim Pengembang',
    handle: '@daffa',
    borderColor: '#F36038',
    gradient: 'linear-gradient(155deg, #F36038 0%, #3a1005 100%)',
  },
  {
    image: 'https://i.pravatar.cc/300?img=33',
    title: 'Abiem',
    subtitle: 'Co-Founder & Tim Pengembang',
    handle: '@abiem',
    borderColor: '#F5C30D',
    gradient: 'linear-gradient(155deg, #b8890a 0%, #2a2000 100%)',
  },
]

const GALLERY = [
  { id: '1', img: pic1, caption: 'Sesi Riset Awal',         height: 560 },
  { id: '2', img: pic2, caption: 'Diskusi Tim Saw iT',       height: 440 },
  { id: '3', img: pic1, caption: 'Workshop Design System',   height: 640 },
  { id: '4', img: pic2, caption: 'Demo MVP Internal',        height: 480 },
  { id: '5', img: pic1, caption: 'Brainstorming Roadmap',    height: 520 },
  { id: '6', img: pic2, caption: 'Persiapan Peluncuran',     height: 400 },
]

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

          <div className="about-page__team-chroma">
            <ChromaGrid
              items={TEAM}
              columns={4}
              rows={1}
              radius={320}
              damping={0.45}
              fadeOut={0.6}
              ease="power3.out"
            />
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

      <section className="about-page__gallery">
        <div className="about-page__gallery-inner">
          <p className="about-page__gallery-eyebrow">Galeri</p>
          <h2 className="about-page__gallery-title">Momen Perjalanan Kami</h2>

          <div className="about-page__gallery-masonry">
            <Masonry
              items={GALLERY}
              animateFrom="bottom"
              ease="power3.out"
              duration={0.6}
              stagger={0.06}
              scaleOnHover={true}
              hoverScale={0.97}
              blurToFocus={true}
              colorShiftOnHover={false}
            />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
