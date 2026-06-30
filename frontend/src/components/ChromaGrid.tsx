import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import './ChromaGrid.css'

export interface ChromaItem {
  image: string
  title: string
  subtitle: string
  handle?: string
  location?: string
  borderColor?: string
  gradient?: string
  url?: string
}

interface ChromaGridProps {
  items: ChromaItem[]
  className?: string
  radius?: number
  columns?: number
  rows?: number
  damping?: number
  fadeOut?: number
  ease?: string
}

export const ChromaGrid = ({
  items,
  className = '',
  radius = 280,
  columns = 4,
  rows = 1,
  damping = 0.45,
  fadeOut = 0.6,
  ease = 'power3.out',
}: ChromaGridProps) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const fadeRef = useRef<HTMLDivElement>(null)
  const setXRef = useRef<gsap.QuickToFunc | null>(null)
  const setYRef = useRef<gsap.QuickToFunc | null>(null)
  const pos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    setXRef.current = gsap.quickSetter(el, '--x', 'px') as gsap.QuickToFunc
    setYRef.current = gsap.quickSetter(el, '--y', 'px') as gsap.QuickToFunc
    const { width, height } = el.getBoundingClientRect()
    pos.current = { x: width / 2, y: height / 2 }
    setXRef.current(pos.current.x)
    setYRef.current(pos.current.y)
  }, [])

  const moveTo = (x: number, y: number) => {
    gsap.to(pos.current, {
      x,
      y,
      duration: damping,
      ease,
      onUpdate: () => {
        setXRef.current?.(pos.current.x)
        setYRef.current?.(pos.current.y)
      },
      overwrite: true,
    })
  }

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = rootRef.current!.getBoundingClientRect()
    moveTo(e.clientX - r.left, e.clientY - r.top)
    gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true })
  }

  const handleLeave = () => {
    gsap.to(fadeRef.current, { opacity: 1, duration: fadeOut, overwrite: true })
  }

  const handleCardClick = (url?: string) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleCardMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
  }

  return (
    <div
      ref={rootRef}
      className={`chroma-grid ${className}`}
      style={
        {
          '--r': `${radius}px`,
          '--cols': columns,
          '--rows': rows,
        } as React.CSSProperties
      }
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {items.map((c, i) => (
        <article
          key={i}
          className="chroma-card"
          onMouseMove={handleCardMove}
          onClick={() => handleCardClick(c.url)}
          style={
            {
              '--card-border': c.borderColor ?? 'transparent',
              '--card-gradient': c.gradient,
              cursor: c.url ? 'pointer' : 'default',
            } as React.CSSProperties
          }
        >
          <div className="chroma-img-wrapper">
            <img src={c.image} alt={c.title} loading="lazy" />
          </div>
          <footer className="chroma-info">
            <h3 className="chroma-name">{c.title}</h3>
            {c.handle && <span className="chroma-handle">{c.handle}</span>}
            <p className="chroma-role">{c.subtitle}</p>
            {c.location && <span className="chroma-location">{c.location}</span>}
          </footer>
        </article>
      ))}
      <div className="chroma-overlay" />
      <div ref={fadeRef} className="chroma-fade" />
    </div>
  )
}

export default ChromaGrid
