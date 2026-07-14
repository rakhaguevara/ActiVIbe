import { useEffect, useState, type CSSProperties, type FormEvent } from 'react'
import {
  FiGlobe, FiMail, FiPhone, FiMapPin, FiCalendar, FiCheckCircle, FiInstagram, FiFacebook, FiLinkedin, FiHeart, FiFileText
} from 'react-icons/fi'
import type { Organization } from '../../../types/organization'
import { updateMyOrganizationProfile } from '../../../lib/organizationApi'
import '../OrganizationPage.css'

interface OrganizationProfileViewProps {
  organization: Organization | null
  isEditing: boolean
  onSaved: (organization: Organization) => void
}

interface ProfileFormState {
  name: string
  location: string
  phone: string
  mission: string
  aboutUs: string
  website: string
  facebookUrl: string
  instagramUrl: string
  linkedinUrl: string
}

function toFormState(org: Organization): ProfileFormState {
  return {
    name: org.name,
    location: org.location,
    phone: org.phone,
    mission: org.mission,
    aboutUs: org.aboutUs,
    website: org.website ?? '',
    facebookUrl: org.facebookUrl ?? '',
    instagramUrl: org.instagramUrl ?? '',
    linkedinUrl: org.linkedinUrl ?? '',
  }
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '—'
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid var(--color-border-light)',
  fontSize: '14px',
  fontFamily: 'inherit',
}

// Tombol "Edit Profile" ada di header OrganizationPage.tsx (parent) — state
// isEditing diangkat ke sana supaya satu tombol mengontrol view ini (pola
// sama BrandingView.tsx yg selalu-editable inline TIDAK dipakai di sini krn
// Edit Profile secara eksplisit ada di header terpisah, beda komponen).
export default function OrganizationProfileView({ organization, isEditing, onSaved }: OrganizationProfileViewProps) {
  const [form, setForm] = useState<ProfileFormState | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isEditing && organization) {
      setForm(toFormState(organization))
      setError(null)
    }
  }, [isEditing, organization])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form) return
    setError(null)
    setIsSaving(true)
    try {
      const updated = await updateMyOrganizationProfile({ ...form })
      onSaved(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan profil organisasi.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!organization) {
    return (
      <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Memuat data organisasi...
      </div>
    )
  }

  if (isEditing && form) {
    return (
      <form onSubmit={handleSubmit} className="card org-profile-card" style={{ padding: '32px', maxWidth: '640px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Edit Profil Organisasi</h2>

        <div className="settings-group">
          <label>Nama Organisasi</label>
          <input
            style={inputStyle}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="settings-group">
          <label>Lokasi</label>
          <input
            style={inputStyle}
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            required
          />
        </div>
        <div className="settings-group">
          <label>Telepon</label>
          <input style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="settings-group">
          <label>Website</label>
          <input
            style={inputStyle}
            value={form.website}
            placeholder="https://..."
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
        </div>
        <div className="settings-group">
          <label>Mission Statement</label>
          <textarea
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            value={form.mission}
            onChange={(e) => setForm({ ...form, mission: e.target.value })}
          />
        </div>
        <div className="settings-group">
          <label>Tentang Kami</label>
          <textarea
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            value={form.aboutUs}
            onChange={(e) => setForm({ ...form, aboutUs: e.target.value })}
          />
        </div>
        <div className="settings-group">
          <label>Facebook URL</label>
          <input
            style={inputStyle}
            value={form.facebookUrl}
            placeholder="https://facebook.com/..."
            onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
          />
        </div>
        <div className="settings-group">
          <label>Instagram URL</label>
          <input
            style={inputStyle}
            value={form.instagramUrl}
            placeholder="https://instagram.com/..."
            onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
          />
        </div>
        <div className="settings-group">
          <label>LinkedIn URL</label>
          <input
            style={inputStyle}
            value={form.linkedinUrl}
            placeholder="https://linkedin.com/..."
            onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
          />
        </div>

        {error && <p style={{ color: 'var(--color-danger, #dc2626)', fontSize: '13px' }}>{error}</p>}

        <button type="submit" className="btn btn--primary" disabled={isSaving} style={{ alignSelf: 'flex-start' }}>
          {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
      {/* Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
        <section className="card org-profile-card" style={{ padding: '32px' }}>
          <div className="org-profile-header">
            {organization.logoUrl ? (
              <img
                src={organization.logoUrl}
                alt={organization.name}
                style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover' }}
              />
            ) : (
              <div className="org-logo-lg">{initialsOf(organization.name)}</div>
            )}
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {organization.name}
                {organization.isVerified && (
                  <FiCheckCircle size={20} color="var(--color-primary)" title="Verified NGO" />
                )}
              </h2>
              {organization.causeAreas.length > 0 && (
                <div style={{ fontSize: '15px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  {organization.causeAreas.join(', ')}
                </div>
              )}
            </div>
          </div>

          <div className="org-info-grid">
            <div className="org-info-item">
              <label>Terdaftar Sejak</label>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiCalendar size={14} color="var(--color-text-muted)" /> {organization.joinedYear}
              </span>
            </div>
            <div className="org-info-item">
              <label>Lokasi</label>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiMapPin size={14} color="var(--color-text-muted)" /> {organization.location}
              </span>
            </div>
            <div className="org-info-item">
              <label>Website</label>
              {organization.website ? (
                <a
                  href={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)' }}
                >
                  <FiGlobe size={14} /> {organization.website}
                </a>
              ) : (
                <span style={{ color: 'var(--color-text-muted)' }}>Belum diisi</span>
              )}
            </div>
            <div className="org-info-item">
              <label>Email</label>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiMail size={14} color="var(--color-text-muted)" /> {organization.email}
              </span>
            </div>
            <div className="org-info-item">
              <label>Phone</label>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiPhone size={14} color="var(--color-text-muted)" /> {organization.phone || '—'}
              </span>
            </div>
          </div>

          <div>
            <div className="org-info-item">
              <label style={{ marginBottom: '8px' }}>Mission Statement</label>
              <span style={{ lineHeight: 1.6, color: 'var(--color-text)' }}>
                {organization.mission || 'Belum diisi.'}
              </span>
            </div>
          </div>

          {organization.causeAreas.length > 0 && (
            <div>
              <div className="org-info-item">
                <label style={{ marginBottom: '8px' }}>Areas of Focus</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {organization.causeAreas.map((area) => (
                    <span key={area} className="badge badge--primary">{area}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Organization Impact Statistics</h3>
          {/* Cuma "Events Organized" yang punya data real (Organization.eventsCount,
              lihat organization.service.js attachEventsCount) — "Volunteers
              Mobilized"/"Certificates Issued" sengaja TIDAK ditampilkan krn
              belum ada agregat backend utk itu (prinsip "don't fabricate",
              lihat CLAUDE.md). */}
          <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(1, minmax(160px, 220px))', gap: '16px' }}>
            <div className="stat-card" style={{ padding: '16px' }}>
              <div className="stat-card__icon" style={{ marginBottom: '8px' }}><FiFileText /></div>
              <div className="stat-card__value" style={{ fontSize: '20px' }}>{organization.eventsCount}</div>
              <div className="stat-card__label">Events Organized</div>
            </div>
          </div>
        </section>
      </div>

      {/* Side Widgets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Social Media Links</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {organization.instagramUrl && (
              <a
                href={organization.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--color-text)', textDecoration: 'none' }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef2f2', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiInstagram size={16} /></div>
                <span>Instagram</span>
              </a>
            )}
            {organization.facebookUrl && (
              <a
                href={organization.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--color-text)', textDecoration: 'none' }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiFacebook size={16} /></div>
                <span>Facebook</span>
              </a>
            )}
            {organization.linkedinUrl && (
              <a
                href={organization.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--color-text)', textDecoration: 'none' }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdf4', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiLinkedin size={16} /></div>
                <span>LinkedIn</span>
              </a>
            )}
            {!organization.instagramUrl && !organization.facebookUrl && !organization.linkedinUrl && (
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                Belum ada link sosial media. Klik "Edit Profile" untuk menambahkan.
              </p>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiHeart /> Tentang Kami
          </h3>
          <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
            {organization.aboutUs || 'Belum diisi.'}
          </p>
        </div>
      </div>
    </div>
  )
}
