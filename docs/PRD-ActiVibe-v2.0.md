# ActiVibe — Product Requirements Document v2.0

> **Platform Volunteer Berbasis AI untuk Personalisasi Minat dalam Melakukan Volunteer**

| Field | Value |
|---|---|
| **Version** | v2.0 Draft |
| **Tanggal** | 18 Juni 2026 |
| **Team** | Saw iT — Rakha, Haikal, Daffa, Abiem |
| **Product Owner** | Rakha Dzikra Guevara |
| **Status** | Draft — Pending Review |
| **Basis** | v1.0 (05/05/2026) + Iterasi Strategis |

> ⚠️ **Catatan untuk Claude Code:** Dokumen ini adalah **single source of truth** project ActiVibe. FR terakhir adalah **FR-027**. Saat menambah FR baru, lanjutkan dari nomor ini. Jangan menimpa/mengubah nomor FR yang sudah ada tanpa konfirmasi.

---

## Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| v0.1 | 05/05/2026 | Rakha, Abiem, Haikal, Daffa | Inisiasi project |
| v1.0 | 05/05/2026 | Rakha, Abiem, Haikal, Daffa | PRD initial draft |
| v2.0 | 18/06/2026 | Claude (AI Assistant) + Rakha | Revisi strategis: Impact Passport, Agentic AI features, revenue model, perbaikan inkonsistensi data model, 5 FR baru |

---

# PART 1 — FOUNDATIONS: PROBLEM, OBJECTIVES & SCOPE

## 1. Problem Statement

### 1.1 Background & Context

Indonesia memiliki tingkat partisipasi sosial yang tinggi, namun sebagian besar kegiatan volunteer masih tidak terorganisir secara digital. Berdasarkan hasil observasi dari seluruh platform volunteer yang ada, mayoritas masih menggunakan sistem pencarian manual tanpa rekomendasi berbasis minat dan skill.

Hal ini menyebabkan:

- Banyak volunteer mendaftar pada kegiatan yang tidak relevan dengan minat atau kompetensi mereka.
- Tingkat ketidaksesuaian (mismatch) diperkirakan mencapai **40–60%** berdasarkan feedback pasca kegiatan.
- Sebagian volunteer tidak melanjutkan partisipasi setelah pengalaman pertama.
- Organisasi penyelenggara mengalami kesulitan mendapatkan volunteer yang relevan, sehingga proses seleksi menjadi tidak efisien.

### 1.2 Problem Statement

> Volunteer dan organisasi pengabdian masyarakat di Indonesia mengalami kesulitan dalam menemukan kecocokan antara minat, skill, dan kebutuhan kegiatan karena tidak adanya sistem rekomendasi yang terstruktur dan berbasis data. Hal ini menyebabkan tingginya tingkat mismatch (**40–60%**), rendahnya kepuasan volunteer, serta rendahnya partisipasi berkelanjutan dalam kegiatan sosial.

### 1.3 Who is Affected

- **Calon Volunteer (individu, 17+ tahun):** Kesulitan menemukan kegiatan yang relevan dengan minat mereka; tidak ada pengalaman personal yang membuat mereka termotivasi untuk kembali berpartisipasi.
- **Organisasi / Penyelenggara Kegiatan Volunteer:** Sulit menjangkau volunteer yang benar-benar sesuai dengan kebutuhan kegiatan mereka; proses rekrutmen volunteer masih manual dan tidak efisien.
- **Admin Platform:** Tidak ada sistem terpusat untuk memantau aktivitas volunteer, engagement pengguna, dan efektivitas pencocokan kegiatan secara real-time.

---

## 2. Objectives

### 2.1 Business Objectives

| # | Objective | Why it matters | Success indicator |
|---|---|---|---|
| 1 | Mengoptimalkan proses pendaftaran volunteer melalui sistem pencocokan berbasis minat dan bakat dengan tingkat akurasi ≥ 75% dalam **6 bulan pertama** | Tanpa sistem matching yang baik, volunteer cenderung tidak cocok sehingga menurunkan kepuasan dan keberlanjutan | Persentase kecocokan berdasarkan rating volunteer pasca-kegiatan (≥ 75% menyatakan "sesuai" atau "sangat sesuai") |
| 2 | Memberikan kemudahan bagi NGO/komunitas dalam merekrut volunteer yang relevan dengan meningkatkan efisiensi rekrutmen hingga ≥ 50% lebih cepat dibanding metode manual | Proses rekrutmen yang lambat menghambat penyelenggaraan kegiatan sosial | Rata-rata waktu dari publikasi event hingga volunteer diterima (time-to-fill) dan tingkat kepuasan organizer |
| 3 | Meningkatkan partisipasi volunteer dengan mencapai tingkat partisipasi ulang (repeat participation) ≥ 40% dalam **6 bulan pertama** penggunaan | Partisipasi berkelanjutan adalah indikator utama keberhasilan platform sosial | Persentase pengguna yang mengikuti ≥ 2 kegiatan dalam 90 hari pertama |
| 4 | Membangun sistem volunteer yang transparan dan terstruktur dengan menyediakan **Impact Passport** digital untuk ≥ 90% pengguna aktif | Transparansi meningkatkan kepercayaan antara volunteer, organizer, dan stakeholder. Impact Passport juga jadi differentiator utama platform. | Persentase pengguna dengan Impact Passport terisi lengkap dan persentase yang membagikan ke media sosial |
| 5 | Membangun model revenue yang sustainable melalui **Freemium Organizer** dan **B2B Corporate CSR**, tanpa membebankan biaya kepada volunteer | Platform sosial yang tidak punya model bisnis tidak bisa bertahan jangka panjang — Idealist.org menjadi contoh kasus defisit operasional | First paying organizer dalam 6 bulan; first B2B corporate deal dalam 12 bulan |

### 2.2 Success Metrics

| Metric | Baseline | Target (6 bulan) | How measured |
|---|---|---|---|
| Jumlah pengguna aktif terdaftar | 0 (platform baru) | ≥ 10.000 | Jumlah akun dengan ≥ 1 pendaftaran kegiatan |
| Tingkat kecocokan volunteer-kegiatan | Tidak terukur (manual) | ≥ 75% rating positif | In-app rating pasca-kegiatan (skala 1–5, dihitung ≥ 4) |
| Retensi volunteer (partisipasi ulang) | Tidak terukur | ≥ 40% dalam 90 hari | % pengguna yang mendaftar ≥ 2 kegiatan dalam 3 bulan pertama |
| Completion rate onboarding profil | Tidak terukur | ≥ 85% | Persentase user yang menyelesaikan profil lengkap via Conversational Onboarding Agent |
| Impact Passport share rate | 0 (fitur baru) | ≥ 30% pengguna aktif share | % pengguna yang share Impact Passport ke minimal 1 platform media sosial |
| Engagement gamifikasi (poin & skill) | 0 (fitur baru) | ≥ 60% pengguna aktif | % pengguna yang cek poin/skill progress minimal 1x per minggu |

---

## 3. Scope

### 3.1 In Scope & Out of Scope (MVP v2.0)

| ✅ IN Scope (MVP v2.0) | ❌ OUT of Scope (v1) |
|---|---|
| Registrasi & Login Pengguna (Email / Nomor Telepon + OTP) | Integrasi asuransi kesehatan pihak ketiga |
| **Conversational Onboarding Agent** (gantikan form profil panjang dengan chat 60 detik) | Fitur chat antar sesama relawan |
| Profil Pengguna (minat, skill, pengalaman) | Manajemen penggajian atau kompensasi finansial |
| **Sistem Rekomendasi Volunteer berbasis AI dengan Predictive Match Score + Reasoning** | Dukungan aplikasi untuk smartwatch |
| Daftar Kegiatan Volunteer | Leaderboard global (gamifikasi lanjutan) |
| Pendaftaran & Partisipasi Kegiatan | Sistem pembayaran / monetisasi eksternal |
| **Impact Passport** (portofolio dampak volunteer yang shareable) | Integrasi pemerintah daerah / API Dinas Sosial |
| **Skill Progress Tracker** per volunteer | B2B Corporate CSR Dashboard (post-MVP) |
| Dashboard Organizer (membuat & mengelola kegiatan) | |
| Dashboard Admin (monitoring pengguna & aktivitas) | |
| **Freemium tier untuk Organizer** (free vs premium) | |

---

# PART 2 — FUNCTIONAL REQUIREMENTS & USER WORKFLOWS

## 4. Functional Requirements

### 4.1 FR Table: Volunteer (End User)

| FR ID | Actor | The system shall… | Condition / Trigger | Priority | MoSCoW |
|---|---|---|---|---|---|
| FR-001 | Volunteer | Memungkinkan pengguna membuat akun menggunakan email atau nomor telepon | Ketika pengguna membuka aplikasi pertama kali dan memilih 'Daftar' | High | M |
| FR-002 | System | Mengirimkan kode verifikasi (OTP) ke email/nomor telepon dengan masa berlaku 5 menit | Setelah pengguna menyelesaikan input data registrasi | High | M |
| FR-003 | Volunteer | Memungkinkan pengguna meminta ulang OTP (maks. 3 kali) | 5 menit setelah OTP dikirim dan belum diverifikasi | High | M |
| FR-004 | System | Menyimpan dan memvalidasi data profil pengguna mencakup minat, keahlian, dan riwayat pengalaman | Ketika pengguna mengisi form profil dan menekan 'Simpan' | High | M |
| FR-005 | System | Menghasilkan daftar rekomendasi kegiatan volunteer yang dipersonalisasi dengan **Predictive Match Score (%)** dan reasoning mengapa event cocok untuk user | Ketika pengguna membuka halaman rekomendasi | High | M |
| FR-006 | Volunteer | Memungkinkan pengguna mendaftar ke kegiatan volunteer | Ketika pengguna memilih kegiatan dan menekan 'Daftar' | High | M |
| FR-007 | System | Menampilkan tiket konfirmasi digital berisi detail lengkap kegiatan setelah pendaftaran berhasil | Setelah pengguna berhasil mengirimkan pendaftaran | High | M |
| FR-008 | Volunteer | Menampilkan **Impact Passport** volunteer sebagai halaman portofolio publik (detail di bawah) | Ketika volunteer membuka halaman 'Impact Passport' atau saat pihak ketiga mengakses URL publik `activivibe.id/passport/{username}` | High | M |
| FR-009 | System | Secara otomatis men-generate **sertifikat digital personal** menggunakan AI untuk setiap volunteer yang dikonfirmasi hadir (detail di bawah) | Ketika organizer menyelesaikan 4-step close event flow (FR-017) dan menekan konfirmasi final; semua proses di-trigger otomatis dalam ≤ 30 detik tanpa aksi tambahan dari volunteer | High | M |
| FR-010 | Volunteer | Memungkinkan pengguna memberikan feedback dan rating terhadap kegiatan; hasil feedback digunakan sebagai sinyal AI untuk meningkatkan akurasi Predictive Match Score pada rekomendasi berikutnya (**explicit feedback loop**) | Setelah kegiatan selesai dan sertifikat diterima | Medium | S |

**FR-008 — Detail Impact Passport.** Halaman portofolio publik yang berisi:

1. **AI-generated tagline personal** dari total kontribusi dan dampak nyata volunteer (bukan template generik).
2. **Statistik dampak agregat:** total jam kontribusi, jumlah kegiatan selesai, jumlah NGO berbeda, dan metrik spesifik per event dari ImpactLog (contoh: "240 bibit ditanam", "18 kg sampah diangkat", "18 anak diajar").
3. **Skill Progress Tracker** dengan XP bar per skill yang berkembang setiap event selesai.
4. **Timeline kegiatan kronologis** dengan narasi dampak per event.
5. **Tombol share 1-klik** ke IG Story, LinkedIn, dan WhatsApp dengan konten yang disesuaikan tone per platform secara otomatis oleh AI.
6. **URL publik** yang dapat diakses tanpa login untuk keperluan CV/portofolio/beasiswa.

**FR-009 — Detail Auto-generate Sertifikat AI.** Alur:

1. AI membaca `impact_value` dari ImpactLog dan `event_type` untuk menyusun narasi pencapaian unik per volunteer — contoh: *"Abiem Nugroho telah berkontribusi menanam 240 bibit mangrove bersama Yayasan Alam Nusantara pada September 2025"* — bukan mengisi template generik dengan nama dan tanggal saja.
2. Sistem menyematkan **QR code verifikasi** yang mengarah ke halaman Impact Passport publik sehingga sertifikat dapat diverifikasi oleh kampus, perusahaan, atau lembaga beasiswa.
3. Update otomatis Skill Progress Tracker: XP ditambahkan ke skill yang relevan berdasarkan skill tag event.
4. Poin reward ditambahkan ke akun volunteer.
5. Sertifikat tersedia untuk diunduh dalam format yang siap dilampirkan ke portofolio digital.

### 4.2 FR Table: Organizer (NGO/Komunitas)

| FR ID | Actor | The system shall… | Condition / Trigger | Priority | MoSCoW |
|---|---|---|---|---|---|
| FR-011 | Organizer | Memungkinkan organizer membuat dan mempublikasikan kegiatan volunteer baru termasuk memilih `impact_metric_template` sesuai jenis event | Ketika organizer mengisi form kegiatan dan menekan 'Publikasikan' | High | M |
| FR-012 | System | Menyimpan seluruh data kegiatan termasuk deskripsi, kebutuhan skill, lokasi, tanggal, kuota, dan `impact_metric_template` | Setelah organizer mengirimkan form kegiatan | High | M |
| FR-013 | Organizer | Menampilkan daftar volunteer yang telah mendaftar beserta profil singkat dan **match score** masing-masing | Ketika organizer membuka halaman 'Manajemen Pendaftar' | High | M |
| FR-014 | Organizer | Memungkinkan organizer menerima atau menolak pendaftaran volunteer secara individual | Ketika organizer memilih pendaftar dan klik 'Terima' atau 'Tolak' | High | M |
| FR-015 | System | Mengirimkan notifikasi status pendaftaran (diterima/ditolak) kepada pengguna | Ketika organizer memperbarui status pendaftaran | High | M |
| FR-016 | Organizer | Memungkinkan organizer memfilter volunteer berdasarkan skill, minat, dan match score | Ketika organizer menggunakan fitur filter | Medium | S |
| FR-017 | Organizer | Memungkinkan organizer menutup event melalui **4-step guided flow** (detail di bawah) | Ketika kegiatan telah berakhir dan organizer memilih 'Tutup Event' dari dashboard organizer | High | M |
| FR-017b | System | Setelah Step 4 FR-017 dikonfirmasi, men-generate **sertifikat digital AI secara batch** untuk semua volunteer yang dikonfirmasi hadir tanpa aksi manual per orang (detail di bawah) | Di-trigger otomatis oleh FR-017 Step 4; seluruh batch sertifikat harus selesai dalam ≤ 60 detik untuk event dengan ≤ 50 volunteer | High | M |

**FR-017 — 4-Step Close Event Flow:**

- **Step 1 — Konfirmasi kehadiran:** per volunteer secara individual (hanya yang dikonfirmasi yang menerima sertifikat dan poin).
- **Step 2 — Input `impact_value` dengan bantuan AI:** sistem menampilkan `impact_metric_template` yang dipilih saat buat event beserta nilai saran berbasis data event sejenis; organizer cukup mengisi angka aktual.
- **Step 3 — Preview Impact Passport:** organizer melihat tampilan akhir halaman Impact Passport satu volunteer sampel termasuk AI-generated headline sebelum difinalisasi; bisa kembali ke Step 2 jika ada koreksi.
- **Step 4 — Konfirmasi final:** men-trigger generate sertifikat AI batch (FR-017b), update ImpactLog, dan notifikasi personal per volunteer (FR-025).

**FR-017b — Batch Generate Sertifikat AI:**

1. AI LLM membaca `impact_value` + `event_type` + `nama_volunteer` dari ImpactLog untuk menyusun narasi pencapaian unik per orang.
2. Sistem render sertifikat dengan narasi personal, QR code verifikasi, logo NGO organizer, dan tanggal kegiatan.
3. Sertifikat langsung tersedia di Impact Passport masing-masing volunteer dan dapat diunduh.
4. Jika generate gagal untuk satu volunteer, sistem retry otomatis hingga 3 kali dan kirim notifikasi error ke organizer jika tetap gagal.

### 4.3 FR Table: Admin

| FR ID | Actor | The system shall… | Condition / Trigger | Priority | MoSCoW |
|---|---|---|---|---|---|
| FR-018 | Admin | Menampilkan dashboard platform berisi data pengguna, kegiatan, tingkat partisipasi, dan metrik Impact Passport | Ketika admin membuka dashboard | High | M |
| FR-019 | Admin | Memungkinkan admin mengelola akun pengguna (aktifkan, nonaktifkan, atau suspend) | Ketika admin melakukan aksi pengelolaan akun | High | M |
| FR-020 | Admin | Memungkinkan admin mengelola kegiatan volunteer (menyetujui atau menghapus) | Ketika admin meninjau kegiatan yang diajukan | High | M |
| FR-021 | Admin | Memungkinkan admin mengekspor data partisipasi volunteer dalam format CSV | Ketika admin memilih rentang waktu dan menekan tombol ekspor | Medium | S |
| FR-022 | System | Mencatat seluruh aktivitas penting pengguna dan organizer untuk keperluan audit dan monitoring | Ketika terjadi aksi penting dalam sistem | High | M |

### 4.4 FR Table: Fitur AI Baru

| FR ID | Actor | The system shall… | Condition / Trigger | Priority | MoSCoW |
|---|---|---|---|---|---|
| FR-023 | System | Menyediakan **Conversational Onboarding Agent** yang menggantikan form profil panjang dengan percakapan chat ≤ 60 detik untuk mengumpulkan minat, skill, dan jadwal volunteer | Ketika pengguna baru pertama kali masuk setelah verifikasi OTP | High | M |
| FR-024 | System | Men-generate **AI headline personal** dari data `impact_value` + `event_type` dan menyimpannya ke ImpactLog sebagai narasi dampak yang muncul di Impact Passport | Ketika organizer menyelesaikan FR-017 (tutup event) dan mengkonfirmasi `impact_value` | High | M |
| FR-025 | System | Mengirimkan **notifikasi personal** yang berbeda per volunteer berdasarkan kontribusi spesifik mereka setelah event ditutup organizer | Setelah FR-024 selesai diproses | High | M |
| FR-026 | System | Menampilkan **Impact Passport sebagai halaman publik** (`activivibe.id/passport/{username}`) yang dapat dibagikan ke IG Story, LinkedIn, dan WhatsApp dalam format yang sudah disesuaikan tone per platform | Ketika volunteer membuka halaman 'Impact Passport' dan memilih 'Bagikan' | High | M |
| FR-027 | System | Menampilkan **Skill Progress Tracker** per volunteer dengan visualisasi XP bar per skill yang diperbarui otomatis berdasarkan skill tag dari event yang diselesaikan | Ketika volunteer membuka halaman 'Profil' atau 'Impact Passport' | Medium | S |

---

## 5. User Workflows

### 5.1 Workflow: Conversational Onboarding Agent

- **Actor:** Volunteer baru
- **Goal:** Menyelesaikan setup profil lengkap dalam ≤ 60 detik melalui percakapan AI, bukan form
- **FRs covered:** FR-004, FR-023

**Ideal Path:**

1. Setelah OTP terverifikasi, sistem menampilkan Conversational Onboarding Agent (chat interface).
2. Agent menyapa: *"Hai! Gue bantu setup profil kamu dalam 60 detik. Kamu suka kegiatan outdoor atau indoor?"*
3. Volunteer memilih dari quick reply chips atau ketik bebas.
4. Agent lanjut: *"Ada skill khusus yang mau kamu kembangkan? Misalnya desain, ngajar, atau koordinasi?"*
5. Agent tanya ketersediaan: *"Biasanya available weekday, weekend, atau keduanya?"*
6. Sistem menyimpan data profil dan langsung menampilkan rekomendasi pertama: *"Oke! Ini 3 event yang cocok buat kamu minggu ini."*

**Decision Points:**

| Decision Point | YES / Success path | NO / Error path |
|---|---|---|
| User menjawab semua pertanyaan? | Profil disimpan, tampilkan rekomendasi | Setelah 2 pertanyaan dijawab, profil partial disimpan — bisa dilengkapi nanti |
| User menutup chat di tengah? | Profil partial tersimpan, muncul reminder "Lengkapi profil dapat 50 poin bonus" | — |

### 5.2 Workflow: Volunteer Mendaftar Kegiatan

- **FRs covered:** FR-005, FR-006, FR-007

**Ideal Path:**

1. Volunteer membuka halaman rekomendasi kegiatan.
2. Sistem menampilkan daftar kegiatan dengan **Match Score (%)** dan satu kalimat reasoning per event.
3. Volunteer memilih salah satu kegiatan.
4. Sistem menampilkan detail kegiatan beserta breakdown Match Score: skill yang cocok, lokasi, jadwal.
5. Volunteer menekan tombol 'Daftar'.
6. Sistem menyimpan pendaftaran dan menampilkan tiket konfirmasi.

### 5.3 Workflow: Organizer Membuat dan Mengelola Event

- **FRs covered:** FR-011, FR-012, FR-013, FR-014, FR-015

**Ideal Path:**

1. Organizer login ke platform ActiVibe For Organizer.
2. Organizer membuka menu 'Buat Kegiatan'.
3. Organizer mengisi form kegiatan (deskripsi, skill, lokasi, kuota) dan memilih `impact_metric_template`.
4. Organizer menekan tombol 'Publikasikan'.
5. Sistem menyimpan dan mempublikasikan kegiatan; **Proactive Matching Agent** mulai scan volunteer cocok.
6. Volunteer mulai mendaftar kegiatan.
7. Organizer membuka daftar pendaftar dan memilih berdasarkan profil + match score.
8. Organizer menerima/menolak; sistem mengirim notifikasi ke volunteer.

### 5.4 Workflow: Organizer Menutup Event (4-Step)

- **FRs covered:** FR-017, FR-017b, FR-024, FR-025

| Step | Aksi |
|---|---|
| **Step 1 — Konfirmasi kehadiran** | Organizer memilih 'Tutup Event'. Sistem menampilkan daftar semua volunteer terdaftar. Organizer mencentang volunteer yang benar-benar hadir (verifikasi manual per orang). |
| **Step 2 — Input `impact_value`** | Sistem menampilkan `impact_metric_template` yang dipilih saat buat event, dengan saran nilai berbasis AI. Organizer mengisi angka aktual (misal: 18 kg sampah, 9 jam kontribusi, 3 volunteer aktif). |
| **Step 3 — Preview Impact Passport** | Sistem menampilkan preview tampilan Impact Passport satu volunteer sampel, termasuk AI-generated headline. Organizer bisa kembali ke Step 2 untuk edit. |
| **Step 4 — Konfirmasi final** | Organizer menekan 'Konfirmasi & Tutup Event'. Sistem trigger FR-024 (AI headline), FR-025 (notifikasi personal), dan update SkillProgress untuk semua volunteer yang dikonfirmasi hadir. |

### 5.5 Workflow: Volunteer Memberikan Feedback

- **FRs covered:** FR-009, FR-010

**Ideal Path:**

1. Setelah organizer menutup event (5.4), sistem memperbarui status kegiatan menjadi 'Selesai'.
2. Sistem memberikan poin dan sertifikat digital kepada volunteer yang dikonfirmasi hadir.
3. Sistem menampilkan form feedback.
4. Volunteer memberikan rating dan ulasan.
5. Sistem menyimpan feedback.

**Decision Points:**

| Decision Point | YES / Success path | NO / Error path |
|---|---|---|
| Kegiatan ditandai selesai oleh organizer? | Sistem memberikan poin & sertifikat | Status tetap 'Berlangsung' — tidak ada poin diberikan |
| User mengisi feedback? | Feedback disimpan, completion status tercatat | Sistem tetap menyimpan completion status dan berikan poin — menampilkan reminder "Berikan feedback untuk bantu volunteer lain" |

---

# PART 3 — DESIGN, DATA & RELEASE PLANNING

## 6. Design Planning

### 6.1 User Persona

| Atribut | Persona 1: Volunteer Aktif | Persona 2: Organizer NGO |
|---|---|---|
| **Nama** | Abiem, 20 tahun | Rakha Dzikra Guevara, 21 tahun |
| **Peran** | Calon Volunteer | Penyelenggara Kegiatan |
| **Latar Belakang** | Mahasiswa aktif, minat IT dan lingkungan | Manajer program NGO, 5–10 kegiatan/tahun |
| **Pain Points** | Kesulitan menemukan kegiatan sesuai minat; platform terlalu generik | Rekrutmen manual, memakan banyak waktu, kandidat sering tidak relevan |
| **Goal di Platform** | Menemukan kegiatan sesuai minat, membangun Impact Passport, mendapat sertifikat digital | Mempublikasikan kegiatan, menemukan volunteer tepat, memantau partisipasi |
| **Tech Literacy** | Pengguna aktif smartphone & media sosial | Menengah — butuh antarmuka intuitif |

### 6.2 Design Principles

- **Accessibility:** Memenuhi standar WCAG 2.1 Level AA — kontras warna, ukuran teks, dan navigasi keyboard.
- **Onboarding Friction Reduction:** Jumlah langkah registrasi dibatasi seminimal mungkin; Conversational Onboarding Agent menggantikan form panjang.
- **Progressive Disclosure:** Informasi kompleks (detail kegiatan, profil organizer) ditampilkan secara bertahap untuk menghindari cognitive overload.
- **Shareable by Design:** Setiap fitur utama (Impact Passport, sertifikat, event recap) dirancang untuk mudah dibagikan ke media sosial dalam 1 klik dengan format yang sudah disesuaikan per platform (IG Story, LinkedIn, WhatsApp).

### 6.3 Non-Functional Requirements

| NFR ID | Kategori | Requirement | Condition / Trigger |
|---|---|---|---|
| NFR-001 | Performance | Halaman rekomendasi kegiatan harus termuat sepenuhnya | < 3 detik pada jaringan 4G |
| NFR-002 | Availability | Uptime platform harus terjaga | ≥ 99.5% per bulan (eksklusif maintenance terjadwal) |
| NFR-004 | Security | Semua data pengguna harus dienkripsi dalam transit dan saat disimpan | HTTPS (TLS 1.2+) dan enkripsi AES-256 untuk data sensitif |
| NFR-005 | Usability | Pengguna baru harus dapat menyelesaikan registrasi dan mendaftar kegiatan pertama tanpa bantuan | Task completion rate onboarding ≥ 85% dalam uji usabilitas |

> Catatan: NFR-003 tidak ada di dokumen (penomoran melompat dari NFR-002 ke NFR-004) — dipertahankan apa adanya dari sumber, ditandai untuk klarifikasi versi final.

---

## 7. Data Planning

### 7.1 Core Data Entities

| Entity | Main Attributes | Relation |
|---|---|---|
| **User** | `id, name, email, phone, password, role (volunteer \| organizer \| admin)` | 1-1 dengan Profile; M-N dengan Interest via User_Interests; M-N dengan Event via Application |
| **Profile** | `id, user_id, bio, location, avatar_url, created_at, updated_at` | Dimiliki oleh satu User |
| **Interest** | `id, name, category` | Digunakan dalam User_Interests dan Event_Interests |
| **User_Interests** *(renamed dari User_Skills)* | `id, user_id, interest_id` | Menghubungkan User dengan Interest (M-N) |
| **Skill** *(baru)* | `id, name, category` | Digunakan dalam User_Skills_Actual dan Event_Skills |
| **User_Skills_Actual** *(baru)* | `id, user_id, skill_id` | Menghubungkan User dengan Skill yang sebenarnya (M-N) |
| **Event** | `id, organizer_id, title, description, location, quota, start_date, end_date, status, approved_by, approved_at, impact_metric_template, created_at, updated_at` | Dimiliki oleh satu Organizer; memiliki banyak Event_Skills, Event_Interests, Applications |
| **Event_Skills** | `id, event_id, skill_id` | Menghubungkan Event dengan Skill (M-N) |
| **Event_Interests** | `id, event_id, interest_id` | Menghubungkan Event dengan Interest (M-N) |
| **Application** | `id, user_id, event_id, status, attended (boolean), impact_value, created_at, updated_at` | Menghubungkan User dengan Event; `attended` dan `impact_value` diisi saat organizer tutup event |
| **ImpactLog** *(baru)* | `id, application_id, metric_label, value, unit, ai_headline, created_at` | Menyimpan dampak spesifik per event per volunteer; `ai_headline` di-generate oleh FR-024 |
| **SkillProgress** *(baru)* | `id, user_id, skill_id, xp_total, level, updated_at` | Menyimpan progress skill volunteer; diperbarui setiap event selesai berdasarkan skill tag event |

### 7.2 Data Retention & Privacy Policy

| Data | Retensi | Catatan |
|---|---|---|
| Data Akun Aktif | Selama akun aktif | Dihapus 30 hari setelah permintaan penghapusan akun dari pengguna |
| Data Sertifikat Digital & Impact Passport | Permanen (selama platform beroperasi) | Hanya dapat dihapus atas permintaan eksplisit pengguna disertai verifikasi identitas |
| ImpactLog | Permanen (selama akun aktif) | Merupakan inti dari Impact Passport; penghapusan hanya via penghapusan akun |

---

## 8. Revenue Model

> **Prinsip utama:** semua revenue berasal dari sisi supply (organizer) dan B2B (perusahaan), bukan dari volunteer end-user. **Volunteer selalu gratis.**

| Stream | Target | Model | Timeline |
|---|---|---|---|
| Freemium Organizer | NGO & komunitas | Free tier (buat event, terima pendaftar) vs Premium Organizer Rp 200–500rb/bulan (AI matching lebih akurat, analytics, prioritas di rekomendasi) | Beta — Bulan 2 |
| Featured Listing | Organizer premium | Event boost: muncul di posisi teratas rekomendasi volunteer selama X hari | MVP Launch — Bulan 3 |
| B2B Corporate CSR | HR/CSR Manager perusahaan | SaaS dashboard untuk tracking jam volunteer karyawan, laporan CSR otomatis, akses pool volunteer terverifikasi — Rp 5–25 juta/bulan | Post-MVP — Bulan 6+ |
| Sertifikasi Premium | Volunteer | Sertifikat terverifikasi dengan QR code + URL publik Impact Passport untuk CV/beasiswa — gratis versi biasa, berbayar versi 'verified' | Post-MVP — Bulan 6+ |
| B2B Iklan | Produk pihak luar | Penyediaan tempat/label iklan di website ActiVibe | Post-MVP — Bulan 6+ |

---

## 9. Release Planning

### 9.1 Release Roadmap

| Fase | Waktu | Fokus | Exit Criteria |
|---|---|---|---|
| **Alpha** (Internal Testing) | Bulan 1 | Registrasi/Login + OTP, Conversational Onboarding Agent, Manajemen Profil, CRUD Kegiatan Organizer, Pendaftaran Kegiatan Dasar | Zero critical bugs; seluruh Must Have FR lulus pengujian fungsional internal |
| **Beta** (Closed Pilot) | Bulan 2 | Sistem Rekomendasi AI dengan Predictive Match Score, Dashboard Admin, Sistem Poin & Sertifikat, Skill Progress Tracker, Feedback & Rating, Freemium Organizer tier | ≥ 50 pengguna pilot (25 volunteer + 10 organizer) menyelesaikan alur end-to-end; bug severity ≤ Medium diselesaikan |
| **MVP Launch** (Public) | Bulan 3 | Rilis publik seluruh fitur In-Scope termasuk Impact Passport + share ke medsos; Featured Listing live; monitoring metrik sukses aktif | Onboarding completion rate ≥ 75%; waktu respons < 3 detik; tidak ada critical/blocker bug aktif |
| **Post-MVP Iteration** | Bulan 4–6 | Penyempurnaan algoritma rekomendasi dari data riil; Proactive Matching Agent; Retention Agent; B2B Corporate CSR dashboard; sertifikasi premium | Match satisfaction rate ≥ 75%; repeat participation rate ≥ 40%; first paying B2B client |

### 9.2 Go-to-Market Strategy

| Channel | Target Segment | Aktivitas |
|---|---|---|
| Kampus & Universitas | Volunteer (17–25) | Sosialisasi di UKM sosial, event kampus, unit kegiatan mahasiswa. Impact Passport sebagai value proposition untuk portofolio MBKM. |
| Komunitas NGO & Yayasan | Organizer | Onboarding langsung bersama 5–10 NGO pilot di fase Beta; sesi pelatihan. Freemium tier sebagai entry point. |
| Media Sosial (Instagram, TikTok) | Volunteer Gen Z | Konten edukatif tentang volunteer dan impact; UGC dari Impact Passport yang dibagikan volunteer; testimoni peserta Beta. |
| Partnership Pemerintah Daerah * | Organizer & Stakeholder | Integrasi program volunteer pemerintah ke platform. *Catatan: ini GTM channel fase awal. Integrasi teknis membutuhkan scope tersendiri di v3.0.* |

### 9.3 Risk Register

| Risiko | Prob. | Dampak | Strategi Mitigasi |
|---|---|---|---|
| Data profil pengguna tidak lengkap → menurunkan kualitas rekomendasi | Tinggi | Tinggi | Conversational Onboarding Agent menggantikan form panjang (FR-023); progress bar gamifikasi; insentif poin bonus untuk melengkapi profil |
| Organizer tidak aktif mempublikasikan kegiatan (chicken-and-egg) | Sedang | Tinggi | Rekrut 5–10 NGO anchor partner sebelum public launch; Freemium tier tanpa biaya; Proactive Matching Agent membuat organizer langsung merasa dapat volunteer relevan |
| Akurasi rekomendasi AI rendah pada tahap awal (cold-start) | Tinggi | Sedang | Rule-based matching + Predictive Match Score sebagai fallback; explicit feedback loop; migrate ke ML-based setelah data cukup (bulan 6+) |
| Breach data pengguna | Rendah | Sangat Tinggi | Enkripsi end-to-end (TLS 1.2+, AES-256), penetration testing pra-launch, audit keamanan berkala |
| Platform tidak sustainable secara finansial *(risiko baru)* | Sedang | Tinggi | Revenue model Freemium Organizer + B2B Corporate CSR dibangun dari MVP. Target: first paying customer bulan 6. |

---

*— End of Document —*
*ActiVibe PRD v2.0 | Saw iT Team | Confidential Draft*
