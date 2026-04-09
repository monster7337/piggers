import { PageHero } from "@/components/page-hero";

export function LegalPage({ eyebrow, title, description, sections }) {
  return (
    <>
      <PageHero
        eyebrow={eyebrow}
        title={title}
        description={description}
        primaryAction={{ href: "/booking", label: "Перейти к бронированию" }}
      />
      <section className="section">
        <div className="container legal-content">
          {sections.map((section) => (
            <section key={section.title} className="legal-section">
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>
      </section>
    </>
  );
}
