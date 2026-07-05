import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import InlineLoading from '../../components/InlineLoading'
import OrganizationListSidebar from '../../components/OrganizationListSidebar'
import OrganizationDetailPanel from '../../components/OrganizationDetailPanel'
import OrganizationSearchBar, { type OrganizationFilters } from '../../components/OrganizationSearchBar'
import ScrollPane from '../../components/ScrollPane'
import SectionErrorBoundary from '../../components/SectionErrorBoundary'
import SectionState from '../../components/SectionState'
import { listOrganizations } from '../../lib/organizationApi'
import type { Organization } from '../../types/organization'
import './FindOrganizationPage.css'

const EMPTY_FILTERS: OrganizationFilters = {
  name: '',
  location: '',
  causeArea: '',
}

export default function FindOrganizationPage() {
  const { user, isLoading: isLoadingAuth } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState<OrganizationFilters>(EMPTY_FILTERS)
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)

  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrganizations = () => {
    setIsLoading(true)
    setError(null)
    listOrganizations()
      .then(setOrganizations)
      .catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat organisasi, coba lagi.'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchOrganizations()
  }, [])

  useEffect(() => {
    if (!isLoadingAuth && !user) {
      navigate('/', { replace: true })
    }
  }, [isLoadingAuth, user, navigate])

  const causeAreas = useMemo(
    () => Array.from(new Set(organizations.flatMap((org) => org.causeAreas))),
    [organizations],
  )

  const filteredOrganizations = useMemo(() => {
    const name = filters.name.trim().toLowerCase()
    const location = filters.location.trim().toLowerCase()

    return organizations.filter((org) => {
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
  }, [organizations, filters])

  // ?org=... dipakai link share dari OrganizationListSidebar/OrganizationDetailPanel
  useEffect(() => {
    const sharedOrgId = searchParams.get('org')
    if (sharedOrgId && organizations.some((org) => org.id === sharedOrgId)) {
      setSelectedOrgId(sharedOrgId)
    }
  }, [searchParams, organizations])

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

  if (isLoadingAuth || !user) {
    return null
  }

  const selectedIndex = filteredOrganizations.findIndex((org) => org.id === selectedOrgId)
  const selectedOrganization = selectedIndex >= 0 ? filteredOrganizations[selectedIndex] : null

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
        {isLoading ? (
          <SectionState variant="loading" title="Memuat daftar organisasi…" />
        ) : error ? (
          <SectionState variant="error" title={error} onRetry={fetchOrganizations} />
        ) : filteredOrganizations.length === 0 ? (
          <SectionState variant="empty" title="Tidak ada organisasi yang cocok dengan pencarian ini." />
        ) : (
          <ScrollPane>
            <OrganizationListSidebar
              organizations={filteredOrganizations}
              selectedOrganizationId={selectedOrgId}
              onSelect={setSelectedOrgId}
            />
          </ScrollPane>
        )}

        {isLoading ? (
          <InlineLoading />
        ) : error ? null : selectedOrganization ? (
          <ScrollPane>
            <SectionErrorBoundary>
              <OrganizationDetailPanel
                organization={selectedOrganization}
                availableEventsCount={selectedOrganization.eventsCount}
                currentIndex={selectedIndex}
                total={filteredOrganizations.length}
                onPrev={() => goToOffset(-1)}
                onNext={() => goToOffset(1)}
                onBackToResults={() => setSelectedOrgId(null)}
              />
            </SectionErrorBoundary>
          </ScrollPane>
        ) : (
          <SectionState variant="empty" title="Pilih organisasi untuk melihat profil lengkapnya." />
        )}
      </div>
    </main>
  )
}
