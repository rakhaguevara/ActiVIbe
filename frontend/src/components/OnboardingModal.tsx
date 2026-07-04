import { useEffect, useRef, useState } from 'react'
import doodleBg from '../assets/png/Onboarding.png'
import illustrationChat from '../assets/svg/together 1.svg'
import illustrationInterests from '../assets/svg/On1.svg'
import illustrationSkills from '../assets/svg/On2.svg'
import illustrationAvailability from '../assets/svg/On3.svg'
import {
  getInterests,
  getSkills,
  updateMyProfile,
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

type ChatPhase = 'bio' | 'motivation' | 'done'

interface ChatMessage {
  id: number
  from: 'bot' | 'user'
  text: string
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
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  // Chat step state
  const [chatPhase, setChatPhase] = useState<ChatPhase>('bio')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isBotTyping, setIsBotTyping] = useState(false)
  const [bioInput, setBioInput] = useState('')
  const [savedBio, setSavedBio] = useState('')
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
  const [availability, setAvailability] = useState<Availability | null>(initialProfile.availability)
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const handleBioKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitBio()
    }
  }

  const handleSubmitBio = () => {
    const text = bioInput.trim()
    if (!text) return
    setSavedBio(text)
    setBioInput('')
    setChatMessages((prev) => [...prev, { id: Date.now(), from: 'user', text }])
    setIsBotTyping(true)
    setTimeout(() => {
      setIsBotTyping(false)
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now(), from: 'bot', text: 'Keren! Satu pertanyaan lagi — apa motivasi utamamu volunteer?' },
      ])
      setChatPhase('motivation')
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
      await updateMyProfile({ bio: savedBio, motivation: selectedMotivation! })
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
    setStep((prev) => (prev === 0 ? prev : ((prev - 1) as 0 | 1 | 2)))
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

  const handleNextFromInterests = async () => {
    setError(null)
    setIsSubmitting(true)
    try {
      await updateMyProfile({ interestIds: Array.from(selectedInterestIds) })
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

  const handleFinish = async () => {
    if (!availability) return
    setError(null)
    setIsSubmitting(true)
    try {
      const profile = await updateMyProfile({ availability })
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
          {[0, 1, 2, 3].map((dot) => (
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

              {chatPhase === 'bio' && !isBotTyping && chatMessages.length > 0 && (
                <div className="onboarding-chat__input-area">
                  <div className="onboarding-chat__textarea-wrap">
                    <textarea
                      className="onboarding-chat__textarea"
                      placeholder="Tulis ceritamu di sini... (Shift+Enter untuk baris baru)"
                      value={bioInput}
                      onChange={(e) => setBioInput(e.target.value)}
                      onKeyDown={handleBioKeyDown}
                      maxLength={500}
                      rows={3}
                      autoFocus
                    />
                    <span className="onboarding-chat__char-count">{bioInput.length}/500</span>
                  </div>
                  <div className="onboarding-modal__footer onboarding-modal__footer--single">
                    <button
                      type="button"
                      className="onboarding-modal__btn onboarding-modal__btn--primary"
                      disabled={!bioInput.trim()}
                      onClick={handleSubmitBio}
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

            <div className="onboarding-modal__options">
              {isLoadingOptions && <p className="onboarding-modal__hint">Memuat pilihan...</p>}
              {groupByCategory(interests).map(([category, items]) => (
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
                disabled={isSubmitting || selectedInterestIds.size === 0}
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
