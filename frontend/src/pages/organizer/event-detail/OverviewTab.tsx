import { Link, useOutletContext } from 'react-router-dom'
import { FiMapPin, FiTag, FiGlobe, FiInfo, FiUser, FiPhone, FiMail, FiFileText } from 'react-icons/fi'
import type { EventDetailOutletContext } from '../EventDetailPage'

const DOCUMENT_LABELS: Record<string, string> = {
  proposal: 'Proposal Kegiatan',
  rundown: 'Rundown Acara',
  poster: 'Poster Event',
  responsibilityLetter: 'Surat Pernyataan Penanggung Jawab',
  locationPermit: 'Surat Izin Penggunaan Lokasi',
  cooperationLetter: 'Surat Kerja Sama',
  assignmentLetter: 'Surat Penugasan',
}

export default function OverviewTab() {
  const { event, eventApplicants } = useOutletContext<EventDetailOutletContext>()

  const heroImage = event.galleryImages && event.galleryImages.length > 0
    ? event.galleryImages[0]
    : 'https://via.placeholder.com/800x400?text=No+Photo+Available'

  const uploadedDocuments = Object.entries(event.documents ?? {}).filter(([, doc]) => doc)
  const totalShifts = event.roles.reduce((sum, role) => sum + role.shifts.length, 0)
  const totalRoleCapacity = event.roles.reduce((sum, role) => sum + role.maxVolunteers, 0)

  return (
    <div className="event-detail__overview">
      <div className="card event-detail__panel" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        <img
          src={heroImage}
          alt={event.title}
          style={{ width: '100%', height: '280px', objectFit: 'cover', borderRadius: '12px' }}
        />

        <div className="event-detail__kpi-row">
          <div><strong>{event.quota}</strong><span>Kuota</span></div>
          <div><strong>{eventApplicants.length}</strong><span>Total Pendaftar</span></div>
          <div><strong>{eventApplicants.filter((a) => a.status === 'accepted' || a.status === 'checked_in' || a.status === 'completed').length}</strong><span>Accepted</span></div>
          <div><strong>{event.impactMetricLabel}</strong><span>Metrik Dampak ({event.impactMetricUnit})</span></div>
        </div>

        {event.registrationClosedAt && (
          <span className="event-detail__tag-chip" style={{ alignSelf: 'flex-start', background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>
            Pendaftaran Ditutup
          </span>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-light)', margin: '0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          <div>
            <h4 style={{ marginBottom: '12px', color: 'var(--color-text-heading)' }}>Deskripsi Kegiatan</h4>
            <p style={{ whiteSpace: 'pre-wrap', color: 'var(--color-text-body)', lineHeight: '1.6' }}>{event.description}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ marginBottom: '4px', color: 'var(--color-text-heading)' }}>Informasi Tambahan</h4>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-muted)' }}>
              <FiTag size={18} /> <span><strong>Kategori:</strong> {event.category || 'Umum'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-muted)' }}>
              <FiGlobe size={18} /> <span><strong>Mode:</strong> {event.eventMode === 'ONLINE' ? 'Online' : 'Offline'}</span>
            </div>
            {event.mapLink && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-muted)' }}>
                <FiMapPin size={18} /> <span><a href={event.mapLink} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>Lihat di Peta</a></span>
              </div>
            )}
            {event.picName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-muted)' }}>
                <FiUser size={18} /> <span><strong>PIC/Pengurus:</strong> {event.picName}</span>
              </div>
            )}
            {event.picContact && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-muted)' }}>
                <FiPhone size={18} /> <span><strong>Kontak WA PIC:</strong> {event.picContact}</span>
              </div>
            )}
            {event.picEmail && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-muted)' }}>
                <FiMail size={18} /> <span><strong>Email PIC:</strong> {event.picEmail}</span>
              </div>
            )}
            {event.organizationEntityType && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-muted)' }}>
                <FiInfo size={18} /> <span><strong>Tipe Organisasi:</strong> {event.organizationEntityType}</span>
              </div>
            )}
            {event.onBehalfOfInstitution && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-muted)' }}>
                <FiInfo size={18} /> <span>Mewakili Institusi</span>
              </div>
            )}
          </div>
        </div>

        {(event.skills?.length || event.interests?.length || event.dayType) && (
          <>
            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-light)', margin: '0' }} />
            <div>
              <h4 style={{ marginBottom: '12px', color: 'var(--color-text-heading)' }}>Tag Kecocokan</h4>
              <ul className="event-detail__tags-row">
                {event.dayType && <li className="event-detail__tag-chip">{event.dayType}</li>}
                {event.skills?.map((skill) => (
                  <li key={skill} className="event-detail__tag-chip">{skill}</li>
                ))}
                {event.interests?.map((interest) => (
                  <li key={interest} className="event-detail__tag-chip">{interest}</li>
                ))}
              </ul>
            </div>
          </>
        )}

        {uploadedDocuments.length > 0 && (
          <>
            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-light)', margin: '0' }} />
            <div>
              <h4 style={{ marginBottom: '12px', color: 'var(--color-text-heading)' }}>Dokumen Pendukung</h4>
              <ul className="event-detail__documents-list">
                {uploadedDocuments.map(([key, doc]) => (
                  <li key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-muted)' }}>
                    <FiFileText size={16} />
                    <a href={doc!.url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>
                      {DOCUMENT_LABELS[key] ?? key}
                    </a>
                  </li>
                ))}
                {(event.legalDocuments ?? []).map((doc) => (
                  <li key={doc.docType} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-muted)' }}>
                    <FiFileText size={16} />
                    <a href={doc.url} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>
                      {doc.docType}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {event.roles.length > 0 && (
          <>
            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-light)', margin: '0' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ marginBottom: '4px', color: 'var(--color-text-heading)' }}>Role &amp; Shift</h4>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-body-sm)' }}>
                  {event.roles.length} role &middot; {totalShifts} shift &middot; kapasitas {totalRoleCapacity} volunteer
                </p>
              </div>
              <Link to="roles" className="btn btn--outline btn--sm">Lihat detail &rarr;</Link>
            </div>
          </>
        )}

        {event.galleryImages && event.galleryImages.length > 1 && (
          <>
            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-light)', margin: '0' }} />
            <div>
              <h4 style={{ marginBottom: '12px', color: 'var(--color-text-heading)' }}>Dokumentasi Event</h4>
              <div className="event-detail__gallery-grid">
                {event.galleryImages.map((url) => (
                  <img key={url} src={url} alt={event.title} />
                ))}
              </div>
            </div>
          </>
        )}

        {event.status === 'completed' && event.closeReport && (
          <>
            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-light)', margin: '0' }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-md)' }}>
              <div>
                <h4 style={{ marginBottom: '4px', color: 'var(--color-text-heading)' }}>Laporan Penutupan Kegiatan</h4>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-body-sm)' }}>
                  {event.closeReport.narrativeSummary}
                </p>
              </div>
              <Link to="impact" className="btn btn--outline btn--sm" style={{ whiteSpace: 'nowrap' }}>Lihat detail &rarr;</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
