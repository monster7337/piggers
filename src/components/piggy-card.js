/* eslint-disable @next/next/no-img-element */

import { withBasePath } from "@/lib/base-path";

export function PiggyCard({ piggy, onOpen }) {
  const imageSource = withBasePath(piggy.image.replace("/images/", "/images/cards/").replace(/\.webp$/, ".avif"));

  return (
    <article className="card piggy-card">
      <div className="photo-card-media piggy-media">
        <img
          className="deferred-card-image deferred-native-image"
          src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
          data-deferred-src={imageSource}
          alt=""
          decoding="async"
          fetchPriority="low"
          style={{ objectPosition: piggy.imagePosition }}
        />
        <noscript>
          <img className="deferred-card-image deferred-native-image" src={imageSource} alt="" style={{ objectPosition: piggy.imagePosition }} />
        </noscript>
      </div>

      <div className="card-body">
        <div className="card-topline">
          <h3>{piggy.name}</h3>
          <span className="soft-badge">{piggy.badge || piggy.age}</span>
        </div>
        <p>{piggy.character}</p>
        {piggy.trait ? <p className="muted-text">{piggy.trait}</p> : null}
        <button type="button" className="button button-secondary button-block" onClick={() => onOpen?.(piggy.slug)}>
          Узнать подробнее
        </button>
      </div>
    </article>
  );
}
