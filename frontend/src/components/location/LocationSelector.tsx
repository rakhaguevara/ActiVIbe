import { useCallback, useEffect, useRef, useState } from 'react'
import { locationService, type LocationItem } from '../../services/locationService'
import './LocationSelector.css'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LocationValue {
  provinceId: string
  provinceName: string
  regencyId: string
  regencyName: string
  districtId: string
  districtName: string
  villageId: string
  villageName: string
}

export const EMPTY_LOCATION: LocationValue = {
  provinceId: '',
  provinceName: '',
  regencyId: '',
  regencyName: '',
  districtId: '',
  districtName: '',
  villageId: '',
  villageName: '',
}

export interface LocationSelectorProps {
  /** Nilai terpilih saat ini */
  value: LocationValue
  /** Callback setiap ada perubahan */
  onChange: (value: LocationValue) => void
  /** Tampilkan dropdown provinsi (default: true) */
  showProvince?: boolean
  /** Tampilkan dropdown kabupaten/kota (default: true) */
  showRegency?: boolean
  /** Tampilkan dropdown kecamatan (default: false) */
  showDistrict?: boolean
  /** Tampilkan dropdown desa/kelurahan (default: false) */
  showVillage?: boolean
  /** Jadikan field required (muncul indikator *) */
  required?: boolean
  /** Nonaktifkan seluruh komponen */
  disabled?: boolean
  /** Override placeholder untuk semua dropdown */
  placeholder?: string
  /** Label grup (opsional) */
  label?: string
}

// ─── In-memory cache ──────────────────────────────────────────────────────────
// Cache bertahan selama sesi browser, mencegah fetch duplikat.

let _provincesCache: LocationItem[] | null = null
const regenciesCache = new Map<string, LocationItem[]>()
const districtsCache = new Map<string, LocationItem[]>()
const villagesCache = new Map<string, LocationItem[]>()

// ─── Single-field Searchable Dropdown ────────────────────────────────────────

interface DropdownProps {
  id: string
  label: string
  ariaLabel: string
  placeholder: string
  items: LocationItem[]
  selectedId: string
  selectedName: string
  isLoading: boolean
  isDisabled: boolean
  required?: boolean
  onSelect: (item: LocationItem) => void
}

function SearchableDropdown({
  id,
  label,
  ariaLabel,
  placeholder,
  items,
  selectedId,
  selectedName,
  isLoading,
  isDisabled,
  required,
  onSelect,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const wrapRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Tutup menu jika klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Fokus input search saat menu terbuka
  useEffect(() => {
    if (isOpen) {
      searchRef.current?.focus()
    }
  }, [isOpen])

  const filteredItems = search.trim()
    ? items.filter((item) => item.name.toLowerCase().includes(search.trim().toLowerCase()))
    : items

  function handleOpen() {
    if (isDisabled) return
    setIsOpen((prev) => !prev)
    setSearch('')
  }

  function handleSelect(item: LocationItem) {
    onSelect(item)
    setIsOpen(false)
    setSearch('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setSearch('')
    }
  }

  const displayText = selectedName || null

  return (
    <div className="location-selector__field">
      <label htmlFor={`${id}-trigger`} className="location-selector__label">
        {label}
        {required && (
          <span className="location-selector__required" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <div className="location-selector__dropdown-wrap" ref={wrapRef}>
        {/* Trigger button */}
        <button
          id={`${id}-trigger`}
          type="button"
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-required={required}
          className={[
            'location-selector__trigger',
            isOpen ? 'location-selector__trigger--open' : '',
            !displayText ? 'location-selector__trigger--placeholder' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          disabled={isDisabled}
          onClick={handleOpen}
          onKeyDown={handleKeyDown}
        >
          <span className="location-selector__trigger-text">
            {isLoading ? `Memuat ${label.toLowerCase()}...` : (displayText ?? placeholder)}
          </span>
          <span className={`location-selector__chevron${isOpen ? ' location-selector__chevron--open' : ''}`}>
            ▾
          </span>
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="location-selector__menu" role="listbox" aria-label={ariaLabel}>
            {/* Search input */}
            <input
              ref={searchRef}
              type="text"
              className="location-selector__search"
              placeholder={`Cari ${label.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={`Cari ${label.toLowerCase()}`}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsOpen(false)
                  setSearch('')
                }
              }}
            />

            {/* List */}
            {isLoading ? (
              <div className="location-selector__loading">
                <span className="location-selector__spinner" aria-hidden="true" />
                Memuat {label.toLowerCase()}...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="location-selector__empty">Tidak ada data</div>
            ) : (
              <ul className="location-selector__list">
                {filteredItems.map((item) => (
                  <li
                    key={item.id}
                    role="option"
                    aria-selected={item.id === selectedId}
                    className={[
                      'location-selector__option',
                      item.id === selectedId ? 'location-selector__option--selected' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => handleSelect(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleSelect(item)
                      }
                    }}
                    tabIndex={0}
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── LocationSelector (Main Component) ───────────────────────────────────────

export default function LocationSelector({
  value,
  onChange,
  showProvince = true,
  showRegency = true,
  showDistrict = false,
  showVillage = false,
  required = false,
  disabled = false,
  placeholder = 'Pilih...',
  label,
}: LocationSelectorProps) {
  const [provinces, setProvinces] = useState<LocationItem[]>([])
  const [regencies, setRegencies] = useState<LocationItem[]>([])
  const [districts, setDistricts] = useState<LocationItem[]>([])
  const [villages, setVillages] = useState<LocationItem[]>([])

  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingRegencies, setLoadingRegencies] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingVillages, setLoadingVillages] = useState(false)

  // ── Load provinces on mount (cached) ──
  useEffect(() => {
    if (!showProvince) return

    if (_provincesCache) {
      setProvinces(_provincesCache)
      return
    }

    setLoadingProvinces(true)
    locationService
      .getProvinces()
      .then((data) => {
        _provincesCache = data
        setProvinces(data)
      })
      .finally(() => setLoadingProvinces(false))
  }, [showProvince])

  // ── Load regencies when province changes (cached) ──
  const loadRegencies = useCallback(
    async (provinceId: string) => {
      if (!showRegency || !provinceId) return

      if (regenciesCache.has(provinceId)) {
        setRegencies(regenciesCache.get(provinceId)!)
        return
      }

      setLoadingRegencies(true)
      try {
        const data = await locationService.getRegencies(provinceId)
        regenciesCache.set(provinceId, data)
        setRegencies(data)
      } finally {
        setLoadingRegencies(false)
      }
    },
    [showRegency],
  )

  // ── Load districts when regency changes (cached) ──
  const loadDistricts = useCallback(
    async (regencyId: string) => {
      if (!showDistrict || !regencyId) return

      if (districtsCache.has(regencyId)) {
        setDistricts(districtsCache.get(regencyId)!)
        return
      }

      setLoadingDistricts(true)
      try {
        const data = await locationService.getDistricts(regencyId)
        districtsCache.set(regencyId, data)
        setDistricts(data)
      } finally {
        setLoadingDistricts(false)
      }
    },
    [showDistrict],
  )

  // ── Load villages when district changes (cached) ──
  const loadVillages = useCallback(
    async (districtId: string) => {
      if (!showVillage || !districtId) return

      if (villagesCache.has(districtId)) {
        setVillages(villagesCache.get(districtId)!)
        return
      }

      setLoadingVillages(true)
      try {
        const data = await locationService.getVillages(districtId)
        villagesCache.set(districtId, data)
        setVillages(data)
      } finally {
        setLoadingVillages(false)
      }
    },
    [showVillage],
  )

  // ── Sync downstream lists when value prop changes externally ──
  useEffect(() => {
    if (value.provinceId) {
      loadRegencies(value.provinceId)
    }
  }, [value.provinceId, loadRegencies])

  useEffect(() => {
    if (value.regencyId) {
      loadDistricts(value.regencyId)
    }
  }, [value.regencyId, loadDistricts])

  useEffect(() => {
    if (value.districtId) {
      loadVillages(value.districtId)
    }
  }, [value.districtId, loadVillages])

  // ─── Handlers ─────────────────────────────────────────────────────────────

  function handleProvinceSelect(item: LocationItem) {
    // Reset seluruh downstream
    setRegencies([])
    setDistricts([])
    setVillages([])

    onChange({
      provinceId: item.id,
      provinceName: item.name,
      regencyId: '',
      regencyName: '',
      districtId: '',
      districtName: '',
      villageId: '',
      villageName: '',
    })

    loadRegencies(item.id)
  }

  function handleRegencySelect(item: LocationItem) {
    // Reset kecamatan & desa
    setDistricts([])
    setVillages([])

    onChange({
      ...value,
      regencyId: item.id,
      regencyName: item.name,
      districtId: '',
      districtName: '',
      villageId: '',
      villageName: '',
    })

    loadDistricts(item.id)
  }

  function handleDistrictSelect(item: LocationItem) {
    // Reset desa
    setVillages([])

    onChange({
      ...value,
      districtId: item.id,
      districtName: item.name,
      villageId: '',
      villageName: '',
    })

    loadVillages(item.id)
  }

  function handleVillageSelect(item: LocationItem) {
    onChange({
      ...value,
      villageId: item.id,
      villageName: item.name,
    })
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="location-selector" aria-label={label ?? 'Pilih wilayah'}>
      {showProvince && (
        <SearchableDropdown
          id="location-province"
          label="Provinsi"
          ariaLabel="Pilih provinsi"
          placeholder={placeholder}
          items={provinces}
          selectedId={value.provinceId}
          selectedName={value.provinceName}
          isLoading={loadingProvinces}
          isDisabled={disabled || loadingProvinces}
          required={required && showProvince}
          onSelect={handleProvinceSelect}
        />
      )}

      {showRegency && (
        <SearchableDropdown
          id="location-regency"
          label="Kabupaten / Kota"
          ariaLabel="Pilih kabupaten atau kota"
          placeholder={value.provinceId ? placeholder : 'Pilih provinsi terlebih dahulu'}
          items={regencies}
          selectedId={value.regencyId}
          selectedName={value.regencyName}
          isLoading={loadingRegencies}
          isDisabled={disabled || !value.provinceId || loadingRegencies}
          required={required && showRegency}
          onSelect={handleRegencySelect}
        />
      )}

      {showDistrict && (
        <SearchableDropdown
          id="location-district"
          label="Kecamatan"
          ariaLabel="Pilih kecamatan"
          placeholder={value.regencyId ? placeholder : 'Pilih kabupaten/kota terlebih dahulu'}
          items={districts}
          selectedId={value.districtId}
          selectedName={value.districtName}
          isLoading={loadingDistricts}
          isDisabled={disabled || !value.regencyId || loadingDistricts}
          required={required && showDistrict}
          onSelect={handleDistrictSelect}
        />
      )}

      {showVillage && (
        <SearchableDropdown
          id="location-village"
          label="Desa / Kelurahan"
          ariaLabel="Pilih desa atau kelurahan"
          placeholder={value.districtId ? placeholder : 'Pilih kecamatan terlebih dahulu'}
          items={villages}
          selectedId={value.villageId}
          selectedName={value.villageName}
          isLoading={loadingVillages}
          isDisabled={disabled || !value.districtId || loadingVillages}
          required={required && showVillage}
          onSelect={handleVillageSelect}
        />
      )}
    </div>
  )
}
