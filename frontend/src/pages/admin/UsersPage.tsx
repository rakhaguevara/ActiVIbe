import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiSearch, FiUserCheck, FiUserX, FiSlash, FiUploadCloud, FiPlus, FiFilter, FiColumns, FiMoreHorizontal, FiEye } from 'react-icons/fi'
import { mockAdminUsers } from '../../data/mockAdmin'
import type { AdminUser } from '../../types/admin'
import ConfirmDialog from '../../components/ConfirmDialog'
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
  const [suspendTarget, setSuspendTarget] = useState<AdminUser | null>(null)
  const [detailTarget, setDetailTarget] = useState<AdminUser | null>(null)
  const [searchParams] = useSearchParams()
  const roleFilter = searchParams.get('role')

  const filteredUsers = useMemo(() => {
    const query = keyword.trim().toLowerCase()
    return users.filter((u) => {
      if (roleFilter && u.role !== roleFilter) return false
      if (query && !u.name.toLowerCase().includes(query) && !u.email.toLowerCase().includes(query)) {
        return false
      }
      return true
    })
  }, [users, keyword, roleFilter])

  const setStatus = (id: string, status: AdminUser['status']) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)))
  }

  return (
    <div className="admin-users">
      <header className="admin-global-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Pengguna</h1>
          <div className="admin-breadcrumb">
            <span>Admin</span> <span className="sep">›</span> <span className="current">Pengguna</span>
          </div>
        </div>
        <div className="admin-users__header-actions">
          <button className="admin-users__btn-export"><FiUploadCloud /> Export</button>
          <button className="admin-users__btn-new"><FiPlus /> New Pengguna</button>
        </div>
      </header>

      <div className="admin-users__toolbar-top">
        <div className="admin-users__toolbar-left">
          <div className="admin-users__search">
            <FiSearch />
            <input
              type="text"
              placeholder="Search..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <button className="admin-users__btn-filter"><FiFilter /> Filter</button>
        </div>

        <div className="admin-users__toolbar-right">
          <span className="admin-users__sort">Sort By: <strong>Latest</strong> <small>▼</small></span>
          <button className="admin-users__btn-column"><FiColumns /> Column <small>▼</small></button>
        </div>
      </div>

      <div className="admin-users__table-wrap">
        <div className="admin-users__table-container">
          <table className="admin-users__table-new">
            <thead>
              <tr>
                <th style={{ width: '40px' }}><input type="checkbox" /></th>
                <th>Pengguna <small>↕</small></th>
                <th>Email <small>↕</small></th>
                <th>Role <small>↕</small></th>
                <th>Bergabung <small>↕</small></th>
                <th>Kegiatan <small>↕</small></th>
                <th>Status <small>↕</small></th>
                <th>Aksi <small>↕</small></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td><input type="checkbox" /></td>
                  <td>
                    <div className="admin-users__user-cell">
                      <img src={`https://ui-avatars.com/api/?name=${u.name}&background=random&color=fff`} alt={u.name} className="admin-users__avatar" />
                      <span className="admin-users__user-name">{u.name}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.role === 'ORGANIZER' ? 'Organizer' : 'Volunteer'}</td>
                  <td>{new Date(u.joinedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                  <td>{u.eventsJoined}</td>
                  <td>
                    <span className={`admin-users__status-badge badge--${STATUS_VARIANT[u.status]}`}>
                      {STATUS_LABEL[u.status]} {u.status === 'active' ? '✓' : u.status === 'suspended' ? '!' : '⊗'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-users__actions-new">
                      <button type="button" className="admin-users__btn-action" onClick={() => setDetailTarget(u)}>
                        <FiEye /> Detail
                      </button>
                      {u.status !== 'active' && (
                        <button type="button" className="admin-users__btn-action" onClick={() => setStatus(u.id, 'active')}>
                          <FiUserCheck /> Aktifkan
                        </button>
                      )}
                      {u.status === 'active' && (
                        <button type="button" className="admin-users__btn-action" onClick={() => setStatus(u.id, 'inactive')}>
                          <FiUserX /> Nonaktif
                        </button>
                      )}
                      {u.status !== 'suspended' && (
                        <button type="button" className="admin-users__btn-action" onClick={() => setSuspendTarget(u)}>
                          <FiSlash /> Suspend
                        </button>
                      )}
                      <button className="admin-users__btn-icon-only"><FiMoreHorizontal /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="admin-users__empty">
                    Tidak ada pengguna yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer / Pagination mock */}
        <div className="admin-users__footer">
          <div className="admin-users__rows-per-page">
            Row Per Page: <strong>10</strong> <small>▼</small> &nbsp; Entries
          </div>
          <div className="admin-users__pagination">
            <button className="pagination-btn">&lt;</button>
            <button className="pagination-btn active">1</button>
            <button className="pagination-btn">2</button>
            <button className="pagination-btn">3</button>
            <button className="pagination-btn">&gt;</button>
          </div>
        </div>
      </div>

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

      {/* 404 Placeholder Modal for Detail */}
      {detailTarget && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', padding: '32px', borderRadius: '12px',
            width: '400px', maxWidth: '90%', textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
            <h2 style={{ margin: '0 0 12px 0', color: 'var(--color-text-heading)' }}>Under Construction</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
              Fitur detail untuk pengguna <strong>{detailTarget.name}</strong> belum tersedia. Halaman ini masih dalam tahap pengembangan.
            </p>
            <button 
              onClick={() => setDetailTarget(null)}
              style={{
                background: 'var(--color-primary)', color: 'white', border: 'none',
                padding: '10px 24px', borderRadius: '8px', cursor: 'pointer',
                fontWeight: 600, fontSize: '14px'
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
