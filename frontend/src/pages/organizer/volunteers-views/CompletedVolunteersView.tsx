import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiSearch, FiUsers, FiAward, FiClock, FiFileText, FiDownload
} from 'react-icons/fi'
import VolunteerProfileDrawer from '../../../components/organizer/VolunteerProfileDrawer'
import { listGeneratedCertificatesRequest } from '../../../lib/organizerApi'
import { generateCertificatePdf, downloadCertificatePdf } from '../../../utils/certificateGenerator'
import { generateVolunteerProfilePdf } from '../../../utils/volunteerProfilePdf'
import type { Certificate, OrganizerVolunteer, OrganizerVolunteerApplication, OrganizerVolunteersResponse } from '../../../types/organizer'
import '../VolunteersPage.css'

interface CompletedRow {
  volunteer: OrganizerVolunteer
  application: OrganizerVolunteerApplication
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function CompletedVolunteersView({ data }: { data: OrganizerVolunteersResponse }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [eventFilter, setEventFilter] = useState('')
  const [selectedProfile, setSelectedProfile] = useState<OrganizerVolunteer | null>(null)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  // Sertifikat difetch terpisah dari OrganizerVolunteersResponse (endpoint
  // beda modul) — cukup sekali saat view ini mount, dipakai lookup by
  // applicationId saat tombol Download diklik.
  useEffect(() => {
    listGeneratedCertificatesRequest().then(setCertificates).catch(() => {})
  }, [])

  const handleDownloadCertificate = async (app: OrganizerVolunteerApplication) => {
    const certificate = certificates.find((c) => c.applicationId === app.applicationId)
    if (!certificate || !certificate.templateUrl) {
      window.alert('Sertifikat belum tersedia untuk diunduh.')
      return
    }
    setDownloadingId(app.applicationId)
    try {
      const bytes = await generateCertificatePdf({
        participantName: certificate.participantName,
        eventTitle: certificate.eventTitle,
        templateUrl: certificate.templateUrl,
        organizationLogoUrl: certificate.organizationLogoUrl,
      })
      downloadCertificatePdf(bytes, `Sertifikat - ${certificate.volunteerName} - ${certificate.eventTitle}.pdf`)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal mengunduh sertifikat.')
    } finally {
      setDownloadingId(null)
    }
  }

  const rows: CompletedRow[] = useMemo(() => {
    const result: CompletedRow[] = []
    for (const volunteer of data.volunteers) {
      for (const application of volunteer.applications) {
        if (application.status === 'completed') result.push({ volunteer, application })
      }
    }
    return result
  }, [data.volunteers])

  const eventOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.application.eventTitle))).sort(),
    [rows],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return rows.filter((r) => {
      if (eventFilter && r.application.eventTitle !== eventFilter) return false
      if (!query) return true
      return r.volunteer.name.toLowerCase().includes(query) || r.volunteer.email.toLowerCase().includes(query)
    })
  }, [rows, search, eventFilter])

  const certificatesGenerated = rows.filter((r) => r.application.certificateIssued).length
  const certificatesPending = rows.length - certificatesGenerated
  const uniqueVolunteers = new Set(rows.map((r) => r.volunteer.id)).size
  const totalHours = Math.round(rows.reduce((sum, r) => sum + r.application.hoursForThisEvent, 0) * 10) / 10

  return (
    <div className="volunteers-crm">
      {/* KPI Cards */}
      <section className="v-kpi-grid">
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiUsers /> Completed Volunteers</div>
          <span className="v-kpi-value">{rows.length}</span>
          <span className="v-kpi-trend neutral">All time</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiFileText /> Certificates Generated</div>
          <span className="v-kpi-value">{certificatesGenerated}</span>
          <span className="v-kpi-trend">{certificatesPending} Pending</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header" style={{ color: 'var(--color-primary)' }}><FiAward /> Unique Volunteers</div>
          <span className="v-kpi-value">{uniqueVolunteers}</span>
          <span className="v-kpi-trend" style={{ color: 'var(--color-primary)' }}>All time</span>
        </div>
        <div className="v-kpi-card">
          <div className="v-kpi-header"><FiClock /> Total Volunteer Hours</div>
          <span className="v-kpi-value">{totalHours.toLocaleString('id-ID')}</span>
          <span className="v-kpi-trend neutral">All time</span>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="v-filter-bar">
        <div className="v-filter-input" style={{ flex: 2 }}>
          <FiSearch color="var(--color-text-muted)" />
          <input type="text" placeholder="Search alumni..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="v-filter-input">
          <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
            <option value="">Completed Event</option>
            {eventOptions.map((title) => <option key={title} value={title}>{title}</option>)}
          </select>
        </div>
        <button className="btn btn--outline btn--sm" style={{ border: 'none' }} onClick={() => { setSearch(''); setEventFilter('') }}>Reset</button>
      </section>

      {/* Main Content */}
      <section className="v-section">
        <h2>Post-Event History & Recognition</h2>
        <div className="v-table-wrapper">
          <table className="v-table">
            <thead>
              <tr>
                <th>Volunteer Name</th>
                <th>Completed Event</th>
                <th>Completion Date</th>
                <th>Hours Earned</th>
                <th>Certificate</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ volunteer: vol, application: app }) => {
                const rating = vol.ratingProxy ?? 0
                return (
                  <tr key={app.applicationId}>
                    <td>
                      <div className="v-volunteer-info">
                        <div className="v-avatar">{vol.avatarInitials}</div>
                        <div>
                          <span className="v-volunteer-name">{vol.name}</span>
                          {vol.hoursCompleted > 200 && <span style={{ marginLeft: '8px', color: '#d4af37' }} title="Veteran Volunteer"><FiAward /></span>}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{app.eventTitle}</td>
                    <td>{formatDate(app.updatedAt)}</td>
                    <td><span className="badge" style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>+{app.hoursForThisEvent}H</span></td>
                    <td>
                      {app.certificateIssued ? (
                        <span className="badge badge--success"><FiFileText /> Ready</span>
                      ) : (
                        <span className="badge badge--warning">Pending</span>
                      )}
                    </td>
                    <td className="v-rating">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} style={{ color: i < rating ? '#f59e0b' : '#e5e7eb' }}>★</span>
                      ))}
                    </td>
                    <td>
                      <div className="v-table-actions">
                        <button className="btn btn--sm btn--outline" onClick={() => setSelectedProfile(vol)}>Profile</button>
                        <button
                          className="btn btn--sm btn--outline"
                          style={{ padding: '0 8px' }}
                          title="Download Certificate"
                          disabled={!app.certificateIssued || downloadingId === app.applicationId}
                          onClick={() => handleDownloadCertificate(app)}
                        >
                          <FiDownload/>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <p style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No completed volunteers yet.</p>
        )}
      </section>

      <VolunteerProfileDrawer
        volunteer={selectedProfile}
        isOpen={selectedProfile !== null}
        onClose={() => setSelectedProfile(null)}
        // Belum ada sistem "invite volunteer ke event tertentu" di backend
        // (di luar scope fase ini) — arahkan ke composer broadcast yang
        // sudah nyata, bukan pura-pura sukses invite langsung.
        onInvite={() => navigate('/organizer/communication?tab=broadcast')}
        onMessage={() => navigate('/organizer/communication?tab=broadcast')}
        onDownloadProfile={
          selectedProfile
            ? async () => {
                const bytes = await generateVolunteerProfilePdf(selectedProfile)
                downloadCertificatePdf(bytes, `Profil - ${selectedProfile.name}.pdf`)
              }
            : undefined
        }
      />
    </div>
  )
}
