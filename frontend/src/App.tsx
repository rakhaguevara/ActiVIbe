import { useState } from 'react'
import Navbar from './components/Navbar'
import AuthModal, { type AuthMode } from './components/AuthModal'
import HomePage from './pages/HomePage'

function App() {
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)

  return (
    <>
      <Navbar
        onLoginClick={() => setAuthMode('login')}
        onSignupClick={() => setAuthMode('signup')}
      />
      <HomePage />

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onModeChange={setAuthMode}
        />
      )}
    </>
  )
}

export default App
