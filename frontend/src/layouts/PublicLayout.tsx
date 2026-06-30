import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

interface PublicLayoutProps {
  onLoginClick: () => void
  onSignupClick: () => void
}

export default function PublicLayout({ onLoginClick, onSignupClick }: PublicLayoutProps) {
  return (
    <>
      <Navbar onLoginClick={onLoginClick} onSignupClick={onSignupClick} />
      <Outlet />
    </>
  )
}
