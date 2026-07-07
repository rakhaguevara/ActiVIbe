// Harus persis sama dengan backend/src/modules/events/event.validation.js
// ORGANIZER_DECLARATION_KEYS — tidak ada package bersama di monorepo ini,
// jadi disinkronkan manual.
export type DeclarationKey =
  | 'infoAccurate'
  | 'documentsValid'
  | 'fullResponsibility'
  | 'compliesWithLaw'
  | 'notFictionalEvent'
  | 'noProhibitedContent'
  | 'permitsObtained'
  | 'publicationOnlyAck'
  | 'organizerLiabilityAck'
  | 'platformModerationAck'
  | 'agreesToTerms'

export const ORGANIZER_DECLARATION_ITEMS: { key: DeclarationKey; label: string }[] = [
  { key: 'infoAccurate', label: 'Saya menyatakan seluruh informasi yang saya masukkan adalah benar.' },
  { key: 'documentsValid', label: 'Saya menyatakan seluruh dokumen yang saya upload adalah sah.' },
  { key: 'fullResponsibility', label: 'Saya bertanggung jawab penuh atas seluruh penyelenggaraan event.' },
  { key: 'compliesWithLaw', label: 'Saya menjamin kegiatan ini tidak melanggar hukum Republik Indonesia.' },
  { key: 'notFictionalEvent', label: 'Saya menjamin kegiatan ini bukan event fiktif.' },
  {
    key: 'noProhibitedContent',
    label:
      'Saya menjamin kegiatan ini tidak mengandung unsur perjudian, pornografi, narkotika, kekerasan, diskriminasi, ujaran kebencian, radikalisme, eksploitasi anak, perdagangan manusia, atau kegiatan ilegal lainnya.',
  },
  { key: 'permitsObtained', label: 'Saya telah memperoleh seluruh izin yang diwajibkan apabila kegiatan memerlukannya.' },
  {
    key: 'publicationOnlyAck',
    label: 'Saya memahami bahwa Platform hanya menyediakan layanan publikasi dan pencarian volunteer.',
  },
  {
    key: 'organizerLiabilityAck',
    label: 'Saya memahami bahwa seluruh tanggung jawab pelaksanaan kegiatan berada pada Organizer.',
  },
  {
    key: 'platformModerationAck',
    label:
      'Saya memahami bahwa Platform berhak melakukan verifikasi terhadap data dan dokumen yang saya unggah, serta berhak menolak, menunda, meminta revisi, maupun menghapus event apabila ditemukan pelanggaran terhadap hukum atau kebijakan platform.',
  },
  {
    key: 'agreesToTerms',
    label: 'Saya menyetujui Syarat & Ketentuan, Kebijakan Privasi, serta Perjanjian Organizer.',
  },
]

export function emptyDeclarationChecklist(): Record<DeclarationKey, boolean> {
  return Object.fromEntries(ORGANIZER_DECLARATION_ITEMS.map((item) => [item.key, false])) as Record<
    DeclarationKey,
    boolean
  >
}
