import type { RatingBreakdownItem } from '../types/event'
import './EventRatingSummary.css'

interface EventRatingSummaryProps {
  rating: number
  reviewCount: number
  ratingBreakdown: RatingBreakdownItem[]
}

export default function EventRatingSummary({ rating, reviewCount, ratingBreakdown }: EventRatingSummaryProps) {
  return (
    <div id="reviews" className="event-rating-summary">
      <h3>★ {rating.toFixed(1)} · {reviewCount} ulasan</h3>
      <div className="event-rating-summary__breakdown">
        {ratingBreakdown.map((item) => (
          <div key={item.label} className="event-rating-summary__row">
            <span className="event-rating-summary__label">{item.label}</span>
            <div className="event-rating-summary__bar">
              <div className="event-rating-summary__bar-fill" style={{ width: `${(item.score / 5) * 100}%` }} />
            </div>
            <span className="event-rating-summary__score">{item.score.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
