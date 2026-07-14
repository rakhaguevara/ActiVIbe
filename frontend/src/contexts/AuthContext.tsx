import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  registerRequest,
  loginRequest,
  verifyTwoFactorLoginRequest,
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
  type LoginResult,
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
  // Bisa mengembalikan sinyal 2FA ({requiresTwoFactor, userId}) alih-alih user
  // langsung — lihat verifyTwoFactorLogin di bawah utk langkah lanjutannya.
  // Akun tanpa 2FA aktif (mayoritas) tidak pernah kena cabang ini.
  login: (payload: LoginPayload) => Promise<LoginResult>
  verifyTwoFactorLogin: (userId: string, code: string) => Promise<AuthUser>
  logout: () => Promise<void>
  // Dipanggil SecuritySettingsView setelah 2FA berhasil di-enroll/dinonaktifkan
  // supaya `user.twoFactorEnabled` di context ikut ter-update tanpa reload halaman.
  refreshUser: () => Promise<void>
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
    const result = await loginRequest(payload)
    if ('requiresTwoFactor' in result) {
      return result
    }
    setUser(result.user)
    return result
  }

  const verifyTwoFactorLogin = async (userId: string, code: string) => {
    const { user } = await verifyTwoFactorLoginRequest({ userId, code })
    setUser(user)
    return user
  }

  const logout = async () => {
    await logoutRequest()
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const { user } = await meRequest()
      setUser(user)
    } catch {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        register,
        verifyOtp,
        resendOtp,
        bypassOtp,
        requestPasswordReset,
        resetPassword,
        login,
        verifyTwoFactorLogin,
        logout,
        refreshUser,
      }}
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
