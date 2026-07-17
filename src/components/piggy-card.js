import Image from "next/image";
import { withBasePath } from "@/lib/base-path";

export function PiggyCard({ piggy, onOpen }) {
  return (
    <article className="card piggy-card">
      <div className="photo-card-media piggy-media">
        <Image
          className="deferred-card-image"
          src={withBasePath(piggy.image)}
          alt=""
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 680px) 33vw, 50vw"
          style={{ objectPosition: piggy.imagePosition }}
        />
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
