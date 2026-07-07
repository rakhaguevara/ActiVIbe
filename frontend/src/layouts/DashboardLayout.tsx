import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import AppTopbar from '../components/AppTopbar'
import OnboardingModal from '../components/OnboardingModal'
import PersonalizationResultModal from '../components/PersonalizationResultModal'
import LoadingScreen from '../components/LoadingScreen'
import MobileBottomNav from '../components/MobileBottomNav'
import { useAuth } from '../contexts/AuthContext'
import { getMyProfile, type ProfileData } from '../lib/profileApi'
import { invalidateRecommendations } from '../services/recommendation.service'
import './DashboardLayout.css'

export default function DashboardLayout() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [showPersonalizationResult, setShowPersonalizationResult] = useState(false)

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

  const handleOnboardingComplete = (updatedProfile: ProfileData) => {
    setProfile(updatedProfile)
    invalidateRecommendations()
    setShowPersonalizationResult(true)
  }

  if (isLoadingProfile) return <LoadingScreen />

  const needsOnboarding = profile !== null && profile.availability === null

  return (
    <div className="dashboard-layout">
      {/* AppTopbar will be hidden on mobile via CSS */}
      <AppTopbar logoTo="/dashboard" />
      
      <Outlet />

      <MobileBottomNav />

      {needsOnboarding && profile && (
        <OnboardingModal initialProfile={profile} onComplete={handleOnboardingComplete} />
      )}

      {showPersonalizationResult && (
        <PersonalizationResultModal onClose={() => setShowPersonalizationResult(false)} />
      )}
    </div>
  )
}
