import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll'
import bg from '../assets/svg/background-1.svg'
import wave from '../assets/svg/wave.svg'
import iconVolunteer from '../assets/svg/recruitment 1.svg'
import iconOrganisasi from '../assets/svg/diversity 1.svg'
import iconAktivitas from '../assets/svg/together 1.svg'
import guitarIcon from '../assets/svg/guitar.svg'
import fireworkIcon from '../assets/svg/firework 2.svg'
import medalIcon from '../assets/svg/medal.svg'
import flowerDeco from '../assets/svg/flower.svg'
import sunDeco from '../assets/svg/sun.svg'
// ── Join Section assets
import waveTop    from '../assets/svg/Vector 2.svg'
import waveBottom from '../assets/svg/Vector 3.svg'
import deco1 from '../assets/svg/Group 1.svg'
import deco3 from '../assets/svg/Group 3.svg'
import deco4 from '../assets/svg/Group 4.svg'
import deco5 from '../assets/svg/Group 5.svg'
import pic1 from '../assets/png/pic1 1.png'
import pic2 from '../assets/png/pic2 1.png'
// ── About Section assets
import aboutIllustration from '../assets/svg/logo-utama.svg'
// ── Symbols Carousel assets (makna tiap elemen logo)
import iconMatahari from '../assets/svg/seperate-logo/Sun.svg'
import iconBurung from '../assets/svg/seperate-logo/air.svg'
import iconManusia from '../assets/svg/seperate-logo/Natural.svg'
import iconMusik from '../assets/svg/seperate-logo/Musical.svg'
import iconDaun from '../assets/svg/seperate-logo/Forest.svg'
import iconOmbak from '../assets/svg/seperate-logo/Water-env.svg'
import iconKotak from '../assets/svg/seperate-logo/Charity.svg'
import ScrollStack, { ScrollStackItem } from '../components/ScrollStack'
import Footer from '../components/Footer'
import './HomePage.css'

/* ── Static data ── */
const STATS = [
  { icon: iconVolunteer, value: 12847, label: 'Volunteer' },
  { icon: iconOrganisasi, value: 348,   label: 'Organisasi' },
  { icon: iconAktivitas,  value: 1053,  label: 'Aktivitas' },
]

const FEATURES = [
  {
    icon: guitarIcon,
    title: 'Kegiatan Sosial Terverifikasi',
    desc: 'Jelajahi ratusan kegiatan volunteer yang sudah diverifikasi tim ActiVibe. AI kami mencocokkannya dengan minat, skill, dan jadwalmu — bukan sekadar daftar acak.',
  },
  {
    icon: fireworkIcon,
    title: 'Daftarkan Organisasimu',
    desc: 'Bergabunglah bersama ratusan NGO dan komunitas yang menggunakan ActiVibe untuk merekrut volunteer tepat, mengelola event, dan melacak dampak secara real-time.',
  },
  {
    icon: medalIcon,
    title: 'Impact Passport Digital',
    desc: 'Setiap kontribusimu otomatis jadi portofolio sosial lengkap dengan sertifikat AI personal. Bagikan ke LinkedIn, IG Story, atau WhatsApp — siap untuk CV dan beasiswa.',
  },
]

/* ── Mobile carousel slides ── */
const JOIN_SLIDES = [
  {
    img:     pic1,
    alt:     'Volunteer group',
    eyebrow: 'Untuk Volunteer',
    title:   'Temukan Kegiatan yang Benar-Benar Cocok',
    desc:    'AI ActiVibe mencocokkan profilmu dengan ratusan event sosial berdasarkan minat, skill, dan jadwalmu. Tidak ada lagi scroll panjang — cukup buka dan daftar.',
  },
  {
    img:     pic2,
    alt:     'Volunteer individual',
    eyebrow: 'Untuk Organisasi & NGO',
    title:   'Rekrut Volunteer yang Tepat, Lebih Cepat',
    desc:    'Publikasikan event, atur role dan shift, lalu terima pendaftar lengkap dengan AI Match Score. Hemat waktu seleksi hingga 50% dibanding cara konvensional.',
  },
]

/* ── How It Works steps (placeholder images — reusing pic1/pic2 until 5 real photos exist) ── */
const HOW_IT_WORKS_STEPS = [
  { label: 'Conversational Onboarding', image: pic1 },
  { label: 'Smart AI Matching', image: pic2 },
  { label: 'Pilih Kegiatan Personalmu', image: pic1 },
  { label: 'Beraksi & Beri Dampak', image: pic2 },
  { label: 'Track Your Impact', image: pic1 },
]

/* ── Symbols carousel (titles = real symbols inside logo-utama.svg; desc still placeholder) ── */
const LOGO_SYMBOLS = [
  { title: 'Matahari', icon: iconMatahari, desc: 'Energi yang menyalakan semangat volunteer untuk terus kembali berkontribusi — hari demi hari, kegiatan demi kegiatan, bukan sekadar sekali ikut lalu berhenti. Konsistensi inilah yang kami rayakan lewat tracking partisipasi dan badge pencapaian, supaya setiap volunteer punya alasan untuk terus menyala dan kembali memberi dampak.' },
  { title: 'Burung', icon: iconBurung, desc: 'Kebebasan menjangkau yang jauh — Smart AI Matching kami menghubungkan volunteer dengan kegiatan yang paling sesuai, di mana pun mereka berada, tanpa batas wilayah maupun latar belakang. Algoritma kami terus belajar dari minat dan riwayat partisipasimu, sehingga rekomendasi kegiatan yang muncul kian relevan setiap kali kamu kembali membuka ActiVibe.' },
  { title: 'Manusia', icon: iconManusia, desc: 'Volunteer adalah inti ActiVibe. Lewat Conversational Onboarding Agent, kami kenali minat dan skill setiap individu hanya dalam hitungan menit, supaya kontribusimu tepat sasaran sejak hari pertama. Proses ini dirancang terasa seperti ngobrol biasa, bukan mengisi formulir panjang, karena kami percaya setiap orang berhak mendapat pengalaman onboarding yang personal dan manusiawi.' },
  { title: 'Musik', icon: iconMusik, desc: 'Harmoni dalam keberagaman — setiap minat, skill, dan latar belakang dicocokkan lewat sistem rekomendasi AI kami, besar maupun kecil, semua punya tempatnya di ActiVibe. Sama seperti nada-nada berbeda yang menyatu jadi melodi, perbedaan latar belakang volunteer justru memperkaya setiap kegiatan yang berjalan di platform kami.' },
  { title: 'Daun', icon: iconDaun, desc: 'Kepedulian terhadap alam adalah nilai yang kami jaga bersama. Setiap aksi lingkunganmu tercatat dan dihargai dalam Impact Passport-mu, mulai dari bersih pantai sampai penanaman pohon. Dengan begitu, kontribusi hijaumu tidak hanya berhenti jadi kenangan, tapi jadi catatan dampak yang bisa kamu tunjukkan kapan saja.' },
  { title: 'Ombak', icon: iconOmbak, desc: 'Gerakan sosial yang terus mengalir — satu aksi kecilmu bisa menjadi gelombang perubahan yang menyentuh ribuan kehidupan lewat komunitas ActiVibe yang terus tumbuh. Setiap volunteer yang bergabung menambah momentum, menarik lebih banyak orang untuk ikut bergerak bersama menuju dampak yang lebih besar.' },
  { title: 'Kotak', icon: iconKotak, desc: 'Struktur kuat di balik dampak yang nyata — dari kegiatan terverifikasi sampai Impact Passport yang tercatat rapi, kami pastikan setiap misi volunteer berjalan lancar dari awal hingga akhir. Fondasi yang solid ini memastikan kepercayaan volunteer, organizer, dan mitra tetap terjaga di setiap langkah perjalanan kontribusi.' },
]

/* ── Activities (mock data — frontend-only for now, will be replaced by backend event listing) ── */
const ACTIVITY_CATEGORIES = ['Semua', 'Lingkungan', 'Pendidikan', 'Sosial', 'Kesehatan']

const ACTIVITIES = [
  {
    title: 'Bersih Pantai Bersama',
    category: 'Lingkungan',
    icon: iconAktivitas,
    participants: 40,
    dateRange: '12 - 28 Juli 2026',
    quota: 15,
    desc: 'Bergabunglah membersihkan sampah di pesisir pantai bersama puluhan relawan. Setiap sampah yang kamu angkat membuat ekosistem laut lebih sehat untuk generasi mendatang.',
  },
  {
    title: 'Mengajar Anak-anak Pedesaan',
    category: 'Pendidikan',
    icon: guitarIcon,
    participants: 11,
    dateRange: '1 - 20 Agustus 2026',
    quota: 8,
    desc: 'Dampingi anak-anak di daerah terpencil dengan pelajaran dasar, literasi, dan kreativitas. Satu jam mengajarmu bisa mengubah cara pandang seorang anak terhadap masa depannya.',
  },
  {
    title: 'Donor Darah Massal',
    category: 'Kesehatan',
    icon: medalIcon,
    participants: 234,
    dateRange: '5 Juli 2026',
    quota: 50,
    desc: 'Satu kantong darahmu bisa menyelamatkan hingga tiga nyawa. Bergabunglah dalam aksi donor massal bersama ratusan relawan terverifikasi ActiVibe dan PMI.',
  },
  {
    title: 'Penanaman 1000 Pohon Mangrove',
    category: 'Lingkungan',
    icon: fireworkIcon,
    participants: 342,
    dateRange: '15 - 30 Juli 2026',
    quota: 20,
    desc: 'Tanam bibit mangrove bersama untuk menjaga pesisir dari abrasi. Setiap bibit yang kamu tanam adalah warisan nyata untuk alam dan generasi berikutnya.',
  },
  {
    title: 'Bantu Panti Asuhan Ceria',
    category: 'Sosial',
    icon: iconOrganisasi,
    participants: 28,
    dateRange: '8 - 22 Agustus 2026',
    quota: 12,
    desc: 'Luangkan waktumu untuk mengunjungi dan menemani anak-anak panti asuhan. Kehadiranmu membawa keceriaan dan semangat yang berarti lebih dari yang bisa dibayangkan.',
  },
  {
    title: 'Edukasi Kesehatan Remaja',
    category: 'Kesehatan',
    icon: iconVolunteer,
    participants: 19,
    dateRange: '3 - 17 Agustus 2026',
    quota: 25,
    desc: 'Dampingi remaja memahami pentingnya kesehatan diri, pola makan sehat, dan kesehatan mental. Jadilah panutan dan inspirasi nyata bagi generasi muda Indonesia.',
  },
]

/* ── Trust badges (value proposition ActiVibe) ── */
const TRUST_BADGES = [
  {
    icon: medalIcon,
    title: 'Smart AI Matching',
    desc: 'Rekomendasi kegiatan volunteer dipersonalisasi sesuai minat dan lokasimu.',
  },
  {
    icon: medalIcon,
    title: 'Komunitas Terverifikasi',
    desc: 'Setiap organisasi & kegiatan diverifikasi tim ActiVibe, aman untuk diikuti.',
  },
  {
    icon: medalIcon,
    title: 'Impact Passport Digital',
    desc: 'Setiap kontribusimu otomatis tercatat jadi portofolio sosial yang bisa dibagikan.',
  },
]

/* ── Gallery (placeholder photos — reusing pic1/pic2 until real activity photos exist) ── */
const GALLERY_MOMENTS = [
  { tab: 'Pantai', img: pic1, title: 'Bersih Pantai Bersama', desc: 'Lebih dari 40 relawan bergotong royong selama 6 jam. Hasilnya: ratusan kilogram sampah terangkat dari pesisir — ekosistem laut kembali bernapas.', tag: 'Lingkungan', volunteers: 40, likes: 128, comments: 24 },
  { tab: 'Mangrove', img: pic2, title: 'Penanaman 1000 Pohon Mangrove', desc: 'Bersama Yayasan Alam Nusantara, tim kami berhasil menanam 1.000 bibit mangrove untuk memulihkan ekosistem pesisir yang terancam abrasi parah.', tag: 'Lingkungan', volunteers: 342, likes: 256, comments: 51 },
  { tab: 'Edukasi', img: pic1, title: 'Mengajar Anak-anak Pedesaan', desc: 'Selama tiga minggu, 11 volunteer mendampingi 45 anak di desa terpencil Jawa Barat. Setiap senyum mereka adalah bukti nyata kekuatan volunteer.', tag: 'Pendidikan', volunteers: 11, likes: 89, comments: 12 },
  { tab: 'Donor Darah', img: pic2, title: 'Donor Darah Massal', desc: 'Dalam satu hari aksi, 234 relawan berhasil mendonorkan darah. Estimasi: lebih dari 700 pasien di Jabodetabek mendapatkan harapan baru dari aksi ini.', tag: 'Kesehatan', volunteers: 234, likes: 310, comments: 64 },
  { tab: 'Panti Asuhan', img: pic1, title: 'Bantu Panti Asuhan Ceria', desc: 'Kunjungan rutin 28 volunteer membawa keceriaan, buku bacaan baru, dan perlengkapan belajar untuk 60 anak Panti Asuhan Ceria di Bandung.', tag: 'Sosial', volunteers: 28, likes: 142, comments: 19 },
  { tab: 'Remaja', img: pic2, title: 'Edukasi Kesehatan Remaja', desc: 'Program edukasi ini menjangkau 200+ remaja di 5 sekolah menengah. Terima kasih kepada 19 volunteer yang tulus mengabdikan waktu dan ilmunya.', tag: 'Kesehatan', volunteers: 19, likes: 77, comments: 9 },
]

/* ── Rating / testimonials ── */
const TESTIMONIALS = [
  {
    quote: 'Saya sudah ikut beberapa kegiatan lewat ActiVibe dan selalu merasa terhubung dengan komunitas yang suportif. Prosesnya mudah, dari cari kegiatan sampai dapat sertifikat kontribusi.',
    name: 'Dewi Anggraini',
    role: 'Volunteer Bersih Pantai',
    avatar: pic1,
  },
  {
    quote: 'Smart matching-nya beneran membantu nemuin kegiatan yang sesuai minat dan lokasi, jadi nggak perlu scroll lama buat cari yang pas.',
    name: 'Putu Aditya',
    role: 'Organizer Komunitas Hijau',
    avatar: pic2,
  },
  {
    quote: 'Tiga kata saja: ActiVibe luar biasa!',
    name: 'Sarah Kusuma',
    role: 'Volunteer Edukasi Anak',
    avatar: pic1,
  },
  {
    quote: 'Impact Passport-nya jadi portofolio sosial yang bisa langsung aku lampirkan waktu daftar beasiswa. Sangat membantu.',
    name: 'Rian Saputra',
    role: 'Volunteer Donor Darah',
    avatar: pic2,
  },
  {
    quote: 'Komunitas di sini ramah banget buat yang baru pertama kali jadi volunteer. Nggak perlu pengalaman dulu.',
    name: 'Maya Lestari',
    role: 'Volunteer Panti Asuhan',
    avatar: pic1,
  },
  {
    quote: 'Recommended!',
    name: 'Fajar Nugroho',
    role: 'Organizer Komunitas Mangrove',
    avatar: pic2,
  },
]

/* ── Hooks ── */
function useCountUp(target: number, trigger: boolean, duration = 1600) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!trigger) return
    let raf: number
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - (1 - t) ** 3
      setCount(Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [trigger, target, duration])
  return count
}

/* ── Sub-components ── */
function StatItem({ icon, value, label, trigger }: { icon: string; value: number; label: string; trigger: boolean }) {
  const count = useCountUp(value, trigger)
  return (
    <div className="hero__stat">
      <img src={icon} alt={label} className="hero__stat-icon" />
      <div className="hero__stat-text">
        <span className="hero__stat-number">{count.toLocaleString('id-ID')}</span>
        <span className="hero__stat-label">{label}</span>
      </div>
    </div>
  )
}

/* ════════════════════════════ */
export default function HomePage() {
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)
  const [pageLoaded, setPageLoaded] = useState(false)
  const featuresReveal = useRevealOnScroll(0.1)
  const joinReveal     = useRevealOnScroll(0.08)
  const aboutReveal    = useRevealOnScroll(0.1)
  const howReveal      = useRevealOnScroll(0.1)
  const [activeStep, setActiveStep] = useState(0)

  /* Symbols carousel */
  const symbolsTrackRef = useRef<HTMLDivElement>(null)
  const [activeSymbol, setActiveSymbol] = useState(0)

  const scrollToSymbol = (i: number) => {
    const track = symbolsTrackRef.current
    const card = track?.children[i] as HTMLElement | undefined
    if (!track || !card) return
    track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: 'smooth' })
  }

  const handleSymbolsScroll = () => {
    const track = symbolsTrackRef.current
    if (!track) return
    let closest = 0
    let closestDist = Infinity
    Array.from(track.children).forEach((child, i) => {
      const el = child as HTMLElement
      const dist = Math.abs(el.offsetLeft - track.offsetLeft - track.scrollLeft)
      if (dist < closestDist) { closestDist = dist; closest = i }
    })
    setActiveSymbol(closest)
  }

  const goSymbol = (i: number) => {
    const next = Math.max(0, Math.min(LOGO_SYMBOLS.length - 1, i))
    setActiveSymbol(next)
    scrollToSymbol(next)
  }

  /* Activities filter + horizontal carousel (4 card per tampilan, sisanya digeser) */
  const [activeCategory, setActiveCategory] = useState('Semua')
  const filteredActivities = activeCategory === 'Semua'
    ? ACTIVITIES
    : ACTIVITIES.filter(a => a.category === activeCategory)

  const activitiesTrackRef = useRef<HTMLDivElement>(null)

  const scrollActivities = (dir: 1 | -1) => {
    const track = activitiesTrackRef.current
    if (!track) return
    track.scrollBy({ left: dir * track.clientWidth * 0.95, behavior: 'smooth' })
  }

  useEffect(() => {
    activitiesTrackRef.current?.scrollTo({ left: 0 })
  }, [activeCategory])

  /* Gallery tabs */
  const [activeMoment, setActiveMoment] = useState(0)

  const goMoment = (dir: 1 | -1) => {
    setActiveMoment((prev) => (prev + dir + GALLERY_MOMENTS.length) % GALLERY_MOMENTS.length)
  }

  const prevMoment = GALLERY_MOMENTS[(activeMoment - 1 + GALLERY_MOMENTS.length) % GALLERY_MOMENTS.length]
  const nextMoment = GALLERY_MOMENTS[(activeMoment + 1) % GALLERY_MOMENTS.length]

  /* Rating pagination (3 per page) */
  const RATING_PER_PAGE = 3
  const ratingPageCount = Math.ceil(TESTIMONIALS.length / RATING_PER_PAGE)
  const [ratingPage, setRatingPage] = useState(0)
  const visibleTestimonials = TESTIMONIALS.slice(
    ratingPage * RATING_PER_PAGE,
    ratingPage * RATING_PER_PAGE + RATING_PER_PAGE
  )

  /* Mobile slider state */
  const [slideIndex,   setSlideIndex]   = useState(0)
  const [slideVisible, setSlideVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setPageLoaded(true), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (window.location.hash !== '#cara-kerja') return
    const t = setTimeout(() => {
      document.getElementById('cara-kerja')?.scrollIntoView({ behavior: 'smooth' })
    }, 120)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const el = statsRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStatsVisible(true); observer.disconnect() } },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  /* auto-advance slider every 4 s */
  useEffect(() => {
    const id = setInterval(() => {
      setSlideVisible(false)
      setTimeout(() => {
        setSlideIndex(prev => (prev + 1) % JOIN_SLIDES.length)
        setSlideVisible(true)
      }, 400)
    }, 4000)
    return () => clearInterval(id)
  }, [])

  const goSlide = (i: number) => {
    setSlideVisible(false)
    setTimeout(() => { setSlideIndex(i); setSlideVisible(true) }, 400)
  }

  const slide = JOIN_SLIDES[slideIndex]

  return (
    <main className={`page-main${pageLoaded ? ' page-main--loaded' : ''}`}>

      {/* ═══ Hero ═══ */}
      <section className="hero">
        <img src={bg}   alt="" className="hero__illustration" />
        <img src={wave} alt="" className="hero__wave" />
        <div
          ref={statsRef}
          className={`hero__stats-card${statsVisible ? ' hero__stats-card--visible' : ''}`}
        >
          {STATS.map(({ icon, value, label }) => (
            <StatItem key={label} icon={icon} value={value} label={label} trigger={statsVisible} />
          ))}
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section
        ref={featuresReveal.ref as React.RefObject<HTMLElement>}
        className={`features${featuresReveal.visible ? ' features--visible' : ''}`}
      >
        <img src={flowerDeco} alt="" className="features__deco features__deco--flower" aria-hidden="true" />
        <img src={sunDeco}    alt="" className="features__deco features__deco--sun"    aria-hidden="true" />

        <h2 className="features__title">
          Temukan cara terbaik untuk memberi dampak nyata
        </h2>

        <div className="features__grid">
          {FEATURES.map(({ icon, title, desc }, i) => (
            <article key={i} className="feature-card" style={{ transitionDelay: `${i * 120}ms` }}>
              <div className="feature-card__icon-wrap">
                <img src={icon} alt={title} className="feature-card__icon" />
              </div>
              <h3 className="feature-card__title">{title}</h3>
              <p  className="feature-card__desc">{desc}</p>
            </article>
          ))}
        </div>

        <div className="features__footer">
          <a href="#" className="features__cta">Cari Aktivitas</a>
        </div>
      </section>

      {/* ═══ Join ═══ */}
      <section
        ref={joinReveal.ref as React.RefObject<HTMLElement>}
        className={`join${joinReveal.visible ? ' join--visible' : ''}`}
      >
        {/* blue bg layer */}
        <div className="join__bg" />

        {/* wave top */}
        <img src={waveTop} alt="" className="join__wave join__wave--top" aria-hidden="true" />

        {/* ══ Deco SVGs — LEFT side ══ */}
        <img src={deco3} alt="" className="join__deco join__deco--swirl-l"  aria-hidden="true" />
        <img src={deco5} alt="" className="join__deco join__deco--leaf-l"   aria-hidden="true" />
        <img src={deco1} alt="" className="join__deco join__deco--branch-l" aria-hidden="true" />
        <img src={deco3} alt="" className="join__deco join__deco--swirl-l2" aria-hidden="true" />

        {/* ══ Deco SVGs — RIGHT side ══ */}
        <img src={deco4} alt="" className="join__deco join__deco--box-r"    aria-hidden="true" />
        <img src={deco5} alt="" className="join__deco join__deco--leaf-r"   aria-hidden="true" />
        <img src={deco1} alt="" className="join__deco join__deco--branch-r" aria-hidden="true" />
        <img src={deco3} alt="" className="join__deco join__deco--swirl-r"  aria-hidden="true" />

        {/* ── DESKTOP two-column (hidden ≤640px) ── */}
        <div className="join__inner join__inner--desktop">
          <div className="join__photo-left">
            <img src={pic1} alt="Volunteer group" className="join__img join__img--main" />
          </div>

          <div className="join__content">
            <p  className="join__eyebrow">Bergabung dan Berdampak</p>
            <h2 className="join__title">Satu Platform, Ribuan Cara untuk Memberi Dampak</h2>
            <p  className="join__desc">
              Sebagai volunteer, ActiVibe mencocokan profilmu dengan kegiatan sosial yang paling relevan menggunakan AI — bukan pencarian manual yang membuang waktu.
            </p>

            <div className="join__photo-right">
              <img src={pic2} alt="Volunteer individual" className="join__img join__img--secondary" />
            </div>

            <p className="join__desc join__desc--sm">
              Sebagai organisasi, kelola seluruh siklus volunteer dari satu dashboard — publikasi event, seleksi pendaftar berbasis Match Score AI, hingga distribusi sertifikat otomatis.
            </p>

            <a href="#" className="join__cta">Mengenal Program</a>
          </div>
        </div>

        {/* ── MOBILE slider (shown ≤640px) ── */}
        <div className="join__mobile">

          {/* photo — cross-fades */}
          <div className={`join__mobile-img-wrap${slideVisible ? ' join__mobile-img-wrap--visible' : ''}`}>
            <img src={slide.img} alt={slide.alt} className="join__img join__img--mobile" />
          </div>

          {/* text — fades with the photo (button NOT included here) */}
          <div className={`join__mobile-text${slideVisible ? ' join__mobile-text--visible' : ''}`}>
            <p  className="join__eyebrow">{slide.eyebrow}</p>
            <h2 className="join__title">{slide.title}</h2>
            <p  className="join__desc">{slide.desc}</p>
          </div>

          {/* dot nav — static */}
          <div className="join__dots" role="tablist" aria-label="Slide indicator">
            {JOIN_SLIDES.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === slideIndex}
                aria-label={`Slide ${i + 1}`}
                className={`join__dot${i === slideIndex ? ' join__dot--active' : ''}`}
                onClick={() => goSlide(i)}
              />
            ))}
          </div>

          {/* button — static, does NOT participate in fade */}
          <a href="#" className="join__cta join__cta--mobile">Mengenal Program</a>
        </div>

        {/* wave bottom */}
        <img src={waveBottom} alt="" className="join__wave join__wave--bottom" aria-hidden="true" />
      </section>

      {/* ═══ About ═══ */}
      <section
        ref={aboutReveal.ref as React.RefObject<HTMLElement>}
        className={`about${aboutReveal.visible ? ' about--visible' : ''}`}
      >
        <img src={sunDeco} alt="" className="about__deco about__deco--sun" aria-hidden="true" />

        <div className="about__inner">
          <h2 className="about__title">Tentang Activibe</h2>

          <div className="about__grid">
            <div className="about__illustration-wrap">
              <img
                src={aboutIllustration}
                alt="Ilustrasi komunitas Activibe"
                className="about__illustration"
              />
            </div>

            <div className="about__content">
              <p className="about__desc">
                ActiVibe adalah platform volunteer berbasis AI pertama di Indonesia yang menghubungkan individu dengan kegiatan sosial sesuai minat, skill, dan jadwal mereka secara personal — bukan daftar generik yang tidak relevan.
              </p>
              <p className="about__desc">
                Kami percaya setiap orang punya kapasitas untuk membuat perubahan nyata. Bersama ActiVibe, kontribusimu tidak hanya berdampak — tapi juga tercatat, diakui, dan dibagikan melalui Impact Passport digital yang unik milikmu.
              </p>
              <Link to="/tentang-kami" className="about__cta">More About Us..</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ How It Works ═══ */}
      <section
        id="cara-kerja"
        ref={howReveal.ref as React.RefObject<HTMLElement>}
        className={`how${howReveal.visible ? ' how--visible' : ''}`}
      >
        <img src={flowerDeco} alt="" className="how__deco how__deco--flower" aria-hidden="true" />

        <div className="how__inner">
          <div className="how__eyebrow-row">
            <span className="how__eyebrow">Cara Kerja ActiVibe</span>
            <span className="how__eyebrow-line" aria-hidden="true" />
          </div>

          <h2 className="how__title">
            Perjalanan volunteering yang terpersonalisasi,<br />
            dari pendaftaran hingga sertifikasi.
          </h2>

          <div className="how__grid">
            <div className="how__nav-wrap">
              <span className="how__counter" aria-hidden="true">
                {String(activeStep + 1).padStart(2, '0')}/{String(HOW_IT_WORKS_STEPS.length).padStart(2, '0')}
              </span>
              <span
                className="how__rail"
                aria-hidden="true"
                style={{ '--progress': `${Math.round(((activeStep + 1) / HOW_IT_WORKS_STEPS.length) * 100)}%` } as React.CSSProperties}
              />

              <ul className="how__nav">
                {HOW_IT_WORKS_STEPS.map(({ label }, i) => (
                  <li key={label}>
                    <button
                      type="button"
                      className={`how__nav-item${i === activeStep ? ' how__nav-item--active' : ''}`}
                      onClick={() => setActiveStep(i)}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="how__image-wrap">
              <img
                key={activeStep}
                src={HOW_IT_WORKS_STEPS[activeStep].image}
                alt={HOW_IT_WORKS_STEPS[activeStep].label}
                className="how__image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Symbols Carousel ═══ */}
      <section className="symbols">
        <div className="symbols__inner">
          <div className="symbols__header">
            <h2 className="symbols__title">
              SATU LOGO.<br />BANYAK MAKNA.
            </h2>
            <div className="symbols__header-side">
              <p className="symbols__desc">
                Setiap simbol dalam logo Activibe punya cerita dan makna tersendiri. Kenali filosofi di balik setiap elemen yang merepresentasikan nilai-nilai kami.
              </p>
              <a href="#" className="symbols__cta">Lihat Semua Simbol →</a>
            </div>
          </div>

          {/* ── DESKTOP: horizontal scroll carousel (hidden on mobile via CSS) ── */}
          <div
            className="symbols__track"
            ref={symbolsTrackRef}
            onScroll={handleSymbolsScroll}
          >
            {LOGO_SYMBOLS.map(({ title, icon, desc }, i) => (
              <article key={title} className={`symbols__card symbols__card--${i % 4}`}>
                <div className="symbols__card-icon-wrap">
                  <img src={icon} alt="" className="symbols__card-icon" />
                </div>
                <h3 className="symbols__card-title">{title}</h3>
                <p className="symbols__card-desc">{desc}</p>
                <a href="#" className="symbols__card-link">Pelajari Lebih Lanjut →</a>
              </article>
            ))}
          </div>

          {/* ── MOBILE: ScrollStack stacking animation (hidden on desktop via CSS) ── */}
          <div className="symbols__stack-mobile">
            <ScrollStack
              itemDistance={120}
              itemStackDistance={16}
              stackPosition="15vh"
            >
              {LOGO_SYMBOLS.map(({ title, icon, desc }, i) => (
                <ScrollStackItem key={title} itemClassName={`scroll-stack-card--${i % 4}`}>
                  <div className="scroll-stack-card__icon-wrap">
                    <img src={icon} alt="" className="scroll-stack-card__icon" />
                  </div>
                  <h3 className="scroll-stack-card__title">{title}</h3>
                  <p className="scroll-stack-card__desc">{desc}</p>
                  <a href="#" className="scroll-stack-card__link">Pelajari Lebih Lanjut →</a>
                </ScrollStackItem>
              ))}
            </ScrollStack>
          </div>

          {/* Nav dots (desktop only) */}
          <div className="symbols__nav">
            <button
              type="button"
              className="symbols__arrow"
              aria-label="Sebelumnya"
              onClick={() => goSymbol(activeSymbol - 1)}
              disabled={activeSymbol === 0}
            >
              ‹
            </button>

            <div className="symbols__dots" role="tablist" aria-label="Pilih simbol">
              {LOGO_SYMBOLS.map(({ title }, i) => (
                <button
                  key={title}
                  role="tab"
                  aria-selected={i === activeSymbol}
                  aria-label={title}
                  className={`symbols__dot${i === activeSymbol ? ' symbols__dot--active' : ''}`}
                  onClick={() => goSymbol(i)}
                />
              ))}
            </div>

            <button
              type="button"
              className="symbols__arrow"
              aria-label="Selanjutnya"
              onClick={() => goSymbol(activeSymbol + 1)}
              disabled={activeSymbol === LOGO_SYMBOLS.length - 1}
            >
              ›
            </button>
          </div>
        </div>
      </section>

      {/* ═══ Activities ═══ */}
      <section className="activities">
        <img src={flowerDeco} alt="" className="activities__deco activities__deco--flower" aria-hidden="true" />

        <div className="activities__inner">
          <h2 className="activities__title">Kegiatan Terpopuler</h2>

          <div className="activities__filters">
            {ACTIVITY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`activities__filter${cat === activeCategory ? ' activities__filter--active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="activities__carousel">
            <button
              type="button"
              className="activities__arrow activities__arrow--prev"
              aria-label="Kegiatan sebelumnya"
              onClick={() => scrollActivities(-1)}
            >
              ‹
            </button>

            <div className="activities__grid" ref={activitiesTrackRef}>
              {filteredActivities.map(({ title, icon, participants, dateRange, quota, desc }, i) => (
                <article key={title} className="activity-card">
                  <div className={`activity-card__banner activity-card__banner--${i % 4}`}>
                    <img src={icon} alt="" className="activity-card__icon" />
                  </div>

                  <div className="activity-card__body">
                    <div className="activity-card__meta">
                      <span className="activity-card__participants">+{participants} Peserta</span>
                      <span className="activity-card__date">{dateRange}</span>
                    </div>

                    <h3 className="activity-card__title">{title}</h3>
                    <p className="activity-card__desc">{desc}</p>

                    <div className="activity-card__footer">
                      <span className="activity-card__quota">Kuota: {quota} tersisa</span>
                      <a href="#" className="activity-card__cta">Daftar Sekarang</a>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <button
              type="button"
              className="activities__arrow activities__arrow--next"
              aria-label="Kegiatan selanjutnya"
              onClick={() => scrollActivities(1)}
            >
              ›
            </button>
          </div>

          <div className="activities__footer">
            <a href="#" className="activities__cta">Lihat Semua Kegiatan</a>
          </div>
        </div>
      </section>

      {/* ═══ Trust Badges ═══ */}
      <section className="trust">
        <div className="trust__card">
          {TRUST_BADGES.map(({ icon, title, desc }) => (
            <div key={title} className="trust__item">
              <div className="trust__badge">
                <img src={icon} alt="" className="trust__badge-icon" />
              </div>
              <div className="trust__text">
                <h3 className="trust__title">{title}</h3>
                <p className="trust__desc">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Gallery ═══ */}
      <section className="gallery">
        <div className="gallery__inner">
          <h2 className="gallery__title">
            GALERI MOMEN<br />VOLUNTEER KAMI.
          </h2>
          <p className="gallery__subtitle">
            Setiap kegiatan ActiVibe meninggalkan cerita. Jelajahi momen-momen nyata dari volunteer
            yang sudah turun langsung memberi dampak.
          </p>

          <div className="gallery__tabs-row">
            <div className="gallery__tabs">
              {GALLERY_MOMENTS.map(({ tab }, i) => (
                <button
                  key={tab}
                  type="button"
                  className={`gallery__tab${i === activeMoment ? ' gallery__tab--active' : ''}`}
                  onClick={() => setActiveMoment(i)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="gallery__nav">
              <button type="button" className="gallery__nav-arrow" aria-label="Sebelumnya" onClick={() => goMoment(-1)}>‹</button>
              <button type="button" className="gallery__nav-arrow" aria-label="Selanjutnya" onClick={() => goMoment(1)}>›</button>
            </div>
          </div>

          <div className="gallery__carousel">
            <article className="gallery__peek gallery__peek--left">
              <div className="gallery__peek-head">
                <span className="gallery__peek-avatar" aria-hidden="true" />
                <span className="gallery__peek-name">{prevMoment.title}</span>
              </div>
              <img src={prevMoment.img} alt="" className="gallery__peek-img" />
              <div className="gallery__peek-stats">
                <span>♥ {prevMoment.likes}</span>
                <span>💬 {prevMoment.comments}</span>
              </div>
            </article>

            <article className="gallery__feature">
              <img src={GALLERY_MOMENTS[activeMoment].img} alt={GALLERY_MOMENTS[activeMoment].title} className="gallery__feature-img" />
              <div className="gallery__feature-overlay" aria-hidden="true" />

              <div className="gallery__feature-floating gallery__feature-floating--card">
                <img src={GALLERY_MOMENTS[activeMoment].img} alt="" className="gallery__feature-floating-thumb" />
                <div>
                  <p className="gallery__feature-floating-title">+{GALLERY_MOMENTS[activeMoment].volunteers} Volunteer</p>
                  <p className="gallery__feature-floating-sub">ikut berpartisipasi</p>
                </div>
              </div>

              <div className="gallery__feature-floating gallery__feature-floating--tag">
                {GALLERY_MOMENTS[activeMoment].tag}
              </div>

              <div className="gallery__feature-content">
                <p className="gallery__feature-label">{GALLERY_MOMENTS[activeMoment].tag}</p>
                <h3 className="gallery__feature-title">{GALLERY_MOMENTS[activeMoment].title}</h3>
                <p className="gallery__feature-desc">{GALLERY_MOMENTS[activeMoment].desc}</p>
                <a href="#" className="gallery__feature-cta">Lihat Galeri →</a>
              </div>
            </article>

            <article className="gallery__peek gallery__peek--right">
              <div className="gallery__peek-head">
                <span className="gallery__peek-avatar" aria-hidden="true" />
                <span className="gallery__peek-name">{nextMoment.title}</span>
              </div>
              <img src={nextMoment.img} alt="" className="gallery__peek-img" />
              <div className="gallery__peek-stats">
                <span>♥ {nextMoment.likes}</span>
                <span>💬 {nextMoment.comments}</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ═══ Rating ═══ */}
      <section className="rating">
        <div className="rating__inner">
          <div className="rating__eyebrow-row">
            <span className="rating__eyebrow">Ulasan</span>
            <span className="rating__eyebrow-line" aria-hidden="true" />
          </div>
          <h2 className="rating__title">Apa Kata Volunteer Kami</h2>

          <div className="rating__grid">
            {visibleTestimonials.map(({ quote, name, role, avatar }) => (
              <article key={name} className="rating-card">
                <p className="rating-card__quote">{quote}</p>
                <div className="rating-card__author">
                  <img src={avatar} alt="" className="rating-card__avatar" />
                  <div className="rating-card__author-text">
                    <span className="rating-card__name">{name}</span>
                    <span className="rating-card__role">{role}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {ratingPageCount > 1 && (
            <div className="rating__dots" role="tablist" aria-label="Halaman ulasan">
              {Array.from({ length: ratingPageCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === ratingPage}
                  aria-label={`Halaman ulasan ${i + 1}`}
                  className={`rating__dot${i === ratingPage ? ' rating__dot--active' : ''}`}
                  onClick={() => setRatingPage(i)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />

    </main>
  )
}
