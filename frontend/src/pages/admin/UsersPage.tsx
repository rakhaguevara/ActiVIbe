import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiSearch, FiUserCheck, FiUserX, FiSlash, FiUploadCloud, FiPlus, FiFilter, FiColumns, FiMoreHorizontal, FiEye } from 'react-icons/fi'
import { listUsers, updateUserStatus, updateUserPassword, deleteUser } from '../../lib/adminApi'
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
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [suspendTarget, setSuspendTarget] = useState<AdminUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
  const [detailTarget, setDetailTarget] = useState<AdminUser | null>(null)
  const [passwordTarget, setPasswordTarget] = useState<AdminUser | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10
  const [searchParams] = useSearchParams()
  const roleFilter = searchParams.get('role')

  useEffect(() => {
    let cancelled = false
    listUsers()
      .then((data) => { if (!cancelled) setUsers(data) })
      .catch((err) => {
        setToastMessage({ text: err instanceof Error ? err.message : 'Gagal memuat pengguna.', type: 'error' })
        setTimeout(() => setToastMessage(null), 3000)
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [])

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

  useEffect(() => {
    setCurrentPage(1)
  }, [keyword, roleFilter])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage))
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    return filteredUsers.slice(start, start + rowsPerPage)
  }, [filteredUsers, currentPage, rowsPerPage])

  const setStatus = async (id: string, status: AdminUser['status']) => {
    try {
      const updated = await updateUserStatus(id, status)
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
    } catch (err) {
      setToastMessage({ text: err instanceof Error ? err.message : 'Gagal mengubah status pengguna.', type: 'error' })
      setTimeout(() => setToastMessage(null), 3000)
    }
  }

  const changePassword = async () => {
    if (!passwordTarget || !newPassword) return
    try {
      await updateUserPassword(passwordTarget.id, newPassword)
      setToastMessage({ text: 'Password berhasil diubah', type: 'success' })
      setTimeout(() => setToastMessage(null), 3000)
      setPasswordTarget(null)
      setNewPassword('')
    } catch (err) {
      setToastMessage({ text: err instanceof Error ? err.message : 'Gagal mengubah password', type: 'error' })
      setTimeout(() => setToastMessage(null), 3000)
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteTarget) return
    try {
      await deleteUser(deleteTarget.id)
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id))
      setToastMessage({ text: 'Akun berhasil dihapus', type: 'success' })
      setTimeout(() => setToastMessage(null), 3000)
      setDeleteTarget(null)
    } catch (err) {
      setToastMessage({ text: err instanceof Error ? err.message : 'Gagal menghapus akun', type: 'error' })
      setTimeout(() => setToastMessage(null), 3000)
    }
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
              {paginatedUsers.map((u) => (
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
                      
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button 
                          className="admin-users__btn-icon-only"
                          onClick={() => setActiveDropdown(activeDropdown === u.id ? null : u.id)}
                        >
                          <FiMoreHorizontal />
                        </button>
                        {activeDropdown === u.id && (
                          <div style={{
                            position: 'absolute', right: 0, top: '100%', zIndex: 10,
                            background: 'white', border: '1px solid #ddd', borderRadius: '4px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '4px 0', minWidth: '150px'
                          }}>
                            <button 
                              style={{
                                width: '100%', padding: '8px 16px', background: 'none', 
                                border: 'none', textAlign: 'left', cursor: 'pointer',
                                fontSize: '14px', color: 'var(--color-text)'
                              }}
                              onClick={() => {
                                setPasswordTarget(u)
                                setActiveDropdown(null)
                              }}
                            >
                              Ubah Password
                            </button>
                            <button 
                              style={{
                                width: '100%', padding: '8px 16px', background: 'none', 
                                border: 'none', textAlign: 'left', cursor: 'pointer',
                                fontSize: '14px', color: 'var(--color-danger)'
                              }}
                              onClick={() => {
                                setDeleteTarget(u)
                                setActiveDropdown(null)
                              }}
                            >
                              Hapus Akun
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {isLoading && (
                <tr>
                  <td colSpan={8} className="admin-users__empty">
                    Memuat pengguna...
                  </td>
                </tr>
              )}
              {!isLoading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="admin-users__empty">
                    Tidak ada pengguna yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer / Pagination */}
        <div className="admin-users__footer">
          <div className="admin-users__rows-per-page">
            Row Per Page: <strong>{rowsPerPage}</strong> <small>▼</small> &nbsp; Entries
          </div>
          <div className="admin-users__pagination">
            <button 
              className="pagination-btn" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >&lt;</button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button 
              className="pagination-btn"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >&gt;</button>
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

      {deleteTarget && (
        <ConfirmDialog
          title="Hapus Akun"
          message={`Apakah Anda yakin ingin menghapus akun "${deleteTarget.name}"? Semua data terkait (termasuk kegiatan jika organizer) akan ikut terhapus dan tindakan ini tidak dapat dibatalkan.`}
          confirmLabel="Hapus"
          tone="danger"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteUser}
        />
      )}

      {passwordTarget && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', padding: '32px', borderRadius: '12px',
            width: '400px', maxWidth: '90%',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ margin: '0 0 16px 0', color: 'var(--color-text-heading)' }}>Ubah Password</h2>
            <p style={{ margin: '0 0 24px 0', color: 'var(--color-text-muted)' }}>
              Ubah password untuk akun <strong>{passwordTarget.name}</strong>.
            </p>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Password Baru</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: '100%', padding: '10px', borderRadius: '6px',
                  border: '1px solid #ddd', boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => {
                  setPasswordTarget(null)
                  setNewPassword('')
                }}
                style={{
                  background: 'none', border: '1px solid #ddd', padding: '8px 16px', 
                  borderRadius: '6px', cursor: 'pointer'
                }}
              >
                Batal
              </button>
              <button 
                onClick={changePassword}
                disabled={!newPassword}
                style={{
                  background: 'var(--color-primary)', color: 'white', border: 'none',
                  padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
                  opacity: !newPassword ? 0.5 : 1
                }}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
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

      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
          background: toastMessage.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white', padding: '16px 24px', borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)', fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: '8px',
          transition: 'all 0.3s ease'
        }}>
          {toastMessage.text}
        </div>
      )}
    </div>
  )
}
