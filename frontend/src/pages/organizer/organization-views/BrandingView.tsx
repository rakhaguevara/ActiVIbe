import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import {
  FiImage, FiUploadCloud, FiMail, FiFileText, FiLayout
} from 'react-icons/fi'
import { getMyOrganization, uploadMyOrganizationLogo } from '../../../lib/organizationApi'
import '../OrganizationPage.css'

// Logo organizer dipakai jadi watermark kecil di tiap sertifikat yang
// diterbitkan (lihat certificateGenerator.ts + certificate.service.js) —
// makanya cuma bagian ini yang disambungkan ke backend sungguhan. Banner/
// signature/stamp/warna/theme di bawah tetap placeholder statis (belum
// diminta, di luar scope perubahan sertifikat).
export default function BrandingView() {
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined)
  const [organizationName, setOrganizationName] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getMyOrganization()
      .then((org) => {
        setLogoUrl(org.logoUrl)
        setOrganizationName(org.name)
      })
      .catch((err) => window.alert(err instanceof Error ? err.message : 'Gagal memuat data organisasi.'))
  }, [])

  const handleUploadClick = () => fileInputRef.current?.click()

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const org = await uploadMyOrganizationLogo(file)
      setLogoUrl(org.logoUrl)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal mengunggah logo.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          <section className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiImage /> Visual Identity
            </h2>

            <div className="settings-group">
              <label>Organization Logo</label>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {logoUrl ? (
                  <img src={logoUrl} alt={organizationName} style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover', border: '1px solid var(--color-border-light)' }} />
                ) : (
                  <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: 'var(--color-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontSize: '12px', textAlign: 'center', padding: '4px' }}>
                    Belum ada logo
                  </div>
                )}
                <div>
                  <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" style={{ display: 'none' }} onChange={handleFileChange} />
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    disabled={isUploading}
                    onClick={handleUploadClick}
                    style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FiUploadCloud /> {isUploading ? 'Mengunggah...' : 'Upload New'}
                  </button>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>PNG/JPG, dipakai juga di sertifikat volunteer</div>
                </div>
              </div>
            </div>

            <div className="settings-group" style={{ marginTop: '24px' }}>
              <label>Cover Image / Banner</label>
              <div style={{ width: '100%', height: '120px', borderRadius: '8px', border: '2px dashed var(--color-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                <FiUploadCloud size={24} />
                <span style={{ fontSize: '13px' }}>Click to upload a banner for your public page</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
              <div className="settings-group">
                <label>Primary Color</label>
                <div className="color-picker-mock">
                  <div className="color-swatch" style={{ background: '#10b981' }}></div>
                  <span style={{ fontSize: '13px', fontFamily: 'monospace' }}>#10b981</span>
                </div>
              </div>
              <div className="settings-group">
                <label>Secondary Color</label>
                <div className="color-picker-mock">
                  <div className="color-swatch" style={{ background: '#059669' }}></div>
                  <span style={{ fontSize: '13px', fontFamily: 'monospace' }}>#059669</span>
                </div>
              </div>
            </div>
            
            <button className="btn btn--primary" style={{ marginTop: '24px' }}>Save Changes</button>
          </section>

          <section className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiFileText /> Certificate Branding
            </h2>
            
            <div className="settings-group">
              <label>Authorized Signature (Transparent PNG)</label>
              <div style={{ width: '200px', height: '80px', borderRadius: '8px', border: '1px solid var(--color-border-light)', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
                <span style={{ fontFamily: 'cursive', fontSize: '24px', color: '#1e293b' }}>Jane Doe</span>
              </div>
              <button className="btn btn--sm btn--outline" style={{ marginTop: '8px' }}>Change Signature</button>
            </div>

            <div className="settings-group" style={{ marginTop: '24px' }}>
              <label>Organization Stamp</label>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px dashed var(--color-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                <FiUploadCloud size={20} />
              </div>
            </div>
            
            <div className="settings-group" style={{ marginTop: '24px' }}>
              <label>Certificate Theme Template</label>
              <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}>
                <option>Modern Minimalist</option>
                <option>Classic Corporate</option>
                <option>Eco Friendly (Current)</option>
                <option>Playful</option>
              </select>
            </div>
          </section>
        </div>

        {/* Side Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <section className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiMail /> Email Branding
            </h2>
            
            <div className="settings-group">
              <label>Email Header Image</label>
              <div style={{ width: '100%', height: '60px', borderRadius: '8px', border: '1px solid var(--color-border-light)', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: 700 }}>
                Green Earth
              </div>
              <button className="btn btn--sm btn--outline" style={{ marginTop: '8px', width: '100%' }}>Change Header</button>
            </div>

            <div className="settings-group" style={{ marginTop: '16px' }}>
              <label>Email Footer Text</label>
              <textarea 
                style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border-light)', resize: 'vertical', fontSize: '13px' }}
                defaultValue="© 2026 Green Earth Foundation. All rights reserved.\nJl. Sudirman No 123, Yogyakarta."
              />
            </div>
            
            <button className="btn btn--outline" style={{ width: '100%', marginTop: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              <FiLayout /> Send Test Email
            </button>
          </section>
        </div>
      </div>
    </>
  )
}
