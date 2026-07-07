import DocumentUploadField from './DocumentUploadField'
import type { LegalDocType, OrganizationEntityType, UploadedFile } from '../../types/organizer'
import './LegalOrgDocumentsSection.css'

const ENTITY_TYPE_OPTIONS: { value: OrganizationEntityType; label: string }[] = [
  { value: 'INDIVIDU', label: 'Individu / Tanpa Badan Usaha' },
  { value: 'PT', label: 'PT' },
  { value: 'CV', label: 'CV' },
  { value: 'YAYASAN', label: 'Yayasan' },
  { value: 'ORGANISASI', label: 'Organisasi/Komunitas' },
]

const LEGAL_DOC_OPTIONS: { docType: LegalDocType; label: string; id: string }[] = [
  { docType: 'NIB', label: 'NIB', id: 'legal-nib' },
  { docType: 'AKTA', label: 'Akta', id: 'legal-akta' },
  { docType: 'SK_KEMENKUMHAM', label: 'SK Kemenkumham', id: 'legal-sk-kemenkumham' },
  { docType: 'NPWP', label: 'NPWP', id: 'legal-npwp' },
]

const DOC_TYPE_TO_UPLOAD_PATH: Record<LegalDocType, 'legal-nib' | 'legal-akta' | 'legal-sk-kemenkumham' | 'legal-npwp'> = {
  NIB: 'legal-nib',
  AKTA: 'legal-akta',
  SK_KEMENKUMHAM: 'legal-sk-kemenkumham',
  NPWP: 'legal-npwp',
}

interface LegalOrgDocumentsSectionProps {
  entityType: OrganizationEntityType
  onEntityTypeChange: (value: OrganizationEntityType) => void
  legalDocs: Partial<Record<LegalDocType, UploadedFile>>
  onLegalDocsChange: (docType: LegalDocType, value: UploadedFile | null) => void
}

export default function LegalOrgDocumentsSection({
  entityType,
  onEntityTypeChange,
  legalDocs,
  onLegalDocsChange,
}: LegalOrgDocumentsSectionProps) {
  const showLegalDocs = entityType !== 'INDIVIDU'

  return (
    <div className="legal-org-docs">
      <div className="create-event__field">
        <label>Jenis Badan Usaha Organizer</label>
        <div className="create-event__tag-options">
          {ENTITY_TYPE_OPTIONS.map((opt) => (
            <label key={opt.value} className="create-event__tag-option">
              <input
                type="radio"
                name="organizationEntityType"
                checked={entityType === opt.value}
                onChange={() => onEntityTypeChange(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {showLegalDocs && (
        <div className="legal-org-docs__uploads">
          <p className="legal-org-docs__hint">
            Dokumen Legal Organisasi — minimal salah satu wajib diunggah.
          </p>
          {LEGAL_DOC_OPTIONS.map((opt) => (
            <DocumentUploadField
              key={opt.docType}
              id={opt.id}
              label={opt.label}
              accept=".pdf,.doc,.docx"
              mimeTypes={[
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              ]}
              maxSizeMB={10}
              docType={DOC_TYPE_TO_UPLOAD_PATH[opt.docType]}
              value={legalDocs[opt.docType] ?? null}
              onChange={(value) => onLegalDocsChange(opt.docType, value)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
