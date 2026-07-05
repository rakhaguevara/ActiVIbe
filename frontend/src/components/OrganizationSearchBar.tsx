import { FiSearch, FiMapPin } from 'react-icons/fi'
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

export default function OrganizationSearchBar({ filters, onChange, causeAreas }: OrganizationSearchBarProps) {
  const update = (patch: Partial<OrganizationFilters>) => onChange({ ...filters, ...patch })

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

      <div className="organization-search-bar__input-group">
        <FiMapPin aria-hidden="true" />
        <input
          type="text"
          placeholder="Lokasi (cth. Yogyakarta)"
          value={filters.location}
          onChange={(e) => update({ location: e.target.value })}
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
