import { Routes, Route, useNavigate } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import AdminLayout from '../layouts/AdminLayout'
import OrganizerLayout from '../layouts/OrganizerLayout'
import HomePage from '../pages/HomePage'
import AboutPage from '../pages/AboutPage'
import CaraKerjaPage from '../pages/CaraKerjaPage'
import NotFoundPage from '../pages/NotFoundPage'
import FindActivityPage from '../pages/volunteer/FindActivityPage'
import LoginPage from '../pages/auth/LoginPage'
import SignupPage from '../pages/auth/SignupPage'
import OverviewPage from '../pages/admin/OverviewPage'
import UsersPage from '../pages/admin/UsersPage'
import EventsPage from '../pages/admin/EventsPage'
import ParticipationExportPage from '../pages/admin/ParticipationExportPage'
import ActivityLogPage from '../pages/admin/ActivityLogPage'
import OrganizerDashboardPage from '../pages/organizer/OrganizerDashboardPage'
import { PORTAL } from '../config/portal'

export default function AppRoutes() {
  const navigate = useNavigate()
  const onLoginClick = () => navigate('/masuk')
  const onSignupClick = () => navigate('/daftar')

  if (PORTAL === 'admin') {
    return (
      <Routes>
        <Route
          path="/"
          element={
            <LoginPage allowedRole="ADMIN" homeRoute="/admin" title="Masuk sebagai Admin" showSignupLink />
          }
        />
        <Route
          path="/daftar"
          element={<SignupPage role="ADMIN" homeRoute="/admin" loginRoute="/" title="Daftar sebagai Admin" />}
        />
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<OverviewPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/events" element={<EventsPage />} />
          <Route path="/admin/participation" element={<ParticipationExportPage />} />
          <Route path="/admin/activity-log" element={<ActivityLogPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    )
  }

  if (PORTAL === 'organizer') {
    return (
      <Routes>
        <Route
          path="/"
          element={
            <LoginPage
              allowedRole="ORGANIZER"
              homeRoute="/organizer"
              title="Masuk sebagai Organizer"
              showSignupLink
            />
          }
        />
        <Route
          path="/daftar"
          element={
            <SignupPage role="ORGANIZER" homeRoute="/organizer" loginRoute="/" title="Daftar sebagai Organizer" />
          }
        />
        <Route element={<OrganizerLayout />}>
          <Route path="/organizer" element={<OrganizerDashboardPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route element={<PublicLayout onLoginClick={onLoginClick} onSignupClick={onSignupClick} />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/tentang-kami" element={<AboutPage onSignupClick={onSignupClick} />} />
        <Route path="/cara-kerja" element={<CaraKerjaPage onSignupClick={onSignupClick} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route
        path="/masuk"
        element={<LoginPage allowedRole="VOLUNTEER" homeRoute="/dashboard" title="Masuk ke akunmu" showSignupLink />}
      />
      <Route
        path="/daftar"
        element={<SignupPage role="VOLUNTEER" homeRoute="/dashboard" loginRoute="/masuk" title="Buat akun barumu" />}
      />

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<FindActivityPage />} />
      </Route>
    </Routes>
  )
}
