import { useEffect, useMemo, useState, type FormEvent } from 'react'
import QRCode from 'qrcode'
import { FiCreditCard, FiSmartphone, FiCheckCircle, FiXCircle, FiX, FiLock } from 'react-icons/fi'
import { checkoutSubscription, type MySubscription, type SubscriptionTier } from '../lib/subscriptionApi'
import './ConfirmDialog.css'
import './PaymentSimulationModal.css'

type PaymentMethod = 'card' | 'qris' | 'va'
type Status = 'form' | 'processing' | 'success' | 'error'

interface PaymentSimulationModalProps {
  tier: Exclude<SubscriptionTier, 'FREE'>
  planName: string
  priceMonthly: number
  onClose: () => void
  onSuccess: (subscription: MySubscription) => void
}

const BANKS = ['BCA', 'Mandiri', 'BNI', 'BRI']

function formatRupiah(amount: number): string {
  return `Rp${new Intl.NumberFormat('id-ID').format(amount)}`
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

// Simulasi pembayaran ActiVibe Plus — TIDAK ADA payment gateway asli, nomor
// kartu/QRIS/VA di sini murni tampilan (tidak pernah dikirim ke server sama
// sekali). Begitu "dibayar", satu-satunya panggilan API yang terjadi adalah
// checkoutSubscription(tier) — yang SUNGGUHAN mengaktifkan Subscription +
// mencatat Transaction di database (muncul di halaman Admin Revenue), tanpa
// perlu approval admin (lihat subscription.service.js checkout()).
export default function PaymentSimulationModal({ tier, planName, priceMonthly, onClose, onSuccess }: PaymentSimulationModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('card')
  const [status, setStatus] = useState<Status>('form')
  const [errorMessage, setErrorMessage] = useState('')

  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const vaNumber = useMemo(() => `8808${Math.floor(1000000000 + Math.random() * 8999999999)}`, [])
  const [vaBank] = useState(() => BANKS[Math.floor(Math.random() * BANKS.length)])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && status !== 'processing') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, status])

  useEffect(() => {
    if (method !== 'qris') return
    let cancelled = false
    QRCode.toDataURL(`activibe-plus-simulasi:${tier}:${Date.now()}`, { width: 180, margin: 1 })
      .then((url) => { if (!cancelled) setQrDataUrl(url) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [method, tier])

  const cardValid = cardNumber.replace(/\D/g, '').length === 16 && cardName.trim().length > 1 && /^\d{2}\/\d{2}$/.test(cardExpiry) && cardCvv.length === 3

  const runCheckout = async () => {
    setStatus('processing')
    setErrorMessage('')
    // Delay artifisial supaya terasa seperti proses pembayaran asli — bukan
    // panggilan API, murni UX (tidak ada request apapun terjadi di sini).
    await new Promise((resolve) => setTimeout(resolve, 1400))
    try {
      const subscription = await checkoutSubscription(tier)
      setStatus('success')
      setTimeout(() => onSuccess(subscription), 1100)
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Gagal mengaktifkan ActiVibe Plus, coba lagi.')
    }
  }

  const handleCardSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!cardValid) return
    runCheckout()
  }

  return (
    <div className="confirm-dialog__backdrop" onClick={() => status !== 'processing' && onClose()}>
      <div className="confirm-dialog payment-sim-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {status !== 'processing' && (
          <button type="button" className="payment-sim-modal__close" aria-label="Tutup" onClick={onClose}>
            <FiX />
          </button>
        )}

        {status === 'success' ? (
          <div className="payment-sim-modal__result">
            <FiCheckCircle className="payment-sim-modal__result-icon payment-sim-modal__result-icon--success" />
            <h3 className="confirm-dialog__title">Pembayaran Berhasil!</h3>
            <p className="confirm-dialog__message">{planName} sudah aktif di akunmu. Semua fitur premium langsung bisa dipakai.</p>
          </div>
        ) : status === 'processing' ? (
          <div className="payment-sim-modal__result">
            <div className="payment-sim-modal__spinner" aria-hidden="true" />
            <h3 className="confirm-dialog__title">Memproses Pembayaran...</h3>
            <p className="confirm-dialog__message">Mohon tunggu sebentar.</p>
          </div>
        ) : (
          <>
            <h3 className="confirm-dialog__title">Simulasi Pembayaran</h3>
            <p className="confirm-dialog__message">
              Berlangganan <strong>{planName}</strong> — {formatRupiah(priceMonthly)}/bulan
            </p>

            {status === 'error' && (
              <div className="payment-sim-modal__error">
                <FiXCircle /> {errorMessage}
              </div>
            )}

            <div className="payment-sim-modal__methods">
              <button type="button" className={`payment-sim-modal__method${method === 'card' ? ' is-active' : ''}`} onClick={() => setMethod('card')}>
                <FiCreditCard /> Kartu
              </button>
              <button type="button" className={`payment-sim-modal__method${method === 'qris' ? ' is-active' : ''}`} onClick={() => setMethod('qris')}>
                <FiSmartphone /> QRIS
              </button>
              <button type="button" className={`payment-sim-modal__method${method === 'va' ? ' is-active' : ''}`} onClick={() => setMethod('va')}>
                Virtual Account
              </button>
            </div>

            {method === 'card' && (
              <form className="payment-sim-modal__form" onSubmit={handleCardSubmit}>
                <label className="payment-sim-modal__field">
                  <span>Nomor Kartu</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    required
                  />
                </label>
                <label className="payment-sim-modal__field">
                  <span>Nama Pemegang Kartu</span>
                  <input type="text" placeholder="Sesuai kartu" value={cardName} onChange={(e) => setCardName(e.target.value)} required />
                </label>
                <div className="payment-sim-modal__field-row">
                  <label className="payment-sim-modal__field">
                    <span>Masa Berlaku</span>
                    <input type="text" placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(formatExpiry(e.target.value))} required />
                  </label>
                  <label className="payment-sim-modal__field">
                    <span>CVV</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="123"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      required
                    />
                  </label>
                </div>
                <button type="submit" className="btn btn--primary payment-sim-modal__submit" disabled={!cardValid}>
                  <FiLock /> Bayar {formatRupiah(priceMonthly)}
                </button>
              </form>
            )}

            {method === 'qris' && (
              <div className="payment-sim-modal__qris">
                {qrDataUrl ? <img src={qrDataUrl} alt="QRIS simulasi" width={160} height={160} /> : <div className="payment-sim-modal__qris-placeholder" />}
                <p>Scan QRIS ini pakai aplikasi e-wallet/mobile banking manapun.</p>
                <button type="button" className="btn btn--primary payment-sim-modal__submit" onClick={runCheckout}>
                  Saya Sudah Membayar
                </button>
              </div>
            )}

            {method === 'va' && (
              <div className="payment-sim-modal__va">
                <div className="payment-sim-modal__va-box">
                  <span className="payment-sim-modal__va-bank">Bank {vaBank} Virtual Account</span>
                  <span className="payment-sim-modal__va-number">{vaNumber}</span>
                </div>
                <p>Transfer sejumlah {formatRupiah(priceMonthly)} ke nomor Virtual Account di atas.</p>
                <button type="button" className="btn btn--primary payment-sim-modal__submit" onClick={runCheckout}>
                  Saya Sudah Membayar
                </button>
              </div>
            )}

            <p className="payment-sim-modal__disclaimer">
              Ini simulasi pembayaran — data kartu/QRIS/VA di atas tidak diproses payment gateway asli manapun.
              Setelah dikonfirmasi, status langgananmu diaktifkan sungguhan di sistem ActiVibe.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
