import { Check, HeartHandshake, Sparkles, TreePine } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";
import { CtaBanner } from "@/components/cta-banner";
import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";

export const metadata = {
  title: "О нас",
  description: "О Piggy Land: антикафе с 11 мини и микро пигами в Санкт-Петербурге, чайной комнатой и форматами для праздников."
};

const values = [
  {
    icon: HeartHandshake,
    title: "11 мини и микро пигов",
    description: "Главная ценность пространства в живом знакомстве со свинками, у каждой из которых свой характер и привычки."
  },
  {
    icon: Sparkles,
    title: "Фотолокации и чайная комната",
    description: "Гости могут сделать теплые кадры, а затем спокойно посидеть за чаем или кофе со вкусняшками."
  },
  {
    icon: TreePine,
    title: "Праздники и особые поводы",
    description: "У нас проводят дни рождения, корпоративы, девичники, пижамные вечеринки и романтические вечера."
  }
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="О нас"
        title="Piggy Land в Санкт-Петербурге создан как место для теплых встреч с минипигами"
        description="Мы работаем по предварительной записи и приглашаем гостей в пространство с 11 мини и микро пигами, фотолокациями и чайной комнатой."
        primaryAction={{ href: "/booking", label: "Забронировать визит" }}
        secondaryAction={{ href: "/gallery", label: "Посмотреть галерею" }}
      />

      <AnimatedSection>
        <div className="container split-grid">
          <article className="card detail-note">
            <span className="eyebrow">История</span>
            <h2 className="section-title small">Почему появился Piggy Land</h2>
            <p className="section-copy">
              Мы хотели собрать в одном месте живое общение с минипигами, уютную чайную комнату и красивое
              пространство, куда хочется прийти не один раз, а возвращаться снова за эмоциями и теплом.
            </p>
          </article>
          <article className="card detail-note">
            <span className="eyebrow">Атмосфера</span>
            <h2 className="section-title small">Как мы хотим, чтобы чувствовал себя гость</h2>
            <p className="section-copy">
              Гость приходит к нашим одиннадцати свинкам, делает красивые фото, отдыхает за чаем или кофе
              и может провести здесь день рождения, девичник, корпоратив или романтический вечер.
            </p>
          </article>
        </div>
      </AnimatedSection>

      <AnimatedSection className="section-muted">
        <div className="container">
          <SectionHeading
            eyebrow="Принципы"
            title="Что делает пространство особенным для гостей"
            description="В центре внимания живое общение с минипигами, уют и формат, который легко адаптировать под разный повод."
          />
          <div className="card-grid card-grid-3">
            {values.map((item) => {
              const Icon = item.icon;

              return (
                <article key={item.title} className="card feature-card">
                  <div className="feature-icon">
                    <Icon size={22} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection>
        <div className="container">
          <SectionHeading
            eyebrow="Забота о минипигах"
            title="Правила комфорта для жителей пространства"
            description="Мы бережно выстраиваем визиты так, чтобы комфортно было и гостям, и нашим мини и микро пигам."
          />
          <div className="card feature-list">
            {[
              "Гости знакомятся с понятными правилами общения перед сеансом.",
              "Ритм визитов строится так, чтобы не перегружать животных.",
              "В пространстве предусмотрены тихие зоны и комфортные укрытия.",
              "Фотографирование работает без резких вспышек и стресса."
            ].map((item) => (
              <div key={item} className="list-row">
                <Check size={18} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <CtaBanner />
    </>
  );
}
