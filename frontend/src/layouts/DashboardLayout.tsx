import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import AppTopbar from '../components/AppTopbar'
import OnboardingModal from '../components/OnboardingModal'
import { useAuth } from '../contexts/AuthContext'
import { getMyProfile, type ProfileData } from '../lib/profileApi'
import './DashboardLayout.css'

export default function DashboardLayout() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)

  useEffect(() => {
    if (!user) return
    getMyProfile()
      .then(setProfile)
      .catch(() => setProfile(null))
  }, [user])

  // `availability` cuma terisi setelah step terakhir wizard onboarding selesai
  // (lihat komentar updateProfile di backend/src/modules/profile/profile.service.js),
  // jadi null berarti user belum menuntaskan wizard-nya.
  const needsOnboarding = profile !== null && profile.availability === null

  return (
    <div className="dashboard-layout">
      <AppTopbar logoTo="/dashboard" />
      <Outlet />

      {needsOnboarding && profile && (
        <OnboardingModal initialProfile={profile} onComplete={setProfile} />
      )}
    </div>
  )
}
