import type { Organization } from '../types/organization'

export const mockOrganizations: Organization[] = [
  {
    id: 'org-aiesec',
    name: 'AIESEC in Indonesia',
    shortProfile:
      'Organisasi kepemimpinan pemuda global yang menghubungkan mahasiswa dengan program volunteer dan magang lintas negara.',
    location: 'Yogyakarta, DIY',
    address: 'Jl. Colombo No. 1, Caturtunggal, Depok, Sleman, Yogyakarta',
    website: 'aiesec.org',
    email: 'lc.yogyakarta@aiesec.net',
    phone: '+622741234567',
    causeAreas: ['Kepemimpinan Pemuda', 'Pendidikan', 'Pertukaran Budaya'],
    isVerified: true,
    joinedYear: 2015,
    eventsCount: 64,
    rating: 4.6,
    mission:
      'AIESEC menggerakkan generasi muda untuk mengembangkan kepemimpinan lewat pengalaman lintas budaya, sambil berkontribusi pada Tujuan Pembangunan Berkelanjutan (SDGs) di komunitas lokal.',
    aboutUs:
      'AIESEC in Indonesia adalah bagian dari jaringan organisasi pemuda terbesar di dunia yang berdiri sejak 1948. Local Committee Yogyakarta secara rutin membuka program Global Volunteer & Global Teacher, menghubungkan relawan lokal maupun internasional dengan proyek sosial dan pendidikan di sekitar DIY.',
  },
  {
    id: 'org-paragon',
    name: 'Paragon — Wujudkan Kebaikan',
    shortProfile:
      'Inisiatif CSR dari PT Paragon Technology and Innovation yang rutin menggerakkan program relawan di bidang lingkungan dan pemberdayaan perempuan.',
    location: 'Yogyakarta, DIY',
    address: 'Jl. Swakarya, Sinduadi, Mlati, Sleman, Yogyakarta',
    website: 'paragon-innovation.com',
    email: 'wujudkankebaikan@paragon-innovation.com',
    phone: '+622741112233',
    causeAreas: ['Pemberdayaan Perempuan', 'Lingkungan', 'Ekonomi Kreatif'],
    isVerified: true,
    joinedYear: 2018,
    eventsCount: 41,
    rating: 4.8,
    mission:
      'Wujudkan Kebaikan mengajak relawan untuk berkontribusi nyata pada isu lingkungan dan pemberdayaan ekonomi perempuan, sejalan dengan komitmen keberlanjutan Paragon.',
    aboutUs:
      'Wujudkan Kebaikan adalah payung program tanggung jawab sosial PT Paragon Technology and Innovation. Selain menggalang dana, program ini rutin membuka kesempatan volunteer langsung di lapangan — mulai dari daur ulang kemasan kosmetik, pelatihan UMKM perempuan, hingga aksi penghijauan bersama komunitas lokal.',
  },
  {
    id: 'org-laut-lestari',
    name: 'Komunitas Laut Lestari',
    shortProfile:
      'Komunitas pesisir yang aktif menjaga kebersihan pantai selatan Yogyakarta lewat aksi bersih pantai dan edukasi sampah.',
    location: 'Parangtritis, Bantul',
    address: 'Jl. Pantai Parangtritis, Parangtritis, Kretek, Bantul, Yogyakarta',
    email: 'halo@lautlestari.id',
    phone: '+6281234501234',
    causeAreas: ['Lingkungan', 'Edukasi Publik'],
    isVerified: true,
    joinedYear: 2019,
    eventsCount: 24,
    rating: 4.7,
    mission:
      'Menjaga kebersihan dan kelestarian pesisir selatan Yogyakarta melalui aksi kolektif warga dan relawan, serta menumbuhkan kesadaran pengelolaan sampah sejak dini.',
    aboutUs:
      'Komunitas Laut Lestari aktif menjaga kebersihan pesisir selatan Yogyakarta sejak 2019. Selain aksi bersih-bersih rutin, komunitas ini juga menjalankan edukasi pengelolaan sampah untuk warga sekitar pantai dan membuka program volunteer bulanan bagi siapa saja yang peduli isu laut.',
  },
  {
    id: 'org-cahaya-pesisir',
    name: 'Yayasan Cahaya Pesisir',
    shortProfile:
      'Yayasan pendidikan yang membuka akses baca-tulis untuk anak-anak nelayan di pesisir selatan Gunungkidul.',
    location: 'Tepus, Gunungkidul',
    address: 'Jl. Baron KM 4, Tepus, Gunungkidul, Yogyakarta',
    email: 'kontak@cahayapesisir.org',
    phone: '+6281234509876',
    causeAreas: ['Pendidikan', 'Anak & Remaja'],
    isVerified: true,
    joinedYear: 2017,
    eventsCount: 16,
    rating: 4.8,
    mission:
      'Membuka akses pendidikan dasar yang setara bagi anak-anak nelayan di pesisir selatan, melalui program belajar yang konsisten dan didampingi relawan terlatih.',
    aboutUs:
      'Yayasan Cahaya Pesisir fokus pada akses pendidikan dasar untuk anak-anak nelayan di pesisir selatan Gunungkidul sejak 2017. Program belajar baca-tulis mingguan menjadi kegiatan andalan yang selalu membutuhkan relawan pengajar dari luar komunitas.',
  },
  {
    id: 'org-literasi-jogja',
    name: 'Gerakan Literasi Yogyakarta',
    shortProfile:
      'Mengelola taman bacaan komunitas di area publik untuk menumbuhkan minat baca anak-anak kota.',
    location: 'Malioboro, Yogyakarta',
    address: 'Jl. Malioboro, Sosromenduran, Gedong Tengen, Yogyakarta',
    email: 'halo@literasijogja.org',
    phone: '+6281234512345',
    causeAreas: ['Pendidikan', 'Seni & Budaya'],
    isVerified: true,
    joinedYear: 2020,
    eventsCount: 38,
    rating: 4.8,
    mission:
      'Menumbuhkan minat baca dan kreativitas anak-anak kota lewat taman bacaan komunitas yang terbuka dan menyenangkan.',
    aboutUs:
      'Gerakan Literasi Yogyakarta mengelola beberapa taman bacaan komunitas di titik-titik strategis kota, termasuk sesi mendongeng rutin setiap akhir pekan. Komunitas ini terbuka bagi relawan yang senang berinteraksi dengan anak-anak dan dunia literasi.',
  },
  {
    id: 'org-pmi-yogyakarta',
    name: 'PMI Cabang Yogyakarta',
    shortProfile:
      'Cabang Palang Merah Indonesia yang rutin mengadakan donor darah dan edukasi kesehatan di berbagai kampus.',
    location: 'Yogyakarta',
    address: 'Jl. Ngeksigondo No. 56, Prenggan, Kotagede, Yogyakarta',
    website: 'pmiyogyakarta.or.id',
    email: 'info@pmiyogyakarta.or.id',
    phone: '+622744567890',
    causeAreas: ['Kesehatan', 'Kebencanaan'],
    isVerified: true,
    joinedYear: 2013,
    eventsCount: 45,
    rating: 4.5,
    mission:
      'Menjamin ketersediaan darah yang aman dan meningkatkan kesadaran kesehatan masyarakat lewat kegiatan donor darah dan edukasi publik yang konsisten.',
    aboutUs:
      'PMI Cabang Yogyakarta rutin mengadakan acara donor darah dan edukasi kesehatan di berbagai kampus di Yogyakarta. Volunteer dilibatkan mulai dari pendaftaran peserta, pendampingan booth edukasi, hingga logistik acara.',
  },
  {
    id: 'org-hijau-merapi',
    name: 'Komunitas Hijau Merapi',
    shortProfile:
      'Menjalankan program konservasi area resapan air di lereng Merapi lewat penanaman pohon berkala.',
    location: 'Cangkringan, Sleman',
    address: 'Jl. Kaliurang KM 22, Cangkringan, Sleman, Yogyakarta',
    email: 'kontak@hijaumerapi.id',
    phone: '+6281234598765',
    causeAreas: ['Lingkungan', 'Mitigasi Bencana'],
    isVerified: true,
    joinedYear: 2011,
    eventsCount: 22,
    rating: 4.5,
    mission:
      'Memulihkan dan menjaga area resapan air lereng Merapi lewat penghijauan berkelanjutan pasca-erupsi 2010, bersama relawan dan warga sekitar.',
    aboutUs:
      'Komunitas Hijau Merapi menjalankan program konservasi area resapan air di lereng Merapi sejak pasca-erupsi 2010. Kegiatan penanaman pohon digelar berkala dan selalu terbuka untuk relawan yang siap turun langsung ke lapangan.',
  },
  {
    id: 'org-posko-sleman',
    name: 'Posko Tanggap Bencana Sleman',
    shortProfile:
      'Mengoordinasikan respons cepat kebencanaan di wilayah Sleman, mulai dari dapur umum hingga distribusi logistik.',
    location: 'Sleman',
    address: 'Jl. Magelang KM 12, Sinduadi, Mlati, Sleman, Yogyakarta',
    email: 'posko@tanggapsleman.id',
    phone: '+6281234587654',
    causeAreas: ['Kebencanaan', 'Bantuan Sosial'],
    isVerified: false,
    joinedYear: 2021,
    eventsCount: 19,
    rating: 4.6,
    mission:
      'Menghadirkan respons kebencanaan yang cepat dan terkoordinasi bagi warga terdampak di wilayah Sleman dan sekitarnya.',
    aboutUs:
      'Posko Tanggap Bencana Sleman mengoordinasikan respons cepat untuk kejadian bencana di wilayah Sleman, termasuk dapur umum dan distribusi logistik. Relawan piket dibutuhkan secara berkala terutama saat musim hujan.',
  },
]
