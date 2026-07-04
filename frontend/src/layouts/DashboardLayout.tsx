import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import AppTopbar from '../components/AppTopbar'
import OnboardingModal from '../components/OnboardingModal'
import PersonalizationResultModal from '../components/PersonalizationResultModal'
import LoadingScreen from '../components/LoadingScreen'
import { useAuth } from '../contexts/AuthContext'
import { getMyProfile, type ProfileData } from '../lib/profileApi'
import { invalidateRecommendations } from '../services/recommendation.service'
import './DashboardLayout.css'

export default function DashboardLayout() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  // Alur pasca-onboarding (FR-005): begitu wizard selesai, JANGAN langsung
  // lepas user ke dashboard — tampilkan dulu card hasil personalisasi
  // (kegiatan paling cocok + CTA daftar) di PersonalizationResultModal.
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
    // Profil baru saja berubah — buang cache rekomendasi supaya modal hasil
    // (dan dashboard di belakangnya) menghitung ulang dengan data terbaru.
    invalidateRecommendations()
    setShowPersonalizationResult(true)
  }

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
        <OnboardingModal initialProfile={profile} onComplete={handleOnboardingComplete} />
      )}

      {showPersonalizationResult && (
        <PersonalizationResultModal onClose={() => setShowPersonalizationResult(false)} />
      )}
    </div>
  )
}
