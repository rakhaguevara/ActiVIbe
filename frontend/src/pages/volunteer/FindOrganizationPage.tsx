import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import OrganizationListSidebar from '../../components/OrganizationListSidebar'
import OrganizationDetailPanel from '../../components/OrganizationDetailPanel'
import OrganizationSearchBar, { type OrganizationFilters } from '../../components/OrganizationSearchBar'
import ScrollPane from '../../components/ScrollPane'
import { mockOrganizations } from '../../data/mockOrganizations'
import { mockEvents } from '../../data/mockEvents'
import './FindOrganizationPage.css'

const EMPTY_FILTERS: OrganizationFilters = {
  name: '',
  location: '',
  causeArea: '',
}

export default function FindOrganizationPage() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState<OrganizationFilters>(EMPTY_FILTERS)
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/', { replace: true })
    }
  }, [isLoading, user, navigate])

  const causeAreas = useMemo(
    () => Array.from(new Set(mockOrganizations.flatMap((org) => org.causeAreas))),
    [],
  )

  const filteredOrganizations = useMemo(() => {
    const name = filters.name.trim().toLowerCase()
    const location = filters.location.trim().toLowerCase()

    return mockOrganizations.filter((org) => {
      if (name && !org.name.toLowerCase().includes(name) && !org.shortProfile.toLowerCase().includes(name)) {
        return false
      }
      if (location && !org.location.toLowerCase().includes(location)) {
        return false
      }
      if (filters.causeArea && !org.causeAreas.includes(filters.causeArea)) {
        return false
      }
      return true
    })
  }, [filters])

  // ?org=... dipakai link share dari OrganizationListSidebar/OrganizationDetailPanel
  useEffect(() => {
    const sharedOrgId = searchParams.get('org')
    if (sharedOrgId && mockOrganizations.some((org) => org.id === sharedOrgId)) {
      setSelectedOrgId(sharedOrgId)
    }
  }, [searchParams])

  useEffect(() => {
    if (filteredOrganizations.length === 0) {
      setSelectedOrgId(null)
      return
    }
    setSelectedOrgId((current) => {
      if (current && filteredOrganizations.some((org) => org.id === current)) return current
      return filteredOrganizations[0].id
    })
  }, [filteredOrganizations])

  if (isLoading || !user) {
    return null
  }

  const selectedIndex = filteredOrganizations.findIndex((org) => org.id === selectedOrgId)
  const selectedOrganization = selectedIndex >= 0 ? filteredOrganizations[selectedIndex] : null
  const availableEventsCount = selectedOrganization
    ? mockEvents.filter((event) => event.organizerName === selectedOrganization.name).length
    : 0

  const goToOffset = (offset: number) => {
    if (selectedIndex < 0) return
    const nextIndex = selectedIndex + offset
    if (nextIndex < 0 || nextIndex >= filteredOrganizations.length) return
    setSelectedOrgId(filteredOrganizations[nextIndex].id)
  }

  return (
    <main className="find-organization-page">
      <OrganizationSearchBar filters={filters} onChange={setFilters} causeAreas={causeAreas} />

      <div className="find-organization-page__results-row">
        <p className="find-organization-page__results-count">
          Organisasi Rekomendasi | Total {filteredOrganizations.length} hasil
        </p>
        <p className="find-organization-page__hint">
          Ikuti organisasi favoritmu atau daftar langsung ke kegiatan yang mereka buka.
        </p>
      </div>

      <div className="find-organization-page__columns">
        {filteredOrganizations.length === 0 ? (
          <p className="find-organization-page__empty">Tidak ada organisasi yang cocok dengan pencarian ini.</p>
        ) : (
          <ScrollPane>
            <OrganizationListSidebar
              organizations={filteredOrganizations}
              selectedOrganizationId={selectedOrgId}
              onSelect={setSelectedOrgId}
            />
          </ScrollPane>
        )}

        {selectedOrganization ? (
          <ScrollPane>
            <OrganizationDetailPanel
              organization={selectedOrganization}
              availableEventsCount={availableEventsCount}
              currentIndex={selectedIndex}
              total={filteredOrganizations.length}
              onPrev={() => goToOffset(-1)}
              onNext={() => goToOffset(1)}
              onBackToResults={() => setSelectedOrgId(null)}
            />
          </ScrollPane>
        ) : (
          <p className="find-organization-page__empty">Pilih organisasi untuk melihat profil lengkapnya.</p>
        )}
      </div>
    </main>
  )
}
