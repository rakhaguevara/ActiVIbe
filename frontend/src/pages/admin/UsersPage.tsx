import { useMemo, useState } from 'react'
import { FiSearch, FiUserCheck, FiUserX, FiSlash } from 'react-icons/fi'
import { mockAdminUsers } from '../../data/mockAdmin'
import type { AdminUser } from '../../types/admin'
import Badge from '../../components/Badge'
import ConfirmDialog from '../../components/ConfirmDialog'
import ScrollPane from '../../components/ScrollPane'
import { formatDateShort } from '../../utils/formatDate'
import './UsersPage.css'

const STATUS_LABEL: Record<AdminUser['status'], string> = {
  active: 'Aktif',
  inactive: 'Nonaktif',
  suspended: 'Ditangguhkan',
}

const STATUS_VARIANT: Record<AdminUser['status'], 'success' | 'warning' | 'danger'> = {
  active: 'success',
  inactive: 'warning',
  suspended: 'danger',
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(mockAdminUsers)
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | AdminUser['status']>('all')
  const [suspendTarget, setSuspendTarget] = useState<AdminUser | null>(null)

  const filteredUsers = useMemo(() => {
    const query = keyword.trim().toLowerCase()
    return users.filter((u) => {
      if (statusFilter !== 'all' && u.status !== statusFilter) return false
      if (query && !u.name.toLowerCase().includes(query) && !u.email.toLowerCase().includes(query)) {
        return false
      }
      return true
    })
  }, [users, keyword, statusFilter])

  const setStatus = (id: string, status: AdminUser['status']) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)))
  }

  return (
    <div className="admin-users">
      <header className="admin-users__header">
        <h1>Manajemen Pengguna</h1>
        <p>Aktifkan, nonaktifkan, atau tangguhkan akun volunteer dan organizer.</p>
      </header>

      <div className="admin-users__toolbar">
        <div className="admin-users__search">
          <FiSearch />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
          <option value="suspended">Ditangguhkan</option>
        </select>
      </div>

      <ScrollPane>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>Role</th>
              <th>Bergabung</th>
              <th>Kegiatan Diikuti</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role === 'ORGANIZER' ? 'Organizer' : 'Volunteer'}</td>
                <td>{formatDateShort(u.joinedAt)}</td>
                <td>{u.eventsJoined}</td>
                <td>
                  <Badge variant={STATUS_VARIANT[u.status]}>{STATUS_LABEL[u.status]}</Badge>
                </td>
                <td>
                  <div className="admin-users__actions">
                    {u.status !== 'active' && (
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={() => setStatus(u.id, 'active')}
                      >
                        <FiUserCheck /> Aktifkan
                      </button>
                    )}
                    {u.status === 'active' && (
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={() => setStatus(u.id, 'inactive')}
                      >
                        <FiUserX /> Nonaktifkan
                      </button>
                    )}
                    {u.status !== 'suspended' && (
                      <button
                        type="button"
                        className="btn btn--danger btn--sm"
                        onClick={() => setSuspendTarget(u)}
                      >
                        <FiSlash /> Suspend
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={7} className="admin-users__empty">
                  Tidak ada pengguna yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </ScrollPane>

      {suspendTarget && (
        <ConfirmDialog
          title="Tangguhkan Akun"
          message={`Akun "${suspendTarget.name}" tidak akan bisa login sampai diaktifkan kembali. Lanjutkan?`}
          confirmLabel="Suspend"
          tone="danger"
          onCancel={() => setSuspendTarget(null)}
          onConfirm={() => {
            setStatus(suspendTarget.id, 'suspended')
            setSuspendTarget(null)
          }}
        />
      )}
    </div>
  )
}
