import { Check, Gift, Sparkles } from "lucide-react";
import Link from "next/link";
import { AnimatedSection } from "@/components/animated-section";
import { CtaBanner } from "@/components/cta-banner";
import { FaqAccordion } from "@/components/faq-accordion";
import { PageHero } from "@/components/page-hero";
import { RateCard } from "@/components/rate-card";
import { SectionHeading } from "@/components/section-heading";
import { extras, faqItems, rates } from "@/lib/site-data";

export const metadata = {
  title: "Тарифы и услуги",
  description: "Тарифы и услуги Piggy Land в Санкт-Петербурге: билеты, льготные форматы, семейные визиты и дополнительные активности."
};

export default function RatesPage() {
  return (
    <>
      <PageHero
        eyebrow="Тарифы / Услуги"
        title="Выберите формат визита под настроение, количество гостей и повод"
        description="У нас можно выбрать билет для обычного визита, семьи или льготного посещения, а также добавить кормление и другие приятные детали."
        primaryAction={{ href: "/booking", label: "Перейти к бронированию" }}
        secondaryAction={{ href: "/gift-certificates", label: "Подарочные сертификаты" }}
      />

      <AnimatedSection>
        <div className="container">
          <SectionHeading
            eyebrow="Основные форматы"
            title="Билеты для спокойного визита, семьи и особых условий"
            description="Каждый тариф показывает стоимость, длительность и сценарий посещения без перегруженных таблиц."
          />
          <div className="card-grid card-grid-4">
            {rates.map((rate) => (
              <RateCard key={rate.id} rate={rate} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="section-muted">
        <div className="container split-grid">
          <div>
          <SectionHeading
            eyebrow="Что включено"
            title="Базовые преимущества каждого тарифа"
            description="В каждом тарифе сохраняется понятный и дружелюбный состав визита без перегруженных сравнений."
          />
            <div className="card feature-list">
              {[
                "Встреча с 11 мини и микро пигами",
                "Чай, кофе и вкусняшки в чайной комнате",
                "Инструктаж по мягкому и безопасному общению",
                "Красочные фотолокации для теплых кадров"
              ].map((item) => (
                <div key={item} className="list-row">
                  <Check size={18} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
          <SectionHeading
            eyebrow="Дополнительно"
            title="Небольшие дополнения к визиту"
            description="К заказу можно добавить лакомства для свинок и другие приятные активности."
          />
            <div className="card-grid card-grid-3 compact-grid">
              {extras.map((item, index) => {
                const Icon = index === 0 ? Sparkles : index === 1 ? Gift : Check;

                return (
                  <article key={item.id} className="card feature-card">
                    <div className="feature-icon">
                      <Icon size={22} />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <strong>{item.price.toLocaleString("ru-RU")} ₽</strong>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="faq-section">
        <div className="container narrow-section">
          <SectionHeading
            eyebrow="FAQ"
            title="Ответы на частые вопросы по бронированию"
            description="Этот блок закрывает сомнения перед оформлением сеанса."
            align="center"
          />
          <FaqAccordion items={faqItems} />
          <div className="section-actions">
            <Link className="button button-primary" href="/booking">
              Перейти к бронированию
            </Link>
          </div>
        </div>
      </AnimatedSection>

      <CtaBanner />
    </>
  );
}
