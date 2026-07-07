import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { applyToEvent, getMyApplications } from '../lib/applicationApi'
import { loadDraft, saveDraft, clearDraft } from '../lib/formDraft'
import type { Event } from '../types/event'
import { formatDateShort } from '../utils/formatDate'
import './EventApplyForm.css'

interface EventApplyFormProps {
  event: Event
}

type FormState = 'idle' | 'submitting' | 'success' | 'already-applied' | 'error'

interface EventApplyDraft {
  whatsapp: string
  motivation: string
  availability: string[]
}

function draftKeyFor(userId: string, eventId: string) {
  return `apply-event:${userId}:${eventId}`
}

export default function EventApplyForm({ event }: EventApplyFormProps) {
  const { user } = useAuth()

  const [whatsapp, setWhatsapp] = useState('')
  const [motivation, setMotivation] = useState('')
  const [availability, setAvailability] = useState<string[]>([])

  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!user) return
    setFormState('idle')
    const draft = loadDraft<EventApplyDraft>(draftKeyFor(user.id, event.id))
    setWhatsapp(draft?.whatsapp ?? '')
    setMotivation(draft?.motivation ?? '')
    setAvailability(draft?.availability ?? [])
    setErrorMsg('')

    getMyApplications()
      .then((applications) => {
        if (applications.some((a) => a.eventId === event.id)) {
          setFormState('already-applied')
        }
      })
      .catch(() => {
        // gagal cek tidak harus blokir form
      })
  }, [event.id, user])

  // Autosave draft lokal per event — bertahan lintas refresh/pindah halaman,
  // cuma hilang kalau user klik "Buang Perubahan" (lihat handleDiscardDraft).
  useEffect(() => {
    if (!user) return
    saveDraft<EventApplyDraft>(draftKeyFor(user.id, event.id), { whatsapp, motivation, availability })
  }, [user, event.id, whatsapp, motivation, availability])

  const handleDiscardDraft = () => {
    if (!user) return
    clearDraft(draftKeyFor(user.id, event.id))
    setWhatsapp('')
    setMotivation('')
    setAvailability([])
  }

  function toggleAvailability(value: string) {
    setAvailability((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    )
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (availability.length === 0) {
      setErrorMsg('Pilih minimal satu ketersediaan.')
      return
    }

    setFormState('submitting')
    setErrorMsg('')

    try {
      await applyToEvent({
        eventId: event.id,
        whatsapp: whatsapp.trim(),
        motivation: motivation.trim(),
        availability,
      })
      setFormState('success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.'
      if (msg.toLowerCase().includes('sudah mendaftar')) {
        setFormState('already-applied')
      } else {
        setErrorMsg(msg)
        setFormState('error')
      }
    }
  }

  // ── Tiket sukses (FR-007) ────────────────────────────────────────────────────
  if (formState === 'success') {
    return (
      <div className="event-apply-form event-apply-form--ticket">
        <div className="event-apply-form__ticket-badge">✓</div>
        <p className="event-apply-form__ticket-heading">Pendaftaran Berhasil!</p>
        <p className="event-apply-form__ticket-event">{event.title}</p>
        <div className="event-apply-form__ticket-row">
          <span className="event-apply-form__ticket-label">Tanggal</span>
          <span className="event-apply-form__ticket-value">
            {formatDateShort(event.startDate)}
            {event.startDate !== event.endDate && ` – ${formatDateShort(event.endDate)}`}
          </span>
        </div>
        <div className="event-apply-form__ticket-row">
          <span className="event-apply-form__ticket-label">Lokasi</span>
          <span className="event-apply-form__ticket-value">{event.location}</span>
        </div>
        <div className="event-apply-form__ticket-row">
          <span className="event-apply-form__ticket-label">Penyelenggara</span>
          <span className="event-apply-form__ticket-value">{event.organizerName}</span>
        </div>
        <div className="event-apply-form__ticket-row">
          <span className="event-apply-form__ticket-label">Status</span>
          <span className="event-apply-form__ticket-status">Menunggu konfirmasi</span>
        </div>
        <p className="event-apply-form__ticket-note">
          Organizer akan menghubungimu via WhatsApp setelah pendaftaran dikonfirmasi.
        </p>
      </div>
    )
  }

  // ── Sudah pernah daftar ──────────────────────────────────────────────────────
  if (formState === 'already-applied') {
    return (
      <div className="event-apply-form event-apply-form--already">
        <div className="event-apply-form__ticket-badge event-apply-form__ticket-badge--info">i</div>
        <p className="event-apply-form__ticket-heading">Sudah Mendaftar</p>
        <p className="event-apply-form__ticket-event">{event.title}</p>
        <p className="event-apply-form__ticket-note">
          Kamu sudah mendaftar ke kegiatan ini. Tunggu konfirmasi dari organizer via WhatsApp.
        </p>
      </div>
    )
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
  return (
    <form className="event-apply-form" onSubmit={handleSubmit} noValidate>
      <p className="event-apply-form__event-title">{event.title}</p>
      <p className="event-apply-form__event-date">
        {formatDateShort(event.startDate)}
        {event.startDate !== event.endDate && ` – ${formatDateShort(event.endDate)}`}
      </p>

      <div className="event-apply-form__field">
        <label htmlFor="apply-name">Nama</label>
        <input id="apply-name" type="text" value={user?.name ?? ''} readOnly />
      </div>

      <div className="event-apply-form__field">
        <label htmlFor="apply-email">Email</label>
        <input id="apply-email" type="email" value={user?.email ?? ''} readOnly />
      </div>

      <div className="event-apply-form__field">
        <label htmlFor="apply-whatsapp">No. WhatsApp</label>
        <input
          id="apply-whatsapp"
          type="tel"
          placeholder="08xxxxxxxxxx"
          value={whatsapp}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setWhatsapp(e.target.value)}
          required
        />
      </div>

      <div className="event-apply-form__field">
        <label htmlFor="apply-motivation">
          Motivasi mengikuti kegiatan ini
          <span className="event-apply-form__char-hint"> ({motivation.length}/1000)</span>
        </label>
        <textarea
          id="apply-motivation"
          rows={3}
          placeholder="Ceritakan alasanmu... (minimal 20 karakter)"
          value={motivation}
          maxLength={1000}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMotivation(e.target.value)}
          required
        />
      </div>

      <fieldset className="event-apply-form__availability">
        <legend>Ketersediaan</legend>
        <label>
          <input
            type="checkbox"
            checked={availability.includes('weekday')}
            onChange={() => toggleAvailability('weekday')}
          />
          Weekday
        </label>
        <label>
          <input
            type="checkbox"
            checked={availability.includes('weekend')}
            onChange={() => toggleAvailability('weekend')}
          />
          Weekend
        </label>
      </fieldset>

      {errorMsg && <p className="event-apply-form__error">{errorMsg}</p>}

      <button
        type="submit"
        className="event-apply-form__submit"
        disabled={formState === 'submitting'}
      >
        {formState === 'submitting' ? 'Mendaftar...' : 'Konfirmasi Pendaftaran'}
      </button>
      <button
        type="button"
        className="event-apply-form__discard"
        onClick={handleDiscardDraft}
        disabled={formState === 'submitting'}
      >
        Buang Perubahan
      </button>
    </form>
  )
}
