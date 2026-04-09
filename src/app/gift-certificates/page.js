import { Gift, Heart, Sparkles } from "lucide-react";
import Link from "next/link";
import { AnimatedSection } from "@/components/animated-section";
import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";
import { giftCertificates } from "@/lib/site-data";

const steps = [
  { icon: Gift, title: "Выберите номинал или тариф" },
  { icon: Heart, title: "Укажите получателя и текст поздравления" },
  { icon: Sparkles, title: "Оплатите и отправьте сертификат" }
];

export const metadata = {
  title: "Подарочные сертификаты",
  description: "Подарочные сертификаты Piggy Land: цифровой подарок на визит с минипигами с выбором тарифа или номинала."
};

export default function GiftCertificatesPage() {
  return (
    <>
      <PageHero
        eyebrow="Подарочные сертификаты"
        title="Подарок, который запоминается как теплое впечатление, а не как еще одна вещь"
        description="Страница сертификатов работает как отдельный продукт: выбор формата, получателя, текста и переход к оплате."
        primaryAction={{ href: "/booking", label: "Забронировать визит" }}
        secondaryAction={{ href: "/rates", label: "Посмотреть тарифы" }}
      />

      <AnimatedSection>
        <div className="container">
          <SectionHeading
            eyebrow="Варианты сертификатов"
            title="От конкретного тарифа до свободного номинала"
            description="Карточки ниже можно легко связать с реальной платежной логикой или формой заказа."
          />
          <div className="card-grid card-grid-3">
            {giftCertificates.map((item) => (
              <article key={item.id} className="card feature-card">
                <div className="feature-icon">
                  <Gift size={22} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <strong>{item.price.toLocaleString("ru-RU")} ₽</strong>
              </article>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="section-muted">
        <div className="container">
          <SectionHeading
            eyebrow="Как это работает"
            title="Сценарий оформления сертификата"
            description="Страница может остаться очень простой, если важнее скорость запуска, чем сложный конструктор подарка."
          />
          <div className="timeline-grid">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <article key={step.title} className="card timeline-card">
                  <div className="timeline-icon">
                    <Icon size={22} />
                  </div>
                  <span className="timeline-count">Шаг {index + 1}</span>
                  <h3>{step.title}</h3>
                </article>
              );
            })}
          </div>
          <div className="section-actions">
            <Link className="button button-primary" href="/booking">
              Перейти к бронированию
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}
