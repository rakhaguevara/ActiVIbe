import { FiSearch, FiMapPin } from 'react-icons/fi'
import './VolunteerSearchBar.css'

export interface EventFilters {
  keyword: string
  location: string
  category: string
  skill: string
  oneDayOnly: boolean
}

interface VolunteerSearchBarProps {
  filters: EventFilters
  onChange: (filters: EventFilters) => void
  categories: string[]
}

export default function VolunteerSearchBar({ filters, onChange, categories }: VolunteerSearchBarProps) {
  const update = (patch: Partial<EventFilters>) => onChange({ ...filters, ...patch })

  return (
    <form className="volunteer-search-bar" onSubmit={(e) => e.preventDefault()}>
      <span className="volunteer-search-bar__type">Kegiatan Volunteer</span>

      <div className="volunteer-search-bar__input-group">
        <FiSearch aria-hidden="true" />
        <input
          type="text"
          placeholder="Cari kegiatan, skill, atau minat..."
          value={filters.keyword}
          onChange={(e) => update({ keyword: e.target.value })}
        />
      </div>

      <div className="volunteer-search-bar__input-group">
        <FiMapPin aria-hidden="true" />
        <input
          type="text"
          placeholder="Lokasi (cth. Yogyakarta)"
          value={filters.location}
          onChange={(e) => update({ location: e.target.value })}
        />
      </div>

      <select
        className="volunteer-search-bar__category"
        value={filters.category}
        onChange={(e) => update({ category: e.target.value })}
      >
        <option value="">Semua Kategori</option>
        {categories.map((category) => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>

      <button type="submit" className="volunteer-search-bar__submit">
        <FiSearch aria-hidden="true" /> Cari
      </button>
    </form>
  )
}
