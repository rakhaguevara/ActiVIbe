import { useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import LocationSelector, { EMPTY_LOCATION, type LocationValue } from './location/LocationSelector'
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

function locationValueToFilterString(value: LocationValue): string {
  if (value.regencyId) {
    return value.provinceName ? `${value.regencyName}, ${value.provinceName}` : value.regencyName
  }
  return value.provinceName
}

export default function VolunteerSearchBar({ filters, onChange, categories }: VolunteerSearchBarProps) {
  const [locationValue, setLocationValue] = useState<LocationValue>(EMPTY_LOCATION)
  const update = (patch: Partial<EventFilters>) => onChange({ ...filters, ...patch })

  const handleLocationChange = (value: LocationValue) => {
    setLocationValue(value)
    update({ location: locationValueToFilterString(value) })
  }

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

      <div className="volunteer-search-bar__location">
        <LocationSelector
          value={locationValue}
          onChange={handleLocationChange}
          showDistrict={false}
          showVillage={false}
          label="Lokasi"
          placeholder="Lokasi (cth. Yogyakarta)"
          variant="bar"
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
