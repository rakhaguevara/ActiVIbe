import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import AccountSidebar from '../../components/AccountSidebar'
import {
  getInterests,
  getSkills,
  getMyProfile,
  updateMyProfile,
  uploadCv,
  deleteCv,
  API_URL,
  MAX_CV_SIZE_BYTES,
  type Availability,
  type Gender,
  type Motivation,
  type TaxonomyItem,
} from '../../lib/profileApi'
import { loadDraft, saveDraft, clearDraft } from '../../lib/formDraft'
import { getMySubscription, type MySubscription } from '../../lib/subscriptionApi'
import './SettingsPage.css'

// Field yang dipersist sbg draft lokal — SENGAJA TIDAK termasuk newPassword
// (kredensial, jangan pernah masuk localStorage) dan deleteConfirmText (teks
// konfirmasi aksi destruktif, aneh & berisiko kalau muncul lagi otomatis
// setelah refresh). CV juga dikecualikan krn upload-nya langsung tersimpan
// server-side, tidak ada "isian belum submit" yang perlu dipertahankan.
interface SettingsDraft {
  name: string
  email: string
  phone: string
  bio: string
  motivation: Motivation | null
  selectedInterestIds: string[]
  selectedSkillIds: string[]
  availability: Availability | null
  gender: Gender | null
  education: string
  passportPublic: boolean
}

const MAX_EDUCATION_LENGTH = 200

function formatFileSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

const MOTIVATION_OPTIONS: { value: Motivation; label: string }[] = [
  { value: 'CAREER', label: 'Pengembangan karier & portofolio' },
  { value: 'SOCIAL', label: 'Membangun relasi & komunitas' },
  { value: 'VALUES', label: 'Sejalan dengan nilai-nilai hidupku' },
  { value: 'SKILL_GROWTH', label: 'Belajar & mengasah skill baru' },
]

const AVAILABILITY_OPTIONS: { value: Availability; label: string }[] = [
  { value: 'WEEKDAY', label: 'Hari kerja (Senin–Jumat)' },
  { value: 'WEEKEND', label: 'Akhir pekan (Sabtu–Minggu)' },
  { value: 'BOTH', label: 'Keduanya, aku fleksibel' },
]

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'FEMALE', label: 'Perempuan' },
  { value: 'MALE', label: 'Laki-laki' },
]

function groupByCategory(items: TaxonomyItem[]): [string, TaxonomyItem[]][] {
  const map = new Map<string, TaxonomyItem[]>()
  for (const item of items) {
    const group = map.get(item.category) ?? []
    group.push(item)
    map.set(item.category, group)
  }
  return Array.from(map.entries())
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  const draftKey = `volunteer-settings:${user?.id ?? 'anon'}`
  const [draft] = useState(() => loadDraft<SettingsDraft>(draftKey))

  // Profil diri (belum ada endpoint update akun — mock lokal, konsisten dgn organizer/SettingsPage)
  const [name, setName] = useState(() => draft?.name ?? user?.name ?? '')
  const [email, setEmail] = useState(() => draft?.email ?? user?.email ?? '')
  const [phone, setPhone] = useState(() => draft?.phone ?? '')
  const [personalSaved, setPersonalSaved] = useState(false)

  // Cerita & motivasi (real — profileApi)
  const [bio, setBio] = useState('')
  const [motivation, setMotivation] = useState<Motivation | null>(null)
  const [isSavingBio, setIsSavingBio] = useState(false)
  const [bioSaved, setBioSaved] = useState(false)

  // Minat & skill (real — profileApi)
  const [interestsAll, setInterestsAll] = useState<TaxonomyItem[]>([])
  const [skillsAll, setSkillsAll] = useState<TaxonomyItem[]>([])
  const [selectedInterestIds, setSelectedInterestIds] = useState<Set<string>>(new Set())
  const [selectedSkillIds, setSelectedSkillIds] = useState<Set<string>>(new Set())
  const [isSavingTags, setIsSavingTags] = useState(false)
  const [tagsSaved, setTagsSaved] = useState(false)

  // Ketersediaan (real — profileApi)
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [isSavingAvailability, setIsSavingAvailability] = useState(false)
  const [availabilitySaved, setAvailabilitySaved] = useState(false)

  // Jenis kelamin (real — profileApi). Ditanyakan wajib di OnboardingModal,
  // tapi section ini tetap ada supaya user yang sudah onboarding SEBELUM
  // fitur "women respect" ada bisa isi/ubah belakangan tanpa perlu re-onboarding.
  const [gender, setGender] = useState<Gender | null>(() => draft?.gender ?? null)
  const [isSavingGender, setIsSavingGender] = useState(false)
  const [genderSaved, setGenderSaved] = useState(false)

  // ActiVibe Plus (real — subscriptionApi)
  const [subscription, setSubscription] = useState<MySubscription | null>(null)

  useEffect(() => {
    getMySubscription().then(setSubscription).catch(() => {})
  }, [])

  // Pendidikan & CV (real — profileApi)
  const [education, setEducation] = useState('')
  const [isSavingEducation, setIsSavingEducation] = useState(false)
  const [educationSaved, setEducationSaved] = useState(false)
  const [cvFileName, setCvFileName] = useState<string | null>(null)
  const [cvUrl, setCvUrl] = useState<string | null>(null)
  const [isCvUploading, setIsCvUploading] = useState(false)
  const [cvError, setCvError] = useState<string | null>(null)

  // Privasi Impact Passport (mock lokal)
  const [passportPublic, setPassportPublic] = useState(() => draft?.passportPublic ?? true)
  const [privacySaved, setPrivacySaved] = useState(false)

  // Keamanan (mock lokal — belum ada endpoint ganti password) — TIDAK dipersist
  const [newPassword, setNewPassword] = useState('')
  const [passwordSaved, setPasswordSaved] = useState(false)

  // Hapus akun (mock lokal, dengan konfirmasi ketik ulang) — TIDAK dipersist
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteRequested, setDeleteRequested] = useState(false)

  useEffect(() => {
    Promise.all([getMyProfile(), getInterests(), getSkills()])
      .then(([profile, interests, skills]) => {
        // Draft (edit yang belum disimpan) menang atas nilai server yang baru
        // di-fetch — kalau tidak, draft langsung ketimpa begitu profil selesai
        // dimuat, bikin fitur "tahan refresh" ini tidak berguna sama sekali.
        setBio(draft?.bio ?? profile.bio ?? '')
        setMotivation(draft?.motivation ?? profile.motivation)
        setAvailability(draft?.availability ?? profile.availability)
        setGender(draft?.gender ?? profile.gender)
        setEducation(draft?.education ?? profile.education ?? '')
        setCvFileName(profile.cvFileName)
        setCvUrl(profile.cvUrl)
        setSelectedInterestIds(new Set(draft?.selectedInterestIds ?? profile.interests.map((i) => i.id)))
        setSelectedSkillIds(new Set(draft?.selectedSkillIds ?? profile.skills.map((s) => s.id)))
        setInterestsAll(interests)
        setSkillsAll(skills)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [draft])

  // Autosave draft lokal — bertahan lintas refresh/pindah halaman, cuma
  // hilang kalau user klik "Buang Perubahan" (lihat handleDiscardDraft).
  useEffect(() => {
    saveDraft<SettingsDraft>(draftKey, {
      name,
      email: email ?? '',
      phone,
      bio,
      motivation,
      selectedInterestIds: Array.from(selectedInterestIds),
      selectedSkillIds: Array.from(selectedSkillIds),
      availability,
      gender,
      education,
      passportPublic,
    })
  }, [
    draftKey,
    name,
    email,
    phone,
    bio,
    motivation,
    selectedInterestIds,
    selectedSkillIds,
    availability,
    gender,
    education,
    passportPublic,
  ])

  const handleDiscardDraft = () => {
    clearDraft(draftKey)
    setName(user?.name ?? '')
    setEmail(user?.email ?? '')
    setPhone('')
    setPassportPublic(true)
    getMyProfile()
      .then((profile) => {
        setBio(profile.bio ?? '')
        setMotivation(profile.motivation)
        setAvailability(profile.availability)
        setGender(profile.gender)
        setEducation(profile.education ?? '')
        setSelectedInterestIds(new Set(profile.interests.map((i) => i.id)))
        setSelectedSkillIds(new Set(profile.skills.map((s) => s.id)))
      })
      .catch(() => {})
  }

  const toggleInterest = (id: string) => {
    setSelectedInterestIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSkill = (id: string) => {
    setSelectedSkillIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSavePersonal = () => {
    setPersonalSaved(true)
    setTimeout(() => setPersonalSaved(false), 2000)
  }

  const handleSaveBio = async () => {
    setIsSavingBio(true)
    try {
      await updateMyProfile({ bio, motivation: motivation ?? undefined })
      setBioSaved(true)
      setTimeout(() => setBioSaved(false), 2000)
    } finally {
      setIsSavingBio(false)
    }
  }

  const handleSaveTags = async () => {
    setIsSavingTags(true)
    try {
      await updateMyProfile({
        interestIds: Array.from(selectedInterestIds),
        skillIds: Array.from(selectedSkillIds),
      })
      setTagsSaved(true)
      setTimeout(() => setTagsSaved(false), 2000)
    } finally {
      setIsSavingTags(false)
    }
  }

  const handleSaveAvailability = async () => {
    if (!availability) return
    setIsSavingAvailability(true)
    try {
      await updateMyProfile({ availability })
      setAvailabilitySaved(true)
      setTimeout(() => setAvailabilitySaved(false), 2000)
    } finally {
      setIsSavingAvailability(false)
    }
  }

  const handleSaveGender = async () => {
    if (!gender) return
    setIsSavingGender(true)
    try {
      await updateMyProfile({ gender })
      setGenderSaved(true)
      setTimeout(() => setGenderSaved(false), 2000)
    } finally {
      setIsSavingGender(false)
    }
  }

  const handleSaveEducation = async () => {
    setIsSavingEducation(true)
    try {
      await updateMyProfile({ education })
      setEducationSaved(true)
      setTimeout(() => setEducationSaved(false), 2000)
    } finally {
      setIsSavingEducation(false)
    }
  }

  const handleCvFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setCvError(null)
    if (file.type !== 'application/pdf') {
      setCvError('CV harus berupa file PDF.')
      return
    }
    if (file.size > MAX_CV_SIZE_BYTES) {
      setCvError(`Ukuran CV maksimal ${formatFileSize(MAX_CV_SIZE_BYTES)}.`)
      return
    }

    setIsCvUploading(true)
    try {
      const profile = await uploadCv(file)
      setCvFileName(profile.cvFileName)
      setCvUrl(profile.cvUrl)
    } catch (err) {
      setCvError(err instanceof Error ? err.message : 'Gagal mengunggah CV, coba lagi.')
    } finally {
      setIsCvUploading(false)
    }
  }

  const handleRemoveCv = async () => {
    setCvError(null)
    setIsCvUploading(true)
    try {
      const profile = await deleteCv()
      setCvFileName(profile.cvFileName)
      setCvUrl(profile.cvUrl)
    } catch (err) {
      setCvError(err instanceof Error ? err.message : 'Gagal menghapus CV, coba lagi.')
    } finally {
      setIsCvUploading(false)
    }
  }

  const handleSavePrivacy = () => {
    setPrivacySaved(true)
    setTimeout(() => setPrivacySaved(false), 2000)
  }

  const handleSavePassword = () => {
    setPasswordSaved(true)
    setNewPassword('')
    setTimeout(() => setPasswordSaved(false), 2000)
  }

  const handleDeleteAccount = () => {
    setDeleteRequested(true)
  }

  if (isLoading) return null

  return (
    <main className="settings-page">
      <AccountSidebar active="pengaturan" />

      <div className="settings-page__content">
        <header className="settings-page__header">
          <div>
            <h1>Pengaturan</h1>
            <p>Kelola profil, minat, ketersediaan, dan privasi Impact Passport-mu.</p>
          </div>
          <button type="button" className="btn btn--outline btn--sm" onClick={handleDiscardDraft}>
            Buang Perubahan
          </button>
        </header>

        <section className="card settings-page__section">
          <h2>Profil Diri</h2>
          <label className="settings-page__field">
            <span>Nama Lengkap</span>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="settings-page__field">
            <span>Email</span>
            <input type="email" value={email ?? ''} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="settings-page__field">
            <span>Nomor Telepon</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08123456789" />
          </label>
          <div className="settings-page__section-footer">
            <button type="button" className="btn btn--primary btn--sm" onClick={handleSavePersonal}>
              Update Informasi Personal
            </button>
            {personalSaved && <span className="settings-page__saved">Tersimpan!</span>}
          </div>
        </section>

        <section className="card settings-page__section">
          <h2>Cerita & Motivasi</h2>
          <p className="settings-page__section-desc">
            Dipakai AI untuk personalisasi rekomendasi kegiatan dan tagline Impact Passport-mu.
          </p>
          <label className="settings-page__field">
            <span>Ceritakan tentang dirimu</span>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Apa yang membuatmu tertarik jadi volunteer?"
              maxLength={500}
            />
          </label>
          <div className="settings-page__chip-group">
            <span className="settings-page__chip-group-label">Motivasi utama</span>
            {MOTIVATION_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={
                  'settings-page__option' + (motivation === option.value ? ' settings-page__option--selected' : '')
                }
              >
                <input
                  type="radio"
                  name="motivation"
                  checked={motivation === option.value}
                  onChange={() => setMotivation(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <div className="settings-page__section-footer">
            <button
              type="button"
              className="btn btn--primary btn--sm"
              disabled={isSavingBio}
              onClick={handleSaveBio}
            >
              {isSavingBio ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            {bioSaved && <span className="settings-page__saved">Tersimpan!</span>}
          </div>
        </section>

        <section className="card settings-page__section">
          <h2>Minat & Skill</h2>
          <p className="settings-page__section-desc">
            Menentukan kegiatan volunteer mana yang direkomendasikan untukmu.
          </p>

          <div className="settings-page__tag-columns">
            <div className="settings-page__tag-column">
              <span className="settings-page__chip-group-label">Minat</span>
              {groupByCategory(interestsAll).map(([category, items]) => (
                <div key={category}>
                  <p className="settings-page__category-heading">{category}</p>
                  {items.map((item) => {
                    const checked = selectedInterestIds.has(item.id)
                    return (
                      <label
                        key={item.id}
                        className={'settings-page__option' + (checked ? ' settings-page__option--selected' : '')}
                      >
                        <input type="checkbox" checked={checked} onChange={() => toggleInterest(item.id)} />
                        <span>{item.name}</span>
                      </label>
                    )
                  })}
                </div>
              ))}
            </div>

            <div className="settings-page__tag-column">
              <span className="settings-page__chip-group-label">Skill</span>
              {groupByCategory(skillsAll).map(([category, items]) => (
                <div key={category}>
                  <p className="settings-page__category-heading">{category}</p>
                  {items.map((item) => {
                    const checked = selectedSkillIds.has(item.id)
                    return (
                      <label
                        key={item.id}
                        className={'settings-page__option' + (checked ? ' settings-page__option--selected' : '')}
                      >
                        <input type="checkbox" checked={checked} onChange={() => toggleSkill(item.id)} />
                        <span>{item.name}</span>
                      </label>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="settings-page__section-footer">
            <button
              type="button"
              className="btn btn--primary btn--sm"
              disabled={isSavingTags}
              onClick={handleSaveTags}
            >
              {isSavingTags ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            {tagsSaved && <span className="settings-page__saved">Tersimpan!</span>}
          </div>
        </section>

        <section className="card settings-page__section">
          <h2>Ketersediaan</h2>
          <p className="settings-page__section-desc">Kapan kamu biasanya available untuk kegiatan volunteer?</p>
          <div className="settings-page__chip-group">
            {AVAILABILITY_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={
                  'settings-page__option' + (availability === option.value ? ' settings-page__option--selected' : '')
                }
              >
                <input
                  type="radio"
                  name="availability"
                  checked={availability === option.value}
                  onChange={() => setAvailability(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <div className="settings-page__section-footer">
            <button
              type="button"
              className="btn btn--primary btn--sm"
              disabled={isSavingAvailability || !availability}
              onClick={handleSaveAvailability}
            >
              {isSavingAvailability ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            {availabilitySaved && <span className="settings-page__saved">Tersimpan!</span>}
          </div>
        </section>

        <section className="card settings-page__section">
          <h2>Jenis Kelamin</h2>
          <p className="settings-page__section-desc">
            Dipakai fitur informasi keamanan & kenyamanan (jumlah peserta perempuan dan gender penyelenggara) di
            halaman pendaftaran kegiatan — hanya tampil untuk kamu, tidak ditampilkan ke user lain.
          </p>
          <div className="settings-page__chip-group">
            {GENDER_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={'settings-page__option' + (gender === option.value ? ' settings-page__option--selected' : '')}
              >
                <input
                  type="radio"
                  name="gender"
                  checked={gender === option.value}
                  onChange={() => setGender(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <div className="settings-page__section-footer">
            <button
              type="button"
              className="btn btn--primary btn--sm"
              disabled={isSavingGender || !gender}
              onClick={handleSaveGender}
            >
              {isSavingGender ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            {genderSaved && <span className="settings-page__saved">Tersimpan!</span>}
          </div>
        </section>

        <section className="card settings-page__section">
          <h2>ActiVibe Plus</h2>
          <p className="settings-page__section-desc">
            {subscription?.tier === 'FREE'
              ? 'Kamu masih di paket Free — Impact Passport dibatasi 2 kegiatan selesai & ada iklan di halaman Cari Kegiatan.'
              : `Kamu berlangganan ${subscription?.plan.name ?? 'ActiVibe Plus'} — Impact Passport & bebas iklan sesuai paketmu.`}
          </p>
          <div className="settings-page__section-footer">
            <a href="/activibe-plus" className="btn btn--primary btn--sm">
              {subscription?.tier === 'FREE' ? 'Upgrade ke ActiVibe Plus' : 'Kelola Langganan'}
            </a>
          </div>
        </section>

        <section className="card settings-page__section">
          <h2>Pendidikan & CV</h2>
          <p className="settings-page__section-desc">
            Opsional, tapi bantu kami (dan nanti AI) menyesuaikan rekomendasi & CV kamu.
          </p>
          <label className="settings-page__field">
            <span>Riwayat Pendidikan</span>
            <input
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="Contoh: S1 Teknik Informatika, Universitas Gadjah Mada (2020–2024)"
              maxLength={MAX_EDUCATION_LENGTH}
            />
          </label>
          <div className="settings-page__section-footer">
            <button
              type="button"
              className="btn btn--primary btn--sm"
              disabled={isSavingEducation}
              onClick={handleSaveEducation}
            >
              {isSavingEducation ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            {educationSaved && <span className="settings-page__saved">Tersimpan!</span>}
          </div>

          <div className="settings-page__field">
            <span>CV (PDF, maks 5MB)</span>
            {cvFileName ? (
              <div className="settings-page__cv-file">
                <a
                  href={cvUrl ? `${API_URL}${cvUrl}` : undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="settings-page__cv-file-name"
                >
                  {cvFileName}
                </a>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  disabled={isCvUploading}
                  onClick={handleRemoveCv}
                >
                  {isCvUploading ? 'Menghapus...' : 'Hapus'}
                </button>
              </div>
            ) : (
              <label className="settings-page__cv-upload-label">
                {isCvUploading ? 'Mengunggah...' : 'Pilih file PDF'}
                <input type="file" accept="application/pdf" hidden disabled={isCvUploading} onChange={handleCvFileChange} />
              </label>
            )}
            {cvError && <p className="settings-page__cv-error">{cvError}</p>}
          </div>
        </section>

        <section className="card settings-page__section">
          <h2>Privasi Impact Passport</h2>
          <label className="settings-page__toggle-row">
            <span>Tampilkan Impact Passport-ku secara publik (bisa diakses tanpa login lewat URL)</span>
            <input
              type="checkbox"
              checked={passportPublic}
              onChange={(e) => setPassportPublic(e.target.checked)}
            />
          </label>
          <div className="settings-page__section-footer">
            <button type="button" className="btn btn--primary btn--sm" onClick={handleSavePrivacy}>
              Simpan Perubahan
            </button>
            {privacySaved && <span className="settings-page__saved">Tersimpan!</span>}
          </div>
        </section>

        <section className="card settings-page__section">
          <h2>Update Password</h2>
          <label className="settings-page__field">
            <span>Password Baru</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
            />
          </label>
          <div className="settings-page__section-footer">
            <button
              type="button"
              className="btn btn--primary btn--sm"
              disabled={newPassword.length < 8}
              onClick={handleSavePassword}
            >
              Set Password
            </button>
            {passwordSaved && <span className="settings-page__saved">Tersimpan!</span>}
          </div>
        </section>

        <section className="card settings-page__section settings-page__section--danger">
          <h2>Hapus Akun</h2>
          <p className="settings-page__section-desc">
            Menghapus akun akan menghilangkan seluruh profil, riwayat kegiatan, dan Impact Passport-mu secara
            permanen. Tindakan ini tidak bisa dibatalkan.
          </p>
          {!deleteRequested ? (
            <>
              <label className="settings-page__field">
                <span>Ketik "HAPUS" untuk konfirmasi</span>
                <input value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} />
              </label>
              <div className="settings-page__section-footer">
                <button
                  type="button"
                  className="btn btn--danger btn--sm"
                  disabled={deleteConfirmText !== 'HAPUS'}
                  onClick={handleDeleteAccount}
                >
                  Hapus Akun Saya
                </button>
              </div>
            </>
          ) : (
            <p className="settings-page__saved">
              Permintaan hapus akun tercatat. Fitur ini belum tersambung ke backend.
            </p>
          )}
        </section>
      </div>
    </main>
  )
}
