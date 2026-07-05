import { useState, useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import AuthModal, { type AuthMode } from './components/AuthModal'
import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './contexts/AuthContext'
import { PORTAL } from './config/portal'

function App() {
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)

  useEffect(() => {
    switch (PORTAL) {
      case 'organizer':
        document.title = 'Activibe-Organizer-Edition'
        break
      case 'admin':
        document.title = 'Activibe:Admin'
        break
      case 'volunteer':
      default:
        document.title = 'Activibe'
        break
    }
  }, [])

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes
          onLoginClick={() => setAuthMode('login')}
          onSignupClick={() => setAuthMode('signup')}
        />

        {PORTAL === 'volunteer' && authMode && (
          <AuthModal
            mode={authMode}
            onClose={() => setAuthMode(null)}
            onModeChange={setAuthMode}
          />
        )}
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
