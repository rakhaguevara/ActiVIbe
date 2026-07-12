import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/apiFetch'
import { FiMapPin, FiUsers } from 'react-icons/fi'
import './PublicFindActivityPage.css' // We can reuse the grid CSS

export default function PublicFindOrganizationPage({ onLoginClick }: { onLoginClick?: () => void }) {
  const [organizations, setOrganizations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadOrgs() {
      try {
        const res = await apiFetch(`${import.meta.env.VITE_API_URL ?? ''}/organizations`)
        const data = await res.json()
        if (data.organizations) {
          setOrganizations(data.organizations)
        }
      } catch (err) {
        console.error('Failed to load public organizations', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadOrgs()
  }, [])

  return (
    <div className="public-activity-page">
      <div className="public-activity-container">
        <h1>Cari Organisasi</h1>
        <p className="public-activity-subtitle">Temukan organisasi yang sejalan dengan nilai-nilai Anda dan ikuti kegiatan mereka.</p>
        
        {isLoading ? (
          <div className="public-loading">Memuat organisasi...</div>
        ) : organizations.length === 0 ? (
          <div className="public-empty">Belum ada organisasi yang terdaftar saat ini.</div>
        ) : (
          <div className="public-grid">
            {organizations.map(org => (
              <div key={org.id} className="public-card">
                <div 
                  className="public-card-image" 
                  style={{ 
                    backgroundImage: `url("${org.logoUrl || 'https://via.placeholder.com/400x200?text=Logo+Organisasi'}")`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: '#fff'
                  }} 
                />
                <div className="public-card-content">
                  <h3 className="public-card-title">{org.name}</h3>
                  <p className="public-card-org">{org.category}</p>
                  
                  <div className="public-card-meta">
                    {org.city && (
                      <span><FiMapPin /> {org.city}{org.province ? `, ${org.province}` : ''}</span>
                    )}
                    <span>
                      <FiUsers /> Organisasi
                    </span>
                  </div>
                  
                  <button className="btn btn--outline public-card-btn" onClick={onLoginClick}>
                    Ikuti Organisasi
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
