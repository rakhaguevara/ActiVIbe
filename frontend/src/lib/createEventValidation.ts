import type { EventMode, EventSupportingDocuments, LegalDocType, OrganizationEntityType, UploadedFile } from '../types/organizer'
import { ORGANIZER_DECLARATION_ITEMS, type DeclarationKey } from './organizerDeclarationItems'

export interface PendingApprovalCheckInput {
  eventMode: EventMode
  onBehalfOfInstitution: boolean
  organizationEntityType: OrganizationEntityType
  documents: Partial<EventSupportingDocuments>
  legalDocs: Partial<Record<LegalDocType, UploadedFile>>
  galleryImages: UploadedFile[]
  declarationChecklist: Record<DeclarationKey, boolean>
}

// Mirror persis validasi backend (pending_approval-only) di
// backend/src/modules/events/event.validation.js — dijalankan client-side
// sebelum request dikirim supaya organizer dapat feedback instan tanpa round
// trip. "Simpan sebagai Draft" TIDAK memanggil fungsi ini sama sekali.
export function validatePendingApproval(input: PendingApprovalCheckInput): string[] {
  const errors: string[] = []
  const { documents } = input

  if (!documents.proposal?.url) errors.push('Proposal Kegiatan wajib diunggah sebelum dipublikasikan')
  if (!documents.rundown?.url) errors.push('Rundown Acara wajib diunggah sebelum dipublikasikan')
  if (!documents.poster?.url) errors.push('Poster Event wajib diunggah sebelum dipublikasikan')
  if (!documents.responsibilityLetter?.url) {
    errors.push('Surat Pernyataan Penanggung Jawab wajib diunggah sebelum dipublikasikan')
  }
  if (input.eventMode === 'OFFLINE' && !documents.locationPermit?.url) {
    errors.push('Surat Izin Penggunaan Lokasi wajib diunggah untuk event offline')
  }
  if (input.onBehalfOfInstitution && !documents.assignmentLetter?.url) {
    errors.push('Surat Penugasan wajib diunggah karena event atas nama instansi')
  }
  if (input.organizationEntityType !== 'INDIVIDU' && Object.keys(input.legalDocs).length < 1) {
    errors.push('Minimal satu Dokumen Legal Organisasi wajib diunggah')
  }
  if (input.galleryImages.length < 1) {
    errors.push('Minimal satu gambar dokumentasi event wajib diunggah')
  }
  const uncheckedCount = ORGANIZER_DECLARATION_ITEMS.filter((item) => !input.declarationChecklist[item.key]).length
  if (uncheckedCount > 0) {
    errors.push('Seluruh pernyataan organizer wajib dicentang sebelum dipublikasikan')
  }

  return errors
}
