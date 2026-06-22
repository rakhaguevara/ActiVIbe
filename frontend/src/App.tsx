import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import Navbar from './components/Navbar'
import AuthModal, { type AuthMode } from './components/AuthModal'
import AppRoutes from './routes/AppRoutes'

function App() {
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)

  return (
    <BrowserRouter>
      <Navbar
        onLoginClick={() => setAuthMode('login')}
        onSignupClick={() => setAuthMode('signup')}
      />
      <AppRoutes onSignupClick={() => setAuthMode('signup')} />

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onModeChange={setAuthMode}
        />
      )}
    </BrowserRouter>
  )
}

export default App
