import { useState, useRef, useEffect } from 'react'
import { FiChevronDown, FiX } from 'react-icons/fi'
import './MultiSelectDropdown.css'

export interface MultiSelectOption {
  value: string
  label: string
}

export interface MultiSelectGroup {
  groupName?: string
  items: MultiSelectOption[]
}

interface MultiSelectDropdownProps {
  options: MultiSelectOption[] | MultiSelectGroup[]
  selectedValues: Set<string>
  onChange: (value: string) => void
  placeholder?: string
}

export default function MultiSelectDropdown({
  options,
  selectedValues,
  onChange,
  placeholder = 'Pilih...',
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isGrouped = options.length > 0 && 'items' in options[0]

  const allItemsFlat = isGrouped
    ? (options as MultiSelectGroup[]).flatMap((g) => g.items)
    : (options as MultiSelectOption[])

  const selectedOptions = allItemsFlat.filter((opt) => selectedValues.has(opt.value))

  const renderOption = (opt: MultiSelectOption) => {
    if (searchQuery && !opt.label.toLowerCase().includes(searchQuery.toLowerCase())) {
      return null
    }
    return (
      <label key={opt.value} className="multi-select__option">
        <input
          type="checkbox"
          checked={selectedValues.has(opt.value)}
          onChange={() => onChange(opt.value)}
        />
        <span>{opt.label}</span>
      </label>
    )
  }

  return (
    <div className="multi-select" ref={containerRef}>
      <div className={`multi-select__control ${isOpen ? 'is-open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <div className="multi-select__values">
          {selectedOptions.length === 0 ? (
            <span className="multi-select__placeholder">{placeholder}</span>
          ) : (
            selectedOptions.map((opt) => (
              <span
                key={opt.value}
                className="multi-select__badge"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange(opt.value)
                }}
              >
                {opt.label}
                <FiX size={12} />
              </span>
            ))
          )}
        </div>
        <div className="multi-select__indicator">
          <FiChevronDown />
        </div>
      </div>

      {isOpen && (
        <div className="multi-select__menu">
          <div className="multi-select__search-wrapper">
            <input
              type="text"
              className="multi-select__search"
              placeholder="Cari..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="multi-select__options-container">
            {isGrouped
              ? (options as MultiSelectGroup[]).map((group) => {
                  const hasMatch = group.items.some(opt => 
                    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  if (searchQuery && !hasMatch) return null

                  return (
                    <div key={group.groupName || 'ungrouped'} className="multi-select__group">
                      {group.groupName && <div className="multi-select__group-label">{group.groupName}</div>}
                      {group.items.map(renderOption)}
                    </div>
                  )
                })
              : (options as MultiSelectOption[]).map(renderOption)}
          </div>
        </div>
      )}
    </div>
  )
}
