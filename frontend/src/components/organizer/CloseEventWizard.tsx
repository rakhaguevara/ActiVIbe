import { useEffect, useMemo, useState } from 'react'
import { FiCheck } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import { loadDraft, saveDraft, clearDraft } from '../../lib/formDraft'
import CloseEventReportFields, { validateCloseEventReport, type CloseEventReportDraft } from './CloseEventReportFields'
import type { Applicant, EventCloseReport, OrganizerEvent } from '../../types/organizer'
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
  closeReport: EventCloseReport
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
  'Laporan Penutupan Kegiatan',
  'Review Volunteer Outcomes',
  'Preview Final Output',
  'Confirm & Close',
]

function emptyReportDraft(): CloseEventReportDraft {
  return {
    narrativeSummary: '',
    volunteersPresentCount: 0,
    totalContributionHours: 0,
    photos: [],
    constraintsNotes: '',
    impactSummary: '',
    categoryMetrics: {},
  }
}

interface CloseEventDraft {
  step: number
  finalStatuses: Record<string, FinalStatus>
  impactValue: number
  report: CloseEventReportDraft
}

export default function CloseEventWizard({ event, applicants, onClose, onConfirm }: CloseEventWizardProps) {
  const { user } = useAuth()
  const draftKey = `close-event:${user?.id ?? 'anon'}:${event.id}`
  const [draft] = useState(() => loadDraft<CloseEventDraft>(draftKey))

  const [step, setStep] = useState(() => draft?.step ?? 1)
  const [finalStatuses, setFinalStatuses] = useState<Record<string, FinalStatus>>(() => {
    if (draft?.finalStatuses) return draft.finalStatuses
    const initial: Record<string, FinalStatus> = {}
    // Default hanya 'completed' utk volunteer yang benar-benar sudah
    // check-in (Applicant.status === 'checked_in', diisi dari Attendance tab
    // — lihat AttendancePage.tsx checkInAttendance/checkInByTicket). Kalau
    // kehadiran belum dikonfirmasi, default ke 'no_show' — organizer TETAP
    // bisa override manual per baris di step ini, tapi defaultnya tidak
    // pernah diam-diam meloloskan volunteer yang belum di-cek ke Impact
    // Passport (poin/ImpactLog cuma dibuat utk status 'completed').
    applicants.forEach((a) => {
      initial[a.id] = a.status === 'checked_in' ? 'completed' : 'no_show'
    })
    return initial
  })
  const [impactValue, setImpactValue] = useState(() => draft?.impactValue ?? event.impactValue ?? applicants.length * 5)
  const [report, setReport] = useState<CloseEventReportDraft>(() => {
    if (draft?.report) return draft.report
    const initialPresentCount = applicants.filter((a) => finalStatuses[a.id] === 'completed').length
    return { ...emptyReportDraft(), volunteersPresentCount: initialPresentCount }
  })

  // Autosave draft lokal per event — bertahan lintas refresh, cuma hilang
  // kalau organizer klik "Batal" (lihat handleCancel, dianggap aksi discard
  // eksplisit di wizard ini).
  useEffect(() => {
    saveDraft<CloseEventDraft>(draftKey, { step, finalStatuses, impactValue, report })
  }, [draftKey, step, finalStatuses, impactValue, report])

  const setStatus = (applicantId: string, status: FinalStatus) => {
    setFinalStatuses((prev) => ({ ...prev, [applicantId]: status }))
  }

  const updateReport = (patch: Partial<CloseEventReportDraft>) => {
    setReport((prev) => ({ ...prev, ...patch }))
  }

  const counts = useMemo(() => {
    const result = { completed: 0, no_show: 0, cancelled_by_organizer: 0, cancelled_by_volunteer: 0 }
    Object.values(finalStatuses).forEach((s) => { result[s] += 1 })
    return result
  }, [finalStatuses])

  const sampleApplicant = applicants.find((a) => finalStatuses[a.id] === 'completed') ?? applicants[0]

  const reportErrors = useMemo(() => validateCloseEventReport(event.category, report), [event.category, report])
  const canProceed = step !== 3 || reportErrors.length === 0

  const handleCancel = () => {
    clearDraft(draftKey)
    onClose()
  }

  const handleConfirm = () => {
    clearDraft(draftKey)
    onConfirm({
      finalStatuses,
      impactValue,
      closeReport: {
        narrativeSummary: report.narrativeSummary,
        volunteersPresentCount: report.volunteersPresentCount,
        totalContributionHours: report.totalContributionHours,
        photoUrls: report.photos.map((p) => p.url),
        constraintsNotes: report.constraintsNotes || undefined,
        impactSummary: report.impactSummary || undefined,
        categoryMetrics: Object.keys(report.categoryMetrics).length > 0 ? report.categoryMetrics : undefined,
      },
    })
    onClose()
  }

  return (
    <div className="close-wizard__backdrop" onClick={handleCancel}>
      <div className="close-wizard" onClick={(e) => e.stopPropagation()}>
        <header className="close-wizard__header">
          <p className="close-wizard__step-label">Step {step} dari {STEP_TITLES.length}</p>
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
              <p className="close-wizard__attendance-hint">
                Status diisi otomatis berdasarkan data check-in di tab Attendance — hanya volunteer yang sudah
                check-in yang default &ldquo;Hadir&rdquo;. Ubah manual di bawah kalau ada koreksi.
              </p>
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
            <>
              <CloseEventReportFields category={event.category} value={report} onChange={updateReport} />
              {reportErrors.length > 0 && (
                <div className="close-wizard__validation-summary">
                  <p>Lengkapi hal berikut sebelum lanjut:</p>
                  <ul>
                    {reportErrors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {step === 4 && (
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

          {step === 5 && sampleApplicant && (
            <div className="close-wizard__preview card">
              <p className="close-wizard__preview-eyebrow">Contoh preview untuk {sampleApplicant.volunteerName}</p>
              <p className="close-wizard__preview-headline">
                &ldquo;{sampleApplicant.volunteerName} telah berkontribusi pada {event.title.toLowerCase()} dengan capaian{' '}
                {impactValue} {event.impactMetricUnit} ({event.impactMetricLabel.toLowerCase()}).&rdquo;
              </p>
              <p className="close-wizard__preview-meta">Status kehadiran: {FINAL_STATUS_LABEL[finalStatuses[sampleApplicant.id]]}</p>
              {report.narrativeSummary && <p className="close-wizard__preview-meta">{report.narrativeSummary}</p>}
            </div>
          )}

          {step === 6 && (
            <div className="close-wizard__confirm">
              <p>
                Menekan konfirmasi akan menandai volunteer sesuai status di atas, membuat ImpactLog, menyimpan laporan
                penutupan kegiatan (arsip resmi ActiVibe &amp; sumber Impact Passport), meng-generate sertifikat
                batch, memperbarui Skill Progress, dan mengirim notifikasi personal. Aksi ini tidak bisa dibatalkan.
              </p>
            </div>
          )}
        </div>

        <footer className="close-wizard__footer">
          <button type="button" className="btn btn--outline btn--sm" onClick={step === 1 ? handleCancel : () => setStep((s) => s - 1)}>
            {step === 1 ? 'Batal' : 'Kembali'}
          </button>
          {step < STEP_TITLES.length ? (
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed}
            >
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
