import { useEffect, useMemo, useState } from 'react'
import { FiCheck } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import { loadDraft, saveDraft, clearDraft } from '../../lib/formDraft'
import type { Applicant, OrganizerEvent } from '../../types/organizer'
import './CloseEventWizard.css'

type FinalStatus = 'completed' | 'no_show' | 'cancelled_by_organizer' | 'cancelled_by_volunteer'

const FINAL_STATUS_LABEL: Record<FinalStatus, string> = {
  completed: 'Hadir',
  no_show: 'No-show',
  cancelled_by_organizer: 'Dibatalkan Organizer',
  cancelled_by_volunteer: 'Dibatalkan Volunteer',
}

export interface CloseEventResult {
  finalStatuses: Record<string, FinalStatus>
  impactValue: number
}

interface CloseEventWizardProps {
  event: OrganizerEvent
  applicants: Applicant[]
  onClose: () => void
  onConfirm: (result: CloseEventResult) => void
}

const STEP_TITLES = [
  'Final Attendance Review',
  'Input Impact Value',
  'Review Volunteer Outcomes',
  'Preview Final Output',
  'Confirm & Close',
]

interface CloseEventDraft {
  step: number
  finalStatuses: Record<string, FinalStatus>
  impactValue: number
}

export default function CloseEventWizard({ event, applicants, onClose, onConfirm }: CloseEventWizardProps) {
  const { user } = useAuth()
  const draftKey = `close-event:${user?.id ?? 'anon'}:${event.id}`
  const [draft] = useState(() => loadDraft<CloseEventDraft>(draftKey))

  const [step, setStep] = useState(() => draft?.step ?? 1)
  const [finalStatuses, setFinalStatuses] = useState<Record<string, FinalStatus>>(() => {
    if (draft?.finalStatuses) return draft.finalStatuses
    const initial: Record<string, FinalStatus> = {}
    applicants.forEach((a) => {
      initial[a.id] = a.status === 'no_show' ? 'no_show' : 'completed'
    })
    return initial
  })
  const [impactValue, setImpactValue] = useState(() => draft?.impactValue ?? event.impactValue ?? applicants.length * 5)

  // Autosave draft lokal per event — bertahan lintas refresh, cuma hilang
  // kalau organizer klik "Batal" (lihat handleCancel, dianggap aksi discard
  // eksplisit di wizard ini).
  useEffect(() => {
    saveDraft<CloseEventDraft>(draftKey, { step, finalStatuses, impactValue })
  }, [draftKey, step, finalStatuses, impactValue])

  const setStatus = (applicantId: string, status: FinalStatus) => {
    setFinalStatuses((prev) => ({ ...prev, [applicantId]: status }))
  }

  const counts = useMemo(() => {
    const result = { completed: 0, no_show: 0, cancelled_by_organizer: 0, cancelled_by_volunteer: 0 }
    Object.values(finalStatuses).forEach((s) => { result[s] += 1 })
    return result
  }, [finalStatuses])

  const sampleApplicant = applicants.find((a) => finalStatuses[a.id] === 'completed') ?? applicants[0]

  const handleCancel = () => {
    clearDraft(draftKey)
    onClose()
  }

  const handleConfirm = () => {
    clearDraft(draftKey)
    onConfirm({ finalStatuses, impactValue })
    onClose()
  }

  return (
    <div className="close-wizard__backdrop" onClick={handleCancel}>
      <div className="close-wizard" onClick={(e) => e.stopPropagation()}>
        <header className="close-wizard__header">
          <p className="close-wizard__step-label">Step {step} dari 5</p>
          <h2>{STEP_TITLES[step - 1]}</h2>
          <div className="close-wizard__dots">
            {STEP_TITLES.map((title, i) => (
              <span key={title} className={`close-wizard__dot${i + 1 <= step ? ' is-active' : ''}`} />
            ))}
          </div>
        </header>

        <div className="close-wizard__body">
          {step === 1 && (
            <div className="close-wizard__attendance-list">
              {applicants.length === 0 && <p className="close-wizard__empty">Tidak ada volunteer accepted/assigned untuk event ini.</p>}
              {applicants.map((a) => (
                <div key={a.id} className="close-wizard__attendance-row">
                  <span>{a.volunteerName}</span>
                  <select value={finalStatuses[a.id]} onChange={(e) => setStatus(a.id, e.target.value as FinalStatus)}>
                    {(Object.keys(FINAL_STATUS_LABEL) as FinalStatus[]).map((s) => (
                      <option key={s} value={s}>{FINAL_STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="close-wizard__impact-form">
              <p>Masukkan nilai aktual untuk metrik dampak event ini:</p>
              <label className="close-wizard__impact-field">
                <span>{event.impactMetricLabel}</span>
                <div className="close-wizard__impact-input">
                  <input
                    type="number"
                    min={0}
                    value={impactValue}
                    onChange={(e) => setImpactValue(Number(e.target.value))}
                  />
                  <span>{event.impactMetricUnit}</span>
                </div>
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="close-wizard__summary">
              <p>Ringkasan volunteer yang akan menerima completion status, poin, sertifikat, dan update Impact Passport:</p>
              <ul>
                <li><strong>{counts.completed}</strong> volunteer ditandai Hadir / Completed</li>
                <li><strong>{counts.no_show}</strong> volunteer ditandai No-show</li>
                <li><strong>{counts.cancelled_by_organizer}</strong> dibatalkan organizer</li>
                <li><strong>{counts.cancelled_by_volunteer}</strong> dibatalkan volunteer</li>
              </ul>
            </div>
          )}

          {step === 4 && sampleApplicant && (
            <div className="close-wizard__preview card">
              <p className="close-wizard__preview-eyebrow">Contoh preview untuk {sampleApplicant.volunteerName}</p>
              <p className="close-wizard__preview-headline">
                &ldquo;{sampleApplicant.volunteerName} telah berkontribusi pada {event.title.toLowerCase()} dengan capaian{' '}
                {impactValue} {event.impactMetricUnit} ({event.impactMetricLabel.toLowerCase()}).&rdquo;
              </p>
              <p className="close-wizard__preview-meta">Status kehadiran: {FINAL_STATUS_LABEL[finalStatuses[sampleApplicant.id]]}</p>
            </div>
          )}

          {step === 5 && (
            <div className="close-wizard__confirm">
              <p>
                Menekan konfirmasi akan menandai volunteer sesuai status di atas, membuat ImpactLog, meng-generate
                sertifikat batch, memperbarui Skill Progress, dan mengirim notifikasi personal. Aksi ini tidak bisa
                dibatalkan.
              </p>
            </div>
          )}
        </div>

        <footer className="close-wizard__footer">
          <button type="button" className="btn btn--outline btn--sm" onClick={step === 1 ? handleCancel : () => setStep((s) => s - 1)}>
            {step === 1 ? 'Batal' : 'Kembali'}
          </button>
          {step < 5 ? (
            <button type="button" className="btn btn--primary btn--sm" onClick={() => setStep((s) => s + 1)}>
              Lanjut
            </button>
          ) : (
            <button type="button" className="btn btn--primary btn--sm" onClick={handleConfirm}>
              <FiCheck /> Confirm &amp; Close
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}
