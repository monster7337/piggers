import { AnimatedSection } from "@/components/animated-section";
import { CtaBanner } from "@/components/cta-banner";
import { PageHero } from "@/components/page-hero";
import { PiggyCard } from "@/components/piggy-card";
import { SectionHeading } from "@/components/section-heading";
import { piggies } from "@/lib/site-data";

export const metadata = {
  title: "Наши минипиги",
  description: "Знакомство с жителями Piggy Land: характер, возраст, особенности и теплые факты о каждом минипиге."
};

export default function PiggiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Наши минипиги"
        title="Здесь живут разные характеры, а не обезличенные карточки"
        description="Страница показывает жителей Piggy Land и помогает эмоционально привязаться к месту еще до бронирования."
        primaryAction={{ href: "/booking", label: "Забронировать визит" }}
        secondaryAction={{ href: "/gallery", label: "Посмотреть галерею" }}
        imagePosition="82% 54%"
      />

      <AnimatedSection>
        <div className="container">
          <SectionHeading
            eyebrow="Жители пространства"
            title="Каждый минипиг со своим темпераментом, привычками и настроением"
            description="На этой странице не должно быть цен и сценариев покупки. Только знакомство и атмосфера."
          />
          <div className="card-grid card-grid-3">
            {piggies.map((piggy) => (
              <PiggyCard key={piggy.slug} piggy={piggy} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      <CtaBanner />
    </>
  );
}
