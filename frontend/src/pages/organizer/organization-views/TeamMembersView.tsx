import { useEffect, useState, type CSSProperties, type FormEvent } from 'react'
import {
  FiUsers, FiUserPlus, FiShield, FiBriefcase, FiUserCheck, FiRefreshCw
} from 'react-icons/fi'
import DropdownMenu, { type DropdownMenuItem } from '../../../components/DropdownMenu'
import ConfirmDialog from '../../../components/ConfirmDialog'
import {
  listMembers,
  inviteMember,
  resendInvite,
  updateMemberRole,
  removeMember,
  type OrganizationMember,
  type OrganizationMemberRole,
} from '../../../lib/organizationMembersApi'
import '../OrganizationPage.css'

const ROLE_LABELS: Record<OrganizationMemberRole, string> = {
  OWNER: 'Owner',
  ADMINISTRATOR: 'Administrator',
  COORDINATOR: 'Coordinator',
}

const ROLE_BADGE_STYLE: Partial<Record<OrganizationMemberRole, CSSProperties>> = {
  ADMINISTRATOR: { background: '#fffbeb', color: '#d97706' },
  COORDINATOR: { background: '#f0fdf4', color: '#15803d' },
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '—'
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
}

function formatDate(value?: string): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const smallInputStyle: CSSProperties = {
  padding: '8px 10px',
  borderRadius: '6px',
  border: '1px solid var(--color-border-light)',
  fontSize: '13px',
}

// Sebelumnya 4 anggota tim hardcoded (mock) — sekarang tersambung ke
// organizationMembersApi.ts (backend organizationMembers.service.js).
// "Invite Member" pakai form inline (bukan modal generik — belum ada modal
// wrapper reusable di codebase ini selain ConfirmDialog yang khusus konfirmasi),
// kebab per-baris pakai DropdownMenu yang sudah ada.
export default function TeamMembersView() {
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isInviteFormOpen, setIsInviteFormOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState<OrganizationMemberRole>('COORDINATOR')
  const [isInviting, setIsInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)

  const [roleEditMemberId, setRoleEditMemberId] = useState<string | null>(null)
  const [roleEditValue, setRoleEditValue] = useState<OrganizationMemberRole>('COORDINATOR')
  const [pendingRemoval, setPendingRemoval] = useState<OrganizationMember | null>(null)
  const [busyMemberId, setBusyMemberId] = useState<string | null>(null)

  const loadMembers = () => {
    setIsLoading(true)
    setError(null)
    listMembers()
      .then(setMembers)
      .catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat anggota tim.'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadMembers()
  }, [])

  const handleInviteSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setInviteError(null)
    setIsInviting(true)
    try {
      await inviteMember({ email: inviteEmail.trim(), name: inviteName.trim(), role: inviteRole })
      setInviteEmail('')
      setInviteName('')
      setInviteRole('COORDINATOR')
      setIsInviteFormOpen(false)
      loadMembers()
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Gagal mengundang anggota.')
    } finally {
      setIsInviting(false)
    }
  }

  const handleResend = async (member: OrganizationMember) => {
    setBusyMemberId(member.id)
    try {
      await resendInvite(member.id)
      window.alert(`Undangan sudah dikirim ulang ke ${member.email}.`)
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal mengirim ulang undangan.')
    } finally {
      setBusyMemberId(null)
    }
  }

  const handleRoleChange = async (member: OrganizationMember, role: OrganizationMemberRole) => {
    setBusyMemberId(member.id)
    try {
      const updated = await updateMemberRole(member.id, role)
      setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal mengubah role.')
    } finally {
      setBusyMemberId(null)
      setRoleEditMemberId(null)
    }
  }

  const handleRemoveConfirmed = async () => {
    if (!pendingRemoval) return
    const target = pendingRemoval
    setBusyMemberId(target.id)
    try {
      await removeMember(target.id)
      setMembers((prev) => prev.filter((m) => m.id !== target.id))
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal menghapus anggota.')
    } finally {
      setBusyMemberId(null)
      setPendingRemoval(null)
    }
  }

  const totalMembers = members.length
  const ownerCount = members.filter((m) => m.role === 'OWNER').length
  const adminCount = members.filter((m) => m.role === 'ADMINISTRATOR').length
  const coordinatorCount = members.filter((m) => m.role === 'COORDINATOR').length

  return (
    <>
      {/* KPI Cards */}
      <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__icon"><FiUsers /></div>
          <div className="stat-card__value">{totalMembers}</div>
          <div className="stat-card__label">Total Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-soft)' }}><FiShield /></div>
          <div className="stat-card__value">{ownerCount}</div>
          <div className="stat-card__label">Owners</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-warning)', background: '#fffbeb' }}><FiBriefcase /></div>
          <div className="stat-card__value">{adminCount}</div>
          <div className="stat-card__label">Administrators</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-success)', background: '#f0fdf4' }}><FiUserCheck /></div>
          <div className="stat-card__value">{coordinatorCount}</div>
          <div className="stat-card__label">Coordinators</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          <section className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Team Members</h2>
              <button
                type="button"
                className="btn btn--primary btn--sm"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={() => setIsInviteFormOpen((prev) => !prev)}
              >
                <FiUserPlus /> {isInviteFormOpen ? 'Batal' : 'Invite Member'}
              </button>
            </div>

            {isInviteFormOpen && (
              <form
                onSubmit={handleInviteSubmit}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 140px auto',
                  gap: '12px',
                  alignItems: 'end',
                  padding: '16px',
                  marginBottom: '20px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border-light)',
                  background: 'var(--color-surface-subtle, #f8fafc)',
                }}
              >
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                  Nama
                  <input
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    style={smallInputStyle}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                  Email
                  <input
                    required
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    style={smallInputStyle}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                  Role
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as OrganizationMemberRole)}
                    style={smallInputStyle}
                  >
                    <option value="ADMINISTRATOR">Administrator</option>
                    <option value="COORDINATOR">Coordinator</option>
                  </select>
                </label>
                <button type="submit" className="btn btn--primary btn--sm" disabled={isInviting}>
                  {isInviting ? 'Mengirim...' : 'Kirim Undangan'}
                </button>
                {inviteError && (
                  <p style={{ gridColumn: '1 / -1', color: 'var(--color-danger, #dc2626)', fontSize: '13px', margin: 0 }}>
                    {inviteError}
                  </p>
                )}
              </form>
            )}

            {isLoading ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Memuat anggota tim...</p>
            ) : error ? (
              <p style={{ color: 'var(--color-danger, #dc2626)', fontSize: '13px' }}>{error}</p>
            ) : members.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                Belum ada anggota tim. Undang anggota pertama lewat tombol di atas.
              </p>
            ) : (
              <div className="v-table-wrapper">
                <table className="v-table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Bergabung / Diundang</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => {
                      const items: DropdownMenuItem[] = []
                      if (member.role !== 'OWNER') {
                        items.push({
                          label: 'Ubah Role',
                          onClick: () => {
                            setRoleEditValue(member.role)
                            setRoleEditMemberId(member.id)
                          },
                        })
                      }
                      if (member.status === 'INVITED') {
                        items.push({
                          label: 'Kirim Ulang Undangan',
                          icon: <FiRefreshCw />,
                          disabled: busyMemberId === member.id,
                          onClick: () => handleResend(member),
                        })
                      }
                      if (member.role !== 'OWNER') {
                        items.push({
                          label: 'Hapus',
                          destructive: true,
                          disabled: busyMemberId === member.id,
                          onClick: () => setPendingRemoval(member),
                        })
                      }

                      return (
                        <tr key={member.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)' }}>
                                {initialsOf(member.name)}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '13px' }}>{member.name}</div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{member.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            {roleEditMemberId === member.id ? (
                              <select
                                autoFocus
                                value={roleEditValue}
                                disabled={busyMemberId === member.id}
                                onChange={(e) => {
                                  const role = e.target.value as OrganizationMemberRole
                                  setRoleEditValue(role)
                                  handleRoleChange(member, role)
                                }}
                                onBlur={() => setRoleEditMemberId(null)}
                                style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--color-border-light)', fontSize: '12px' }}
                              >
                                <option value="ADMINISTRATOR">Administrator</option>
                                <option value="COORDINATOR">Coordinator</option>
                              </select>
                            ) : member.role === 'OWNER' ? (
                              <span className="badge badge--primary">Owner</span>
                            ) : (
                              <span className="badge" style={ROLE_BADGE_STYLE[member.role]}>{ROLE_LABELS[member.role]}</span>
                            )}
                          </td>
                          <td>
                            {member.status === 'ACTIVE' ? (
                              <span className="badge badge--success">Aktif</span>
                            ) : (
                              <span className="badge badge--warning">Menunggu</span>
                            )}
                          </td>
                          <td>{formatDate(member.joinedAt ?? member.createdAt)}</td>
                          <td>
                            {items.length > 0 && <DropdownMenu items={items} />}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* Side Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Role Permissions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Owner</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Full access to all modules, billing, and team management.</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Administrator</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Can manage events, volunteers, and reports. Cannot access billing.</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Coordinator</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Can only view and manage specific assigned events.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {pendingRemoval && (
        <ConfirmDialog
          title="Hapus Anggota Tim"
          message={`Yakin ingin menghapus ${pendingRemoval.name} (${pendingRemoval.email}) dari tim organisasi?`}
          confirmLabel="Hapus"
          tone="danger"
          onConfirm={handleRemoveConfirmed}
          onCancel={() => setPendingRemoval(null)}
        />
      )}
    </>
  )
}
