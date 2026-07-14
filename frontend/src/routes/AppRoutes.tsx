import { Routes, Route } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import AdminLayout from '../layouts/AdminLayout'
import OrganizerLayout from '../layouts/OrganizerLayout'
import HomePage from '../pages/HomePage'
import AboutPage from '../pages/AboutPage'
import CaraKerjaPage from '../pages/CaraKerjaPage'
import DonatePage from '../pages/DonatePage'
import ActivibePlusPage from '../pages/ActivibePlusPage'
import NotFoundPage from '../pages/NotFoundPage'
import FindActivityPage from '../pages/volunteer/FindActivityPage'
import FindOrganizationPage from '../pages/volunteer/FindOrganizationPage'
import PublicFindActivityPage from '../pages/public/PublicFindActivityPage'
import PublicFindOrganizationPage from '../pages/public/PublicFindOrganizationPage'
import OrganizationRegisterPage from '../pages/volunteer/OrganizationRegisterPage'
import SetOrganizationPasswordPage from '../pages/volunteer/SetOrganizationPasswordPage'
import PassportPage from '../pages/volunteer/PassportPage'
import PassportBookPreview from '../pages/volunteer/PassportBookPreview'
import VolunteerSettingsPage from '../pages/volunteer/SettingsPage'
import SavedItemsPage from '../pages/volunteer/SavedItemsPage'
import ApplicationHistoryPage from '../pages/volunteer/ApplicationHistoryPage'
import ActivityDetailPage from '../pages/volunteer/ActivityDetailPage'
import MobileProfilePage from '../pages/volunteer/MobileProfilePage'
import LoginPage from '../pages/auth/LoginPage'
import OverviewPage from '../pages/admin/OverviewPage'
import UsersPage from '../pages/admin/UsersPage'
import EventsPage from '../pages/admin/EventsPage'
import ParticipationExportPage from '../pages/admin/ParticipationExportPage'
import ActivityLogPage from '../pages/admin/ActivityLogPage'
import PrematureClosuresPage from '../pages/admin/PrematureClosuresPage'
import OrganizersPage from '../pages/admin/OrganizersPage'
import RevenuePage from '../pages/admin/RevenuePage'
import CertificateTemplatesPage from '../pages/admin/CertificateTemplatesPage'
import OrganizerOverviewPage from '../pages/organizer/OverviewPage'
import VolunteersPage from '../pages/organizer/VolunteersPage'
import OrganizerEventsPage from '../pages/organizer/EventsPage'
import CreateEventPage from '../pages/organizer/CreateEventPage'
import EventDetailPage from '../pages/organizer/EventDetailPage'
import OverviewTab from '../pages/organizer/event-detail/OverviewTab'
import RolesTab from '../pages/organizer/event-detail/RolesTab'
import RequirementsTab from '../pages/organizer/event-detail/RequirementsTab'
import ImpactTab from '../pages/organizer/event-detail/ImpactTab'
import EventCertificatesTab from '../pages/organizer/EventCertificatesTab'
import ApplicantsPage from '../pages/organizer/ApplicantsPage'
import AssignmentsPage from '../pages/organizer/AssignmentsPage'
import AttendancePage from '../pages/organizer/AttendancePage'
import CommunicationPage from '../pages/organizer/CommunicationPage'
import ReportsPage from '../pages/organizer/ReportsPage'
import CertificatesPage from '../pages/organizer/CertificatesPage'
import OrganizationPage from '../pages/organizer/OrganizationPage'
import OrganizerSettingsPage from '../pages/organizer/SettingsPage'
import OrganizerHelpPage from '../pages/organizer/HelpPage'
import AcceptTeamInvitePage from '../pages/organizer/AcceptTeamInvitePage'
import { PORTAL } from '../config/portal'
import LoadingScreen from '../components/LoadingScreen'
import { useAuth } from '../contexts/AuthContext'

interface AppRoutesProps {
  onLoginClick: () => void
  onSignupClick: () => void
}

export default function AppRoutes({ onLoginClick, onSignupClick }: AppRoutesProps) {
  const { isLoading } = useAuth()

  if (isLoading) return <LoadingScreen />

  if (PORTAL === 'admin') {
    return (
      <Routes>
        <Route path="/" element={<LoginPage allowedRole="ADMIN" homeRoute="/admin" title="Masuk sebagai Admin" />} />
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<OverviewPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/events" element={<EventsPage />} />
          <Route path="/admin/participation" element={<ParticipationExportPage />} />
          <Route path="/admin/activity-log" element={<ActivityLogPage />} />
          <Route path="/admin/premature-closures" element={<PrematureClosuresPage />} />
          <Route path="/admin/organizers" element={<OrganizersPage />} />
          <Route path="/admin/revenue" element={<RevenuePage />} />
          <Route path="/admin/certificate-templates" element={<CertificateTemplatesPage />} />
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
          element={<LoginPage allowedRole="ORGANIZER" homeRoute="/organizer" title="Masuk sebagai Organizer" />}
        />
        {/* Publik (tanpa requireAuth) — dibuka dari email undangan tim
            organisasi, lihat organizationMembers.service.js inviteMember.
            Didaftarkan di luar OrganizerLayout (sama seperti "/" di atas)
            krn belum tentu (dan tidak perlu) ada sesi login saat dibuka. */}
        <Route path="/accept-invite" element={<AcceptTeamInvitePage />} />
        <Route element={<OrganizerLayout />}>
          <Route path="/organizer" element={<OrganizerOverviewPage />} />
          <Route path="/organizer/events" element={<OrganizerEventsPage />} />
          <Route path="/organizer/events/new" element={<CreateEventPage />} />
          <Route path="/organizer/events/:eventId" element={<EventDetailPage />}>
            <Route index element={<OverviewTab />} />
            <Route path="applicants" element={<ApplicantsPage />} />
            <Route path="roles" element={<RolesTab />} />
            <Route path="assignments" element={<AssignmentsPage />} />
            <Route path="requirements" element={<RequirementsTab />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="communication" element={<CommunicationPage />} />
            <Route path="impact" element={<ImpactTab />} />
            <Route path="certificates" element={<EventCertificatesTab />} />
          </Route>
          <Route path="/organizer/communication" element={<CommunicationPage />} />
          <Route path="/organizer/reports" element={<ReportsPage />} />
          
          {/* Placeholders for new Level 1 Organizer modules */}
          <Route path="/organizer/volunteers" element={<VolunteersPage />} />
          <Route path="/organizer/certificates" element={<CertificatesPage />} />
          <Route path="/organizer/organization" element={<OrganizationPage />} />
          <Route path="/organizer/settings" element={<OrganizerSettingsPage />} />
          <Route path="/organizer/help" element={<OrganizerHelpPage />} />
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
        <Route path="/cari-aktivitas" element={<PublicFindActivityPage onLoginClick={onLoginClick} />} />
        <Route path="/cari-organisasi" element={<PublicFindOrganizationPage onLoginClick={onLoginClick} />} />
        <Route path="/donasi" element={<DonatePage />} />
        <Route path="/activibe-plus" element={<ActivibePlusPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="/set-password-organisasi" element={<SetOrganizationPasswordPage />} />

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<FindActivityPage />} />
        <Route path="/dashboard/organisasi" element={<FindOrganizationPage />} />
        <Route path="/dashboard/organisasi/daftar" element={<OrganizationRegisterPage />} />
        <Route path="/dashboard/passport" element={<PassportPage />} />
        <Route path="/dashboard/passport/prototype" element={<PassportBookPreview />} />
        <Route path="/dashboard/settings" element={<VolunteerSettingsPage />} />
        <Route path="/dashboard/saved" element={<SavedItemsPage />} />
        <Route path="/dashboard/history" element={<ApplicationHistoryPage />} />
        <Route path="/dashboard/activity/:id" element={<ActivityDetailPage />} />
        <Route path="/dashboard/profile" element={<MobileProfilePage />} />
      </Route>
    </Routes>
  )
}
