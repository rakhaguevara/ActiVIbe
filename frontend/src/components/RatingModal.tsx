import { useEffect, useState } from 'react'
import { FiStar } from 'react-icons/fi'
import './ConfirmDialog.css'
import './RatingModal.css'

interface RatingModalProps {
  eventTitle: string
  onSubmit: (rating: number, comment: string) => Promise<void>
  onClose: () => void
}

export default function RatingModal({ eventTitle, onSubmit, onClose }: RatingModalProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const handleSubmit = async () => {
    if (rating === 0) return
    setIsSubmitting(true)
    setError(null)
    try {
      await onSubmit(rating, comment.trim())
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim rating, coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="confirm-dialog__backdrop" onClick={onClose}>
      <div className="confirm-dialog rating-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h3 className="confirm-dialog__title">Beri Rating</h3>
        <p className="confirm-dialog__message">Bagaimana pengalamanmu di kegiatan "{eventTitle}"?</p>

        <div className="rating-modal__stars" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className="rating-modal__star-btn"
              aria-label={`${value} bintang`}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(value)}
            >
              <FiStar
                className={
                  value <= (hoverRating || rating) ? 'rating-modal__star rating-modal__star--filled' : 'rating-modal__star'
                }
              />
            </button>
          ))}
        </div>

        <textarea
          className="rating-modal__comment"
          placeholder="Komentar (opsional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />

        {error && <p className="rating-modal__error">{error}</p>}

        <div className="confirm-dialog__actions">
          <button type="button" className="btn btn--outline btn--sm" onClick={onClose}>
            Batal
          </button>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            disabled={rating === 0 || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Rating'}
          </button>
        </div>
      </div>
    </div>
  )
}
