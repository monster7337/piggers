import { Clock3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { withBasePath } from "@/lib/base-path";

export function RateCard({ rate }) {
  return (
    <article className={`card rate-card ${rate.popular ? "popular" : ""}`}>
      <div className="photo-card-media">
        <Image
          className="deferred-card-image"
          src={withBasePath(rate.image)}
          alt=""
          fill
          fetchPriority="low"
          sizes="(min-width: 1024px) 25vw, 50vw"
          style={{ objectPosition: rate.imagePosition }}
        />
        {rate.popular ? <span className="card-badge">Популярный тариф</span> : null}
      </div>

      <div className="card-body">
        <div className="card-topline">
          <h3>{rate.name}</h3>
          <span className="price-badge">{rate.price.toLocaleString("ru-RU")} ₽</span>
        </div>

        <p>
          <span className="copy-desktop">{rate.description}</span>
          <span className="copy-mobile">{rate.mobileDescription || rate.description}</span>
        </p>

        <div className="card-meta">
          <span>
            <Clock3 size={16} />
            {rate.duration}
          </span>
        </div>

        <Link className="button button-secondary button-block" href={`/booking?rate=${rate.id}`} prefetch={false}>
          Выбрать
        </Link>
      </div>
    </article>
  );
}
