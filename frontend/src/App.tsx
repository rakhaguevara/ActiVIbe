import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import AuthModal, { type AuthMode } from './components/AuthModal'
import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './contexts/AuthContext'
import { PORTAL } from './config/portal'

function App() {
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)

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
