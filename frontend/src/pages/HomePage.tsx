import { useState, useEffect, useRef } from 'react'
import bg from '../assets/svg/background-1.svg'
import wave from '../assets/svg/wave.svg'
import iconVolunteer from '../assets/svg/recruitment 1.svg'
import iconOrganisasi from '../assets/svg/diversity 1.svg'
import iconAktivitas from '../assets/svg/together 1.svg'
import './HomePage.css'

const STATS = [
  { icon: iconVolunteer, value: 13231, label: 'Volunteer' },
  { icon: iconOrganisasi, value: 13231, label: 'Organisasi' },
  { icon: iconAktivitas, value: 13231, label: 'Aktivitas' },
]

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

function StatItem({
  icon,
  value,
  label,
  trigger,
}: {
  icon: string
  value: number
  label: string
  trigger: boolean
}) {
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

export default function HomePage() {
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = statsRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <main>
      <section className="hero">
        <img src={bg} alt="" className="hero__illustration" />
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
      {/* placeholder — akan diganti konten nyata */}
      <div className="scroll-placeholder" />
    </main>
  )
}
