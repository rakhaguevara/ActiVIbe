import { useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import LocationSelector, { EMPTY_LOCATION, type LocationValue } from './location/LocationSelector'
import './OrganizationSearchBar.css'

export interface OrganizationFilters {
  name: string
  location: string
  causeArea: string
}

interface OrganizationSearchBarProps {
  filters: OrganizationFilters
  onChange: (filters: OrganizationFilters) => void
  causeAreas: string[]
}

function locationValueToFilterString(value: LocationValue): string {
  if (value.regencyId) {
    return value.provinceName ? `${value.regencyName}, ${value.provinceName}` : value.regencyName
  }
  return value.provinceName
}

export default function OrganizationSearchBar({ filters, onChange, causeAreas }: OrganizationSearchBarProps) {
  const [locationValue, setLocationValue] = useState<LocationValue>(EMPTY_LOCATION)
  const update = (patch: Partial<OrganizationFilters>) => onChange({ ...filters, ...patch })

  const handleLocationChange = (value: LocationValue) => {
    setLocationValue(value)
    update({ location: locationValueToFilterString(value) })
  }

  return (
    <form className="organization-search-bar" onSubmit={(e) => e.preventDefault()}>
      <span className="organization-search-bar__type">Cari Organisasi</span>

      <div className="organization-search-bar__input-group">
        <FiSearch aria-hidden="true" />
        <input
          type="text"
          placeholder="Cari nama organisasi..."
          value={filters.name}
          onChange={(e) => update({ name: e.target.value })}
        />
      </div>

      <div className="organization-search-bar__location">
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
        className="organization-search-bar__cause-select"
        value={filters.causeArea}
        onChange={(e) => update({ causeArea: e.target.value })}
      >
        <option value="">Semua Bidang Fokus</option>
        {causeAreas.map((cause) => (
          <option key={cause} value={cause}>{cause}</option>
        ))}
      </select>

      <button type="submit" className="organization-search-bar__submit">
        <FiSearch aria-hidden="true" /> Cari
      </button>
    </form>
  )
}
