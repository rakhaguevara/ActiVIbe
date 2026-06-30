import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { FiChevronDown } from 'react-icons/fi'
import './ScrollPane.css'

interface ScrollPaneProps {
  children: ReactNode
}

export default function ScrollPane({ children }: ScrollPaneProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [canScrollDown, setCanScrollDown] = useState(false)

  const checkScroll = () => {
    const el = contentRef.current
    if (!el) return
    setCanScrollDown(el.scrollHeight - el.scrollTop - el.clientHeight > 4)
  }

  useLayoutEffect(() => {
    checkScroll()
  })

  const scrollDown = () => {
    const el = contentRef.current
    if (!el) return
    el.scrollBy({ top: el.clientHeight * 0.8, behavior: 'smooth' })
  }

  return (
    <div className="scroll-pane">
      <div className="scroll-pane__content" ref={contentRef} onScroll={checkScroll}>
        {children}
      </div>
      {canScrollDown && (
        <button
          type="button"
          className="scroll-pane__hint"
          onClick={scrollDown}
          aria-label="Scroll ke bawah"
        >
          <FiChevronDown />
        </button>
      )}
    </div>
  )
}
