import { Star } from "lucide-react";

export function ReviewsStrip({ reviews }) {
  return (
    <div className="reviews-grid">
      <div className="rating-summary card">
        <div className="rating-score">4.9</div>
        <div>
          <p className="rating-copy">Средняя оценка гостей</p>
          <div className="stars-row" aria-label="Рейтинг 4.9 из 5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} size={16} fill="currentColor" />
            ))}
          </div>
          <p className="muted-text">
            Гости чаще всего отмечают атмосферу, комфортную подачу и ощущение живого отдыха.
          </p>
        </div>
      </div>

      {reviews.map((review) => (
        <article key={`${review.name}-${review.date}`} className="card review-card">
          <div className="review-header">
            <div className="review-avatar">{review.name.slice(0, 1)}</div>
            <div>
              <h3>{review.name}</h3>
              <span>{review.date}</span>
            </div>
          </div>
          <div className="stars-row">
            {Array.from({ length: review.rating }).map((_, index) => (
              <Star key={index} size={14} fill="currentColor" />
            ))}
          </div>
          <p>{review.text}</p>
        </article>
      ))}
    </div>
  );
}

