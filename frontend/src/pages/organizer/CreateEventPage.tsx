import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { useOrganizerData } from '../../contexts/OrganizerDataContext'
import type { EventRole, EventShift } from '../../types/organizer'
import './CreateEventPage.css'

let idCounter = 0
function nextId(prefix: string) {
  idCounter += 1
  return `${prefix}-${Date.now()}-${idCounter}`
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
