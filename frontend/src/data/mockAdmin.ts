import type { AdminUser, AdminEvent, ParticipationRecord, ActivityLogEntry } from '../types/admin'

export const mockAdminUsers: AdminUser[] = [
  { id: 'u-01', name: 'Abiem Nugroho', email: 'abiem.nugroho@mail.com', role: 'VOLUNTEER', status: 'active', joinedAt: '2026-02-03', eventsJoined: 5 },
  { id: 'u-02', name: 'Cinta Larasati', email: 'cinta.larasati@mail.com', role: 'VOLUNTEER', status: 'active', joinedAt: '2026-02-11', eventsJoined: 3 },
  { id: 'u-03', name: 'Yayasan Alam Nusantara', email: 'kontak@alamnusantara.org', role: 'ORGANIZER', status: 'active', joinedAt: '2026-01-20', eventsJoined: 8 },
  { id: 'u-04', name: 'Daffa Ramadhan', email: 'daffa.ramadhan@mail.com', role: 'VOLUNTEER', status: 'active', joinedAt: '2026-03-02', eventsJoined: 1 },
  { id: 'u-05', name: 'Komunitas Peduli Pesisir', email: 'admin@peduli-pesisir.id', role: 'ORGANIZER', status: 'inactive', joinedAt: '2026-01-05', eventsJoined: 2 },
  { id: 'u-06', name: 'Haikal Fadillah', email: 'haikal.fadillah@mail.com', role: 'VOLUNTEER', status: 'active', joinedAt: '2026-03-18', eventsJoined: 4 },
  { id: 'u-07', name: 'Rakha Dzikra Guevara', email: 'rakha.dzikra@mail.com', role: 'VOLUNTEER', status: 'active', joinedAt: '2026-02-25', eventsJoined: 6 },
  { id: 'u-08', name: 'Sekar Ayu Wulandari', email: 'sekar.wulandari@mail.com', role: 'VOLUNTEER', status: 'suspended', joinedAt: '2026-02-14', eventsJoined: 2 },
  { id: 'u-09', name: 'Griya Belajar Anak Bangsa', email: 'halo@griyabelajar.id', role: 'ORGANIZER', status: 'active', joinedAt: '2026-01-28', eventsJoined: 6 },
  { id: 'u-10', name: 'Fikri Ardiansyah', email: 'fikri.ardiansyah@mail.com', role: 'VOLUNTEER', status: 'active', joinedAt: '2026-04-07', eventsJoined: 0 },
  { id: 'u-11', name: 'Nabila Putri Salsabila', email: 'nabila.salsabila@mail.com', role: 'VOLUNTEER', status: 'active', joinedAt: '2026-04-15', eventsJoined: 2 },
  { id: 'u-12', name: 'Bank Sampah Hijau Lestari', email: 'info@hijaulestari.org', role: 'ORGANIZER', status: 'suspended', joinedAt: '2026-01-12', eventsJoined: 3 },
]

export const mockAdminEvents: AdminEvent[] = [
  { id: 'e-01', title: 'Penanaman 500 Bibit Mangrove Pesisir Cilincing', organizerName: 'Yayasan Alam Nusantara', location: 'Jakarta Utara', quota: 40, filledSlots: 40, startDate: '2026-03-14', endDate: '2026-03-14', status: 'approved', impactMetricTemplate: 'Jumlah bibit ditanam', createdAt: '2026-02-20', approvedBy: 'Admin ActiVibe', approvedAt: '2026-02-21' },
  { id: 'e-02', title: 'Bersih Pantai & Edukasi Sampah Plastik', organizerName: 'Komunitas Peduli Pesisir', location: 'Anyer, Banten', quota: 30, filledSlots: 22, startDate: '2026-04-05', endDate: '2026-04-05', status: 'approved', impactMetricTemplate: 'Kg sampah diangkat', createdAt: '2026-03-10', approvedBy: 'Admin ActiVibe', approvedAt: '2026-03-11' },
  { id: 'e-03', title: 'Kelas Baca Tulis untuk Anak Panti Asuhan', organizerName: 'Griya Belajar Anak Bangsa', location: 'Bandung', quota: 15, filledSlots: 15, startDate: '2026-04-20', endDate: '2026-04-21', status: 'approved', impactMetricTemplate: 'Jumlah anak diajar', createdAt: '2026-03-28', approvedBy: 'Admin ActiVibe', approvedAt: '2026-03-29' },
  { id: 'e-04', title: 'Donor Darah & Cek Kesehatan Gratis', organizerName: 'Yayasan Alam Nusantara', location: 'Surabaya', quota: 25, filledSlots: 9, startDate: '2026-06-02', endDate: '2026-06-02', status: 'pending', impactMetricTemplate: 'Jumlah pendonor', createdAt: '2026-05-24' },
  { id: 'e-05', title: 'Workshop Daur Ulang Sampah Elektronik', organizerName: 'Bank Sampah Hijau Lestari', location: 'Semarang', quota: 20, filledSlots: 4, startDate: '2026-06-18', endDate: '2026-06-18', status: 'pending', impactMetricTemplate: 'Kg e-waste terkumpul', createdAt: '2026-06-01' },
  { id: 'e-06', title: 'Pendampingan UMKM Digital untuk Ibu Rumah Tangga', organizerName: 'Griya Belajar Anak Bangsa', location: 'Yogyakarta', quota: 18, filledSlots: 0, startDate: '2026-07-11', endDate: '2026-07-12', status: 'pending', impactMetricTemplate: 'Jumlah UMKM didampingi', createdAt: '2026-06-25' },
  { id: 'e-07', title: 'Konser Amal Peduli Bencana (Lomba DJ Tanpa Izin)', organizerName: 'Akun Tidak Dikenal', location: 'Tidak jelas', quota: 100, filledSlots: 3, startDate: '2026-06-15', endDate: '2026-06-15', status: 'rejected', impactMetricTemplate: 'Jumlah donasi terkumpul', createdAt: '2026-05-30', approvedBy: 'Admin ActiVibe', approvedAt: '2026-05-31' },
  { id: 'e-08', title: 'Penanaman Terumbu Karang Kepulauan Seribu', organizerName: 'Komunitas Peduli Pesisir', location: 'Kepulauan Seribu', quota: 20, filledSlots: 12, startDate: '2026-05-09', endDate: '2026-05-10', status: 'approved', impactMetricTemplate: 'Jumlah bibit karang ditanam', createdAt: '2026-04-15', approvedBy: 'Admin ActiVibe', approvedAt: '2026-04-16' },
]

export const mockParticipationRecords: ParticipationRecord[] = [
  { id: 'p-01', userName: 'Abiem Nugroho', eventTitle: 'Penanaman 500 Bibit Mangrove Pesisir Cilincing', attended: true, impactMetricLabel: 'Jumlah bibit ditanam', impactValue: 40, impactUnit: 'bibit', date: '2026-03-14' },
  { id: 'p-02', userName: 'Cinta Larasati', eventTitle: 'Penanaman 500 Bibit Mangrove Pesisir Cilincing', attended: true, impactMetricLabel: 'Jumlah bibit ditanam', impactValue: 40, impactUnit: 'bibit', date: '2026-03-14' },
  { id: 'p-03', userName: 'Haikal Fadillah', eventTitle: 'Bersih Pantai & Edukasi Sampah Plastik', attended: true, impactMetricLabel: 'Kg sampah diangkat', impactValue: 18, impactUnit: 'kg', date: '2026-04-05' },
  { id: 'p-04', userName: 'Rakha Dzikra Guevara', eventTitle: 'Bersih Pantai & Edukasi Sampah Plastik', attended: false, impactMetricLabel: 'Kg sampah diangkat', impactValue: 0, impactUnit: 'kg', date: '2026-04-05' },
  { id: 'p-05', userName: 'Nabila Putri Salsabila', eventTitle: 'Kelas Baca Tulis untuk Anak Panti Asuhan', attended: true, impactMetricLabel: 'Jumlah anak diajar', impactValue: 12, impactUnit: 'anak', date: '2026-04-20' },
  { id: 'p-06', userName: 'Daffa Ramadhan', eventTitle: 'Kelas Baca Tulis untuk Anak Panti Asuhan', attended: true, impactMetricLabel: 'Jumlah anak diajar', impactValue: 12, impactUnit: 'anak', date: '2026-04-20' },
  { id: 'p-07', userName: 'Sekar Ayu Wulandari', eventTitle: 'Penanaman Terumbu Karang Kepulauan Seribu', attended: true, impactMetricLabel: 'Jumlah bibit karang ditanam', impactValue: 15, impactUnit: 'bibit karang', date: '2026-05-09' },
  { id: 'p-08', userName: 'Abiem Nugroho', eventTitle: 'Penanaman Terumbu Karang Kepulauan Seribu', attended: true, impactMetricLabel: 'Jumlah bibit karang ditanam', impactValue: 15, impactUnit: 'bibit karang', date: '2026-05-09' },
  { id: 'p-09', userName: 'Cinta Larasati', eventTitle: 'Penanaman Terumbu Karang Kepulauan Seribu', attended: false, impactMetricLabel: 'Jumlah bibit karang ditanam', impactValue: 0, impactUnit: 'bibit karang', date: '2026-05-10' },
  { id: 'p-10', userName: 'Haikal Fadillah', eventTitle: 'Donor Darah & Cek Kesehatan Gratis', attended: true, impactMetricLabel: 'Jumlah pendonor', impactValue: 1, impactUnit: 'orang', date: '2026-06-02' },
  { id: 'p-11', userName: 'Fikri Ardiansyah', eventTitle: 'Donor Darah & Cek Kesehatan Gratis', attended: true, impactMetricLabel: 'Jumlah pendonor', impactValue: 1, impactUnit: 'orang', date: '2026-06-02' },
  { id: 'p-12', userName: 'Nabila Putri Salsabila', eventTitle: 'Workshop Daur Ulang Sampah Elektronik', attended: true, impactMetricLabel: 'Kg e-waste terkumpul', impactValue: 6, impactUnit: 'kg', date: '2026-06-18' },
]

export const mockActivityLog: ActivityLogEntry[] = [
  { id: 'a-01', actorName: 'Admin ActiVibe', actorRole: 'ADMIN', action: 'Menyetujui kegiatan', targetLabel: 'Penanaman 500 Bibit Mangrove Pesisir Cilincing', timestamp: '2026-02-21T09:12:00' },
  { id: 'a-02', actorName: 'Yayasan Alam Nusantara', actorRole: 'ORGANIZER', action: 'Mempublikasikan kegiatan', targetLabel: 'Penanaman 500 Bibit Mangrove Pesisir Cilincing', timestamp: '2026-02-20T14:03:00' },
  { id: 'a-03', actorName: 'Admin ActiVibe', actorRole: 'ADMIN', action: 'Menyetujui kegiatan', targetLabel: 'Bersih Pantai & Edukasi Sampah Plastik', timestamp: '2026-03-11T10:47:00' },
  { id: 'a-04', actorName: 'Admin ActiVibe', actorRole: 'ADMIN', action: 'Menangguhkan akun', targetLabel: 'Sekar Ayu Wulandari', timestamp: '2026-04-02T16:20:00' },
  { id: 'a-05', actorName: 'Admin ActiVibe', actorRole: 'ADMIN', action: 'Menyetujui kegiatan', targetLabel: 'Kelas Baca Tulis untuk Anak Panti Asuhan', timestamp: '2026-03-29T08:55:00' },
  { id: 'a-06', actorName: 'Admin ActiVibe', actorRole: 'ADMIN', action: 'Menonaktifkan akun', targetLabel: 'Komunitas Peduli Pesisir', timestamp: '2026-04-18T11:30:00' },
  { id: 'a-07', actorName: 'Admin ActiVibe', actorRole: 'ADMIN', action: 'Menyetujui kegiatan', targetLabel: 'Penanaman Terumbu Karang Kepulauan Seribu', timestamp: '2026-04-16T13:09:00' },
  { id: 'a-08', actorName: 'Admin ActiVibe', actorRole: 'ADMIN', action: 'Menolak kegiatan', targetLabel: 'Konser Amal Peduli Bencana (Lomba DJ Tanpa Izin)', timestamp: '2026-05-31T17:41:00' },
  { id: 'a-09', actorName: 'Admin ActiVibe', actorRole: 'ADMIN', action: 'Menangguhkan akun', targetLabel: 'Bank Sampah Hijau Lestari', timestamp: '2026-06-05T09:18:00' },
  { id: 'a-10', actorName: 'Griya Belajar Anak Bangsa', actorRole: 'ORGANIZER', action: 'Mengajukan kegiatan baru', targetLabel: 'Pendampingan UMKM Digital untuk Ibu Rumah Tangga', timestamp: '2026-06-25T15:02:00' },
  { id: 'a-11', actorName: 'Yayasan Alam Nusantara', actorRole: 'ORGANIZER', action: 'Mengajukan kegiatan baru', targetLabel: 'Donor Darah & Cek Kesehatan Gratis', timestamp: '2026-05-24T12:44:00' },
  { id: 'a-12', actorName: 'Bank Sampah Hijau Lestari', actorRole: 'ORGANIZER', action: 'Mengajukan kegiatan baru', targetLabel: 'Workshop Daur Ulang Sampah Elektronik', timestamp: '2026-06-01T10:16:00' },
]
