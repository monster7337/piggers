import Link from "next/link";
import { withBasePath } from "@/lib/base-path";

export function PiggyCard({ piggy, onOpen }) {
  return (
    <article className="card piggy-card">
      <div
        className="photo-card-media piggy-media"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(17, 17, 17, 0.04), rgba(17, 17, 17, 0.22)), url(${withBasePath(piggy.image)})`,
          backgroundPosition: piggy.imagePosition
        }}
      />

      <div className="card-body">
        <div className="card-topline">
          <h3>{piggy.name}</h3>
          <span className="soft-badge">{piggy.badge || piggy.age}</span>
        </div>
        <p>{piggy.character}</p>
        {piggy.trait ? <p className="muted-text">{piggy.trait}</p> : null}
        {onOpen ? (
          <button type="button" className="button button-secondary button-block" onClick={() => onOpen(piggy.slug)}>
            Узнать подробнее
          </button>
        ) : (
          <Link className="button button-secondary button-block" href={`/piggies/${piggy.slug}`}>
            Узнать подробнее
          </Link>
        )}
      </div>
    </article>
  );
}
