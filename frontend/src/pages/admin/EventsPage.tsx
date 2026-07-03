import { useMemo, useState } from 'react'
import { FiCheck, FiX, FiTrash2 } from 'react-icons/fi'
import { mockAdminEvents } from '../../data/mockAdmin'
import type { AdminEvent } from '../../types/admin'
import Badge from '../../components/Badge'
import ConfirmDialog from '../../components/ConfirmDialog'
import ScrollPane from '../../components/ScrollPane'
import { formatDateShort } from '../../utils/formatDate'
import './EventsPage.css'

const STATUS_LABEL: Record<AdminEvent['status'], string> = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
}

const STATUS_VARIANT: Record<AdminEvent['status'], 'success' | 'warning' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
}

type DialogState = { type: 'reject' | 'delete'; event: AdminEvent } | null

export default function EventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>(mockAdminEvents)
  const [statusFilter, setStatusFilter] = useState<'all' | AdminEvent['status']>('all')
  const [dialog, setDialog] = useState<DialogState>(null)

  const filteredEvents = useMemo(() => {
    if (statusFilter === 'all') return events
    return events.filter((e) => e.status === statusFilter)
  }, [events, statusFilter])

  const approveEvent = (id: string) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, status: 'approved', approvedBy: 'Admin ActiVibe', approvedAt: new Date().toISOString().slice(0, 10) }
          : e,
      ),
    )
  }

  const rejectEvent = (id: string) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: 'rejected' } : e)))
  }

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <div className="admin-events">
      <header className="admin-events__header">
        <h1>Manajemen Kegiatan</h1>
        <p>Tinjau, setujui, atau hapus kegiatan volunteer yang diajukan organizer.</p>
      </header>

      <div className="admin-events__toolbar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
          <option value="all">Semua Status</option>
          <option value="pending">Menunggu</option>
          <option value="approved">Disetujui</option>
          <option value="rejected">Ditolak</option>
        </select>
      </div>

      <ScrollPane>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Kegiatan</th>
              <th>Organizer</th>
              <th>Lokasi</th>
              <th>Tanggal</th>
              <th>Kuota</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((e) => (
              <tr key={e.id}>
                <td className="admin-events__title">{e.title}</td>
                <td>{e.organizerName}</td>
                <td>{e.location}</td>
                <td>{formatDateShort(e.startDate)}</td>
                <td>{e.filledSlots}/{e.quota}</td>
                <td>
                  <Badge variant={STATUS_VARIANT[e.status]}>{STATUS_LABEL[e.status]}</Badge>
                </td>
                <td>
                  <div className="admin-events__actions">
                    {e.status === 'pending' && (
                      <>
                        <button type="button" className="btn btn--primary btn--sm" onClick={() => approveEvent(e.id)}>
                          <FiCheck /> Setujui
                        </button>
                        <button
                          type="button"
                          className="btn btn--outline btn--sm"
                          onClick={() => setDialog({ type: 'reject', event: e })}
                        >
                          <FiX /> Tolak
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      className="btn btn--danger btn--sm"
                      onClick={() => setDialog({ type: 'delete', event: e })}
                    >
                      <FiTrash2 /> Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredEvents.length === 0 && (
              <tr>
                <td colSpan={7} className="admin-events__empty">
                  Tidak ada kegiatan pada status ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </ScrollPane>

      {dialog?.type === 'reject' && (
        <ConfirmDialog
          title="Tolak Kegiatan"
          message={`Kegiatan "${dialog.event.title}" akan ditandai ditolak dan tidak tampil ke volunteer. Lanjutkan?`}
          confirmLabel="Tolak"
          tone="danger"
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            rejectEvent(dialog.event.id)
            setDialog(null)
          }}
        />
      )}

      {dialog?.type === 'delete' && (
        <ConfirmDialog
          title="Hapus Kegiatan"
          message={`Kegiatan "${dialog.event.title}" akan dihapus permanen dari platform. Lanjutkan?`}
          confirmLabel="Hapus"
          tone="danger"
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            deleteEvent(dialog.event.id)
            setDialog(null)
          }}
        />
      )}
    </div>
  )
}
