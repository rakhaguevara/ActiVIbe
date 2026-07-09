import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { FiCheckCircle, FiCopy, FiX } from 'react-icons/fi'
import type { ApplicationStatus } from '../lib/applicationApi'
import { formatDateShort } from '../utils/formatDate'
import './ConfirmDialog.css'
import './TicketModal.css'

interface TicketModalProps {
  eventTitle: string
  eventLocation: string
  eventStartDate: string
  eventEndDate: string
  ticketCode: string
  status: ApplicationStatus
  onClose: () => void
}

const ALREADY_PRESENT_STATUSES: ApplicationStatus[] = ['CHECKED_IN', 'COMPLETED']

// Kode tiket sebelumnya cuma pernah dikirim sekali lewat email saat
// ACCEPTED (lihat sendEventTicketEmail di CLAUDE.md) — volunteer yang
// kehilangan/tidak buka email itu tidak punya cara lain untuk lihat kodenya
// lagi tanpa organizer resend manual. Modal ini nampilin ulang kode yang
// sama (bukan generate baru) langsung dari data ApplicationRecord, supaya
// presensi tidak bergantung pada akses email.
export default function TicketModal({
  eventTitle,
  eventLocation,
  eventStartDate,
  eventEndDate,
  ticketCode,
  status,
  onClose,
}: TicketModalProps) {
  const [copied, setCopied] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [qrError, setQrError] = useState(false)
  const alreadyPresent = ALREADY_PRESENT_STATUSES.includes(status)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // QR digenerate client-side dari ticketCode yang sama persis dgn yang
  // dikirim di email (lihat sendEventTicketEmail/QRCode.toBuffer di backend)
  // — bukan minta gambar dari server, jadi tidak butuh endpoint baru.
  useEffect(() => {
    let cancelled = false
    setQrError(false)
    QRCode.toDataURL(ticketCode, { width: 220, margin: 1 })
      .then((url) => { if (!cancelled) setQrDataUrl(url) })
      .catch(() => { if (!cancelled) setQrError(true) })
    return () => { cancelled = true }
  }, [ticketCode])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ticketCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API bisa gagal (mis. browser lama/permission) — kode tetap
      // kelihatan di layar jadi tidak fatal, cuma tombol salin tidak berfungsi.
    }
  }

  return (
    <div className="confirm-dialog__backdrop" onClick={onClose}>
      <div className="confirm-dialog ticket-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="ticket-modal__close" aria-label="Tutup" onClick={onClose}>
          <FiX />
        </button>

        <h3 className="confirm-dialog__title">Tiket Kehadiran</h3>
        <p className="confirm-dialog__message">
          {eventTitle} &middot; {eventLocation}
          <br />
          {formatDateShort(eventStartDate)} – {formatDateShort(eventEndDate)}
        </p>

        <div className="ticket-modal__qr">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt={`QR tiket ${ticketCode}`} width={180} height={180} />
          ) : qrError ? (
            <p className="ticket-modal__qr-error">Gagal membuat QR, gunakan kode di bawah.</p>
          ) : (
            <div className="ticket-modal__qr-placeholder" aria-hidden="true" />
          )}
        </div>

        <div className="ticket-modal__code-box">
          <span className="ticket-modal__code">{ticketCode}</span>
          <button type="button" className="btn btn--outline btn--sm" onClick={handleCopy}>
            <FiCopy /> {copied ? 'Tersalin' : 'Salin'}
          </button>
        </div>

        {alreadyPresent ? (
          <p className="ticket-modal__status ticket-modal__status--done">
            <FiCheckCircle /> Kehadiranmu sudah dikonfirmasi panitia.
          </p>
        ) : (
          <p className="ticket-modal__status">
            Tunjukkan atau sebutkan kode ini ke panitia saat acara berlangsung untuk presensi kehadiran.
          </p>
        )}

        <div className="confirm-dialog__actions">
          <button type="button" className="btn btn--primary btn--sm" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
