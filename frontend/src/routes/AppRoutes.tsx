import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import AboutPage from '../pages/AboutPage'
import NotFoundPage from '../pages/NotFoundPage'

interface AppRoutesProps {
  onSignupClick: () => void
}

export default function AppRoutes({ onSignupClick }: AppRoutesProps) {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tentang-kami" element={<AboutPage onSignupClick={onSignupClick} />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
