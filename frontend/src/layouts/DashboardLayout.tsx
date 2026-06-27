import { Outlet } from 'react-router-dom'
import AppTopbar from '../components/AppTopbar'
import './DashboardLayout.css'

export default function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <AppTopbar logoTo="/dashboard" />
      <Outlet />
    </div>
  )
}
