import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { FiCheckCircle, FiChevronLeft } from 'react-icons/fi'
import LocationSelector, { EMPTY_LOCATION, type LocationValue } from '../../components/location/LocationSelector'
import { registerOrganization } from '../../lib/organizationApi'
import { CAUSE_AREA_OPTIONS } from '../../utils/causeAreaStyle'
import './OrganizationRegisterPage.css'

export default function OrganizationRegisterPage() {
  const [contactName, setContactName] = useState('')
  const [name, setName] = useState('')
  const [shortProfile, setShortProfile] = useState('')
  const [location, setLocation] = useState<LocationValue>(EMPTY_LOCATION)
  const [address, setAddress] = useState('')
  const [website, setWebsite] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [causeAreas, setCauseAreas] = useState<Set<string>>(new Set())

  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'submitting'>('idle')
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)

  const toggleCauseArea = (cause: string) => {
    setCauseAreas((prev) => {
      const next = new Set(prev)
      if (next.has(cause)) next.delete(cause)
      else next.add(cause)
      return next
    })
  }

  const resetForm = () => {
    setContactName('')
    setName('')
    setShortProfile('')
    setLocation(EMPTY_LOCATION)
    setAddress('')
    setWebsite('')
    setEmail('')
    setPhone('')
    setCauseAreas(new Set())
    setSubmittedEmail(null)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setStatus('submitting')

    const locationString = location.regencyId
      ? location.provinceName
        ? `${location.regencyName}, ${location.provinceName}`
        : location.regencyName
      : location.provinceName ?? ''

    try {
      await registerOrganization({
        name,
        shortProfile,
        location: locationString,
        address: address || undefined,
        website: website || undefined,
        email,
        phone,
        causeAreas: Array.from(causeAreas),
        contactName,
      })
      setSubmittedEmail(email)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi.')
    } finally {
      setStatus('idle')
    }
  }

  return (
    <main className="org-register-page">
      <div className="org-register-page__panel card">
        <Link to="/dashboard/organisasi" className="org-register-page__back">
          <FiChevronLeft /> Kembali
        </Link>

        {submittedEmail ? (
          <div className="org-register-page__confirmation">
            <FiCheckCircle className="org-register-page__confirmation-icon" />
            <h1>Berhasil mengajukan organisasi!</h1>
            <p>
              Cek email <strong>{submittedEmail}</strong> untuk link <strong>atur password</strong>. Ikuti langkahnya
              (password + kode verifikasi) untuk mengaktifkan organisasi dan masuk sebagai organizer.
            </p>
            <button type="button" className="btn btn--primary" onClick={resetForm}>
              Daftarkan Organisasi Lain
            </button>
          </div>
        ) : (
          <>
            <h1 className="org-register-page__title">Daftarkan Organisasimu</h1>
            <p className="org-register-page__subtitle">
              Isi profil organisasimu di bawah ini. Kami akan mengirim link atur password ke email organisasi setelah
              kamu submit.
            </p>

            <form className="org-register-page__form" onSubmit={handleSubmit}>
              <label className="org-register-page__field">
                <span>Nama Kamu (Penanggung Jawab)</span>
                <input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Nama lengkapmu"
                  required
                />
              </label>

              <label className="org-register-page__field">
                <span>Nama Organisasi</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Yayasan Peduli Bumi" required />
              </label>

              <label className="org-register-page__field">
                <span>Profil Singkat</span>
                <textarea
                  value={shortProfile}
                  onChange={(e) => setShortProfile(e.target.value)}
                  placeholder="Ceritakan secara singkat tentang organisasimu..."
                  rows={3}
                  required
                />
              </label>

              <div className="org-register-page__field">
                <LocationSelector
                  value={location}
                  onChange={setLocation}
                  showDistrict={false}
                  showVillage={false}
                  label="Lokasi"
                  placeholder="Pilih kota / kabupaten..."
                />
              </div>

              <label className="org-register-page__field">
                <span>Alamat Lengkap (opsional)</span>
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Jl. Contoh No. 1" />
              </label>

              <label className="org-register-page__field">
                <span>Website (opsional)</span>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://organisasimu.org"
                />
              </label>

              <div className="org-register-page__row">
                <label className="org-register-page__field">
                  <span>Email Organisasi</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kontak@organisasimu.org"
                    required
                  />
                </label>
                <label className="org-register-page__field">
                  <span>Nomor Telepon</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812xxxxxxx"
                    required
                  />
                </label>
              </div>

              <div className="org-register-page__field">
                <span>Cause Area (opsional, boleh lebih dari satu)</span>
                <div className="org-register-page__chip-group">
                  {CAUSE_AREA_OPTIONS.map((cause) => (
                    <label
                      key={cause}
                      className={[
                        'org-register-page__chip',
                        causeAreas.has(cause) ? 'org-register-page__chip--selected' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <input type="checkbox" checked={causeAreas.has(cause)} onChange={() => toggleCauseArea(cause)} />
                      {cause}
                    </label>
                  ))}
                </div>
              </div>

              {error && <p className="org-register-page__error">{error}</p>}

              <button type="submit" className="btn btn--primary" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Mengirim...' : 'Daftarkan Organisasi'}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
