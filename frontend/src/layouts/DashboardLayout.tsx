import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import AppTopbar from '../components/AppTopbar'
import OnboardingModal from '../components/OnboardingModal'
import LoadingScreen from '../components/LoadingScreen'
import { useAuth } from '../contexts/AuthContext'
import { getMyProfile, type ProfileData } from '../lib/profileApi'
import './DashboardLayout.css'

export default function DashboardLayout() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  useEffect(() => {
    if (!user) {
      setIsLoadingProfile(false)
      return
    }
    setIsLoadingProfile(true)
    getMyProfile()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setIsLoadingProfile(false))
  }, [user])

  if (isLoadingProfile) return <LoadingScreen />

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
