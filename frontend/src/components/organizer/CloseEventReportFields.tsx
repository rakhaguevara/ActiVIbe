import EventGalleryUploader from './EventGalleryUploader'
import type { UploadedFile } from '../../types/organizer'

export interface CloseEventReportDraft {
  narrativeSummary: string
  volunteersPresentCount: number
  totalContributionHours: number
  photos: UploadedFile[]
  constraintsNotes: string
  impactSummary: string
  categoryMetrics: Record<string, number>
}

interface CloseEventReportFieldsProps {
  category?: string
  value: CloseEventReportDraft
  onChange: (patch: Partial<CloseEventReportDraft>) => void
}

// Gate step "Laporan Penutupan Kegiatan" di CloseEventWizard — semua field di
// sini WAJIB kecuali yang berlabel "(opsional)" (impactSummary/constraintsNotes).
// Field categoryMetrics wajib cuma yang relevan dgn Event.category (mirror
// kondisional render di bawah).
export function validateCloseEventReport(category: string | undefined, value: CloseEventReportDraft): string[] {
  const errors: string[] = []

  if (!value.narrativeSummary.trim()) errors.push('Ringkasan naratif hasil kegiatan wajib diisi')
  if (value.volunteersPresentCount <= 0) errors.push('Jumlah relawan hadir wajib diisi')
  if (value.totalContributionHours <= 0) errors.push('Total jam kontribusi wajib diisi')
  if (value.photos.length < 1) errors.push('Minimal satu foto/dokumentasi kegiatan wajib diunggah')

  if (category === 'Lingkungan') {
    if (!value.categoryMetrics.treesPlanted) errors.push('Jumlah pohon ditanam wajib diisi')
    if (!value.categoryMetrics.hectaresImpacted) errors.push('Luas lingkungan terdampak wajib diisi')
    if (!value.categoryMetrics.peopleImpacted) errors.push('Jumlah orang terdampak wajib diisi')
  } else if (['Pendidikan', 'Kesehatan', 'Sosial'].includes(category ?? '')) {
    if (!value.categoryMetrics.peopleImpacted) errors.push('Jumlah anak/orang tua/warga terdampak wajib diisi')
  } else if (category === 'Seni & Budaya') {
    if (!value.categoryMetrics.successRatePercent) errors.push('Dampak keberhasilan acara wajib diisi')
  }

  return errors
}

// Field impact tambahan per kategori (lihat CATEGORY_OPTIONS di
// CreateEventPage.tsx & komentar categoryMetrics di EventCloseReport model,
// schema.prisma) — Teknologi/Umum sengaja tidak punya field tambahan, cukup
// impactMetricLabel/value dari step "Input Impact Value" sebelumnya.
export default function CloseEventReportFields({ category, value, onChange }: CloseEventReportFieldsProps) {
  const setMetric = (key: string) => (raw: string) =>
    onChange({ categoryMetrics: { ...value.categoryMetrics, [key]: Number(raw) } })

  return (
    <div className="close-wizard__report-form">
      <label className="close-wizard__report-field">
        <span>Ringkasan naratif hasil kegiatan</span>
        <textarea
          rows={4}
          value={value.narrativeSummary}
          onChange={(e) => onChange({ narrativeSummary: e.target.value })}
        />
      </label>

      <div className="close-wizard__report-row">
        <label className="close-wizard__report-field">
          <span>Jumlah relawan hadir</span>
          <input
            type="number"
            min={0}
            value={value.volunteersPresentCount}
            onChange={(e) => onChange({ volunteersPresentCount: Number(e.target.value) })}
          />
        </label>
        <label className="close-wizard__report-field">
          <span>Total jam kontribusi (jam)</span>
          <input
            type="number"
            min={0}
            value={value.totalContributionHours}
            onChange={(e) => onChange({ totalContributionHours: Number(e.target.value) })}
          />
        </label>
      </div>

      <label className="close-wizard__report-field">
        <span>Foto/dokumentasi kegiatan</span>
        <EventGalleryUploader images={value.photos} onChange={(photos) => onChange({ photos })} maxCount={6} />
      </label>

      <label className="close-wizard__report-field">
        <span>Dampak yang dihasilkan (opsional)</span>
        <textarea
          rows={2}
          value={value.impactSummary}
          onChange={(e) => onChange({ impactSummary: e.target.value })}
        />
      </label>

      {category === 'Lingkungan' && (
        <div className="close-wizard__report-row">
          <label className="close-wizard__report-field">
            <span>Jumlah pohon ditanam</span>
            <input type="number" min={0} value={value.categoryMetrics.treesPlanted ?? 0} onChange={(e) => setMetric('treesPlanted')(e.target.value)} />
          </label>
          <label className="close-wizard__report-field">
            <span>Luas lingkungan terdampak (hektar)</span>
            <input type="number" min={0} value={value.categoryMetrics.hectaresImpacted ?? 0} onChange={(e) => setMetric('hectaresImpacted')(e.target.value)} />
          </label>
          <label className="close-wizard__report-field">
            <span>Jumlah orang terdampak</span>
            <input type="number" min={0} value={value.categoryMetrics.peopleImpacted ?? 0} onChange={(e) => setMetric('peopleImpacted')(e.target.value)} />
          </label>
        </div>
      )}

      {['Pendidikan', 'Kesehatan', 'Sosial'].includes(category ?? '') && (
        <label className="close-wizard__report-field">
          <span>Jumlah anak/orang tua/warga terdampak</span>
          <input type="number" min={0} value={value.categoryMetrics.peopleImpacted ?? 0} onChange={(e) => setMetric('peopleImpacted')(e.target.value)} />
        </label>
      )}

      {category === 'Seni & Budaya' && (
        <label className="close-wizard__report-field">
          <span>Dampak keberhasilan acara (%)</span>
          <input
            type="number"
            min={0}
            max={100}
            value={value.categoryMetrics.successRatePercent ?? 0}
            onChange={(e) => setMetric('successRatePercent')(e.target.value)}
          />
        </label>
      )}

      <label className="close-wizard__report-field">
        <span>Kendala/catatan tambahan (opsional)</span>
        <textarea
          rows={2}
          value={value.constraintsNotes}
          onChange={(e) => onChange({ constraintsNotes: e.target.value })}
        />
      </label>
    </div>
  )
}
