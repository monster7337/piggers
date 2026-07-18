/* eslint-disable @next/next/no-img-element */

import { Clock3 } from "lucide-react";
import Link from "next/link";
import { withBasePath } from "@/lib/base-path";

export function RateCard({ rate }) {
  const imageSource = withBasePath(rate.image.replace("/images/", "/images/cards/").replace(/\.webp$/, ".avif"));

  return (
    <article className={`card rate-card ${rate.popular ? "popular" : ""}`}>
      <div className="photo-card-media">
        <img
          className="deferred-card-image deferred-native-image"
          src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
          data-deferred-src={imageSource}
          alt=""
          decoding="async"
          fetchPriority="low"
          style={{ objectPosition: rate.imagePosition }}
        />
        <noscript>
          <img className="deferred-card-image deferred-native-image" src={imageSource} alt="" style={{ objectPosition: rate.imagePosition }} />
        </noscript>
        {rate.popular ? <span className="card-badge">Часто выбирают</span> : null}
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
