import { useState, useEffect } from 'react'
import { FiX, FiSearch, FiMapPin, FiCalendar, FiTag } from 'react-icons/fi'
import { type EventFilters } from './VolunteerSearchBar'
import './MobileSearchModal.css'

interface MobileSearchModalProps {
  isOpen: boolean
  onClose: () => void
  filters: EventFilters
  onChange: (filters: EventFilters) => void
  categories: string[]
}

type ActiveSection = 'where' | 'when' | 'category' | null

export default function MobileSearchModal({ isOpen, onClose, filters, onChange, categories }: MobileSearchModalProps) {
  const [localFilters, setLocalFilters] = useState<EventFilters>(filters)
  const [activeSection, setActiveSection] = useState<ActiveSection>('where')

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters)
      setActiveSection('where')
    }
  }, [isOpen, filters])

  if (!isOpen) return null

  const handleApply = () => {
    onChange(localFilters)
    onClose()
  }

  const handleClear = () => {
    setLocalFilters({
      keyword: '',
      location: '',
      category: '',
      skill: '',
      oneDayOnly: false,
    })
    setActiveSection('where')
  }

  const SUGGESTED_LOCATIONS = [
    { label: 'Semua Lokasi', desc: 'Jelajahi ke mana saja', value: '' },
    { label: 'Bandung, Indonesia', desc: 'Kota kembang yang sejuk', value: 'Bandung' },
    { label: 'Jakarta, Indonesia', desc: 'Pusat kota metropolitan', value: 'Jakarta' },
    { label: 'Yogyakarta, Indonesia', desc: 'Kota budaya dan pendidikan', value: 'Yogyakarta' },
  ]

  return (
    <div className="mobile-search-modal">
      <div className="mobile-search-modal__header">
        <button type="button" className="mobile-search-modal__close" onClick={onClose}>
          <FiX />
        </button>
      </div>

      <div className="mobile-search-modal__content">
        {/* WHERE SECTION */}
        <div className={`mobile-search-modal__card ${activeSection === 'where' ? 'is-active' : ''}`}>
          {activeSection !== 'where' ? (
            <div className="mobile-search-modal__collapsed" onClick={() => setActiveSection('where')}>
              <span className="mobile-search-modal__collapsed-title">Where</span>
              <span className="mobile-search-modal__collapsed-value">
                {localFilters.location || localFilters.keyword || 'Add destinations'}
              </span>
            </div>
          ) : (
            <div className="mobile-search-modal__expanded">
              <h2 className="mobile-search-modal__title">Where?</h2>
              
              <div className="mobile-search-modal__input-group">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Cari kota, kegiatan, atau organizer"
                  value={localFilters.keyword || localFilters.location}
                  onChange={(e) => setLocalFilters({ ...localFilters, keyword: e.target.value })}
                  autoFocus
                />
              </div>

              <div className="mobile-search-modal__suggestions">
                <p className="mobile-search-modal__subtitle">Suggested destinations</p>
                <div className="mobile-search-modal__list">
                  {SUGGESTED_LOCATIONS.map((loc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="mobile-search-modal__list-item"
                      onClick={() => setLocalFilters({ ...localFilters, location: loc.value })}
                    >
                      <div className="mobile-search-modal__list-icon"><FiMapPin /></div>
                      <div className="mobile-search-modal__list-text">
                        <span className="mobile-search-modal__list-label">{loc.label}</span>
                        <span className="mobile-search-modal__list-desc">{loc.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* WHEN SECTION */}
        <div className={`mobile-search-modal__card ${activeSection === 'when' ? 'is-active' : ''}`}>
          {activeSection !== 'when' ? (
            <div className="mobile-search-modal__collapsed" onClick={() => setActiveSection('when')}>
              <span className="mobile-search-modal__collapsed-title">When</span>
              <span className="mobile-search-modal__collapsed-value">
                {localFilters.oneDayOnly ? '1 Hari Saja' : 'Add dates'}
              </span>
            </div>
          ) : (
            <div className="mobile-search-modal__expanded">
              <h2 className="mobile-search-modal__title">When?</h2>
              <div className="mobile-search-modal__options-row">
                <label className="mobile-search-modal__checkbox-label">
                  <input
                    type="checkbox"
                    checked={localFilters.oneDayOnly}
                    onChange={(e) => setLocalFilters({ ...localFilters, oneDayOnly: e.target.checked })}
                  />
                  Hanya kegiatan 1 hari
                </label>
              </div>
            </div>
          )}
        </div>

        {/* CATEGORY SECTION */}
        <div className={`mobile-search-modal__card ${activeSection === 'category' ? 'is-active' : ''}`}>
          {activeSection !== 'category' ? (
            <div className="mobile-search-modal__collapsed" onClick={() => setActiveSection('category')}>
              <span className="mobile-search-modal__collapsed-title">Category</span>
              <span className="mobile-search-modal__collapsed-value">
                {localFilters.category || 'Add category'}
              </span>
            </div>
          ) : (
            <div className="mobile-search-modal__expanded">
              <h2 className="mobile-search-modal__title">Category?</h2>
              <div className="mobile-search-modal__scroll-options">
                <button
                  type="button"
                  className={`mobile-search-modal__pill ${!localFilters.category ? 'is-selected' : ''}`}
                  onClick={() => setLocalFilters({ ...localFilters, category: '' })}
                >
                  Semua Kategori
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`mobile-search-modal__pill ${localFilters.category === cat ? 'is-selected' : ''}`}
                    onClick={() => setLocalFilters({ ...localFilters, category: cat })}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mobile-search-modal__footer">
        <button type="button" className="mobile-search-modal__clear" onClick={handleClear}>
          Clear all
        </button>
        <button type="button" className="mobile-search-modal__submit" onClick={handleApply}>
          <FiSearch /> Search
        </button>
      </div>
    </div>
  )
}
