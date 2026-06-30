# ActiVibe — PRD Addendum v2.1: Organizer / NGO Dashboard

> **Organization / NGO Features (Rosterfy-Inspired).** Memperdalam dashboard Organizer/NGO ActiVibe agar lebih operasional dan setara ekspektasi platform volunteer management modern (mis. Rosterfy), tanpa menambahkan kompleksitas multi-event operational view.

| Field | Value |
|---|---|
| **Version** | v2.1 Draft Addendum |
| **Tanggal** | 24 Juni 2026 |
| **Status** | Draft — Pending Review |
| **Berdasarkan** | [PRD-ActiVibe-v2.0.md](PRD-ActiVibe-v2.0.md) |
| **FR Range Baru** | FR-028 – FR-052 |

> ⚠️ **Catatan untuk Claude Code:** Dokumen ini **addendum**, bukan pengganti PRD utama. FR terakhir di seluruh project (v2.0 + addendum ini) adalah **FR-052**. Saat menambah FR baru — di PRD utama maupun addendum lain — cek dua dokumen ini supaya nomor tidak collide.

> **Posisi dokumen ini:** hanya mencakup domain **Organization / Organizer**, dan dimaksudkan untuk **memperluas Section 4.2 (FR Table: Organizer)** serta workflow organizer pada PRD utama. Problem Statement, Objectives, Scope MVP, Data Model umum, Revenue Model, dan Release Planning **tidak diulang di sini** — rujuk [PRD-ActiVibe-v2.0.md](PRD-ActiVibe-v2.0.md).

---

# PART O — ORGANIZATION / NGO SCOPE

## O.1 Purpose

Patch ini menambahkan fitur-fitur organisasi yang dibutuhkan agar NGO/komunitas tidak hanya bisa **mem-posting event dan menerima volunteer**, tetapi juga bisa **mengelola volunteer lifecycle secara operasional** dari tahap publikasi event, seleksi pelamar, penugasan role/shift, komunikasi, check-in, hingga penutupan event dan distribusi dampak/sertifikat.

## O.2 Goals

Dengan patch ini, dashboard organizer ActiVibe harus mampu:

1. **Mengurangi beban operasional organizer** dalam mengelola volunteer sebelum, saat, dan sesudah event.
2. **Menyediakan sistem assignment volunteer yang lebih rapi** melalui role dan shift per event.
3. **Menyediakan kontrol komunikasi** antara organizer dan volunteer dalam satu tempat.
4. **Menyediakan proses attendance dan close-event** yang lebih terstruktur.
5. **Menyediakan visibilitas kinerja event** melalui dashboard KPI organizer.
6. **Tetap selaras dengan positioning ActiVibe** sebagai platform volunteer berbasis AI + Impact Passport.

## O.3 Scope Boundaries

### Included in this patch

- Dashboard organizer overview
- Event creation & event settings
- Volunteer application management
- Volunteer lifecycle status
- Role & shift management per event
- Volunteer assignment
- Broadcast & reminder communication
- Pre-event requirement management
- QR / manual attendance check-in
- Event close flow & organizer analytics

### Explicitly excluded from this patch

- Multi-event operational board lintas banyak event secara kompleks
- Corporate CSR dashboard
- Volunteer-to-volunteer chat
- Finance / payroll / reimbursement management
- Cross-organization volunteer exchange

---

# PART O1 — ORGANIZATION FUNCTIONAL REQUIREMENTS

## O1.1 FR Table: Organizer / NGO (Extended)

> **Catatan numbering:** agar aman terhadap PRD utama yang saat ini berhenti di FR-027, seluruh FR organizer tambahan dimulai dari **FR-028**.

| FR ID | Actor | The system shall… | Condition / Trigger | Priority | MoSCoW |
|---|---|---|---|---|---|
| FR-028 | Organizer | Menampilkan **Organizer Dashboard Overview** berisi ringkasan event aktif, pendaftar pending, volunteer diterima, volunteer hadir, event yang perlu ditutup, dan total dampak organisasi | Ketika organizer membuka dashboard utama | High | M |
| FR-029 | Organizer | Memungkinkan organizer membuat **role/position** di dalam satu event (mis. Registrasi, Dokumentasi, Mentor, Konsumsi) beserta deskripsi singkat dan kebutuhan skill per role | Ketika organizer membuka halaman detail event dan memilih 'Kelola Role' | High | M |
| FR-030 | Organizer | Memungkinkan organizer membuat **shift** untuk setiap role dalam event, termasuk tanggal, jam mulai, jam selesai, kuota volunteer, dan titik/lokasi tugas | Ketika organizer menambahkan jadwal operasional event | High | M |
| FR-031 | System | Menyimpan relasi antara event, role, dan shift sehingga volunteer dapat ditempatkan pada penugasan yang spesifik, bukan hanya pada level event | Setelah organizer menyimpan role/shift | High | M |
| FR-032 | Organizer | Menampilkan **pipeline pendaftar volunteer** dengan status minimal: `Applied`, `Under Review`, `Accepted`, `Rejected`, `Waitlisted`, `Checked-in`, `Completed`, `No-show` | Ketika organizer membuka halaman manajemen pendaftar event | High | M |
| FR-033 | Organizer | Memungkinkan organizer mengubah status volunteer secara individual maupun batch pada pipeline pendaftar | Ketika organizer memilih satu atau lebih volunteer dari daftar pendaftar | High | M |
| FR-034 | Organizer | Menampilkan **Volunteer Detail Drawer / Page** yang memuat profil ringkas volunteer, skill, minat, riwayat event di ActiVibe, match score, dan catatan organizer | Ketika organizer membuka detail volunteer dari daftar pendaftar | High | M |
| FR-035 | Organizer | Memungkinkan organizer menambahkan **internal notes** pada volunteer untuk keperluan koordinasi internal organisasi | Ketika organizer membuka detail volunteer dan mengisi kolom catatan | Medium | S |
| FR-036 | Organizer | Memungkinkan organizer memfilter volunteer berdasarkan skill, minat, match score, status pipeline, ketersediaan waktu, dan role yang dilamar | Ketika organizer menggunakan filter pada halaman volunteer/event applicants | High | M |
| FR-037 | Organizer | Memungkinkan organizer melakukan **assignment volunteer ke role dan shift tertentu** setelah volunteer diterima | Ketika organizer membuka halaman assignment pada event | High | M |
| FR-038 | System | Mengirimkan notifikasi ke volunteer ketika mereka di-assign ke role/shift tertentu, termasuk nama role, tanggal, jam, lokasi, dan instruksi singkat | Setelah organizer menyimpan assignment volunteer | High | M |
| FR-039 | Organizer | Memungkinkan organizer membuat **pre-event requirements** per event atau per role, seperti checklist briefing, dokumen yang wajib dibaca, atau konfirmasi persetujuan aturan kegiatan | Ketika organizer mengatur persiapan event | High | M |
| FR-040 | Volunteer / System | Menampilkan status pemenuhan requirement volunteer (`Not Started`, `In Progress`, `Completed`) kepada organizer untuk setiap volunteer yang telah diterima | Ketika organizer membuka daftar volunteer accepted / assigned | High | M |
| FR-041 | Organizer | Memungkinkan organizer mengirim **broadcast message** ke volunteer berdasarkan segmentasi minimal: semua pendaftar event, volunteer accepted, volunteer pada role tertentu, atau volunteer pada shift tertentu | Ketika organizer membuka modul komunikasi event | High | M |
| FR-042 | System | Mengirim **reminder otomatis** kepada volunteer accepted sebelum event dimulai (mis. H-1 dan/atau 3 jam sebelum shift dimulai) dengan konten yang dapat dikustomisasi organizer | Setelah organizer mengaktifkan reminder event | Medium | S |
| FR-043 | Organizer | Menampilkan **Communication Log** berisi riwayat broadcast, reminder, waktu kirim, target penerima, dan status pengiriman | Ketika organizer membuka halaman komunikasi event | Medium | S |
| FR-044 | Organizer | Memungkinkan organizer melakukan **check-in volunteer** saat hari H melalui pemindaian QR atau konfirmasi manual oleh panitia | Ketika volunteer hadir di lokasi event / shift | High | M |
| FR-045 | System | Menyimpan data attendance per volunteer yang mencakup waktu check-in, metode check-in (QR/manual), event, role, dan shift | Setelah check-in berhasil | High | M |
| FR-046 | Organizer | Menampilkan daftar volunteer yang **belum check-in**, **sudah check-in**, dan **no-show** pada hari pelaksanaan event | Ketika organizer membuka halaman attendance event | High | M |
| FR-047 | Organizer | Menampilkan **Event Operations Summary** untuk satu event yang memuat jumlah volunteer accepted, assigned, checked-in, no-show, completion rate requirement, dan total impact sementara | Ketika organizer membuka halaman detail event | High | M |
| FR-048 | Organizer | Memungkinkan organizer menutup event melalui **enhanced 5-step close event flow** yang mencakup attendance final, impact input, preview output volunteer, final confirmation, dan post-event summary | Ketika organizer memilih aksi `Tutup Event` pada event yang selesai | High | M |
| FR-049 | System | Setelah event ditutup, memperbarui status volunteer ke `Completed` atau `No-show` sesuai attendance final dan hasil konfirmasi organizer | Setelah FR-048 Step 5 dikonfirmasi | High | M |
| FR-050 | Organizer | Menampilkan **Organizer Analytics & Reports** pada level organisasi, minimal mencakup jumlah event dipublikasikan, total applicants, acceptance rate, attendance rate, no-show rate, total volunteer hours, dan total impact agregat | Ketika organizer membuka halaman laporan / analytics | High | M |
| FR-051 | Organizer | Memungkinkan organizer mengekspor data volunteer, attendance, assignment, dan impact event dalam format CSV | Ketika organizer memilih menu export dan rentang event/waktu | Medium | S |
| FR-052 | System | Menyimpan audit log untuk aksi penting organizer seperti publish event, ubah status volunteer, kirim broadcast, assignment shift, dan close event | Ketika terjadi aksi penting di dashboard organizer | High | M |

> FR-048/FR-049 **menggantikan** FR-017/FR-017b pada PRD v2.0 (lihat [O2.7](#o27-enhanced-close-event-flow-fr-048-fr-049)). FR lain di tabel ini melengkapi FR-011–FR-016 yang sudah ada di v2.0, bukan menggantikannya.

---

# PART O2 — DETAILED FEATURE DEFINITIONS

## O2.1 Organizer Dashboard Overview (FR-028)

Dashboard utama organizer harus menampilkan ringkasan operasional yang langsung membantu tindakan, bukan sekadar statistik pasif.

### Minimum cards / sections

1. **Event Aktif** — jumlah event dengan status `Published` atau `Ongoing`
2. **Pendaftar Pending Review** — total volunteer yang statusnya `Applied` / `Under Review`
3. **Volunteer Accepted** — total volunteer yang sudah diterima namun belum selesai
4. **Perlu Ditutup** — event yang tanggal berakhirnya telah lewat tetapi belum menjalankan close-event flow
5. **Attendance Hari Ini** — volunteer yang check-in hari ini vs total expected
6. **Total Impact Organisasi** — agregat dari `ImpactLog` semua event organizer
7. **Recent Activity Feed** — aktivitas penting seperti volunteer baru mendaftar, volunteer assigned ke shift, atau sertifikat batch selesai dibuat

### Organizer quick actions

Dashboard harus menyediakan tombol cepat:

- `Buat Event Baru`
- `Lihat Pendaftar Pending`
- `Kelola Attendance Hari Ini`
- `Tutup Event`
- `Kirim Broadcast`

## O2.2 Role & Shift Management (FR-029, FR-030, FR-031, FR-037)

Fitur ini membuat event organizer tidak berhenti di level "satu event = satu kumpulan volunteer", tetapi bisa dipecah ke penugasan yang lebih realistis.

### A. Role

Role adalah jenis posisi volunteer di dalam event.

#### Contoh role

- Registrasi
- Dokumentasi
- Mentor Anak
- Logistik
- Konsumsi
- Fasilitator Lapangan

#### Field minimum untuk Role

- `role_name`
- `role_description`
- `required_skills[]`
- `optional_skills[]`
- `max_volunteers`
- `notes_for_volunteer`

### B. Shift

Shift adalah slot waktu operasional untuk sebuah role.

#### Field minimum untuk Shift

- `role_id`
- `shift_date`
- `start_time`
- `end_time`
- `quota`
- `location_point`
- `check_in_window_start`
- `check_in_window_end`
- `instructions`

### C. Assignment

Volunteer yang sudah accepted dapat di-assign ke satu role dan satu shift tertentu.

#### Aturan minimum

- Organizer dapat assign satu volunteer ke satu atau lebih shift jika event membutuhkan
- Sistem harus menampilkan warning jika volunteer di-assign ke shift yang waktunya bentrok
- Assignment harus terlihat pada dashboard volunteer dan organizer

## O2.3 Volunteer Pipeline & Detail View (FR-032 s.d. FR-036)

Organizer membutuhkan kontrol terhadap status volunteer dari awal daftar sampai selesai kegiatan.

### A. Status pipeline minimum

- `Applied`
- `Under Review`
- `Accepted`
- `Rejected`
- `Waitlisted`
- `Checked-in`
- `Completed`
- `No-show`

### B. Volunteer Detail View minimum

Saat organizer membuka detail volunteer, sistem menampilkan:

#### Identitas & kecocokan

- nama volunteer
- avatar
- domisili / lokasi
- match score
- alasan singkat kecocokan (reasoning)
- role yang dilamar / role yang cocok

#### Profil & kemampuan

- daftar minat
- daftar skill
- availability / ketersediaan
- pengalaman volunteer sebelumnya di ActiVibe
- Impact Passport ringkas (opsional preview)
- total volunteer hours sebelumnya

#### Data operasional

- status pipeline saat ini
- requirement completion status
- assignment role / shift
- attendance status
- internal notes organizer

### C. Bulk actions minimum

Organizer harus dapat melakukan aksi massal terhadap banyak volunteer sekaligus untuk:

- `Accept`
- `Reject`
- `Move to Waitlist`
- `Assign to Role/Shift`
- `Send Broadcast`

## O2.4 Pre-Event Requirements (FR-039, FR-040)

Organizer harus bisa meminta volunteer menyelesaikan kewajiban tertentu sebelum hari H.

### Jenis requirement minimum

1. **Read & acknowledge** — volunteer wajib membaca aturan / SOP / briefing dan menekan tombol "Saya mengerti".
2. **Checklist completion** — contoh: sudah bergabung ke grup koordinasi, sudah membawa perlengkapan wajib, sudah membaca rundown kegiatan.
3. **Upload / attach proof** (opsional post-MVP jika terlalu berat) — misalnya surat izin, dokumen pendukung, atau bukti tertentu.

### Status requirement

- `Not Started`
- `In Progress`
- `Completed`

### Tampilan organizer

Organizer harus bisa melihat siapa saja volunteer yang:

- belum menyelesaikan requirement
- sudah menyelesaikan semua requirement
- perlu di-remind

## O2.5 Communication Center (FR-041, FR-042, FR-043)

Organizer membutuhkan pusat komunikasi sederhana namun terstruktur agar koordinasi tidak sepenuhnya berpindah ke luar platform.

### A. Broadcast targets minimum

Organizer dapat memilih target pesan ke:

- semua pendaftar pada event
- semua volunteer accepted
- volunteer dengan role tertentu
- volunteer dengan shift tertentu
- volunteer yang belum menyelesaikan requirement

### B. Jenis pesan minimum

- informasi umum event
- perubahan jam / lokasi
- reminder perlengkapan
- reminder requirement
- ucapan terima kasih / post-event follow-up

### C. Communication log minimum

Setiap broadcast harus menyimpan:

- `message_title`
- `message_body`
- `target_segment`
- `delivery_channel`
- `sent_at`
- `created_by`

### D. Reminder automation minimum

Organizer dapat mengaktifkan reminder otomatis seperti:

- H-1 sebelum event
- 3 jam sebelum shift
- reminder requirement belum selesai

## O2.6 Attendance / Check-in (FR-044, FR-045, FR-046)

Attendance harus menjadi fitur operasional yang eksplisit, bukan sekadar checkbox manual di akhir event.

### A. Cara check-in minimum

1. **QR Check-in** — volunteer menunjukkan QR/tiket event → panitia scan → status hadir tercatat.
2. **Manual check-in** — organizer/panitia memilih volunteer dari daftar lalu klik hadir.

### B. Data attendance minimum

- `volunteer_id`
- `event_id`
- `role_id`
- `shift_id`
- `check_in_at`
- `check_in_method` (`qr` / `manual`)
- `checked_in_by` (opsional untuk manual)

### C. Attendance views minimum

Organizer harus bisa melihat:

- semua volunteer expected hari itu
- volunteer sudah hadir
- volunteer belum hadir
- volunteer no-show
- volunteer per shift

## O2.7 Enhanced Close Event Flow (FR-048, FR-049)

Patch ini menggantikan close-event flow lama (FR-017 di PRD v2.0) dengan versi yang lebih organizer-centric, tetapi tetap kompatibel dengan Impact Passport.

### 5-Step Close Event Flow

#### Step 1 — Final Attendance Review

Organizer melihat seluruh volunteer accepted / assigned dan mengonfirmasi status final:

- hadir
- no-show
- dibatalkan organizer
- dibatalkan volunteer

#### Step 2 — Input Impact Value

Sistem menampilkan `impact_metric_template` event beserta nilai aktual yang harus diisi organizer. Jika event memiliki beberapa role yang berkontribusi pada output berbeda, organizer dapat menambahkan catatan konteks per role.

#### Step 3 — Review Volunteer Outcomes

Organizer melihat ringkasan volunteer yang akan menerima:

- completion status
- poin
- sertifikat
- update Impact Passport
- update skill progress

#### Step 4 — Preview Final Output

Sistem menampilkan preview satu volunteer contoh:

- AI-generated headline
- ringkasan impact
- preview sertifikat
- role / shift yang tercatat
- attendance status

#### Step 5 — Confirm & Close

Saat organizer menekan konfirmasi final:

- volunteer dengan attendance valid ditandai `Completed`
- volunteer tidak hadir ditandai `No-show`
- ImpactLog dibuat / diperbarui
- sertifikat batch di-generate
- Skill Progress diperbarui
- notifikasi personal dikirim

## O2.8 Organizer Analytics & Reporting (FR-050, FR-051)

Analytics organizer harus fokus pada **kinerja event dan volunteer operations**, bukan hanya vanity metrics.

### KPI minimum

1. **Total Events Published**
2. **Total Applicants**
3. **Acceptance Rate**
4. **Attendance Rate**
5. **No-show Rate**
6. **Total Volunteer Hours**
7. **Total Volunteers Completed**
8. **Total Impact Aggregate** — contoh: total bibit, total kg sampah, total anak diajar — sesuai `impact_metric_template`

### Filter minimum

Organizer dapat melihat analytics berdasarkan:

- event tertentu
- rentang tanggal
- status event

### Export minimum

Data yang bisa diekspor:

- daftar volunteer per event
- attendance log
- assignment role/shift
- impact summary

---

# PART O3 — ORGANIZATION USER WORKFLOWS

## O3.1 Workflow: Organizer Creates Event with Roles & Shifts

- **Actors:** Organizer
- **FRs covered:** FR-011, FR-012, FR-029, FR-030, FR-031

**Ideal Path:**

1. Organizer membuka menu `Buat Event`.
2. Organizer mengisi data dasar event: judul, deskripsi, lokasi, tanggal, kuota, skill, interest, `impact_metric_template`.
3. Organizer masuk ke section `Role & Shift`.
4. Organizer membuat satu atau lebih role untuk event.
5. Organizer menambahkan shift pada masing-masing role.
6. Organizer meninjau ringkasan event.
7. Organizer menekan `Publikasikan`.
8. Sistem menyimpan event, role, dan shift; event tampil di katalog volunteer.

## O3.2 Workflow: Organizer Reviews Applicants & Assigns Volunteers

- **Actors:** Organizer
- **FRs covered:** FR-013, FR-014, FR-016, FR-032, FR-033, FR-034, FR-036, FR-037, FR-038

**Ideal Path:**

1. Organizer membuka event dan masuk ke tab `Applicants`.
2. Sistem menampilkan daftar pendaftar dengan match score dan status pipeline.
3. Organizer memfilter volunteer berdasarkan skill, minat, availability, atau role.
4. Organizer membuka detail volunteer untuk melihat profil ringkas dan riwayat.
5. Organizer menerima volunteer terpilih.
6. Organizer mengubah status volunteer ke `Accepted`.
7. Organizer membuka tab `Assignments`.
8. Organizer menempatkan volunteer ke role dan shift tertentu.
9. Sistem mengirim notifikasi assignment ke volunteer.

## O3.3 Workflow: Organizer Manages Requirements & Broadcasts Reminder

- **Actors:** Organizer
- **FRs covered:** FR-039, FR-040, FR-041, FR-042, FR-043

**Ideal Path:**

1. Organizer membuka event lalu masuk ke tab `Requirements`.
2. Organizer membuat daftar requirement pra-event.
3. Volunteer yang accepted melihat requirement di dashboard mereka.
4. Organizer memantau volunteer mana yang belum menyelesaikan requirement.
5. Organizer membuka tab `Communication`.
6. Organizer memilih segment "Volunteer accepted yang belum complete requirement".
7. Organizer mengirim broadcast reminder.
8. Sistem menyimpan log komunikasi dan mengirim reminder ke target volunteer.

## O3.4 Workflow: Organizer Handles Attendance on Event Day

- **Actors:** Organizer / Volunteer
- **FRs covered:** FR-044, FR-045, FR-046

**Ideal Path:**

1. Pada hari H, organizer membuka halaman `Attendance`.
2. Volunteer datang ke lokasi dan menunjukkan QR / tiket volunteer.
3. Panitia scan QR atau check-in manual dari daftar volunteer.
4. Sistem memperbarui status kehadiran volunteer secara real-time.
5. Organizer dapat melihat siapa yang sudah hadir, siapa yang belum, dan siapa yang berpotensi no-show.

## O3.5 Workflow: Organizer Closes Event and Finalizes Volunteer Outcomes

- **Actors:** Organizer
- **FRs covered:** FR-017, FR-017b, FR-024, FR-025, FR-048, FR-049, FR-050

**Ideal Path:**

1. Setelah event selesai, organizer memilih `Tutup Event`.
2. Organizer melakukan final attendance review.
3. Organizer mengisi nilai impact aktual.
4. Organizer memeriksa ringkasan volunteer outcome.
5. Organizer melihat preview output volunteer.
6. Organizer menekan `Confirm & Close`.
7. Sistem memperbarui status volunteer, membuat ImpactLog, meng-generate sertifikat batch, memperbarui Skill Progress, dan mengirim notifikasi personal.
8. Organizer dapat melihat hasil akhir di halaman analytics / event summary.

---

# PART O4 — ORGANIZATION DASHBOARD INFORMATION ARCHITECTURE

## O4.1 Recommended Organizer Sidebar Structure

Struktur minimum dashboard organizer ActiVibe:

1. **Overview**
2. **Events**
   - All Events
   - Create Event
3. **Applicants**
4. **Assignments**
5. **Attendance**
6. **Communication**
7. **Reports & Impact**
8. **Organization Settings**

## O4.2 Event Detail Tabs

Saat organizer membuka satu event, struktur tab minimum:

1. **Overview** — ringkasan event, kuota, timeline, KPI event
2. **Applicants** — daftar pendaftar + pipeline status + filter + bulk actions
3. **Roles & Shifts** — definisi role, jadwal shift, assignment summary
4. **Requirements** — daftar requirement dan status completion volunteer
5. **Attendance** — daftar hadir, QR/manual check-in, no-show
6. **Communication** — broadcast, reminder, communication log
7. **Impact & Close Event** — input impact, preview output, close event flow, event summary

---

# PART O5 — DATA MODEL ADDITIONS (ORGANIZER DOMAIN)

## O5.1 New / Extended Entities

> Entitas berikut **menambah** Core Data Entities di Section 7.1 PRD v2.0 (User, Event, Application, ImpactLog, dst.) — bukan menggantikannya.

| Entity | Main Attributes | Relation |
|---|---|---|
| **EventRole** | `id, event_id, role_name, role_description, max_volunteers, notes_for_volunteer` | Satu Event memiliki banyak Role |
| **EventRoleSkill** | `id, event_role_id, skill_id, requirement_type (required/optional)` | Role dapat memiliki beberapa skill requirement |
| **EventShift** | `id, event_role_id, shift_date, start_time, end_time, quota, location_point, instructions` | Satu Role memiliki banyak Shift |
| **VolunteerAssignment** | `id, application_id, event_role_id, event_shift_id, assigned_at, assigned_by` | Menghubungkan volunteer accepted ke role dan shift |
| **EventRequirement** | `id, event_id, title, type, description, is_mandatory` | Requirement pra-event milik Event |
| **VolunteerRequirementStatus** | `id, requirement_id, application_id, status, completed_at` | Menyimpan progress requirement volunteer |
| **OrganizerNote** | `id, organizer_id, application_id, note, created_at` | Catatan internal organizer untuk volunteer tertentu |
| **CommunicationLog** | `id, event_id, title, message, target_segment, delivery_channel, sent_at, sent_by` | Riwayat broadcast / reminder |
| **AttendanceLog** | `id, application_id, event_role_id, event_shift_id, checked_in_at, method, checked_in_by` | Log kehadiran volunteer |

---

# PART O6 — ACCEPTANCE NOTES FOR MVP

## O6.1 MVP Prioritization Notes

Jika perlu dipangkas untuk menjaga scope MVP, urutan prioritas organizer adalah:

### Must keep

- FR-028 Dashboard Overview
- FR-029–031 Role & Shift
- FR-032–038 Applicant pipeline + assignment
- FR-039–040 Requirements
- FR-041 Broadcast
- FR-044–046 Attendance
- FR-048–049 Enhanced Close Event Flow
- FR-050 Organizer Analytics

### Can simplify if needed

- FR-035 internal notes → bisa dibuat sangat sederhana
- FR-042 automated reminder → bisa dimulai dari manual broadcast + template reminder
- FR-043 communication log → versi dasar dulu
- FR-051 export → cukup CSV basic
- FR-052 audit log organizer → bisa dibuat backend-first tanpa UI kompleks

---

*— End of Addendum —*
*ActiVibe PRD v2.1 Draft Addendum — Organization / NGO Only | Saw iT Team | Confidential Draft*
