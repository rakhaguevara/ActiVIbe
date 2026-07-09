import { useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'
import { FiCamera, FiCheckCircle, FiXCircle, FiX } from 'react-icons/fi'
import '../ConfirmDialog.css'
import './QrCheckInScanner.css'

interface QrCheckInScannerProps {
  onScan: (ticketCode: string) => Promise<void>
  onClose: () => void
}

type ScanState = 'starting' | 'scanning' | 'processing' | 'success' | 'error' | 'camera-error'

// Reuse endpoint yang sama dgn "Cek-in via Tiket" manual (checkInByTicket di
// OrganizerDataContext, POST /applications/ticket/check-in) — scanner ini
// cuma otomatisasi cara ngisi ticketCode-nya (decode kamera), bukan alur
// baru. Scan berjalan terus-menerus (bukan tutup setelah 1 scan) supaya
// panitia bisa presensi banyak volunteer berturut-turut di satu device.
export default function QrCheckInScanner({ onScan, onClose }: QrCheckInScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<QrScanner | null>(null)
  const [state, setState] = useState<ScanState>('starting')
  const [message, setMessage] = useState('')
  const processingRef = useRef(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  useEffect(() => {
    if (!videoRef.current) return

    const scanner = new QrScanner(
      videoRef.current,
      (result) => handleDecode(result.data),
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
        preferredCamera: 'environment',
        maxScansPerSecond: 5,
      },
    )
    scannerRef.current = scanner

    scanner
      .start()
      .then(() => setState('scanning'))
      .catch(() => {
        setState('camera-error')
        setMessage('Tidak bisa mengakses kamera. Pastikan izin kamera diaktifkan di browser.')
      })

    return () => {
      scanner.stop()
      scanner.destroy()
      scannerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDecode = async (ticketCode: string) => {
    if (processingRef.current) return
    processingRef.current = true
    setState('processing')
    try {
      await onScan(ticketCode.trim())
      setState('success')
      setMessage(`Berhasil presensi: ${ticketCode.trim()}`)
    } catch (err) {
      setState('error')
      setMessage(err instanceof Error ? err.message : 'Gagal memproses tiket ini.')
    } finally {
      // Jeda sebentar biar panitia sempat baca hasilnya, lalu lanjut scan
      // volunteer berikutnya tanpa perlu buka-tutup modal berulang kali.
      setTimeout(() => {
        processingRef.current = false
        setState('scanning')
      }, 1800)
    }
  }

  return (
    <div className="confirm-dialog__backdrop" onClick={onClose}>
      <div className="confirm-dialog qr-scanner-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="qr-scanner-modal__close" aria-label="Tutup" onClick={onClose}>
          <FiX />
        </button>

        <h3 className="confirm-dialog__title">
          <FiCamera /> Scan QR Tiket
        </h3>
        <p className="confirm-dialog__message">Arahkan kamera ke QR pada tiket volunteer untuk presensi otomatis.</p>

        <div className="qr-scanner-modal__video-wrapper">
          <video ref={videoRef} className="qr-scanner-modal__video" muted playsInline />
        </div>

        <div
          className={
            'qr-scanner-modal__status' +
            (state === 'success' ? ' qr-scanner-modal__status--success' : '') +
            (state === 'error' || state === 'camera-error' ? ' qr-scanner-modal__status--error' : '')
          }
        >
          {state === 'starting' && <span>Menyalakan kamera...</span>}
          {state === 'scanning' && <span>Menunggu QR...</span>}
          {state === 'processing' && <span>Memproses...</span>}
          {state === 'success' && (
            <span><FiCheckCircle /> {message}</span>
          )}
          {(state === 'error' || state === 'camera-error') && (
            <span><FiXCircle /> {message}</span>
          )}
        </div>

        <div className="confirm-dialog__actions">
          <button type="button" className="btn btn--outline btn--sm" onClick={onClose}>
            Selesai
          </button>
        </div>
      </div>
    </div>
  )
}
