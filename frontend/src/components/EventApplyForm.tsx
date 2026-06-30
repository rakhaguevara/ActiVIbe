import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import type { Event } from '../types/event'
import { formatDateShort } from '../utils/formatDate'
import './EventApplyForm.css'

interface EventApplyFormProps {
  event: Event
}

export default function EventApplyForm({ event }: EventApplyFormProps) {
  const { user } = useAuth()
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    setSubmitted(false)
  }, [event.id])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="event-apply-form event-apply-form--success">
        <p className="event-apply-form__success-text">
          Pendaftaran tercatat! (demo, belum tersambung backend)
        </p>
        <p className="event-apply-form__success-event">{event.title}</p>
      </div>
    )
  }

  return (
    <form className="event-apply-form" onSubmit={handleSubmit}>
      <p className="event-apply-form__event-title">{event.title}</p>
      <p className="event-apply-form__event-date">
        {formatDateShort(event.startDate)} – {formatDateShort(event.endDate)}
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
        <input id="apply-whatsapp" name="whatsapp" type="tel" placeholder="08xxxxxxxxxx" required />
      </div>

      <div className="event-apply-form__field">
        <label htmlFor="apply-motivation">Motivasi mengikuti kegiatan ini</label>
        <textarea id="apply-motivation" name="motivation" rows={3} placeholder="Ceritakan alasanmu..." required />
      </div>

      <fieldset className="event-apply-form__availability">
        <legend>Ketersediaan</legend>
        <label><input type="checkbox" name="availability" value="weekday" /> Weekday</label>
        <label><input type="checkbox" name="availability" value="weekend" /> Weekend</label>
      </fieldset>

      <button type="submit" className="event-apply-form__submit">Konfirmasi Pendaftaran</button>
    </form>
  )
}
