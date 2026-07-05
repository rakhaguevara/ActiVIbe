import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { useOrganizerData } from '../../contexts/OrganizerDataContext'
import { getInterests, getSkills, type TaxonomyItem } from '../../lib/profileApi'
import type { EventRole, EventShift } from '../../types/organizer'
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

export default function CreateEventPage() {
  const { addEvent } = useOrganizerData()
  const navigate = useNavigate()

  const eventId = useState(() => nextId('evt-org'))[0]

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [quota, setQuota] = useState(20)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [impactMetricLabel, setImpactMetricLabel] = useState('')
  const [impactMetricUnit, setImpactMetricUnit] = useState('')
  const [roles, setRoles] = useState<EventRole[]>([emptyRole(eventId)])

  // Tag kecocokan (FR-005 Predictive Match Score) — opsional, tapi tanpa ini
  // event baru selalu skor netral di rekomendasi volunteer.
  const [category, setCategory] = useState('')
  const [dayType, setDayType] = useState<'' | 'WEEKDAY' | 'WEEKEND' | 'BOTH'>('')
  const [motivationTags, setMotivationTags] = useState<Set<'CAREER' | 'SOCIAL' | 'VALUES' | 'SKILL_GROWTH'>>(new Set())
  const [interestsAll, setInterestsAll] = useState<TaxonomyItem[]>([])
  const [skillsAll, setSkillsAll] = useState<TaxonomyItem[]>([])
  const [selectedInterestIds, setSelectedInterestIds] = useState<Set<string>>(new Set())
  const [selectedSkillIds, setSelectedSkillIds] = useState<Set<string>>(new Set())

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

  return (
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
            <label htmlFor="location">Lokasi</label>
            <input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div className="create-event__field">
            <label htmlFor="quota">Kuota Total</label>
            <input id="quota" type="number" min={1} value={quota} onChange={(e) => setQuota(Number(e.target.value))} />
          </div>
        </div>
        <div className="create-event__row">
          <div className="create-event__field">
            <label htmlFor="startDate">Tanggal Mulai</label>
            <input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="create-event__field">
            <label htmlFor="endDate">Tanggal Selesai</label>
            <input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
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
          <div className="create-event__tag-options">
            {MOTIVATION_OPTIONS.map((opt) => (
              <label key={opt.value} className="create-event__tag-option">
                <input
                  type="checkbox"
                  checked={motivationTags.has(opt.value)}
                  onChange={() => toggleMotivationTag(opt.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div className="create-event__row">
          <div className="create-event__field">
            <label>Skill yang Dibutuhkan</label>
            <div className="create-event__tag-options">
              {groupByCategory(skillsAll).map(([groupName, items]) => (
                <div key={groupName} className="create-event__tag-group">
                  <span className="create-event__tag-group-label">{groupName}</span>
                  {items.map((item) => (
                    <label key={item.id} className="create-event__tag-option">
                      <input
                        type="checkbox"
                        checked={selectedSkillIds.has(item.id)}
                        onChange={() => toggleSkill(item.id)}
                      />
                      {item.name}
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="create-event__field">
            <label>Minat yang Cocok</label>
            <div className="create-event__tag-options">
              {groupByCategory(interestsAll).map(([groupName, items]) => (
                <div key={groupName} className="create-event__tag-group">
                  <span className="create-event__tag-group-label">{groupName}</span>
                  {items.map((item) => (
                    <label key={item.id} className="create-event__tag-option">
                      <input
                        type="checkbox"
                        checked={selectedInterestIds.has(item.id)}
                        onChange={() => toggleInterest(item.id)}
                      />
                      {item.name}
                    </label>
                  ))}
                </div>
              ))}
            </div>
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

      <div className="create-event__footer">
        <button type="button" className="btn btn--outline btn--sm" onClick={() => handleSubmit('draft')}>
          Simpan sebagai Draft
        </button>
        <button type="button" className="btn btn--primary btn--sm" onClick={() => handleSubmit('pending_approval')}>
          Publikasikan
        </button>
      </div>
    </div>
  )
}
