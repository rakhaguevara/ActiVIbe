import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import './SettingsPage.css'

export default function SettingsPage() {
  const { user } = useAuth()
  const [orgName, setOrgName] = useState(user?.name ?? '')
  const [description, setDescription] = useState('')
  const [contactEmail, setContactEmail] = useState(user?.email ?? '')
  const [contactPhone, setContactPhone] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="organizer-settings">
      <header className="organizer-settings__header">
        <h1>Organization Settings</h1>
        <p>Profil organisasi yang tampil ke volunteer & publik.</p>
      </header>

      <div className="card organizer-settings__form">
        <label className="organizer-settings__field">
          <span>Nama Organisasi</span>
          <input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
        </label>
        <label className="organizer-settings__field">
          <span>Deskripsi</span>
          <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ceritakan tentang organisasimu..." />
        </label>
        <label className="organizer-settings__field">
          <span>Email Kontak</span>
          <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        </label>
        <label className="organizer-settings__field">
          <span>Nomor Telepon</span>
          <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="08123456789" />
        </label>

        <div className="organizer-settings__footer">
          <button type="button" className="btn btn--primary btn--sm" onClick={handleSave}>
            Simpan Perubahan
          </button>
          {saved && <span className="organizer-settings__saved">Tersimpan!</span>}
        </div>
      </div>
    </div>
  )
}
