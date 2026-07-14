import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import {
  FiImage, FiUploadCloud, FiMail, FiFileText, FiLayout
} from 'react-icons/fi'
import {
  getMyOrganization,
  uploadMyOrganizationLogo,
  uploadMyOrganizationBanner,
  uploadMyOrganizationSignature,
  uploadMyOrganizationStamp,
  uploadMyOrganizationEmailHeader,
  updateVisualIdentity,
  updateEmailIdentity,
  sendBrandingTestEmail,
} from '../../../lib/organizationApi'
import { getActiveCertificateTemplateRequest, type ActiveCertificateTemplateInfo } from '../../../lib/organizerApi'
import '../OrganizationPage.css'

const DEFAULT_PRIMARY_COLOR = '#10b981'
const DEFAULT_SECONDARY_COLOR = '#059669'
const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/

// Logo dipakai jadi watermark kecil di tiap sertifikat yang diterbitkan
// (lihat certificateGenerator.ts + certificate.service.js). Sisanya di bawah
// (banner/warna/tanda tangan/stempel/email) sekarang juga tersambung penuh ke
// backend nyata (lihat organization.service.js updateMyOrganizationBrandingAsset/
// VisualIdentity/EmailIdentity) — sebelumnya placeholder statis, sudah tidak lagi.
export default function BrandingView() {
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined)
  const [bannerUrl, setBannerUrl] = useState<string | undefined>(undefined)
  const [signatureUrl, setSignatureUrl] = useState<string | undefined>(undefined)
  const [stampUrl, setStampUrl] = useState<string | undefined>(undefined)
  const [emailHeaderUrl, setEmailHeaderUrl] = useState<string | undefined>(undefined)
  const [organizationName, setOrganizationName] = useState('')

  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY_COLOR)
  const [secondaryColor, setSecondaryColor] = useState(DEFAULT_SECONDARY_COLOR)
  const [emailFooterText, setEmailFooterText] = useState('')

  const [activeTemplate, setActiveTemplate] = useState<ActiveCertificateTemplateInfo | null>(null)
  const [templateLoaded, setTemplateLoaded] = useState(false)

  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const [isSavingColors, setIsSavingColors] = useState(false)
  const [isSavingEmail, setIsSavingEmail] = useState(false)
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false)
  const [testEmailMessage, setTestEmailMessage] = useState<string | null>(null)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const signatureInputRef = useRef<HTMLInputElement>(null)
  const stampInputRef = useRef<HTMLInputElement>(null)
  const emailHeaderInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getMyOrganization()
      .then((org) => {
        setLogoUrl(org.logoUrl)
        setOrganizationName(org.name)
        setBannerUrl(org.bannerUrl)
        setSignatureUrl(org.signatureUrl)
        setStampUrl(org.stampUrl)
        setEmailHeaderUrl(org.emailHeaderImageUrl)
        if (org.primaryColor && HEX_COLOR_REGEX.test(org.primaryColor)) setPrimaryColor(org.primaryColor)
        if (org.secondaryColor && HEX_COLOR_REGEX.test(org.secondaryColor)) setSecondaryColor(org.secondaryColor)
        setEmailFooterText(org.emailFooterText ?? '')
      })
      .catch((err) => window.alert(err instanceof Error ? err.message : 'Gagal memuat data organisasi.'))

    // Template sertifikat dikelola terpusat oleh admin ActiVibe (satu template
    // aktif global) — lihat cross-cutting decision di plan branding: organizer
    // TIDAK boleh memilih theme sendiri, cukup ditampilkan read-only di sini.
    getActiveCertificateTemplateRequest()
      .then(setActiveTemplate)
      .catch(() => setActiveTemplate(null))
      .finally(() => setTemplateLoaded(true))
  }, [])

  const handleLogoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingField('logo')
    try {
      const org = await uploadMyOrganizationLogo(file)
      setLogoUrl(org.logoUrl)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal mengunggah logo.')
    } finally {
      setUploadingField(null)
      if (logoInputRef.current) logoInputRef.current.value = ''
    }
  }

  const handleBannerChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingField('banner')
    try {
      const org = await uploadMyOrganizationBanner(file)
      setBannerUrl(org.bannerUrl)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal mengunggah banner.')
    } finally {
      setUploadingField(null)
      if (bannerInputRef.current) bannerInputRef.current.value = ''
    }
  }

  const handleSignatureChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingField('signature')
    try {
      const org = await uploadMyOrganizationSignature(file)
      setSignatureUrl(org.signatureUrl)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal mengunggah tanda tangan.')
    } finally {
      setUploadingField(null)
      if (signatureInputRef.current) signatureInputRef.current.value = ''
    }
  }

  const handleStampChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingField('stamp')
    try {
      const org = await uploadMyOrganizationStamp(file)
      setStampUrl(org.stampUrl)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal mengunggah stempel.')
    } finally {
      setUploadingField(null)
      if (stampInputRef.current) stampInputRef.current.value = ''
    }
  }

  const handleEmailHeaderChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingField('emailHeader')
    try {
      const org = await uploadMyOrganizationEmailHeader(file)
      setEmailHeaderUrl(org.emailHeaderImageUrl)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal mengunggah header email.')
    } finally {
      setUploadingField(null)
      if (emailHeaderInputRef.current) emailHeaderInputRef.current.value = ''
    }
  }

  const handleSaveColors = async () => {
    setIsSavingColors(true)
    try {
      await updateVisualIdentity({ primaryColor, secondaryColor })
      window.alert('Warna identitas visual berhasil disimpan.')
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal menyimpan warna.')
    } finally {
      setIsSavingColors(false)
    }
  }

  const handleSaveEmailFooter = async () => {
    setIsSavingEmail(true)
    try {
      await updateEmailIdentity({ emailFooterText })
      window.alert('Footer email berhasil disimpan.')
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal menyimpan footer email.')
    } finally {
      setIsSavingEmail(false)
    }
  }

  const handleSendTestEmail = async () => {
    setIsSendingTestEmail(true)
    setTestEmailMessage(null)
    try {
      const result = await sendBrandingTestEmail()
      setTestEmailMessage(`Test email terkirim ke ${result.sentTo}.`)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal mengirim test email.')
    } finally {
      setIsSendingTestEmail(false)
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
                  <input ref={logoInputRef} type="file" accept="image/png,image/jpeg" style={{ display: 'none' }} onChange={handleLogoChange} />
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    disabled={uploadingField === 'logo'}
                    onClick={() => logoInputRef.current?.click()}
                    style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FiUploadCloud /> {uploadingField === 'logo' ? 'Mengunggah...' : 'Upload New'}
                  </button>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>PNG/JPG, dipakai juga di sertifikat volunteer</div>
                </div>
              </div>
            </div>

            <div className="settings-group" style={{ marginTop: '24px' }}>
              <label>Cover Image / Banner</label>
              <input ref={bannerInputRef} type="file" accept="image/png,image/jpeg" style={{ display: 'none' }} onChange={handleBannerChange} />
              {bannerUrl ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <img src={bannerUrl} alt="Banner organisasi" style={{ width: '100%', height: '120px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--color-border-light)' }} />
                  <button
                    type="button"
                    className="btn btn--sm btn--outline"
                    disabled={uploadingField === 'banner'}
                    onClick={() => bannerInputRef.current?.click()}
                  >
                    {uploadingField === 'banner' ? 'Mengunggah...' : 'Ganti Banner'}
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => bannerInputRef.current?.click()}
                  style={{ width: '100%', height: '120px', borderRadius: '8px', border: '2px dashed var(--color-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                >
                  <FiUploadCloud size={24} />
                  <span style={{ fontSize: '13px' }}>{uploadingField === 'banner' ? 'Mengunggah...' : 'Click to upload a banner for your public page'}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
              <div className="settings-group">
                <label>Primary Color</label>
                <div className="color-picker-mock">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={{ width: '32px', height: '32px', border: 'none', padding: 0, background: 'none', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => {
                      const value = e.target.value
                      setPrimaryColor(value)
                    }}
                    style={{ fontSize: '13px', fontFamily: 'monospace', width: '90px', padding: '4px 6px', borderRadius: '6px', border: '1px solid var(--color-border-light)' }}
                  />
                </div>
              </div>
              <div className="settings-group">
                <label>Secondary Color</label>
                <div className="color-picker-mock">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    style={{ width: '32px', height: '32px', border: 'none', padding: 0, background: 'none', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => {
                      const value = e.target.value
                      setSecondaryColor(value)
                    }}
                    style={{ fontSize: '13px', fontFamily: 'monospace', width: '90px', padding: '4px 6px', borderRadius: '6px', border: '1px solid var(--color-border-light)' }}
                  />
                </div>
              </div>
            </div>

            <button className="btn btn--primary" style={{ marginTop: '24px' }} disabled={isSavingColors} onClick={handleSaveColors}>
              {isSavingColors ? 'Menyimpan...' : 'Save Changes'}
            </button>
          </section>

          <section className="card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiFileText /> Certificate Branding
            </h2>

            <div className="settings-group">
              <label>Authorized Signature (Transparent PNG)</label>
              <input ref={signatureInputRef} type="file" accept="image/png,image/jpeg" style={{ display: 'none' }} onChange={handleSignatureChange} />
              <div style={{ width: '200px', height: '80px', borderRadius: '8px', border: '1px solid var(--color-border-light)', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
                {signatureUrl ? (
                  <img src={signatureUrl} alt="Tanda tangan" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Belum ada tanda tangan</span>
                )}
              </div>
              <button
                type="button"
                className="btn btn--sm btn--outline"
                style={{ marginTop: '8px' }}
                disabled={uploadingField === 'signature'}
                onClick={() => signatureInputRef.current?.click()}
              >
                {uploadingField === 'signature' ? 'Mengunggah...' : 'Change Signature'}
              </button>
            </div>

            <div className="settings-group" style={{ marginTop: '24px' }}>
              <label>Organization Stamp</label>
              <input ref={stampInputRef} type="file" accept="image/png,image/jpeg" style={{ display: 'none' }} onChange={handleStampChange} />
              <div
                onClick={() => stampInputRef.current?.click()}
                style={{ width: '80px', height: '80px', borderRadius: '50%', border: stampUrl ? '1px solid var(--color-border-light)' : '2px dashed var(--color-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', cursor: 'pointer', overflow: 'hidden' }}
              >
                {stampUrl ? (
                  <img src={stampUrl} alt="Stempel organisasi" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <FiUploadCloud size={20} />
                )}
              </div>
              {uploadingField === 'stamp' && <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Mengunggah...</div>}
            </div>

            <div className="settings-group" style={{ marginTop: '24px' }}>
              <label>Certificate Theme Template</label>
              {/* Bukan <select> per-organizer — konflik dgn desain Certificate
                  Generation Hub yang sudah dibangun (satu template aktif
                  global, dikelola admin). Di sini cukup tampilkan read-only
                  supaya organizer tahu template apa yang sedang dipakai. */}
              <div style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border-light)', background: 'var(--color-surface-subtle, #f8fafc)', fontSize: '14px' }}>
                {!templateLoaded ? (
                  'Memuat template aktif...'
                ) : activeTemplate ? (
                  <>Template aktif saat ini: <strong>{activeTemplate.name}</strong></>
                ) : (
                  'Belum ada template aktif — hubungi admin ActiVibe.'
                )}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                Template sertifikat dikelola terpusat oleh admin ActiVibe.
              </div>
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
              <input ref={emailHeaderInputRef} type="file" accept="image/png,image/jpeg" style={{ display: 'none' }} onChange={handleEmailHeaderChange} />
              {emailHeaderUrl ? (
                <img src={emailHeaderUrl} alt="Header email" style={{ width: '100%', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--color-border-light)' }} />
              ) : (
                <div style={{ width: '100%', height: '60px', borderRadius: '8px', border: '1px dashed var(--color-border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                  Belum ada header
                </div>
              )}
              <button
                type="button"
                className="btn btn--sm btn--outline"
                style={{ marginTop: '8px', width: '100%' }}
                disabled={uploadingField === 'emailHeader'}
                onClick={() => emailHeaderInputRef.current?.click()}
              >
                {uploadingField === 'emailHeader' ? 'Mengunggah...' : 'Change Header'}
              </button>
            </div>

            <div className="settings-group" style={{ marginTop: '16px' }}>
              <label>Email Footer Text</label>
              <textarea
                value={emailFooterText}
                onChange={(e) => setEmailFooterText(e.target.value)}
                maxLength={500}
                style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border-light)', resize: 'vertical', fontSize: '13px' }}
              />
              <button
                type="button"
                className="btn btn--sm btn--outline"
                style={{ marginTop: '8px', width: '100%' }}
                disabled={isSavingEmail}
                onClick={handleSaveEmailFooter}
              >
                {isSavingEmail ? 'Menyimpan...' : 'Save Footer'}
              </button>
            </div>

            <button
              type="button"
              className="btn btn--outline"
              style={{ width: '100%', marginTop: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              disabled={isSendingTestEmail}
              onClick={handleSendTestEmail}
            >
              <FiLayout /> {isSendingTestEmail ? 'Mengirim...' : 'Send Test Email'}
            </button>
            {testEmailMessage && (
              <div style={{ color: 'var(--color-success)', fontSize: '13px', marginTop: '8px' }}>{testEmailMessage}</div>
            )}
          </section>
        </div>
      </div>
    </>
  )
}
