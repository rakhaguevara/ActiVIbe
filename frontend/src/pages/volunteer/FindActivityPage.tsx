import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './FindActivityPage.css'

export default function FindActivityPage() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/', { replace: true })
    }
  }, [isLoading, user, navigate])

  if (isLoading || !user) {
    return null
  }

  return (
    <main className="find-activity-page">
      <p className="find-activity-page__placeholder">
        Halo, {user.name.split(' ')[0]}! Halaman cari kegiatan akan segera hadir di sini.
      </p>
    </main>
  )
}
