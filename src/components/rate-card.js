import { ArrowUpRight, Clock3 } from "lucide-react";
import Link from "next/link";

export function RateCard({ rate }) {
  return (
    <article className={`card rate-card ${rate.popular ? "popular" : ""}`}>
      <div
        className="photo-card-media"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(17, 17, 17, 0.02), rgba(17, 17, 17, 0.16)), url(${rate.image})`,
          backgroundPosition: rate.imagePosition
        }}
      >
        {rate.popular ? <span className="card-badge">Популярный тариф</span> : null}
      </div>

      <div className="card-body">
        <div className="card-topline">
          <h3>{rate.name}</h3>
          <span className="price-badge">{rate.price.toLocaleString("ru-RU")} ₽</span>
        </div>

        <p>{rate.description}</p>

        <div className="card-meta">
          <span>
            <Clock3 size={16} />
            {rate.duration}
          </span>
        </div>

        <Link className="button button-secondary button-block" href={`/booking?rate=${rate.id}`}>
          Выбрать
          <ArrowUpRight size={18} />
        </Link>
      </div>
    </article>
  );
}
