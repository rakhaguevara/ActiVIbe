import wave from '../assets/svg/wave.svg'
import Footer from '../components/Footer'
import './AboutPage.css'

export default function AboutPage() {
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

      <Footer />
    </main>
  )
}
