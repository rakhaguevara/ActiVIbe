import { useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2, FiX } from 'react-icons/fi'
import { useOrganizerData } from '../../../contexts/OrganizerDataContext'
import '../EventsPage.css'

const EMPTY_FORM = { name: '', email: '', whatsapp: '', title: '' }

// Kontak koordinator/PIC reusable (lihat section PIC di CreateEventPage) —
// satu form dipakai bergantian utk mode tambah/edit, pola sama "Nama role
// baru" + "+ Tambah Role" di RolesTab (form inline, bukan modal terpisah).
export default function SubOrganizerView() {
  const { subOrganizers, addSubOrganizer, updateSubOrganizer, removeSubOrganizer } = useOrganizerData()
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startEdit = (id: string) => {
    const target = subOrganizers.find((s) => s.id === id)
    if (!target) return
    setEditingId(id)
    setForm({ name: target.name, email: target.email, whatsapp: target.whatsapp, title: target.title ?? '' })
    setError(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError(null)
  }

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.whatsapp.trim()) {
      setError('Nama, email, dan WhatsApp wajib diisi')
      return
    }
    setError(null)
    setIsSaving(true)
    try {
      const payload = { name: form.name, email: form.email, whatsapp: form.whatsapp, title: form.title || undefined }
      if (editingId) {
        await updateSubOrganizer(editingId, payload)
      } else {
        await addSubOrganizer(payload)
      }
      cancelEdit()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus Sub Organizer ini? Event yang sudah dibuat memakai kontak ini tidak akan berubah.')) return
    await removeSubOrganizer(id)
    if (editingId === id) cancelEdit()
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-xl)', alignItems: 'start' }}>
      <section className="card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Daftar Sub Organizer</h2>
        {subOrganizers.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>
            Belum ada Sub Organizer tersimpan. Tambahkan lewat form di samping, atau centang "Simpan sebagai Sub
            Organizer" saat isi PIC di form Buat Event.
          </p>
        ) : (
          <div className="v-table-wrapper">
            <table className="v-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Jabatan</th>
                  <th>Email</th>
                  <th>WhatsApp</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {subOrganizers.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{s.title ?? '-'}</td>
                    <td>{s.email}</td>
                    <td>{s.whatsapp}</td>
                    <td>
                      <div className="v-table-actions">
                        <button type="button" className="btn btn--sm btn--outline" title="Edit" onClick={() => startEdit(s.id)}>
                          <FiEdit2 /> Edit
                        </button>
                        <button type="button" className="btn btn--sm btn--outline" title="Hapus" onClick={() => handleDelete(s.id)}>
                          <FiTrash2 /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{editingId ? 'Edit Sub Organizer' : 'Tambah Sub Organizer'}</h3>
          {editingId && (
            <button type="button" className="btn btn--sm btn--outline" onClick={cancelEdit} title="Batal edit">
              <FiX />
            </button>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="create-event__field">
            <label htmlFor="subOrgName">Nama</label>
            <input id="subOrgName" placeholder="mis. Budi Santoso" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="create-event__field">
            <label htmlFor="subOrgTitle">Jabatan (opsional)</label>
            <input id="subOrgTitle" placeholder="mis. Koordinator Lapangan" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="create-event__field">
            <label htmlFor="subOrgEmail">Email</label>
            <input id="subOrgEmail" type="email" placeholder="mis. budi@example.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="create-event__field">
            <label htmlFor="subOrgWhatsapp">WhatsApp</label>
            <input id="subOrgWhatsapp" placeholder="mis. 08xxxxxxxxxx" value={form.whatsapp} onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))} />
          </div>
          {error && <p style={{ color: 'var(--color-danger, #dc2626)', fontSize: '13px', margin: 0 }}>{error}</p>}
          <button type="button" className="admin-dashboard-btn admin-dashboard-btn--dark" disabled={isSaving} onClick={handleSubmit}>
            <FiPlus /> {isSaving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Sub Organizer'}
          </button>
        </div>
      </div>
    </div>
  )
}
