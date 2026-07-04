import { useState, type FormEvent } from 'react'
import Footer from '../components/Footer'
import './DonatePage.css'

type DonationFrequency = 'once' | 'monthly'

const PRESET_AMOUNTS = [25000, 50000, 100000, 250000]

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID').format(amount)
}

export default function DonatePage() {
  const [frequency, setFrequency] = useState<DonationFrequency>('once')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(PRESET_AMOUNTS[1])
  const [customAmount, setCustomAmount] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const amount = selectedAmount ?? (customAmount ? Number(customAmount) : 0)

  function handlePresetClick(value: number) {
    setSelectedAmount(value)
    setCustomAmount('')
  }

  function handleCustomChange(value: string) {
    const digitsOnly = value.replace(/\D/g, '')
    setCustomAmount(digitsOnly)
    setSelectedAmount(null)
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (amount <= 0) return
    setIsSubmitted(true)
  }

  return (
    <main className="donate-page">
      <section className="donate-page__hero">
        <div className="donate-page__hero-text">
          <p className="donate-page__eyebrow">Donasi</p>
          <h1 className="donate-page__title">
            Bantu ActiVibe menjangkau lebih banyak volunteer & organisasi.
          </h1>
          <p className="donate-page__desc">
            Donasimu membantu kami menjaga platform ini gratis untuk volunteer, membangun fitur AI
            Matching yang lebih akurat, dan mendukung organisasi-organisasi yang menyelenggarakan
            kegiatan sosial di seluruh Indonesia.
          </p>
        </div>

        <div className="donate-page__card">
          {isSubmitted ? (
            <div className="donate-page__success">
              <div className="donate-page__success-badge">✓</div>
              <p className="donate-page__success-heading">Terima Kasih!</p>
              <p className="donate-page__success-desc">
                Donasi {frequency === 'once' ? 'sekali' : 'bulanan'} sebesar{' '}
                <strong>Rp {formatRupiah(amount)}</strong> berhasil dicatat. Bukti donasi akan
                dikirim ke emailmu.
              </p>
            </div>
          ) : (
            <form className="donate-page__form" onSubmit={handleSubmit} noValidate>
              <div className="donate-page__tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={frequency === 'once'}
                  className={`donate-page__tab${frequency === 'once' ? ' donate-page__tab--active' : ''}`}
                  onClick={() => setFrequency('once')}
                >
                  Sekali
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={frequency === 'monthly'}
                  className={`donate-page__tab${frequency === 'monthly' ? ' donate-page__tab--active' : ''}`}
                  onClick={() => setFrequency('monthly')}
                >
                  Bulanan
                </button>
              </div>

              <p className="donate-page__amount-label">
                Pilih nominal donasi {frequency === 'once' ? 'satu kali' : 'per bulan'}
              </p>

              <div className="donate-page__amount-grid">
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`donate-page__amount-btn${selectedAmount === preset ? ' donate-page__amount-btn--active' : ''}`}
                    onClick={() => handlePresetClick(preset)}
                  >
                    Rp {formatRupiah(preset)}
                  </button>
                ))}
              </div>

              <div className="donate-page__field">
                <label htmlFor="donate-custom-amount">Atau masukkan nominal lain</label>
                <div className="donate-page__custom-input">
                  <span>Rp</span>
                  <input
                    id="donate-custom-amount"
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={customAmount ? formatRupiah(Number(customAmount)) : ''}
                    onChange={(e) => handleCustomChange(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="donate-page__submit" disabled={amount <= 0}>
                Donasi Sekarang
              </button>

              <p className="donate-page__disclaimer">
                Donasi bersifat sukarela dan digunakan sepenuhnya untuk pengembangan platform
                ActiVibe serta dukungan operasional organisasi mitra.
              </p>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
