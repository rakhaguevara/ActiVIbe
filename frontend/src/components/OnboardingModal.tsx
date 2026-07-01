import { useEffect, useState } from 'react'
import doodleBg from '../assets/png/Onboarding.png'
import illustrationInterests from '../assets/svg/On1.svg'
import illustrationSkills from '../assets/svg/On2.svg'
import illustrationAvailability from '../assets/svg/On3.svg'
import {
  getInterests,
  getSkills,
  updateMyProfile,
  type Availability,
  type ProfileData,
  type TaxonomyItem,
} from '../lib/profileApi'
import './OnboardingModal.css'

interface OnboardingModalProps {
  initialProfile: ProfileData
  onComplete: (profile: ProfileData) => void
}

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
  const [step, setStep] = useState<1 | 2 | 3>(1)
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

  useEffect(() => {
    Promise.all([getInterests(), getSkills()])
      .then(([interestList, skillList]) => {
        setInterests(interestList)
        setSkills(skillList)
      })
      .catch(() => setError('Gagal memuat pilihan, coba muat ulang halaman.'))
      .finally(() => setIsLoadingOptions(false))
  }, [])

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

  const goBack = () => {
    setError(null)
    setStep((prev) => (prev === 1 ? prev : ((prev - 1) as 1 | 2)))
  }

  const handleNextFromInterests = async () => {
    setError(null)
    setIsSubmitting(true)
    try {
      await updateMyProfile({ interestIds: Array.from(selectedInterestIds) })
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
          {[1, 2, 3].map((dot) => (
            <span
              key={dot}
              className={
                'onboarding-modal__dot' +
                (dot === step ? ' onboarding-modal__dot--active' : dot < step ? ' onboarding-modal__dot--done' : '')
              }
            />
          ))}
        </div>

        {step === 1 && (
          <div className="onboarding-modal__step">
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

            <div className="onboarding-modal__footer onboarding-modal__footer--single">
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

        {step === 2 && (
          <div className="onboarding-modal__step">
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

        {step === 3 && (
          <div className="onboarding-modal__step">
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
