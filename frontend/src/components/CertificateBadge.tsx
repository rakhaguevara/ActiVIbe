// ActiVibe Plus — transparansi sertifikat: dari awal jelas apakah event ini
// menyediakan sertifikat ActiVibe (diterbitkan lewat fitur "Generate
// Certificates", khusus tier ActiVibe Plus) atau dari luar ActiVibe (klaim
// organizer sendiri), atau tidak ada sama sekali (render null, tidak ada
// badge "Tidak ada sertifikat" yang berisik).
export default function CertificateBadge({ certificateProvider }: { certificateProvider?: 'NONE' | 'ACTIVIBE' | 'EXTERNAL' }) {
  if (!certificateProvider || certificateProvider === 'NONE') return null

  if (certificateProvider === 'ACTIVIBE') {
    return <span className="badge badge--success" style={{ fontSize: '11px' }}>🎓 Sertifikat ActiVibe</span>
  }

  return <span className="badge badge--info" style={{ fontSize: '11px' }}>📜 Sertifikat dari Penyelenggara</span>
}
