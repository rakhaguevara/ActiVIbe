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
import OrganizerOverviewPage from '../pages/organizer/OverviewPage'
import OrganizerEventsPage from '../pages/organizer/EventsPage'
import CreateEventPage from '../pages/organizer/CreateEventPage'
import EventDetailPage from '../pages/organizer/EventDetailPage'
import ApplicantsPage from '../pages/organizer/ApplicantsPage'
import AssignmentsPage from '../pages/organizer/AssignmentsPage'
import AttendancePage from '../pages/organizer/AttendancePage'
import CommunicationPage from '../pages/organizer/CommunicationPage'
import ReportsPage from '../pages/organizer/ReportsPage'
import OrganizerSettingsPage from '../pages/organizer/SettingsPage'
import { PORTAL } from '../config/portal'
import LoadingScreen from '../components/LoadingScreen'
import { useAuth } from '../contexts/AuthContext'

export default function AppRoutes() {
  const navigate = useNavigate()
  const { isLoading } = useAuth()
  const onLoginClick = () => navigate('/masuk')
  const onSignupClick = () => navigate('/daftar')

  if (isLoading) return <LoadingScreen />

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
          <Route path="/organizer" element={<OrganizerOverviewPage />} />
          <Route path="/organizer/events" element={<OrganizerEventsPage />} />
          <Route path="/organizer/events/new" element={<CreateEventPage />} />
          <Route path="/organizer/events/:eventId" element={<EventDetailPage />} />
          <Route path="/organizer/applicants" element={<ApplicantsPage />} />
          <Route path="/organizer/assignments" element={<AssignmentsPage />} />
          <Route path="/organizer/attendance" element={<AttendancePage />} />
          <Route path="/organizer/communication" element={<CommunicationPage />} />
          <Route path="/organizer/reports" element={<ReportsPage />} />
          <Route path="/organizer/settings" element={<OrganizerSettingsPage />} />
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
