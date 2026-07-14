import { useEffect, useRef, useState, type ReactNode } from 'react'
import { FiMoreVertical } from 'react-icons/fi'
import './DropdownMenu.css'

export interface DropdownMenuItem {
  label: string
  icon?: ReactNode
  onClick: () => void
  disabled?: boolean
  destructive?: boolean
}

interface DropdownMenuProps {
  items: DropdownMenuItem[]
  align?: 'left' | 'right'
  triggerLabel?: string
  triggerIcon?: ReactNode
  triggerClassName?: string
}

export default function DropdownMenu({
  items,
  align = 'right',
  triggerLabel = 'Menu aksi',
  triggerIcon,
  triggerClassName = 'btn btn--sm btn--outline',
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])

  useEffect(() => {
    if (!open) return

    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusedIndex((i) => Math.min(i + 1, items.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedIndex((i) => Math.max(i - 1, 0))
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, items.length])

  useEffect(() => {
    if (focusedIndex >= 0) itemRefs.current[focusedIndex]?.focus()
  }, [focusedIndex])

  const handleToggle = () => {
    setOpen((prev) => {
      const next = !prev
      if (next) setFocusedIndex(-1)
      return next
    })
  }

  return (
    <div className="dropdown-menu" ref={containerRef}>
      <button
        type="button"
        className={triggerClassName}
        style={{ padding: '0 8px' }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={triggerLabel}
        onClick={handleToggle}
      >
        {triggerIcon ?? <FiMoreVertical />}
      </button>
      {open && (
        <div className={`dropdown-menu__panel dropdown-menu__panel--${align}`} role="menu">
          {items.map((item, index) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              ref={(el) => {
                itemRefs.current[index] = el
              }}
              className={`dropdown-menu__item${item.destructive ? ' dropdown-menu__item--destructive' : ''}`}
              disabled={item.disabled}
              onClick={() => {
                setOpen(false)
                item.onClick()
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
