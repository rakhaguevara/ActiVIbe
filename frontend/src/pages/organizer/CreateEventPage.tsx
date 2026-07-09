import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { useOrganizerData } from '../../contexts/OrganizerDataContext'
import { useAuth } from '../../contexts/AuthContext'
import { getInterests, getSkills, type TaxonomyItem } from '../../lib/profileApi'
import { loadDraft, saveDraft, clearDraft } from '../../lib/formDraft'
import LocationSelector, { EMPTY_LOCATION, type LocationValue } from '../../components/location/LocationSelector'
import MapsLinkField from '../../components/location/MapsLinkField'
import EventDetailPanel from '../../components/EventDetailPanel'
import DocumentUploadField from '../../components/organizer/DocumentUploadField'
import LegalOrgDocumentsSection from '../../components/organizer/LegalOrgDocumentsSection'
import EventGalleryUploader from '../../components/organizer/EventGalleryUploader'
import MultiSelectDropdown, { type MultiSelectOption, type MultiSelectGroup } from '../../components/ui/MultiSelectDropdown'
import OrganizerDeclarationChecklist from '../../components/organizer/OrganizerDeclarationChecklist'
import { emptyDeclarationChecklist, type DeclarationKey } from '../../lib/organizerDeclarationItems'
import { validatePendingApproval } from '../../lib/createEventValidation'
import { resolveAssetUrl } from '../../lib/assetUrl'
import type {
  EventMode,
  EventRole,
  EventShift,
  EventSupportingDocuments,
  LegalDocType,
  OrganizationEntityType,
  UploadedFile,
} from '../../types/organizer'
import type { Event } from '../../types/event'
import './CreateEventPage.css'

let idCounter = 0
function nextId(prefix: string) {
  idCounter += 1
  return `${prefix}-${Date.now()}-${idCounter}`
}

// Kategori baku (dipetakan ke simbol emoji di backend CATEGORY_SYMBOLS) —
// sinkron dgn recommendation.data.js supaya kartu rekomendasi volunteer tampil rapi.
const CATEGORY_OPTIONS = ['Lingkungan', 'Pendidikan', 'Kesehatan', 'Sosial', 'Teknologi', 'Seni & Budaya', 'Umum']

const MOTIVATION_OPTIONS: { value: 'CAREER' | 'SOCIAL' | 'VALUES' | 'SKILL_GROWTH'; label: string }[] = [
  { value: 'CAREER', label: 'Pengembangan karier' },
  { value: 'SOCIAL', label: 'Relasi & komunitas' },
  { value: 'VALUES', label: 'Nilai-nilai hidup' },
  { value: 'SKILL_GROWTH', label: 'Belajar skill baru' },
]

const DAY_TYPE_OPTIONS: { value: 'WEEKDAY' | 'WEEKEND' | 'BOTH'; label: string }[] = [
  { value: 'WEEKDAY', label: 'Hari kerja' },
  { value: 'WEEKEND', label: 'Akhir pekan' },
  { value: 'BOTH', label: 'Keduanya' },
]

const EVENT_MODE_OPTIONS: { value: EventMode; label: string }[] = [
  { value: 'OFFLINE', label: 'Offline (tatap muka)' },
  { value: 'ONLINE', label: 'Online' },
]

const DOC_MIME = {
  pdfDoc: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  image: ['image/png', 'image/jpeg'],
}
const DOC_MIME_PDF_OR_IMAGE = [...DOC_MIME.pdfDoc, ...DOC_MIME.image]

function emptySupportingDocuments(): EventSupportingDocuments {
  return {
    proposal: null,
    rundown: null,
    poster: null,
    responsibilityLetter: null,
    locationPermit: null,
    cooperationLetter: null,
    assignmentLetter: null,
  }
}

function groupByCategory(items: TaxonomyItem[]): [string, TaxonomyItem[]][] {
  const map = new Map<string, TaxonomyItem[]>()
  for (const item of items) {
    const group = map.get(item.category) ?? []
    group.push(item)
    map.set(item.category, group)
  }
  return Array.from(map.entries())
}

function emptyShift(eventRoleId: string): EventShift {
  return { id: nextId('shift'), eventRoleId, shiftDate: '', startTime: '', endTime: '', quota: 1, locationPoint: '' }
}

function emptyRole(eventId: string): EventRole {
  const id = nextId('role')
  return { id, eventId, roleName: '', roleDescription: '', maxVolunteers: 1, shifts: [emptyShift(id)] }
}

interface CreateEventDraft {
  title: string
  description: string
  location: string
  quota: number
  startDate: string
  endDate: string
  impactMetricLabel: string
  impactMetricUnit: string
  roles: EventRole[]
  category: string
  dayType: '' | 'WEEKDAY' | 'WEEKEND' | 'BOTH'
  motivationTags: ('CAREER' | 'SOCIAL' | 'VALUES' | 'SKILL_GROWTH')[]
  selectedInterestIds: string[]
  selectedSkillIds: string[]
  // Enhancement: verifikasi organizer, dokumen pendukung, galeri, peta lokasi.
  // File asli tidak bisa diserialisasi — yang disimpan cuma {url,fileName}
  // hasil upload (persis seperti cvUrl/cvFileName), supaya refresh halaman
  // tidak menganggurkan file yang sudah sukses diupload.
  eventMode: EventMode
  mapLink: string
  picName: string
  picContact: string
  picEmail: string
  onBehalfOfInstitution: boolean
  organizationEntityType: OrganizationEntityType
  documents: EventSupportingDocuments
  legalDocs: Partial<Record<LegalDocType, UploadedFile>>
  galleryImages: UploadedFile[]
  declarationChecklist: Record<DeclarationKey, boolean>
}

export default function CreateEventPage() {
  const { addEvent, subOrganizers, addSubOrganizer } = useOrganizerData()
  const { user } = useAuth()
  const navigate = useNavigate()

  const draftKey = `create-event:${user?.id ?? 'anon'}`
  const [draft] = useState(() => loadDraft<CreateEventDraft>(draftKey))

  const eventId = useState(() => nextId('evt-org'))[0]
  // Business rule 2: organizer cuma bisa membuat event dari hari ini ke depan.
  const todayISO = new Date().toISOString().slice(0, 10)

  const [title, setTitle] = useState(() => draft?.title ?? '')
  const [description, setDescription] = useState(() => draft?.description ?? '')
  const [locationValue, setLocationValue] = useState<LocationValue>(EMPTY_LOCATION)
  const location = locationValue.regencyId
    ? locationValue.provinceName
      ? `${locationValue.regencyName}, ${locationValue.provinceName}`
      : locationValue.regencyName
    : locationValue.provinceName
  const [quota, setQuota] = useState(() => draft?.quota ?? 20)
  const [startDate, setStartDate] = useState(() => draft?.startDate ?? '')
  const [endDate, setEndDate] = useState(() => draft?.endDate ?? '')
  const [impactMetricLabel, setImpactMetricLabel] = useState(() => draft?.impactMetricLabel ?? '')
  const [impactMetricUnit, setImpactMetricUnit] = useState(() => draft?.impactMetricUnit ?? '')
  const [roles, setRoles] = useState<EventRole[]>(() => draft?.roles ?? [emptyRole(eventId)])

  // Tag kecocokan (FR-005 Predictive Match Score) — opsional, tapi tanpa ini
  // event baru selalu skor netral di rekomendasi volunteer.
  const [category, setCategory] = useState(() => draft?.category ?? '')
  const [dayType, setDayType] = useState<'' | 'WEEKDAY' | 'WEEKEND' | 'BOTH'>(() => draft?.dayType ?? '')
  const [motivationTags, setMotivationTags] = useState<Set<'CAREER' | 'SOCIAL' | 'VALUES' | 'SKILL_GROWTH'>>(
    () => new Set(draft?.motivationTags ?? []),
  )
  const [interestsAll, setInterestsAll] = useState<TaxonomyItem[]>([])
  const [skillsAll, setSkillsAll] = useState<TaxonomyItem[]>([])
  const [selectedInterestIds, setSelectedInterestIds] = useState<Set<string>>(
    () => new Set(draft?.selectedInterestIds ?? []),
  )
  const [selectedSkillIds, setSelectedSkillIds] = useState<Set<string>>(() => new Set(draft?.selectedSkillIds ?? []))

  // Enhancement: verifikasi organizer, dokumen pendukung, galeri, peta lokasi
  // (additive — lihat CLAUDE.md, tidak mengubah field/section yang sudah ada).
  const [eventMode, setEventMode] = useState<EventMode>(() => draft?.eventMode ?? 'OFFLINE')
  const [mapLink, setMapLink] = useState(() => draft?.mapLink ?? '')
  // Business rule 1: PIC/pengurus penanggung jawab lapangan — dipakai backend
  // utk cek konflik kalau organizer punya event lain di tanggal yang sama
  // (lihat assertNoPicConflict di event.service.js). Dokumen pendukungnya
  // reuse Surat Pernyataan Penanggung Jawab di section Dokumen Pendukung.
  const [picName, setPicName] = useState(() => draft?.picName ?? '')
  const [picContact, setPicContact] = useState(() => draft?.picContact ?? '')
  // Sub Organizer (kontak PIC reusable, lihat halaman "Sub Organizer" di
  // bagian Events): picEmail wajib bareng picContact begitu status
  // pending_approval. picSubOrganizerId null = mode isi manual (checkbox
  // saveAsSubOrganizer nentuin apa disimpan ke daftar reusable saat submit);
  // terisi = PIC diambil dari daftar existing (field jadi read-only).
  const [picEmail, setPicEmail] = useState(() => draft?.picEmail ?? '')
  const [picSubOrganizerId, setPicSubOrganizerId] = useState<string | null>(null)
  const [saveAsSubOrganizer, setSaveAsSubOrganizer] = useState(true)

  const handleSelectSubOrganizer = (id: string) => {
    if (!id) {
      setPicSubOrganizerId(null)
      setPicName('')
      setPicContact('')
      setPicEmail('')
      return
    }
    const picked = subOrganizers.find((s) => s.id === id)
    if (!picked) return
    setPicSubOrganizerId(id)
    setPicName(picked.name)
    setPicContact(picked.whatsapp)
    setPicEmail(picked.email)
  }
  const [onBehalfOfInstitution, setOnBehalfOfInstitution] = useState(() => draft?.onBehalfOfInstitution ?? false)
  const [organizationEntityType, setOrganizationEntityType] = useState<OrganizationEntityType>(
    () => draft?.organizationEntityType ?? 'INDIVIDU',
  )
  const [documents, setDocuments] = useState<EventSupportingDocuments>(() => draft?.documents ?? emptySupportingDocuments())
  const [legalDocs, setLegalDocs] = useState<Partial<Record<LegalDocType, UploadedFile>>>(() => draft?.legalDocs ?? {})
  const [galleryImages, setGalleryImages] = useState<UploadedFile[]>(() => draft?.galleryImages ?? [])
  const [declarationChecklist, setDeclarationChecklist] = useState<Record<DeclarationKey, boolean>>(
    () => draft?.declarationChecklist ?? emptyDeclarationChecklist(),
  )
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const updateDocument = (key: keyof EventSupportingDocuments, value: UploadedFile | null) => {
    setDocuments((prev) => ({ ...prev, [key]: value }))
  }

  const updateLegalDoc = (docType: LegalDocType, value: UploadedFile | null) => {
    setLegalDocs((prev) => {
      const next = { ...prev }
      if (value) next[docType] = value
      else delete next[docType]
      return next
    })
  }

  const updateDeclaration = (key: DeclarationKey, value: boolean) => {
    setDeclarationChecklist((prev) => ({ ...prev, [key]: value }))
  }

  // Autosave draft lokal (localStorage) — bertahan lintas refresh/pindah
  // halaman, cuma hilang kalau user klik "Buang Perubahan" (lihat
  // handleDiscardDraft). Sengaja TIDAK auto-clear setelah submit sukses.
  useEffect(() => {
    saveDraft<CreateEventDraft>(draftKey, {
      title,
      description,
      location,
      quota,
      startDate,
      endDate,
      impactMetricLabel,
      impactMetricUnit,
      roles,
      category,
      dayType,
      motivationTags: Array.from(motivationTags),
      selectedInterestIds: Array.from(selectedInterestIds),
      selectedSkillIds: Array.from(selectedSkillIds),
      eventMode,
      mapLink,
      picName,
      picContact,
      picEmail,
      onBehalfOfInstitution,
      organizationEntityType,
      documents,
      legalDocs,
      galleryImages,
      declarationChecklist,
    })
  }, [
    draftKey,
    title,
    description,
    location,
    quota,
    startDate,
    endDate,
    impactMetricLabel,
    impactMetricUnit,
    roles,
    category,
    dayType,
    motivationTags,
    selectedInterestIds,
    selectedSkillIds,
    eventMode,
    mapLink,
    picName,
    picContact,
    picEmail,
    onBehalfOfInstitution,
    organizationEntityType,
    documents,
    legalDocs,
    galleryImages,
    declarationChecklist,
  ])

  const handleDiscardDraft = () => {
    clearDraft(draftKey)
    setTitle('')
    setDescription('')
    setLocationValue(EMPTY_LOCATION)
    setQuota(20)
    setStartDate('')
    setEndDate('')
    setImpactMetricLabel('')
    setImpactMetricUnit('')
    setRoles([emptyRole(eventId)])
    setCategory('')
    setDayType('')
    setMotivationTags(new Set())
    setSelectedInterestIds(new Set())
    setSelectedSkillIds(new Set())
    setEventMode('OFFLINE')
    setMapLink('')
    setPicName('')
    setPicContact('')
    setPicEmail('')
    setPicSubOrganizerId(null)
    setSaveAsSubOrganizer(true)
    setOnBehalfOfInstitution(false)
    setOrganizationEntityType('INDIVIDU')
    setDocuments(emptySupportingDocuments())
    setLegalDocs({})
    setGalleryImages([])
    setDeclarationChecklist(emptyDeclarationChecklist())
    setValidationErrors([])
  }

  useEffect(() => {
    Promise.all([getInterests(), getSkills()])
      .then(([interests, skills]) => {
        setInterestsAll(interests)
        setSkillsAll(skills)
      })
      .catch(() => {
        // Gagal ambil daftar tag tidak boleh blokir form buat event — organizer
        // masih bisa submit tanpa tag, cuma bagian ini kosong.
      })
  }, [])

  const toggleMotivationTag = (value: 'CAREER' | 'SOCIAL' | 'VALUES' | 'SKILL_GROWTH') => {
    setMotivationTags((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  const toggleInterest = (id: string) => {
    setSelectedInterestIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSkill = (id: string) => {
    setSelectedSkillIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const updateRole = (roleId: string, patch: Partial<EventRole>) => {
    setRoles((prev) => prev.map((r) => (r.id === roleId ? { ...r, ...patch } : r)))
  }

  const updateShift = (roleId: string, shiftId: string, patch: Partial<EventShift>) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.id === roleId ? { ...r, shifts: r.shifts.map((s) => (s.id === shiftId ? { ...s, ...patch } : s)) } : r,
      ),
    )
  }

  const addRole = () => setRoles((prev) => [...prev, emptyRole(eventId)])
  const removeRole = (roleId: string) => setRoles((prev) => prev.filter((r) => r.id !== roleId))
  const addShift = (roleId: string) => {
    setRoles((prev) => prev.map((r) => (r.id === roleId ? { ...r, shifts: [...r.shifts, emptyShift(roleId)] } : r)))
  }
  const removeShift = (roleId: string, shiftId: string) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, shifts: r.shifts.filter((s) => s.id !== shiftId) } : r)),
    )
  }

  const handleSubmit = async (status: 'draft' | 'pending_approval') => {
    if (status === 'pending_approval') {
      const errors = validatePendingApproval({
        eventMode,
        onBehalfOfInstitution,
        organizationEntityType,
        documents,
        legalDocs,
        galleryImages,
        declarationChecklist,
        picName,
        picContact,
        picEmail,
      })
      if (errors.length > 0) {
        setValidationErrors(errors)
        return
      }
    }
    setValidationErrors([])

    // PIC diisi manual (bukan dipilih dari daftar existing) + user centang
    // "simpan utk dipakai lagi" -> simpan dulu sbg Sub Organizer baru sebelum
    // event dibuat, supaya event ini langsung ke-link (picSubOrganizerId) dan
    // baris itu tersedia dipilih lagi di event berikutnya.
    let resolvedSubOrganizerId = picSubOrganizerId
    if (!resolvedSubOrganizerId && saveAsSubOrganizer && picName.trim() && picContact.trim() && picEmail.trim()) {
      try {
        const saved = await addSubOrganizer({ name: picName, email: picEmail, whatsapp: picContact })
        resolvedSubOrganizerId = saved.id
      } catch {
        // Gagal simpan ke daftar reusable tidak boleh blokir submit event —
        // picName/picContact/picEmail tetap ikut tersimpan sbg snapshot biasa.
      }
    }

    await addEvent({
      title,
      description,
      location,
      quota,
      startDate,
      endDate,
      status,
      impactMetricLabel,
      impactMetricUnit,
      category: category || undefined,
      skillIds: Array.from(selectedSkillIds),
      interestIds: Array.from(selectedInterestIds),
      motivationTags: Array.from(motivationTags),
      dayType: dayType || undefined,
      eventMode,
      mapLink: mapLink || undefined,
      picName: picName || undefined,
      picContact: picContact || undefined,
      picEmail: picEmail || undefined,
      picSubOrganizerId: resolvedSubOrganizerId || undefined,
      organizationEntityType,
      onBehalfOfInstitution,
      documents,
      legalDocuments: Object.entries(legalDocs).map(([docType, file]) => ({
        docType: docType as LegalDocType,
        ...(file as UploadedFile),
      })),
      galleryImages,
      declarationChecklist,
      // Strip client-only id/eventId fields (dipakai cuma utk React key & state
      // lokal form ini) — backend yang generate id sungguhan.
      roles: roles.map(({ roleName, roleDescription, maxVolunteers, shifts }) => ({
        roleName,
        roleDescription,
        maxVolunteers,
        shifts: shifts.map(({ shiftDate, startTime, endTime, quota: shiftQuota, locationPoint }) => ({
          shiftDate,
          startTime,
          endTime,
          quota: shiftQuota,
          locationPoint,
        })),
      })),
    })
    navigate('/organizer/events')
  }

  const previewEvent: Event = {
    id: 'preview',
    title: title || 'Judul Kegiatan',
    imageUrl: '',
    description: description || 'Deskripsi kegiatan akan tampil di sini...',
    category: category || 'Umum',
    location: location || 'Lokasi Kegiatan',
    organizerName: user?.name || 'Nama Organisasi',
    quota: quota || 0,
    filledSlots: 0,
    startDate: startDate || new Date().toISOString().split('T')[0],
    endDate: endDate || new Date().toISOString().split('T')[0],
    skills: Array.from(selectedSkillIds).map(
      (id) => skillsAll.find((s) => s.id === id)?.name || id
    ),
    matchScore: 100,
    matchReasoning: 'Ini adalah tampilan contoh (preview) bagaimana event kamu akan terlihat oleh volunteer.',
    fitBadgeLabel: 'Preview',
    symbol: '👀',
    aiGenerated: false,
    rating: 0,
    reviewCount: 0,
    ratingBreakdown: [],
    reviews: [],
    provisions: [],
    organizerBio: 'Profil singkat organisasi akan tampil di sini.',
    organizerEventsCount: 0,
    organizerRating: 5.0,
    organizerYearsActive: 1,
    cancellationPolicy: 'Kebijakan pembatalan standar',
    eventRules: 'Tata tertib standar',
    safetyInfo: 'Informasi keselamatan standar',
    photos: galleryImages.map((image) => resolveAssetUrl(image.url)),
    mapLink: mapLink || undefined,
    eventMode,
  }

  const motivationOptions: MultiSelectOption[] = MOTIVATION_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.label,
  }))

  const skillOptions: MultiSelectGroup[] = groupByCategory(skillsAll).map(([groupName, items]) => ({
    groupName,
    items: items.map((item) => ({ value: item.id, label: item.name })),
  }))

  const interestOptions: MultiSelectGroup[] = groupByCategory(interestsAll).map(([groupName, items]) => ({
    groupName,
    items: items.map((item) => ({ value: item.id, label: item.name })),
  }))

  return (
    <div className="create-event-wrapper">
      <div className="create-event">
      <header className="create-event__header">
        <h1>Buat Event Baru</h1>
        <p>Isi data dasar kegiatan, lalu tambahkan role &amp; shift sebelum dipublikasikan.</p>
      </header>

      <section className="card create-event__section">
        <h2>Data Dasar</h2>
        <div className="create-event__field">
          <label htmlFor="title">Judul Kegiatan</label>
          <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="create-event__field">
          <label htmlFor="description">Deskripsi</label>
          <textarea id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="create-event__row">
          <div className="create-event__field">
            <LocationSelector
              value={locationValue}
              onChange={setLocationValue}
              showDistrict={false}
              showVillage={false}
              label="Lokasi"
              placeholder="Pilih kota / kabupaten..."
            />
          </div>
          <div className="create-event__field">
            <label htmlFor="quota">Kuota Total</label>
            <input id="quota" type="number" min={1} value={quota} onChange={(e) => setQuota(Number(e.target.value))} />
          </div>
        </div>
        <div className="create-event__row">
          <div className="create-event__field">
            <label htmlFor="startDate">Tanggal Mulai</label>
            <input
              id="startDate"
              type="date"
              min={todayISO}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="create-event__field">
            <label htmlFor="endDate">Tanggal Selesai</label>
            <input
              id="endDate"
              type="date"
              min={startDate || todayISO}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="create-event__row">
          <div className="create-event__field">
            <label htmlFor="impactMetricLabel">Metrik Dampak</label>
            <input
              id="impactMetricLabel"
              placeholder="mis. Jumlah bibit ditanam"
              value={impactMetricLabel}
              onChange={(e) => setImpactMetricLabel(e.target.value)}
            />
          </div>
          <div className="create-event__field">
            <label htmlFor="impactMetricUnit">Satuan</label>
            <input
              id="impactMetricUnit"
              placeholder="mis. bibit"
              value={impactMetricUnit}
              onChange={(e) => setImpactMetricUnit(e.target.value)}
            />
          </div>
        </div>
        <div className="create-event__row">
          <div className="create-event__field">
            <label>Mode Event</label>
            <div className="create-event__tag-options">
              {EVENT_MODE_OPTIONS.map((opt) => (
                <label key={opt.value} className="create-event__tag-option">
                  <input
                    type="radio"
                    name="eventMode"
                    checked={eventMode === opt.value}
                    onChange={() => setEventMode(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </div>
        <MapsLinkField value={mapLink} onChange={setMapLink} />

        <div className="create-event__field">
          <label htmlFor="picSubOrganizer">Pilih Sub Organizer</label>
          <select
            id="picSubOrganizer"
            value={picSubOrganizerId ?? ''}
            onChange={(e) => handleSelectSubOrganizer(e.target.value)}
          >
            <option value="">+ Isi manual / Tambah Sub Organizer baru</option>
            {subOrganizers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}{s.title ? ` — ${s.title}` : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="create-event__row">
          <div className="create-event__field">
            <label htmlFor="picName">Nama PIC / Pengurus Penanggung Jawab</label>
            <input
              id="picName"
              placeholder="mis. Budi Santoso"
              value={picName}
              onChange={(e) => setPicName(e.target.value)}
              readOnly={!!picSubOrganizerId}
            />
          </div>
          <div className="create-event__field">
            <label htmlFor="picContact">Kontak WA PIC</label>
            <input
              id="picContact"
              placeholder="mis. 08xxxxxxxxxx"
              value={picContact}
              onChange={(e) => setPicContact(e.target.value)}
              readOnly={!!picSubOrganizerId}
            />
          </div>
          <div className="create-event__field">
            <label htmlFor="picEmail">Email PIC</label>
            <input
              id="picEmail"
              type="email"
              placeholder="mis. budi@example.com"
              value={picEmail}
              onChange={(e) => setPicEmail(e.target.value)}
              readOnly={!!picSubOrganizerId}
            />
          </div>
        </div>
        {!picSubOrganizerId && (
          <label className="create-event__tag-option">
            <input
              type="checkbox"
              checked={saveAsSubOrganizer}
              onChange={(e) => setSaveAsSubOrganizer(e.target.checked)}
            />
            Simpan sebagai Sub Organizer untuk dipakai lagi di event berikutnya
          </label>
        )}
        <p className="create-event__tag-hint">
          Kontak PIC (WA & email) dicantumkan di email tiket yang diterima volunteer, supaya ada yang bisa dihubungi
          di lokasi. Kalau kamu punya event lain di tanggal yang sama, PIC-nya wajib berbeda dan dokumen kedua event
          harus lengkap — dokumen pendukung PIC memakai Surat Pernyataan Penanggung Jawab di bawah, tidak perlu
          upload terpisah.
        </p>
      </section>

      <section className="card create-event__section">
        <h2>Dokumen Pendukung</h2>
        <p className="create-event__tag-hint">
          Dokumen berikut membantu proses verifikasi event oleh tim kami. Dokumen hanya dapat diakses oleh Organizer dan
          Admin Platform.
        </p>

        <DocumentUploadField
          id="doc-proposal"
          label="Proposal Kegiatan"
          required
          helperText="Proposal berisi tujuan kegiatan, target peserta, susunan panitia, timeline, serta gambaran pelaksanaan kegiatan."
          accept=".pdf,.doc,.docx"
          mimeTypes={DOC_MIME.pdfDoc}
          maxSizeMB={10}
          docType="proposal"
          value={documents.proposal}
          onChange={(value) => updateDocument('proposal', value)}
        />
        <DocumentUploadField
          id="doc-rundown"
          label="Rundown Acara"
          required
          accept=".pdf,.doc,.docx"
          mimeTypes={DOC_MIME.pdfDoc}
          maxSizeMB={10}
          docType="rundown"
          value={documents.rundown}
          onChange={(value) => updateDocument('rundown', value)}
        />
        <DocumentUploadField
          id="doc-poster"
          label="Poster Event"
          required
          accept=".png,.jpg,.jpeg"
          mimeTypes={DOC_MIME.image}
          maxSizeMB={10}
          docType="poster"
          value={documents.poster}
          onChange={(value) => updateDocument('poster', value)}
        />
        <DocumentUploadField
          id="doc-responsibility-letter"
          label="Surat Pernyataan Penanggung Jawab"
          required
          helperText="Surat pernyataan bahwa seluruh informasi yang diberikan adalah benar dan organizer bertanggung jawab penuh atas penyelenggaraan kegiatan."
          accept=".pdf,.doc,.docx"
          mimeTypes={DOC_MIME.pdfDoc}
          maxSizeMB={10}
          docType="responsibility-letter"
          value={documents.responsibilityLetter}
          onChange={(value) => updateDocument('responsibilityLetter', value)}
        />
        {eventMode === 'OFFLINE' && (
          <DocumentUploadField
            id="doc-location-permit"
            label="Surat Izin Penggunaan Lokasi"
            required
            helperText="Upload surat izin penggunaan lokasi atau bukti bahwa organizer memiliki hak menggunakan lokasi tersebut."
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            mimeTypes={DOC_MIME_PDF_OR_IMAGE}
            maxSizeMB={10}
            docType="location-permit"
            value={documents.locationPermit}
            onChange={(value) => updateDocument('locationPermit', value)}
          />
        )}
        <DocumentUploadField
          id="doc-cooperation-letter"
          label="Surat Kerja Sama"
          helperText="Opsional — upload apabila event bekerja sama dengan sponsor, instansi, universitas, perusahaan, atau komunitas lain."
          accept=".pdf,.doc,.docx"
          mimeTypes={DOC_MIME.pdfDoc}
          maxSizeMB={10}
          docType="cooperation-letter"
          value={documents.cooperationLetter}
          onChange={(value) => updateDocument('cooperationLetter', value)}
        />

        <div className="create-event__field">
          <label className="create-event__tag-option">
            <input
              type="checkbox"
              checked={onBehalfOfInstitution}
              onChange={(e) => setOnBehalfOfInstitution(e.target.checked)}
            />
            Event diselenggarakan atas nama instansi
          </label>
        </div>
        {onBehalfOfInstitution && (
          <DocumentUploadField
            id="doc-assignment-letter"
            label="Surat Penugasan"
            required
            accept=".pdf,.doc,.docx"
            mimeTypes={DOC_MIME.pdfDoc}
            maxSizeMB={10}
            docType="assignment-letter"
            value={documents.assignmentLetter}
            onChange={(value) => updateDocument('assignmentLetter', value)}
          />
        )}

        <LegalOrgDocumentsSection
          entityType={organizationEntityType}
          onEntityTypeChange={setOrganizationEntityType}
          legalDocs={legalDocs}
          onLegalDocsChange={updateLegalDoc}
        />
      </section>

      <section className="card create-event__section">
        <h2>Kategori &amp; Tag Kecocokan</h2>
        <p className="create-event__tag-hint">
          Dipakai algoritma rekomendasi (Predictive Match Score) buat mencocokkan event ini ke volunteer yang tepat.
          Boleh dikosongkan, tapi event tanpa tag akan tampil netral di semua volunteer.
        </p>
        <div className="create-event__row">
          <div className="create-event__field">
            <label htmlFor="category">Kategori</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Pilih kategori</option>
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className="create-event__field">
            <label htmlFor="dayType">Waktu Pelaksanaan</label>
            <select id="dayType" value={dayType} onChange={(e) => setDayType(e.target.value as typeof dayType)}>
              <option value="">Tidak ditentukan</option>
              {DAY_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="create-event__field">
          <label>Motivasi yang Cocok</label>
          <MultiSelectDropdown
            options={motivationOptions}
            selectedValues={motivationTags}
            onChange={toggleMotivationTag}
            placeholder="Pilih motivasi yang sesuai..."
          />
        </div>

        <div className="create-event__row">
          <div className="create-event__field">
            <label>Skill yang Dibutuhkan</label>
            <MultiSelectDropdown
              options={skillOptions}
              selectedValues={selectedSkillIds}
              onChange={toggleSkill}
              placeholder="Pilih skill yang dibutuhkan..."
            />
          </div>
          <div className="create-event__field">
            <label>Minat yang Cocok</label>
            <MultiSelectDropdown
              options={interestOptions}
              selectedValues={selectedInterestIds}
              onChange={toggleInterest}
              placeholder="Pilih minat yang cocok..."
            />
          </div>
        </div>
      </section>

      <section className="card create-event__section">
        <div className="create-event__section-header">
          <h2>Role &amp; Shift</h2>
          <button type="button" className="btn btn--outline btn--sm" onClick={addRole}>
            <FiPlus /> Tambah Role
          </button>
        </div>

        {roles.map((role, roleIndex) => (
          <div key={role.id} className="create-event__role">
            <div className="create-event__role-header">
              <h3>Role {roleIndex + 1}</h3>
              {roles.length > 1 && (
                <button type="button" className="create-event__icon-btn" onClick={() => removeRole(role.id)} aria-label="Hapus role">
                  <FiTrash2 />
                </button>
              )}
            </div>

            <div className="create-event__row">
              <div className="create-event__field">
                <label>Nama Role</label>
                <input value={role.roleName} onChange={(e) => updateRole(role.id, { roleName: e.target.value })} />
              </div>
              <div className="create-event__field">
                <label>Maks. Volunteer</label>
                <input
                  type="number"
                  min={1}
                  value={role.maxVolunteers}
                  onChange={(e) => updateRole(role.id, { maxVolunteers: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="create-event__field">
              <label>Deskripsi Role</label>
              <input value={role.roleDescription} onChange={(e) => updateRole(role.id, { roleDescription: e.target.value })} />
            </div>

            <p className="create-event__shift-label">Shift</p>
            {role.shifts.map((shift) => (
              <div key={shift.id} className="create-event__shift-row">
                <input type="date" value={shift.shiftDate} onChange={(e) => updateShift(role.id, shift.id, { shiftDate: e.target.value })} />
                <input type="time" value={shift.startTime} onChange={(e) => updateShift(role.id, shift.id, { startTime: e.target.value })} />
                <input type="time" value={shift.endTime} onChange={(e) => updateShift(role.id, shift.id, { endTime: e.target.value })} />
                <input
                  type="number"
                  min={1}
                  placeholder="Kuota"
                  value={shift.quota}
                  onChange={(e) => updateShift(role.id, shift.id, { quota: Number(e.target.value) })}
                />
                <input
                  placeholder="Titik lokasi"
                  value={shift.locationPoint}
                  onChange={(e) => updateShift(role.id, shift.id, { locationPoint: e.target.value })}
                />
                {role.shifts.length > 1 && (
                  <button type="button" className="create-event__icon-btn" onClick={() => removeShift(role.id, shift.id)} aria-label="Hapus shift">
                    <FiTrash2 />
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn btn--outline btn--sm" onClick={() => addShift(role.id)}>
              <FiPlus /> Tambah Shift
            </button>
          </div>
        ))}
      </section>

      <section className="card create-event__section">
        <h2>Dokumentasi Event</h2>
        <p className="create-event__tag-hint">
          Upload dokumentasi atau gambar representatif event. Gambar akan ditampilkan pada halaman detail event. Gambar
          pertama akan digunakan sebagai thumbnail utama event.
        </p>
        <EventGalleryUploader images={galleryImages} onChange={setGalleryImages} />
      </section>

      <section className="card create-event__section">
        <h2>Pernyataan Organizer</h2>
        <OrganizerDeclarationChecklist values={declarationChecklist} onChange={updateDeclaration} />
      </section>

      {validationErrors.length > 0 && (
        <div className="create-event__validation-summary">
          <p>Lengkapi hal berikut sebelum dipublikasikan:</p>
          <ul>
            {validationErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="create-event__footer">
        <button type="button" className="btn btn--outline btn--sm" onClick={handleDiscardDraft}>
          Buang Perubahan
        </button>
        <button type="button" className="btn btn--outline btn--sm" onClick={() => handleSubmit('draft')}>
          Simpan sebagai Draft
        </button>
        <button type="button" className="btn btn--primary btn--sm" onClick={() => handleSubmit('pending_approval')}>
          Publikasikan
        </button>
      </div>
      </div>
      
      {/* Preview Section */}
      <div className="create-event-preview">
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '16px', textAlign: 'center' }}>
          Preview Tampilan Volunteer
        </h3>
        <EventDetailPanel event={previewEvent} />
      </div>
    </div>
  )
}
