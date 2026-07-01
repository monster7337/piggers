import Link from "next/link";
import { PageHero } from "@/components/page-hero";

export function LegalPage({ eyebrow, title, description, sections, returnHref = "/booking", returnLabel = "Вернуться к записи" }) {
  return (
    <>
      <div className="legal-top-return">
        <div className="container">
          <Link href={returnHref} className="button button-secondary">
            ← {returnLabel}
          </Link>
        </div>
      </div>
      <PageHero
        eyebrow={eyebrow}
        title={title}
        description={description}
        primaryAction={{ href: "/booking", label: "Перейти к бронированию" }}
        hideImage
      />
      <section className="section">
        <div className="container legal-content">
          {sections.map((section, index) => (
            <section id={`section-${index + 1}`} key={section.title} className="legal-section">
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}

          <div className="mt-6">
            <Link href={returnHref} className="button button-secondary">
              {returnLabel}
            </Link>
          </div>
        </div>
      </section>
      <div className="legal-mobile-return">
        <Link href={returnHref} className="button button-primary">
          ← {returnLabel}
        </Link>
      </div>
    </>
  );
}
