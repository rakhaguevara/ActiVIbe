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
  skills: string[]
}

export default function VolunteerSearchBar({ filters, onChange, categories, skills }: VolunteerSearchBarProps) {
  const update = (patch: Partial<EventFilters>) => onChange({ ...filters, ...patch })

  return (
    <div className="volunteer-search-bar">
      <div className="volunteer-search-bar__row">
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
      </div>

      <div className="volunteer-search-bar__pills">
        <select value={filters.category} onChange={(e) => update({ category: e.target.value })}>
          <option value="">Semua Kategori</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select value={filters.skill} onChange={(e) => update({ skill: e.target.value })}>
          <option value="">Semua Skill</option>
          {skills.map((skill) => (
            <option key={skill} value={skill}>{skill}</option>
          ))}
        </select>

        <label className="volunteer-search-bar__toggle">
          <input
            type="checkbox"
            checked={filters.oneDayOnly}
            onChange={(e) => update({ oneDayOnly: e.target.checked })}
          />
          Hanya 1 hari
        </label>
      </div>
    </div>
  )
}
