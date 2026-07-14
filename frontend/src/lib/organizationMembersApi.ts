import { apiFetch } from './apiFetch'

const API_URL = import.meta.env.VITE_API_URL ?? ''

export type OrganizationMemberRole = 'OWNER' | 'ADMINISTRATOR' | 'COORDINATOR'
export type OrganizationMemberStatus = 'INVITED' | 'ACTIVE'

export interface OrganizationMember {
  id: string
  email: string
  name: string
  role: OrganizationMemberRole
  status: OrganizationMemberStatus
  joinedAt?: string
  createdAt: string
}

async function parseResponse(res: Response) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Terjadi kesalahan, coba lagi.')
  }
  return data
}

// TeamMembersView.tsx — semua fungsi di bawah ini (kecuali getInviteInfo/
// acceptInvite) butuh sesi organizer (credentials: 'include'), pola sama
// organizationApi.ts.
export async function listMembers(): Promise<OrganizationMember[]> {
  const res = await apiFetch(`${API_URL}/organization-members`, { credentials: 'include' })
  const data = await parseResponse(res)
  return data.members as OrganizationMember[]
}

export async function inviteMember(payload: {
  email: string
  name: string
  role: OrganizationMemberRole
}): Promise<OrganizationMember> {
  const res = await apiFetch(`${API_URL}/organization-members/invite`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await parseResponse(res)
  return data.member as OrganizationMember
}

export async function resendInvite(id: string): Promise<OrganizationMember> {
  const res = await apiFetch(`${API_URL}/organization-members/${id}/resend`, {
    method: 'POST',
    credentials: 'include',
  })
  const data = await parseResponse(res)
  return data.member as OrganizationMember
}

export async function updateMemberRole(id: string, role: OrganizationMemberRole): Promise<OrganizationMember> {
  const res = await apiFetch(`${API_URL}/organization-members/${id}/role`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  })
  const data = await parseResponse(res)
  return data.member as OrganizationMember
}

export async function removeMember(id: string): Promise<void> {
  const res = await apiFetch(`${API_URL}/organization-members/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.error?.message ?? 'Terjadi kesalahan, coba lagi.')
  }
}

// --- Public (AcceptTeamInvitePage) — tidak butuh sesi login ---

export async function getInviteInfo(
  token: string,
): Promise<{ organizationName: string; role: OrganizationMemberRole; email: string }> {
  const res = await apiFetch(`${API_URL}/organization-members/invite/${encodeURIComponent(token)}`)
  return parseResponse(res)
}

export async function acceptInvite(
  token: string,
  payload: { password: string },
): Promise<{ email: string; organizationId: string }> {
  const res = await apiFetch(`${API_URL}/organization-members/invite/${encodeURIComponent(token)}/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return parseResponse(res)
}
