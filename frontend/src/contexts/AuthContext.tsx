import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  registerRequest,
  loginRequest,
  verifyOtpRequest,
  resendOtpRequest,
  bypassOtpRequest,
  forgotPasswordRequestOtpRequest,
  resetPasswordRequest,
  meRequest,
  logoutRequest,
  type AuthUser,
  type RegisterPayload,
  type LoginPayload,
} from '../lib/api'

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  register: (payload: RegisterPayload) => Promise<{ otpRequired: true; email: string }>
  verifyOtp: (email: string, code: string) => Promise<AuthUser>
  resendOtp: (email: string) => Promise<void>
  bypassOtp: (email: string) => Promise<AuthUser>
  requestPasswordReset: (email: string) => Promise<void>
  resetPassword: (email: string, code: string, newPassword: string) => Promise<AuthUser>
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
    // Tidak set user di sini — sesi baru terbit setelah OTP diverifikasi.
    return registerRequest(payload)
  }

  const verifyOtp = async (email: string, code: string) => {
    const { user } = await verifyOtpRequest({ email, code })
    setUser(user)
    return user
  }

  const resendOtp = async (email: string) => {
    await resendOtpRequest({ email })
  }

  const bypassOtp = async (email: string) => {
    const { user } = await bypassOtpRequest({ email })
    setUser(user)
    return user
  }

  const requestPasswordReset = async (email: string) => {
    await forgotPasswordRequestOtpRequest({ email })
  }

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    const { user } = await resetPasswordRequest({ email, code, newPassword })
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
    <AuthContext.Provider
      value={{ user, isLoading, register, verifyOtp, resendOtp, bypassOtp, requestPasswordReset, resetPassword, login, logout }}
    >
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
