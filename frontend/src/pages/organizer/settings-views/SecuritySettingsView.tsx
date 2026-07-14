import { useEffect, useState } from 'react'
import {
  FiShield, FiKey, FiMonitor, FiAlertTriangle, FiTrash2, FiSmartphone, FiX, FiCheckCircle
} from 'react-icons/fi'
import { useAuth } from '../../../contexts/AuthContext'
import ConfirmDialog from '../../../components/ConfirmDialog'
import {
  changePasswordRequest,
  listSessionsRequest,
  revokeSessionRequest,
  revokeOtherSessionsRequest,
  beginTwoFactorEnrollRequest,
  confirmTwoFactorEnrollRequest,
  disableTwoFactorRequest,
  type AuthSession,
  type TwoFactorEnrollResult,
} from '../../../lib/api'
import { getMyOrganization, deactivateOrganization, reactivateOrganization, transferOrganizationOwnership, deleteOrganization } from '../../../lib/organizationApi'
import type { Organization } from '../../../types/organization'
import '../SettingsPage.css'

type DangerAction = 'deactivate' | 'reactivate' | 'transfer' | 'delete' | null

// Sesi tanpa userAgent (device lama sebelum kolom ini ada, atau device yang
// backend tidak sempat tangkap header-nya) tampil sbg "Perangkat tidak dikenal"
// — bukan string kosong yang membingungkan.
function formatUserAgent(userAgent?: string): string {
  if (!userAgent) return 'Perangkat tidak dikenal'
  return userAgent.length > 70 ? `${userAgent.slice(0, 70)}...` : userAgent
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Baru saja'
  if (diffMin < 60) return `${diffMin} menit lalu`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour} jam lalu`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 7) return `${diffDay} hari lalu`
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function SecuritySettingsView() {
  const { user, refreshUser } = useAuth()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [sessions, setSessions] = useState<AuthSession[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)

  // --- Update Password ---
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  // --- 2FA enroll/disable ---
  const [enrollData, setEnrollData] = useState<TwoFactorEnrollResult | null>(null)
  const [enrollCode, setEnrollCode] = useState('')
  const [enrollError, setEnrollError] = useState<string | null>(null)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [showDisableModal, setShowDisableModal] = useState(false)
  const [disableCode, setDisableCode] = useState('')
  const [disableError, setDisableError] = useState<string | null>(null)
  const [isDisabling2fa, setIsDisabling2fa] = useState(false)

  // --- Danger zone ---
  const [dangerAction, setDangerAction] = useState<DangerAction>(null)
  const [dangerPassword, setDangerPassword] = useState('')
  const [dangerError, setDangerError] = useState<string | null>(null)
  const [transferEmail, setTransferEmail] = useState('')
  const [isProcessingDanger, setIsProcessingDanger] = useState(false)

  const loadSessions = () => {
    setSessionsLoading(true)
    listSessionsRequest()
      .then(({ sessions }) => setSessions(sessions))
      .catch((err) => window.alert(err instanceof Error ? err.message : 'Gagal memuat sesi login.'))
      .finally(() => setSessionsLoading(false))
  }

  useEffect(() => {
    getMyOrganization()
      .then(setOrganization)
      .catch((err) => window.alert(err instanceof Error ? err.message : 'Gagal memuat data organisasi.'))
    loadSessions()
  }, [])

  const handleChangePassword = async () => {
    setPasswordError(null)
    if (newPassword.length < 8) {
      setPasswordError('Password baru minimal 8 karakter.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password tidak cocok.')
      return
    }
    setIsSavingPassword(true)
    try {
      await changePasswordRequest({ currentPassword, newPassword })
      window.alert('Password berhasil diubah. Sesi di device lain sudah otomatis keluar.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordForm(false)
      loadSessions()
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Gagal mengubah password.')
    } finally {
      setIsSavingPassword(false)
    }
  }

  const handleStartEnroll = async () => {
    setEnrollError(null)
    try {
      const result = await beginTwoFactorEnrollRequest()
      setEnrollData(result)
      setEnrollCode('')
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal memulai aktivasi 2FA.')
    }
  }

  const handleConfirmEnroll = async () => {
    if (!enrollData) return
    setEnrollError(null)
    setIsEnrolling(true)
    try {
      await confirmTwoFactorEnrollRequest({ secret: enrollData.secret, code: enrollCode.trim() })
      setEnrollData(null)
      setEnrollCode('')
      await refreshUser()
      window.alert('2FA berhasil diaktifkan.')
    } catch (err) {
      setEnrollError(err instanceof Error ? err.message : 'Kode verifikasi salah.')
    } finally {
      setIsEnrolling(false)
    }
  }

  const handleDisable2fa = async () => {
    setDisableError(null)
    setIsDisabling2fa(true)
    try {
      await disableTwoFactorRequest({ code: disableCode.trim() })
      setShowDisableModal(false)
      setDisableCode('')
      await refreshUser()
      window.alert('2FA berhasil dinonaktifkan.')
    } catch (err) {
      setDisableError(err instanceof Error ? err.message : 'Kode verifikasi salah.')
    } finally {
      setIsDisabling2fa(false)
    }
  }

  const handleRevokeSession = async (id: string) => {
    try {
      await revokeSessionRequest(id)
      loadSessions()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal mencabut sesi.')
    }
  }

  const handleRevokeOthers = async () => {
    try {
      await revokeOtherSessionsRequest()
      loadSessions()
      window.alert('Semua sesi lain berhasil dicabut.')
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal mencabut sesi lain.')
    }
  }

  const closeDangerDialog = () => {
    setDangerAction(null)
    setDangerPassword('')
    setDangerError(null)
    setTransferEmail('')
  }

  const handleConfirmDanger = async () => {
    if (!dangerAction) return
    setDangerError(null)
    setIsProcessingDanger(true)
    try {
      if (dangerAction === 'deactivate') {
        setOrganization(await deactivateOrganization(dangerPassword))
        window.alert('Organisasi berhasil dinonaktifkan.')
      } else if (dangerAction === 'reactivate') {
        setOrganization(await reactivateOrganization(dangerPassword))
        window.alert('Organisasi berhasil diaktifkan kembali.')
      } else if (dangerAction === 'transfer') {
        if (!transferEmail.trim()) {
          setDangerError('Email pemilik baru wajib diisi.')
          setIsProcessingDanger(false)
          return
        }
        setOrganization(await transferOrganizationOwnership({ newOwnerEmail: transferEmail.trim(), password: dangerPassword }))
        window.alert('Kepemilikan organisasi berhasil dipindahkan.')
      } else if (dangerAction === 'delete') {
        await deleteOrganization(dangerPassword)
        window.alert('Organisasi berhasil dihapus.')
      }
      closeDangerDialog()
    } catch (err) {
      setDangerError(err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi.')
    } finally {
      setIsProcessingDanger(false)
    }
  }

  const isOrgActive = organization?.status === 'ACTIVE'
  const isOrgDeactivated = organization?.status === 'DEACTIVATED'
  const currentSession = sessions.find((s) => s.isCurrent)

  const dangerDialogCopy: Record<Exclude<DangerAction, null>, { title: string; message: string; confirmLabel: string }> = {
    deactivate: {
      title: 'Nonaktifkan Organisasi?',
      message: 'Semua event akan disembunyikan sementara dari volunteer. Kamu bisa mengaktifkannya kembali kapan saja.',
      confirmLabel: 'Nonaktifkan',
    },
    reactivate: {
      title: 'Aktifkan Kembali Organisasi?',
      message: 'Organisasi akan kembali terlihat oleh volunteer dan event bisa berjalan normal lagi.',
      confirmLabel: 'Aktifkan Kembali',
    },
    transfer: {
      title: 'Transfer Kepemilikan Organisasi',
      message: 'Pemilik baru harus sudah punya akun organizer terdaftar di ActiVibe. Kamu akan kehilangan akses kepemilikan setelah ini.',
      confirmLabel: 'Transfer',
    },
    delete: {
      title: 'Hapus Organisasi?',
      message: 'Organisasi tidak akan lagi muncul di direktori atau dashboard-mu. Histori event tetap tersimpan (tidak dihapus permanen).',
      confirmLabel: 'Hapus Organisasi',
    },
  }

  return (
    <>
      {/* KPI Cards — cuma angka nyata (2FA status & jumlah sesi aktif), tidak
          ada "Security Score"/"Team Protected" krn tidak ada data backend
          utk itu (lihat prinsip "jangan mengarang angka" di CLAUDE.md). */}
      <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: user?.twoFactorEnabled ? 'var(--color-success)' : 'var(--color-text-muted)', background: user?.twoFactorEnabled ? '#f0fdf4' : '#f8fafc' }}><FiKey /></div>
          <div className="stat-card__value">{user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}</div>
          <div className="stat-card__label">Two-Factor Auth</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon"><FiMonitor /></div>
          <div className="stat-card__value">{sessions.length}</div>
          <div className="stat-card__label">Active Sessions</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          <section className="card" style={{ padding: '32px' }}>
            <h2 className="settings-section-title"><FiKey /> Security Settings</h2>

            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <div className="settings-toggle-title">Change Password</div>
                <div className="settings-toggle-desc">Regularly updating your password helps keep your account secure.</div>
              </div>
              <button type="button" className="btn btn--sm btn--outline" onClick={() => setShowPasswordForm((v) => !v)}>
                {showPasswordForm ? 'Batal' : 'Update Password'}
              </button>
            </div>

            {showPasswordForm && (
              <div style={{ padding: '16px 0', borderBottom: '1px solid var(--color-border-light)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="settings-group">
                  <label>Password Saat Ini</label>
                  <input type="password" className="settings-input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                </div>
                <div className="settings-group">
                  <label>Password Baru</label>
                  <input type="password" className="settings-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div className="settings-group">
                  <label>Konfirmasi Password Baru</label>
                  <input type="password" className="settings-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
                {passwordError && <p style={{ color: '#b91c1c', fontSize: '13px', margin: 0 }}>{passwordError}</p>}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn--primary btn--sm" onClick={handleChangePassword} disabled={isSavingPassword}>
                    {isSavingPassword ? 'Menyimpan...' : 'Simpan Password Baru'}
                  </button>
                </div>
              </div>
            )}

            <div className="settings-toggle-row" style={{ borderBottom: 'none' }}>
              <div className="settings-toggle-info">
                <div className="settings-toggle-title">Two-Factor Authentication (2FA)</div>
                <div className="settings-toggle-desc">Require a security code from your authenticator app when logging in.</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className={`badge ${user?.twoFactorEnabled ? 'badge--success' : ''}`}>
                  {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
                {user?.twoFactorEnabled ? (
                  <button type="button" className="btn btn--sm btn--outline" onClick={() => setShowDisableModal(true)}>
                    Disable
                  </button>
                ) : (
                  <button type="button" className="btn btn--sm btn--outline" onClick={handleStartEnroll}>
                    Configure
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="settings-section-title" style={{ margin: 0 }}><FiMonitor /> Manage Sessions</h2>
              {sessions.length > 1 && (
                <button type="button" className="btn btn--sm btn--outline" onClick={handleRevokeOthers}>
                  Revoke All Other Sessions
                </button>
              )}
            </div>
            <div className="v-table-wrapper">
              <table className="v-table">
                <thead>
                  <tr>
                    <th>Device</th>
                    <th>IP Address</th>
                    <th>Last Active</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {sessionsLoading && (
                    <tr><td colSpan={5} style={{ color: 'var(--color-text-muted)' }}>Memuat sesi...</td></tr>
                  )}
                  {!sessionsLoading && sessions.length === 0 && (
                    <tr><td colSpan={5} style={{ color: 'var(--color-text-muted)' }}>Tidak ada sesi aktif.</td></tr>
                  )}
                  {sessions.map((session) => (
                    <tr key={session.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                          <FiSmartphone /> {formatUserAgent(session.userAgent)}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace' }}>{session.ipAddress ?? '-'}</td>
                      <td>{formatRelativeTime(session.lastUsedAt)}</td>
                      <td>{session.isCurrent ? <span className="badge badge--success">Current</span> : <span className="badge">Active</span>}</td>
                      <td>
                        {!session.isCurrent && (
                          <button type="button" className="btn btn--sm btn--outline" onClick={() => handleRevokeSession(session.id)}>
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Side Form - Danger Zone */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="danger-zone-card">
            <div className="danger-zone-header">
              <FiAlertTriangle /> Danger Zone
            </div>
            <div className="danger-zone-body">
              <div className="danger-action">
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>Transfer Ownership</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Transfer this organization to another owner.</div>
                </div>
                <button type="button" className="btn btn--sm" style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }} onClick={() => setDangerAction('transfer')}>
                  Transfer
                </button>
              </div>
              <div className="danger-action">
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>
                    {isOrgDeactivated ? 'Reactivate Organization' : 'Deactivate Organization'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    {isOrgDeactivated ? 'Bring this organization back online.' : 'Temporarily suspend all events.'}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn--sm"
                  style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}
                  onClick={() => setDangerAction(isOrgDeactivated ? 'reactivate' : 'deactivate')}
                  disabled={!organization || (!isOrgActive && !isOrgDeactivated)}
                >
                  {isOrgDeactivated ? 'Reactivate' : 'Deactivate'}
                </button>
              </div>
              <div className="danger-action" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#b91c1c' }}>Delete Organization</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Remove this organization from directories and your dashboard. Event history is kept, not permanently erased.</div>
                </div>
                <button
                  type="button"
                  className="btn btn--sm"
                  style={{ background: '#b91c1c', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                  onClick={() => setDangerAction('delete')}
                >
                  <FiTrash2 /> Delete Organization
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2FA enroll modal */}
      {enrollData && (
        <div className="confirm-dialog__backdrop" onClick={() => setEnrollData(null)}>
          <div className="confirm-dialog" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <h3 className="confirm-dialog__title">Aktifkan Two-Factor Authentication</h3>
            <p className="confirm-dialog__message">
              Scan QR code ini dengan aplikasi authenticator (Google Authenticator, Authy, dst), lalu masukkan kode 6 digit yang muncul.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <img src={enrollData.qrDataUrl} alt="QR code 2FA" style={{ width: '180px', height: '180px' }} />
            </div>
            <div className="settings-group" style={{ marginBottom: '12px' }}>
              <label>Atau masukkan secret ini secara manual</label>
              <input type="text" className="settings-input" value={enrollData.secret} readOnly onClick={(e) => (e.target as HTMLInputElement).select()} />
            </div>
            <div className="settings-group" style={{ marginBottom: '12px' }}>
              <label>Kode Verifikasi</label>
              <input type="text" inputMode="numeric" maxLength={6} className="settings-input" value={enrollCode} onChange={(e) => setEnrollCode(e.target.value)} placeholder="123456" />
            </div>
            {enrollError && <p style={{ color: '#b91c1c', fontSize: '13px', margin: '0 0 12px' }}>{enrollError}</p>}
            <div className="confirm-dialog__actions">
              <button type="button" className="btn btn--outline btn--sm" onClick={() => setEnrollData(null)}>Batal</button>
              <button type="button" className="btn btn--primary btn--sm" onClick={handleConfirmEnroll} disabled={isEnrolling || enrollCode.trim().length < 6}>
                <FiCheckCircle /> {isEnrolling ? 'Memverifikasi...' : 'Aktifkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA disable modal */}
      {showDisableModal && (
        <div className="confirm-dialog__backdrop" onClick={() => setShowDisableModal(false)}>
          <div className="confirm-dialog" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3 className="confirm-dialog__title">Nonaktifkan 2FA</h3>
            <p className="confirm-dialog__message">Masukkan kode dari aplikasi authenticator kamu untuk menonaktifkan 2FA.</p>
            <div className="settings-group" style={{ marginBottom: '12px' }}>
              <input type="text" inputMode="numeric" maxLength={6} className="settings-input" value={disableCode} onChange={(e) => setDisableCode(e.target.value)} placeholder="123456" autoFocus />
            </div>
            {disableError && <p style={{ color: '#b91c1c', fontSize: '13px', margin: '0 0 12px' }}>{disableError}</p>}
            <div className="confirm-dialog__actions">
              <button type="button" className="btn btn--outline btn--sm" onClick={() => setShowDisableModal(false)}><FiX /> Batal</button>
              <button type="button" className="btn btn--danger btn--sm" onClick={handleDisable2fa} disabled={isDisabling2fa || disableCode.trim().length < 6}>
                {isDisabling2fa ? 'Memproses...' : 'Nonaktifkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Danger zone confirmation — deactivate/reactivate/delete cuma butuh
          password (pakai ConfirmDialog generik yg sudah di-extend requirePassword).
          Transfer butuh field tambahan (email pemilik baru) jadi pakai modal
          custom sendiri di bawah, bukan dipaksakan ke ConfirmDialog. */}
      {dangerAction && dangerAction !== 'transfer' && (
        <ConfirmDialog
          title={dangerDialogCopy[dangerAction].title}
          message={dangerDialogCopy[dangerAction].message}
          confirmLabel={dangerDialogCopy[dangerAction].confirmLabel}
          tone="danger"
          requirePassword
          passwordValue={dangerPassword}
          onPasswordChange={setDangerPassword}
          passwordError={dangerError}
          confirmDisabled={isProcessingDanger}
          onConfirm={handleConfirmDanger}
          onCancel={closeDangerDialog}
        />
      )}

      {dangerAction === 'transfer' && (
        <div className="confirm-dialog__backdrop" onClick={closeDangerDialog}>
          <div className="confirm-dialog" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3 className="confirm-dialog__title">{dangerDialogCopy.transfer.title}</h3>
            <p className="confirm-dialog__message">{dangerDialogCopy.transfer.message}</p>
            <div className="settings-group" style={{ marginBottom: '12px' }}>
              <label>Email Pemilik Baru</label>
              <input
                type="email"
                className="settings-input"
                value={transferEmail}
                onChange={(e) => setTransferEmail(e.target.value)}
                placeholder="organizer-baru@email.com"
                autoFocus
              />
            </div>
            <div className="confirm-dialog__password">
              <label htmlFor="transfer-password">Masukkan password kamu untuk melanjutkan</label>
              <input
                id="transfer-password"
                type="password"
                className="confirm-dialog__password-input"
                value={dangerPassword}
                onChange={(e) => setDangerPassword(e.target.value)}
                placeholder="Password"
              />
              {dangerError && <p className="confirm-dialog__password-error">{dangerError}</p>}
            </div>
            <div className="confirm-dialog__actions">
              <button type="button" className="btn btn--outline btn--sm" onClick={closeDangerDialog}>Batal</button>
              <button
                type="button"
                className="btn btn--sm btn--danger"
                onClick={handleConfirmDanger}
                disabled={isProcessingDanger || !transferEmail.trim() || !dangerPassword.trim()}
              >
                {dangerDialogCopy.transfer.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
