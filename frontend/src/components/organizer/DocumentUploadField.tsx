import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { uploadEventDocumentRequest, type EventDocumentType } from '../../lib/organizerApi'
import type { UploadedFile } from '../../types/organizer'
import './DocumentUploadField.css'

function formatFileSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(0)}MB`
}

interface DocumentUploadFieldProps {
  id: string
  label: string
  helperText?: string
  required?: boolean
  accept: string
  mimeTypes: string[]
  maxSizeMB: number
  docType: EventDocumentType
  value: UploadedFile | null
  onChange: (value: UploadedFile | null) => void
  disabled?: boolean
}

// Kontrol upload dokumen tunggal, dipakai berulang (~11x) di section "Dokumen
// Pendukung"/"Dokumen Legal Organisasi" — pola sama dgn upload CV yang sudah
// ada di SettingsPage.tsx/OnboardingModal.tsx (label ber-hidden input, chip
// nama file setelah berhasil, tombol hapus).
export default function DocumentUploadField({
  id,
  label,
  helperText,
  required,
  accept,
  mimeTypes,
  maxSizeMB,
  docType,
  value,
  onChange,
  disabled,
}: DocumentUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setError(null)
    if (!mimeTypes.includes(file.type)) {
      setError('Format file tidak didukung.')
      return
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Ukuran file maksimal ${formatFileSize(maxSizeMB * 1024 * 1024)}.`)
      return
    }

    setIsUploading(true)
    try {
      const uploaded = await uploadEventDocumentRequest(docType, file)
      onChange(uploaded)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah file, coba lagi.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="create-event__field">
      <label htmlFor={id}>
        {label}
        {required && <span className="document-upload-field__required"> *</span>}
      </label>
      {helperText && <p className="document-upload-field__helper">{helperText}</p>}

      {value ? (
        <div className="document-upload-field__file">
          <span className="document-upload-field__file-name">{value.fileName}</span>
          <button
            type="button"
            className="btn btn--outline btn--sm"
            disabled={isUploading || disabled}
            onClick={() => onChange(null)}
          >
            Ganti
          </button>
        </div>
      ) : (
        <label htmlFor={id} className="document-upload-field__upload-label">
          {isUploading ? 'Mengunggah...' : 'Pilih file'}
          <input id={id} type="file" accept={accept} hidden disabled={isUploading || disabled} onChange={handleFileChange} />
        </label>
      )}
      {error && <p className="document-upload-field__error">{error}</p>}
    </div>
  )
}
