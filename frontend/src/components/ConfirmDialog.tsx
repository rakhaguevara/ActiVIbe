import { useEffect } from 'react'
import './ConfirmDialog.css'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel: string
  tone?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
  // Dipakai aksi Danger Zone organisasi (deactivate/reactivate/transfer/delete
  // — lihat SecuritySettingsView) yang butuh konfirmasi password pemilik, bukan
  // cuma klik konfirmasi biasa. Opsional & default off supaya semua pemakaian
  // ConfirmDialog yang sudah ada (kebab menu, hapus template, dst) tidak berubah.
  requirePassword?: boolean
  passwordValue?: string
  onPasswordChange?: (value: string) => void
  passwordError?: string | null
  confirmDisabled?: boolean
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  tone = 'default',
  onConfirm,
  onCancel,
  requirePassword = false,
  passwordValue = '',
  onPasswordChange,
  passwordError,
  confirmDisabled = false,
}: ConfirmDialogProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  const isConfirmDisabled = confirmDisabled || (requirePassword && !passwordValue.trim())

  return (
    <div className="confirm-dialog__backdrop" onClick={onCancel}>
      <div className="confirm-dialog" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h3 className="confirm-dialog__title">{title}</h3>
        <p className="confirm-dialog__message">{message}</p>
        {requirePassword && (
          <div className="confirm-dialog__password">
            <label htmlFor="confirm-dialog-password">Masukkan password kamu untuk melanjutkan</label>
            <input
              id="confirm-dialog-password"
              type="password"
              className="confirm-dialog__password-input"
              value={passwordValue}
              onChange={(e) => onPasswordChange?.(e.target.value)}
              placeholder="Password"
              autoFocus
            />
            {passwordError && <p className="confirm-dialog__password-error">{passwordError}</p>}
          </div>
        )}
        <div className="confirm-dialog__actions">
          <button type="button" className="btn btn--outline btn--sm" onClick={onCancel}>
            Batal
          </button>
          <button
            type="button"
            className={`btn btn--sm ${tone === 'danger' ? 'btn--danger' : 'btn--primary'}`}
            onClick={onConfirm}
            disabled={isConfirmDisabled}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
