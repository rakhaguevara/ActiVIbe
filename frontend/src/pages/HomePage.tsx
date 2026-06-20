import { useState, useEffect, useRef } from 'react'
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
import deco2 from '../assets/svg/Group 2.svg'
import deco3 from '../assets/svg/Group 3.svg'
import deco4 from '../assets/svg/Group 4.svg'
import deco5 from '../assets/svg/Group 5.svg'
import pic1 from '../assets/png/pic1 1.png'
import pic2 from '../assets/png/pic2 1.png'
import './HomePage.css'

/* ── Static data ── */
const STATS = [
  { icon: iconVolunteer, value: 13231, label: 'Volunteer' },
  { icon: iconOrganisasi, value: 13231, label: 'Organisasi' },
  { icon: iconAktivitas,  value: 13231, label: 'Aktivitas' },
]

const FEATURES = [
  {
    icon: guitarIcon,
    title: 'Social-Impact Activity',
    desc: 'Lorem ipsum dolor sit amet consectetur. Quis diam sed scelerisque aliquam imperdiet egestas. Quis diam sed scelerisque aliquam imperdiet egestas.',
  },
  {
    icon: fireworkIcon,
    title: 'Social-Impact Activity',
    desc: 'Lorem ipsum dolor sit amet consectetur. Quis diam sed scelerisque aliquam imperdiet egestas. Quis diam sed scelerisque aliquam imperdiet egestas.',
  },
  {
    icon: medalIcon,
    title: 'Social-Impact Activity',
    desc: 'Lorem ipsum dolor sit amet consectetur. Quis diam sed scelerisque aliquam imperdiet egestas. Quis diam sed scelerisque aliquam imperdiet egestas.',
  },
]

/* ── Mobile carousel slides ── */
const JOIN_SLIDES = [
  {
    img:     pic1,
    alt:     'Volunteer group',
    eyebrow: 'Bergabung dan Berdampak',
    title:   'Bergabung Bersama Activibe',
    desc:    'Lorem ipsum dolor sit amet consectetur. Quis diam sed scelerisque aliquam imperdiet egestas.',
  },
  {
    img:     pic2,
    alt:     'Volunteer individual',
    eyebrow: 'Bergabung dan Berdampak',
    title:   'Jadilah Relawan Berdampak',
    desc:    'Lorem ipsum dolor sit amet consectetur. Quis diam sed scelerisque aliquam imperdiet egestas.',
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

function useRevealOnScroll(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return { ref, visible }
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

  /* Mobile slider state */
  const [slideIndex,   setSlideIndex]   = useState(0)
  const [slideVisible, setSlideVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setPageLoaded(true), 80)
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
          Find or post jobs and volunteer opportunities around the world
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
            <h2 className="join__title">Bergabung Bersama Activibe</h2>
            <p  className="join__desc">
              Lorem ipsum dolor sit amet consectetur. Quis diam sed scelerisque aliquam imperdiet egestas.
            </p>

            <div className="join__photo-right">
              <img src={pic2} alt="Volunteer individual" className="join__img join__img--secondary" />
            </div>

            <p className="join__desc join__desc--sm">
              Lorem ipsum dolor sit amet consectetur. Quis diam sed scelerisque aliquam imperdiet egestas.
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

    </main>
  )
}
