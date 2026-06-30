import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  registerRequest,
  loginRequest,
  meRequest,
  logoutRequest,
  type AuthUser,
  type RegisterPayload,
  type LoginPayload,
} from '../lib/api'

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  register: (payload: RegisterPayload) => Promise<AuthUser>
  login: (payload: LoginPayload) => Promise<AuthUser>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    meRequest()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  const register = async (payload: RegisterPayload) => {
    const { user } = await registerRequest(payload)
    setUser(user)
    return user
  }

  const login = async (payload: LoginPayload) => {
    const { user } = await loginRequest(payload)
    setUser(user)
    return user
  }

  const logout = async () => {
    await logoutRequest()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
