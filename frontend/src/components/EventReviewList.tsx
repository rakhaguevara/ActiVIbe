import type { ReviewEntry } from '../types/event'
import './EventReviewList.css'

interface EventReviewListProps {
  reviews: ReviewEntry[]
}

export default function EventReviewList({ reviews }: EventReviewListProps) {
  return (
    <div className="event-review-list">
      {reviews.map((review) => {
        const fullStars = Math.round(review.rating)
        return (
          <div key={`${review.reviewerName}-${review.timeAgo}`} className="event-review-list__card">
            <div className="event-review-list__header">
              <span className="event-review-list__avatar" aria-hidden="true">{review.reviewerName.charAt(0)}</span>
              <div>
                <p className="event-review-list__name">{review.reviewerName}</p>
                <p className="event-review-list__time">{review.timeAgo}</p>
              </div>
            </div>
            <p className="event-review-list__rating">{'★'.repeat(fullStars)}{'☆'.repeat(5 - fullStars)}</p>
            <p className="event-review-list__text">{review.text}</p>
          </div>
        )
      })}
    </div>
  )
}
