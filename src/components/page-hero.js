import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { withBasePath } from "@/lib/base-path";

export function PageHero({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  imagePosition = "76% 52%"
}) {
  return (
    <section className="page-hero">
      <div className="container page-hero-grid">
        <div className="page-hero-copy">
          {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
          <h1 className="page-title">{title}</h1>
          <p className="page-copy">{description}</p>
          <div className="button-row">
            {primaryAction ? (
              <Link className="button button-primary" href={primaryAction.href}>
                {primaryAction.label}
              </Link>
            ) : null}
            {secondaryAction ? (
              <Link className="button button-secondary" href={secondaryAction.href}>
                {secondaryAction.label}
                <ArrowRight size={18} />
              </Link>
            ) : null}
          </div>
        </div>

        <div className="page-hero-media">
          <Image
            src={withBasePath("/images/piggyland-hero.png")}
            alt="Теплый фермерский дворик Piggy Land"
            fill
            sizes="(max-width: 960px) 100vw, 46vw"
            style={{ objectFit: "cover", objectPosition: imagePosition }}
          />
        </div>
      </div>
    </section>
  );
}
