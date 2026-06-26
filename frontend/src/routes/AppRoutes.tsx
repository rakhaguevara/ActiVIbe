import { Routes, Route } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import HomePage from '../pages/HomePage'
import AboutPage from '../pages/AboutPage'
import CaraKerjaPage from '../pages/CaraKerjaPage'
import NotFoundPage from '../pages/NotFoundPage'
import FindActivityPage from '../pages/volunteer/FindActivityPage'

interface AppRoutesProps {
  onLoginClick: () => void
  onSignupClick: () => void
}

export default function AppRoutes({ onLoginClick, onSignupClick }: AppRoutesProps) {
  return (
    <Routes>
      <Route element={<PublicLayout onLoginClick={onLoginClick} onSignupClick={onSignupClick} />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/tentang-kami" element={<AboutPage onSignupClick={onSignupClick} />} />
        <Route path="/cara-kerja" element={<CaraKerjaPage onSignupClick={onSignupClick} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<FindActivityPage />} />
      </Route>
    </Routes>
  )
}
