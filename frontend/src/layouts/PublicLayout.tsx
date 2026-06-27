import { Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import AppTopbar from '../components/AppTopbar'

interface PublicLayoutProps {
  onLoginClick: () => void
  onSignupClick: () => void
}

export default function PublicLayout({ onLoginClick, onSignupClick }: PublicLayoutProps) {
  const { user } = useAuth()

  return (
    <>
      {user ? (
        <AppTopbar logoTo="/" />
      ) : (
        <Navbar onLoginClick={onLoginClick} onSignupClick={onSignupClick} />
      )}
      <Outlet />
    </>
  )
}
