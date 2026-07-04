import { useEffect, useRef, useState } from 'react'
import doodleBg from '../assets/png/Onboarding.png'
import illustrationChat from '../assets/svg/together 1.svg'
import illustrationInterests from '../assets/svg/On1.svg'
import illustrationSkills from '../assets/svg/On2.svg'
import illustrationAvailability from '../assets/svg/On3.svg'
import {
  getMyProfile,
  getInterests,
  getSkills,
  updateMyProfile,
  uploadCv,
  deleteCv,
  MAX_CV_SIZE_BYTES,
  type Availability,
  type Motivation,
  type ProfileData,
  type TaxonomyItem,
} from '../lib/profileApi'
import './OnboardingModal.css'

interface OnboardingModalProps {
  initialProfile: ProfileData
  onComplete: (profile: ProfileData) => void
}

type ChatTextPhase = 'bio' | 'origin' | 'education' | 'hobby'
type ChatPhase = ChatTextPhase | 'motivation' | 'done'

interface ChatMessage {
  id: number
  from: 'bot' | 'user'
  text: string
}

function isChatTextPhase(phase: ChatPhase): phase is ChatTextPhase {
  return phase === 'bio' || phase === 'origin' || phase === 'education' || phase === 'hobby'
}

const CHAT_TEXT_STEPS: Record<
  ChatTextPhase,
  { nextPhase: ChatPhase; nextBotText: string; placeholder: string; maxLength: number }
> = {
  bio: {
    nextPhase: 'origin',
    nextBotText: 'Asal kamu dari mana?',
    placeholder: 'Tulis ceritamu di sini... (Shift+Enter untuk baris baru)',
    maxLength: 350,
  },
  origin: {
    nextPhase: 'education',
    nextBotText: 'Ngomong-ngomong, riwayat pendidikanmu apa?',
    placeholder: 'Contoh: Yogyakarta',
    maxLength: 100,
  },
  education: {
    nextPhase: 'hobby',
    nextBotText: 'Kalau lagi senggang, apa kesukaan atau hobimu?',
    placeholder: 'Contoh: S1 Teknik Informatika, Universitas Gadjah Mada (2020–2024)',
    maxLength: 200,
  },
  hobby: {
    nextPhase: 'motivation',
    nextBotText: 'Satu pertanyaan terakhir — apa motivasi utamamu buat volunteer?',
    placeholder: 'Contoh: fotografi, mendaki gunung, baca komik...',
    maxLength: 120,
  },
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

const MAX_CUSTOM_INTERESTS = 10
const MAX_CUSTOM_INTEREST_LENGTH = 40

function formatFileSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

function groupByCategory(items: TaxonomyItem[]): [string, TaxonomyItem[]][] {
  const map = new Map<string, TaxonomyItem[]>()
  for (const item of items) {
    const group = map.get(item.category) ?? []
    group.push(item)
    map.set(item.category, group)
  }
  return Array.from(map.entries())
}

export default function OnboardingModal({ initialProfile, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  // Chat step state
  const [chatPhase, setChatPhase] = useState<ChatPhase>('bio')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isBotTyping, setIsBotTyping] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [chatAnswers, setChatAnswers] = useState<Record<ChatTextPhase, string>>({
    bio: '',
    origin: '',
    education: '',
    hobby: '',
  })
  const [selectedMotivation, setSelectedMotivation] = useState<Motivation | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Selection steps state
  const [interests, setInterests] = useState<TaxonomyItem[]>([])
  const [skills, setSkills] = useState<TaxonomyItem[]>([])
  const [selectedInterestIds, setSelectedInterestIds] = useState<Set<string>>(
    () => new Set(initialProfile.interests.map((i) => i.id)),
  )
  const [selectedSkillIds, setSelectedSkillIds] = useState<Set<string>>(
    () => new Set(initialProfile.skills.map((s) => s.id)),
  )
  const [interestSearch, setInterestSearch] = useState('')
  const [customInterests, setCustomInterests] = useState<string[]>([])
  const [customInterestInput, setCustomInterestInput] = useState('')
  const [availability, setAvailability] = useState<Availability | null>(initialProfile.availability)
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 4: CV
  const [cvFileName, setCvFileName] = useState<string | null>(initialProfile.cvFileName)
  const [isCvUploading, setIsCvUploading] = useState(false)
  const [cvError, setCvError] = useState<string | null>(null)

  // Load taxonomy options
  useEffect(() => {
    Promise.all([getInterests(), getSkills()])
      .then(([interestList, skillList]) => {
        setInterests(interestList)
        setSkills(skillList)
      })
      .catch(() => setError('Gagal memuat pilihan, coba muat ulang halaman.'))
      .finally(() => setIsLoadingOptions(false))
  }, [])

  // Trigger first bot message on mount
  useEffect(() => {
    setIsBotTyping(true)
    const t = setTimeout(() => {
      setIsBotTyping(false)
      setChatMessages([
        {
          id: 1,
          from: 'bot',
          text: 'Hei! Sebelum kita mulai, ceritakan sedikit tentang dirimu — apa yang membuatmu tertarik jadi volunteer?',
        },
      ])
    }, 1200)
    return () => clearTimeout(t)
  }, [])

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isBotTyping])

  // ── Chat handlers ──

  const handleTextKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitText()
    }
  }

  const handleSubmitText = () => {
    const text = textInput.trim()
    if (!text || !isChatTextPhase(chatPhase)) return
    const { nextPhase, nextBotText } = CHAT_TEXT_STEPS[chatPhase]
    setChatAnswers((prev) => ({ ...prev, [chatPhase]: text }))
    setTextInput('')
    setChatMessages((prev) => [...prev, { id: Date.now(), from: 'user', text }])
    setIsBotTyping(true)
    setTimeout(() => {
      setIsBotTyping(false)
      setChatMessages((prev) => [...prev, { id: Date.now(), from: 'bot', text: nextBotText }])
      setChatPhase(nextPhase)
    }, 900)
  }

  const handleSelectMotivation = (value: Motivation) => {
    const label = MOTIVATION_OPTIONS.find((o) => o.value === value)!.label
    setSelectedMotivation(value)
    setChatMessages((prev) => [...prev, { id: Date.now(), from: 'user', text: label }])
    setChatPhase('done')
  }

  const handleNextFromChat = async () => {
    setError(null)
    setIsSubmitting(true)
    try {
      const bio = chatAnswers.hobby ? `${chatAnswers.bio}\n\nKesukaan: ${chatAnswers.hobby}` : chatAnswers.bio
      await updateMyProfile({
        bio,
        location: chatAnswers.origin || undefined,
        education: chatAnswers.education || undefined,
        motivation: selectedMotivation!,
      })
      setDirection('forward')
      setStep(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Selection step handlers ──

  const goBack = () => {
    setError(null)
    setDirection('back')
    setStep((prev) => (prev === 0 ? prev : ((prev - 1) as 0 | 1 | 2 | 3)))
  }

  const toggleInterest = (id: string) => {
    setSelectedInterestIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filteredInterests = interests.filter((item) =>
    item.name.toLowerCase().includes(interestSearch.trim().toLowerCase()),
  )

  const handleAddCustomInterest = () => {
    const text = customInterestInput.trim()
    if (!text) return

    const existingMatch = interests.find((item) => item.name.toLowerCase() === text.toLowerCase())
    if (existingMatch) {
      setSelectedInterestIds((prev) => new Set(prev).add(existingMatch.id))
      setCustomInterestInput('')
      return
    }

    if (customInterests.some((c) => c.toLowerCase() === text.toLowerCase())) {
      setCustomInterestInput('')
      return
    }

    if (customInterests.length >= MAX_CUSTOM_INTERESTS) return

    setCustomInterests((prev) => [...prev, text.slice(0, MAX_CUSTOM_INTEREST_LENGTH)])
    setCustomInterestInput('')
  }

  const handleCustomInterestKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddCustomInterest()
    }
  }

  const removeCustomInterest = (name: string) => {
    setCustomInterests((prev) => prev.filter((c) => c !== name))
  }

  const toggleSkill = (id: string) => {
    setSelectedSkillIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleNextFromInterests = async () => {
    setError(null)
    setIsSubmitting(true)
    try {
      await updateMyProfile({
        interestIds: Array.from(selectedInterestIds),
        customInterests: customInterests.length > 0 ? customInterests : undefined,
      })
      setDirection('forward')
      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNextFromSkills = async () => {
    setError(null)
    setIsSubmitting(true)
    try {
      await updateMyProfile({ skillIds: Array.from(selectedSkillIds) })
      setDirection('forward')
      setStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNextFromAvailability = async () => {
    if (!availability) return
    setError(null)
    setIsSubmitting(true)
    try {
      await updateMyProfile({ availability })
      setDirection('forward')
      setStep(4)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Step 4: CV handlers ──

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
    } catch (err) {
      setCvError(err instanceof Error ? err.message : 'Gagal menghapus CV, coba lagi.')
    } finally {
      setIsCvUploading(false)
    }
  }

  const handleFinish = async () => {
    setError(null)
    setIsSubmitting(true)
    try {
      // CV (kalau diupload) sudah tersimpan real-time per-file di step ini;
      // tidak ada field lain yang perlu di-PATCH, jadi cukup ambil profil
      // terbaru dari server (bukan `initialProfile` yang basi, di-capture
      // sebelum step-step wizard sebelumnya menyimpan) lalu selesai. Kalau
      // user tidak upload CV, ini otomatis jadi jalur "lewati".
      const profile = await getMyProfile()
      onComplete(profile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="onboarding-modal__backdrop" style={{ backgroundImage: `url(${doodleBg})` }}>
      <div className="onboarding-modal" role="dialog" aria-modal="true" aria-label="Lengkapi profil volunteer kamu">
        <div className="onboarding-modal__dots" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((dot) => (
            <span
              key={dot}
              className={
                'onboarding-modal__dot' +
                (dot === step ? ' onboarding-modal__dot--active' : dot < step ? ' onboarding-modal__dot--done' : '')
              }
            />
          ))}
        </div>

        {/* ── Step 0: Chat intro ── */}
        {step === 0 && (
          <div key={0} className={`onboarding-modal__step onboarding-modal__step--${direction}`}>
            <img src={illustrationChat} alt="" className="onboarding-modal__illustration" />
            <h2 className="onboarding-modal__title">Kenalan dulu, yuk!</h2>
            <p className="onboarding-modal__subtitle">Ceritamu membantu kami mencocokkan kegiatan yang tepat buatmu.</p>

            <div className="onboarding-chat">
              <div className="onboarding-chat__messages">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`onboarding-chat__bubble onboarding-chat__bubble--${msg.from}`}>
                    {msg.text}
                  </div>
                ))}
                {isBotTyping && (
                  <div className="onboarding-chat__typing" aria-label="Bot sedang mengetik">
                    <span /><span /><span />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {isChatTextPhase(chatPhase) && !isBotTyping && chatMessages.length > 0 && (
                <div className="onboarding-chat__input-area">
                  <div className="onboarding-chat__textarea-wrap">
                    <textarea
                      className="onboarding-chat__textarea"
                      placeholder={CHAT_TEXT_STEPS[chatPhase].placeholder}
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      onKeyDown={handleTextKeyDown}
                      maxLength={CHAT_TEXT_STEPS[chatPhase].maxLength}
                      rows={chatPhase === 'bio' ? 3 : 2}
                      autoFocus
                    />
                    <span className="onboarding-chat__char-count">
                      {textInput.length}/{CHAT_TEXT_STEPS[chatPhase].maxLength}
                    </span>
                  </div>
                  <div className="onboarding-modal__footer onboarding-modal__footer--single">
                    <button
                      type="button"
                      className="onboarding-modal__btn onboarding-modal__btn--primary"
                      disabled={!textInput.trim()}
                      onClick={handleSubmitText}
                    >
                      Kirim
                    </button>
                  </div>
                </div>
              )}

              {chatPhase === 'motivation' && !isBotTyping && (
                <div className="onboarding-chat__input-area">
                  <div className="onboarding-chat__quick-replies">
                    {MOTIVATION_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className="onboarding-chat__quick-reply"
                        onClick={() => handleSelectMotivation(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chatPhase === 'done' && (
                <div className="onboarding-chat__input-area">
                  {error && <p className="onboarding-modal__error">{error}</p>}
                  <div className="onboarding-modal__footer onboarding-modal__footer--single">
                    <button
                      type="button"
                      className="onboarding-modal__btn onboarding-modal__btn--primary"
                      disabled={isSubmitting}
                      onClick={handleNextFromChat}
                    >
                      {isSubmitting ? 'Menyimpan...' : 'Lanjut'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Step 1: Interests ── */}
        {step === 1 && (
          <div key={1} className={`onboarding-modal__step onboarding-modal__step--${direction}`}>
            <img src={illustrationInterests} alt="" className="onboarding-modal__illustration" />
            <h2 className="onboarding-modal__title">Apa yang bikin kamu semangat volunteer?</h2>
            <p className="onboarding-modal__subtitle">Pilih minat yang paling menggambarkan kamu.</p>

            <input
              type="text"
              className="onboarding-modal__search"
              placeholder="Cari minat..."
              value={interestSearch}
              onChange={(e) => setInterestSearch(e.target.value)}
              aria-label="Cari minat"
            />

            <div className="onboarding-modal__options">
              {isLoadingOptions && <p className="onboarding-modal__hint">Memuat pilihan...</p>}
              {!isLoadingOptions && filteredInterests.length === 0 && (
                <p className="onboarding-modal__hint">Tidak ada minat yang cocok. Coba tulis di kolom "Lainnya" di bawah.</p>
              )}
              {groupByCategory(filteredInterests).map(([category, items]) => (
                <div key={category}>
                  <p className="option-select-item__category-heading">{category}</p>
                  {items.map((item) => {
                    const checked = selectedInterestIds.has(item.id)
                    return (
                      <label
                        key={item.id}
                        className={'option-select-item' + (checked ? ' option-select-item--selected' : '')}
                      >
                        <input type="checkbox" checked={checked} onChange={() => toggleInterest(item.id)} />
                        <span className="option-select-item__label">{item.name}</span>
                      </label>
                    )
                  })}
                </div>
              ))}

              <div className="onboarding-modal__custom-interests">
                <p className="option-select-item__category-heading">Lainnya</p>
                {customInterests.length > 0 && (
                  <div className="onboarding-modal__chips">
                    {customInterests.map((name) => (
                      <span key={name} className="onboarding-modal__chip">
                        {name}
                        <button
                          type="button"
                          className="onboarding-modal__chip-remove"
                          onClick={() => removeCustomInterest(name)}
                          aria-label={`Hapus minat ${name}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {customInterests.length < MAX_CUSTOM_INTERESTS && (
                  <div className="onboarding-modal__custom-input-row">
                    <input
                      type="text"
                      className="onboarding-modal__search"
                      placeholder="Minat kamu nggak ada di daftar? Tulis di sini..."
                      value={customInterestInput}
                      onChange={(e) => setCustomInterestInput(e.target.value)}
                      onKeyDown={handleCustomInterestKeyDown}
                      maxLength={MAX_CUSTOM_INTEREST_LENGTH}
                    />
                    <button
                      type="button"
                      className="onboarding-modal__btn onboarding-modal__btn--outline onboarding-modal__btn--sm"
                      disabled={!customInterestInput.trim()}
                      onClick={handleAddCustomInterest}
                    >
                      Tambah
                    </button>
                  </div>
                )}
              </div>
            </div>

            {error && <p className="onboarding-modal__error">{error}</p>}

            <div className="onboarding-modal__footer">
              <button
                type="button"
                className="onboarding-modal__btn onboarding-modal__btn--outline"
                disabled={isSubmitting}
                onClick={goBack}
              >
                Kembali
              </button>
              <button
                type="button"
                className="onboarding-modal__btn onboarding-modal__btn--primary"
                disabled={isSubmitting || (selectedInterestIds.size === 0 && customInterests.length === 0)}
                onClick={handleNextFromInterests}
              >
                {isSubmitting ? 'Menyimpan...' : 'Lanjut'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Skills ── */}
        {step === 2 && (
          <div key={2} className={`onboarding-modal__step onboarding-modal__step--${direction}`}>
            <img src={illustrationSkills} alt="" className="onboarding-modal__illustration" />
            <h2 className="onboarding-modal__title">Skill apa yang mau kamu kontribusikan?</h2>
            <p className="onboarding-modal__subtitle">Pilih skill yang kamu punya, boleh lebih dari satu.</p>

            <div className="onboarding-modal__options">
              {groupByCategory(skills).map(([category, items]) => (
                <div key={category}>
                  <p className="option-select-item__category-heading">{category}</p>
                  {items.map((item) => {
                    const checked = selectedSkillIds.has(item.id)
                    return (
                      <label
                        key={item.id}
                        className={'option-select-item' + (checked ? ' option-select-item--selected' : '')}
                      >
                        <input type="checkbox" checked={checked} onChange={() => toggleSkill(item.id)} />
                        <span className="option-select-item__label">{item.name}</span>
                      </label>
                    )
                  })}
                </div>
              ))}
            </div>

            {error && <p className="onboarding-modal__error">{error}</p>}

            <div className="onboarding-modal__footer">
              <button
                type="button"
                className="onboarding-modal__btn onboarding-modal__btn--outline"
                disabled={isSubmitting}
                onClick={goBack}
              >
                Kembali
              </button>
              <button
                type="button"
                className="onboarding-modal__btn onboarding-modal__btn--primary"
                disabled={isSubmitting || selectedSkillIds.size === 0}
                onClick={handleNextFromSkills}
              >
                {isSubmitting ? 'Menyimpan...' : 'Lanjut'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Availability ── */}
        {step === 3 && (
          <div key={3} className={`onboarding-modal__step onboarding-modal__step--${direction}`}>
            <img src={illustrationAvailability} alt="" className="onboarding-modal__illustration" />
            <h2 className="onboarding-modal__title">Kapan kamu biasanya available?</h2>
            <p className="onboarding-modal__subtitle">Ini bantu kami mencocokkan jadwal kegiatan buat kamu.</p>

            <div className="onboarding-modal__options">
              {AVAILABILITY_OPTIONS.map((option) => {
                const checked = availability === option.value
                return (
                  <label
                    key={option.value}
                    className={'option-select-item' + (checked ? ' option-select-item--selected' : '')}
                  >
                    <input
                      type="radio"
                      name="availability"
                      checked={checked}
                      onChange={() => setAvailability(option.value)}
                    />
                    <span className="option-select-item__label">{option.label}</span>
                  </label>
                )
              })}
            </div>

            {error && <p className="onboarding-modal__error">{error}</p>}

            <div className="onboarding-modal__footer">
              <button
                type="button"
                className="onboarding-modal__btn onboarding-modal__btn--outline"
                disabled={isSubmitting}
                onClick={goBack}
              >
                Kembali
              </button>
              <button
                type="button"
                className="onboarding-modal__btn onboarding-modal__btn--primary"
                disabled={isSubmitting || !availability}
                onClick={handleNextFromAvailability}
              >
                {isSubmitting ? 'Menyimpan...' : 'Lanjut'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Riwayat Pendidikan & CV ── */}
        {step === 4 && (
          <div key={4} className={`onboarding-modal__step onboarding-modal__step--${direction}`}>
            <img src={illustrationChat} alt="" className="onboarding-modal__illustration" />
            <h2 className="onboarding-modal__title">Ada CV yang mau kamu unggah?</h2>
            <p className="onboarding-modal__subtitle">Opsional — boleh dilewati dan diisi nanti dari Pengaturan.</p>

            <div className="onboarding-modal__cv-section">
              <span className="onboarding-modal__field-label">CV (PDF, maks 5MB)</span>
              {cvFileName ? (
                <div className="onboarding-modal__cv-file">
                  <span className="onboarding-modal__cv-file-name">{cvFileName}</span>
                  <button
                    type="button"
                    className="onboarding-modal__btn onboarding-modal__btn--outline onboarding-modal__btn--sm"
                    disabled={isCvUploading}
                    onClick={handleRemoveCv}
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <label className="onboarding-modal__cv-upload-label">
                  {isCvUploading ? 'Mengunggah...' : 'Pilih file PDF'}
                  <input
                    type="file"
                    accept="application/pdf"
                    hidden
                    disabled={isCvUploading}
                    onChange={handleCvFileChange}
                  />
                </label>
              )}
              {cvError && <p className="onboarding-modal__error">{cvError}</p>}
            </div>

            <p className="onboarding-modal__cv-note">
              Begitu kamu menyelesaikan kegiatan volunteer, ActiVibe bisa bantu langsung menambahkan prestasi &
              pengalamanmu ke CV yang kamu unggah di sini — jadi CV-mu gampang di-update tanpa nulis ulang dari nol.
            </p>

            {error && <p className="onboarding-modal__error">{error}</p>}

            <div className="onboarding-modal__footer">
              <button
                type="button"
                className="onboarding-modal__btn onboarding-modal__btn--outline"
                disabled={isSubmitting}
                onClick={goBack}
              >
                Kembali
              </button>
              <button
                type="button"
                className="onboarding-modal__btn onboarding-modal__btn--primary"
                disabled={isSubmitting || isCvUploading}
                onClick={handleFinish}
              >
                {isSubmitting ? 'Menyimpan...' : 'Selesai'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
