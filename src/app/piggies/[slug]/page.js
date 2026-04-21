import { notFound } from "next/navigation";
import { Check, Heart, X } from "lucide-react";
import Link from "next/link";
import { AnimatedSection } from "@/components/animated-section";
import { PageHero } from "@/components/page-hero";
import { piggies } from "@/lib/site-data";

export async function generateStaticParams() {
  return piggies.map((piggy) => ({ slug: piggy.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const piggy = piggies.find((item) => item.slug === slug);

  if (!piggy) {
    return {
      title: "Минипиг не найден"
    };
  }

  return {
    title: `${piggy.name} — наш минипиг`,
    description: `${piggy.name}: ${piggy.character} ${piggy.trait}`
  };
}

export default async function PiggyDetailPage({ params }) {
  const { slug } = await params;
  const piggy = piggies.find((item) => item.slug === slug);

  if (!piggy) {
    notFound();
  }

  return (
    <>
      <PageHero
        eyebrow="Минипиг"
        title={`${piggy.name} — ${piggy.character}`}
        description={piggy.trait || piggy.character}
        primaryAction={{ href: "/booking", label: "Забронировать визит" }}
        secondaryAction={{ href: "/piggies", label: "Вернуться ко всем" }}
        imagePosition={piggy.imagePosition}
      />

      <AnimatedSection>
        <div className="container split-grid">
          <article className="card feature-list">
            <span className="eyebrow">Любит</span>
            <h2 className="section-title small">{piggy.name} особенно любит</h2>
            {piggy.likes.map((item) => (
              <div key={item} className="list-row">
                <Heart size={18} />
                <span>{item}</span>
              </div>
            ))}
          </article>

          <article className="card feature-list">
            <span className="eyebrow">Не любит</span>
            <h2 className="section-title small">Что лучше учитывать гостям</h2>
            {piggy.dislikes.map((item) => (
              <div key={item} className="list-row">
                <X size={18} />
                <span>{item}</span>
              </div>
            ))}
          </article>
        </div>
      </AnimatedSection>

      <AnimatedSection className="section-muted">
        <div className="container split-grid">
          <article className="card feature-list">
            <span className="eyebrow">Факты</span>
            <h2 className="section-title small">Немного больше о характере</h2>
            {piggy.facts.map((item) => (
              <div key={item} className="list-row">
                <Check size={18} />
                <span>{item}</span>
              </div>
            ))}
          </article>

          <article className="card detail-note">
            <span className="eyebrow">О минипиге</span>
            <h2 className="section-title small">{piggy.badge || piggy.age}</h2>
            <p className="section-copy">
              У каждого жителя Piggy Land свой характер, привычки и любимые занятия. Познакомьтесь поближе и приезжайте в гости за живыми эмоциями.
            </p>
            <div className="button-row">
              <Link className="button button-primary" href="/booking">
                Забронировать
              </Link>
              <Link className="button button-secondary" href="/gallery">
                Галерея
              </Link>
            </div>
          </article>
        </div>
      </AnimatedSection>
    </>
  );
}

