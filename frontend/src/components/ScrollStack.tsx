import { useLayoutEffect, useRef, type ReactNode } from 'react'
import './ScrollStack.css'

const MAX_VISIBLE = 4

interface ScrollStackItemProps {
  children: ReactNode
  itemClassName?: string
}

export const ScrollStackItem = ({ children, itemClassName = '' }: ScrollStackItemProps) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
)

interface ScrollStackProps {
  children: ReactNode
  className?: string
  itemDistance?: number      // Scroll distance between cards
  itemStackDistance?: number // Vertical offset when stacked
  stackPosition?: string     // CSS top value for the first card
  
  // Ignored props kept for API compatibility so it doesn't break existing usages
  itemScale?: number
  scaleEndPosition?: string
  baseScale?: number
  rotationAmount?: number
  blurAmount?: number
  useWindowScroll?: boolean
  onStackComplete?: () => void
}

const ScrollStack = ({
  children,
  className = '',
  itemDistance = 150, 
  itemStackDistance = 24,
  stackPosition = '15vh',
}: ScrollStackProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return
    const cards = Array.from(container.querySelectorAll<HTMLElement>('.scroll-stack-card'))

    // Convert stackPosition string
    let baseTopStr = stackPosition
    if (/^\d+$/.test(baseTopStr)) baseTopStr += 'px'
    if (baseTopStr.endsWith('%')) baseTopStr = baseTopStr.replace('%', 'vh')

    // Apply native position: sticky to each card
    cards.forEach((card, i) => {
      card.style.position = 'sticky'
      card.style.top = `calc(${baseTopStr} + ${i * itemStackDistance}px)`
      card.style.zIndex = String(i)
      
      // Spacing between cards (how much user has to scroll)
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`
      }
    })

    // Handle fading out cards deeper than MAX_VISIBLE
    const handleScroll = () => {
      let baseTopPx = 0
      if (baseTopStr.endsWith('vh')) {
        baseTopPx = (parseFloat(baseTopStr) / 100) * window.innerHeight
      } else {
        baseTopPx = parseFloat(baseTopStr) || 0
      }

      let maxStuckIndex = -1
      cards.forEach((card, i) => {
        const rect = card.getBoundingClientRect()
        const stickyTopThreshold = baseTopPx + i * itemStackDistance
        
        // If card hit its sticky top boundary
        if (rect.top <= stickyTopThreshold + 2) {
          maxStuckIndex = i
        }
      })

      cards.forEach((card, i) => {
        const shouldFade = i <= maxStuckIndex - MAX_VISIBLE
        card.style.opacity = shouldFade ? '0' : '1'
        // Prevent interaction on faded cards
        card.style.pointerEvents = shouldFade ? 'none' : 'auto'
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [itemDistance, itemStackDistance, stackPosition])

  return (
    <div ref={containerRef} className={`scroll-stack-scroller ${className}`.trim()}>
      <div className="scroll-stack-inner">
        {children}
        {/* Spacer to give the last card room to stay pinned before the container finishes scrolling up */}
        <div className="scroll-stack-end" style={{ height: '40vh', pointerEvents: 'none' }} />
      </div>
    </div>
  )
}

export default ScrollStack
