// AuditLog tidak punya field status eksplisit — statusnya diturunkan dari kata
// kunci di `action` (dipakai ActivityLogPage.tsx dan OverviewPage.tsx).
export function getActivityLogStatus(action: string): { label: string; color: string } {
  if (action.includes('Tolak') || action.includes('Nonaktif') || action.includes('Tangguh')) {
    return { label: 'Rejected', color: '#f75555' }
  }
  if (action.includes('Mengajukan')) {
    return { label: 'Pending', color: '#ff9d00' }
  }
  return { label: 'Delivered', color: '#00b06b' }
}
