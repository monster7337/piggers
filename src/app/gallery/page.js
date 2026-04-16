import { AnimatedSection } from "@/components/animated-section";
import { CtaBanner } from "@/components/cta-banner";
import { GalleryFilter } from "@/components/gallery-filter";
import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";
import { galleryItems } from "@/lib/site-data";

export const metadata = {
  title: "Галерея",
  description: "Фильтруемая галерея Piggy Land: минипиги, интерьер, детали, семейные визиты и фотогеничные сцены."
};

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Галерея"
        title="Атмосферные кадры, после которых хочется приехать к нам в гости"
        description="Здесь собраны теплые фотографии с минипигами, гостями и уютной атмосферой Piggy Land."
        primaryAction={{ href: "/booking", label: "Забронировать визит" }}
        secondaryAction={{ href: "/rates", label: "Тарифы" }}
        imagePosition="74% 50%"
      />

      <AnimatedSection className="gallery-section">
        <div className="container">
          <SectionHeading
            eyebrow="Фото и сцены"
            title="Минипиги, гости, интерьер и теплые детали в одном визуальном потоке"
            description="Здесь собраны кадры с минипигами, атмосферой пространства, фотолокациями и теплыми моментами гостей."
          />
          <GalleryFilter items={galleryItems} />
        </div>
      </AnimatedSection>

      <CtaBanner />
    </>
  );
}
