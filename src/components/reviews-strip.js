import { Award, Star } from "lucide-react";

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function ReviewsStrip({ reviews, platforms }) {
  return (
    <div className="reviews-grid">
      <aside className="rating-summary card">
        <div className="reviews-proof-head">
          <span className="eyebrow">Отзывы и награды</span>
          <div className="rating-score-block">
            <div className="rating-score">5.0</div>
            <div className="rating-score-copy">
              <p className="rating-copy">Твердые 5 звезд на Яндексе, 2ГИС и VK.</p>
              <div className="stars-row" aria-label="Рейтинг 5 из 5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={16} fill="currentColor" />
                ))}
              </div>
            </div>
          </div>
          <p className="muted-text">
            <span className="copy-desktop">
              Более 5,1 тыс. отзывов только на Яндексе и 2ГИС, ежегодные награды и очень сильная репутация во
              VK показывают одно: гости действительно возвращаются к нам снова.
            </span>
            <span className="copy-mobile">
              Более 5,1 тыс. отзывов на Яндексе и 2ГИС, ежегодные награды и твердые 5 звезд во VK.
            </span>
          </p>
        </div>

        <div className="review-platform-list">
          {platforms.map((platform) => (
            <article key={platform.id} className="review-platform-row">
              <div className="review-platform-main">
                <span className="review-platform-mark" data-platform={platform.id}>
                  {platform.mark}
                </span>
                <div className="review-platform-copy">
                  <div className="review-platform-heading">
                    <h3>{platform.label}</h3>
                    <span className="review-platform-score-badge">{platform.rating}</span>
                  </div>
                  <p>{platform.proof}</p>
                </div>
              </div>
              <div className="review-platform-award">
                <Award size={14} />
                <span>{platform.award}</span>
              </div>
            </article>
          ))}
        </div>
      </aside>

      <div className="review-card-stack">
        {reviews.map((review) => (
          <article
            key={`${review.name}-${review.date}`}
            className={`card review-card${review.featured ? " review-card-featured" : ""}`}
          >
            <div className="review-card-topline">
              <span className="review-platform-badge" data-platform={review.platformId}>
                {review.platform}
              </span>
              <div className="stars-row" aria-label={`Рейтинг ${review.rating} из 5`}>
                {Array.from({ length: review.rating }).map((_, index) => (
                  <Star key={index} size={14} fill="currentColor" />
                ))}
              </div>
            </div>

            <div className="review-header">
              <div className="review-avatar" data-platform={review.platformId}>
                {getInitials(review.name)}
              </div>
              <div className="review-author-meta">
                <h3>{review.name}</h3>
                <span>{review.role}</span>
              </div>
              <span className="review-date">{review.date}</span>
            </div>

            <div className="review-copy">
              <p className="review-title">{review.title}</p>
              <p>
                <span className="copy-desktop">{review.text}</span>
                <span className="copy-mobile">{review.mobileText || review.text}</span>
              </p>
            </div>

          </article>
        ))}
      </div>
    </div>
  );
}
