import {
  CalendarDays,
  Camera,
  Clock3,
  Coffee,
  HeartHandshake,
  Leaf,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  TreePine,
  Users
} from "lucide-react";
import Link from "next/link";
import { AnimatedSection } from "@/components/animated-section";
import { CtaBanner } from "@/components/cta-banner";
import { FaqAccordion } from "@/components/faq-accordion";
import { GalleryFilter } from "@/components/gallery-filter";
import { Hero } from "@/components/hero";
import { PiggyBrowser } from "@/components/piggy-browser";
import { RateCard } from "@/components/rate-card";
import { ReviewsStrip } from "@/components/reviews-strip";
import { SectionHeading } from "@/components/section-heading";
import { VisitJourney } from "@/components/visit-journey";
import {
  contactInfo,
  experienceHighlights,
  faqItems,
  galleryItems,
  piggies,
  rates,
  reviews,
  visitSteps
} from "@/lib/site-data";

const highlightIcons = [HeartHandshake, Leaf, Coffee, Camera, Users, Sparkles];

const aboutValues = [
  {
    icon: HeartHandshake,
    title: "11 мини и микро пигов",
    description: "Главные жители пространства встречают гостей в живой, дружелюбной и бережной атмосфере."
  },
  {
    icon: TreePine,
    title: "Чайная комната и фотолокации",
    description: "После общения со свинками можно посидеть за чаем или кофе со вкусняшками и сделать красивые кадры."
  },
  {
    icon: Sparkles,
    title: "Праздники и камерные события",
    description: "У нас отмечают дни рождения, проводят корпоративы, девичники, пижамные вечеринки и романтические вечера."
  }
];

const contactCards = [
  { icon: MapPin, title: "Адрес", value: contactInfo.address },
  { icon: Phone, title: "Телефон", value: contactInfo.phone, href: contactInfo.phoneLink },
  { icon: MessageCircle, title: contactInfo.socialLabel, value: contactInfo.socialValue, href: contactInfo.socialLink },
  { icon: Clock3, title: "График", value: contactInfo.hours }
];

export default function HomePage() {
  return (
    <>
      <Hero />

      <AnimatedSection id="rates" className="home-rates-section">
        <div className="container">
          <SectionHeading
            eyebrow="Тарифы и сеансы"
            title="Форматы посещения, которые сразу ведут к бронированию"
            description="Это первый прикладной блок после атмосферы: человек быстро понимает сценарии визита, стоимость и куда нажать дальше."
            actions={
              <Link className="button button-secondary" href="/booking">
                Перейти к бронированию
              </Link>
            }
          />
          <div className="card-grid card-grid-4">
            {rates.map((rate) => (
              <RateCard key={rate.id} rate={rate} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="journey-section">
        <div className="container">
          <SectionHeading
            eyebrow="Как проходит визит"
            title="Путь гостя от интереса до теплого часа с минипигами"
            description="Воронка очень простая: формат, слот, подтверждение и приятный визит без лишних шагов."
          />
          <VisitJourney steps={visitSteps} />
        </div>
      </AnimatedSection>

      <AnimatedSection className="experience-section">
        <div className="container">
          <SectionHeading
            eyebrow="Что вас ждет"
            title="Что ждет гостей в антикафе с минипигами"
            description="Здесь собраны ключевые причины приехать: живое общение со свинками, фотолокации, чайная комната и форматы для разных поводов."
          />
          <div className="card-grid card-grid-3">
            {experienceHighlights.map((item, index) => {
              const Icon = highlightIcons[index];

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

      <AnimatedSection id="piggies" className="section-muted">
        <div className="container">
          <SectionHeading
            eyebrow="Наши минипиги"
            title="Жители пространства, с которыми гости знакомятся вживую"
            description="На странице остается чистая сетка, а подробности о характере, привычках и фактах открываются в модальном окне."
          />
          <PiggyBrowser piggies={piggies} />
        </div>
      </AnimatedSection>

      <AnimatedSection id="gallery">
        <div className="container">
          <SectionHeading
            eyebrow="Галерея"
            title="Ключевые фото на странице, а полный просмотр уже в модальном просмотрщике"
            description="На лендинге остаются лучшие кадры, а вся галерея раскрывается поверх страницы с переключением вперед и назад."
          />
          <GalleryFilter items={galleryItems} limit={6} showLink />
        </div>
      </AnimatedSection>

      <AnimatedSection id="about" className="section-muted">
        <div className="container">
          <SectionHeading
            eyebrow="О нас"
            title="Антикафе в Петербурге для теплого отдыха и ярких событий"
            description="Мы работаем по предварительной записи и приглашаем гостей в пространство, где можно не только познакомиться со свинками, но и провести особенный вечер."
          />
          <div className="card-grid card-grid-3">
            {aboutValues.map((item) => {
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

      <AnimatedSection className="reviews-section">
        <div className="container">
          <SectionHeading
            eyebrow="Отзывы"
            title="Социальное доказательство без сухой корпоративности"
            description="Отзывы поддерживают доверие перед бронированием и подтверждают, что формат действительно нравится гостям."
          />
          <ReviewsStrip reviews={reviews} />
        </div>
      </AnimatedSection>

      <AnimatedSection id="contacts" className="section-muted">
        <div className="container">
          <SectionHeading
            eyebrow="Контакты"
            title="Санкт-Петербург, 6-я Советская, 28А"
            description="Свяжитесь с нами по телефону или через VK и заранее запишитесь на визит в удобное время."
          />
          <div className="card-grid card-grid-3">
            {contactCards.map((item) => {
              const Icon = item.icon;
              const content = (
                <article className="card feature-card">
                  <div className="feature-icon">
                    <Icon size={22} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.value}</p>
                </article>
              );

              return item.href ? (
                <a key={item.title} href={item.href} className="plain-link" target="_blank" rel="noreferrer">
                  {content}
                </a>
              ) : (
                <div key={item.title}>{content}</div>
              );
            })}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection>
        <div className="container narrow-section">
          <SectionHeading
            eyebrow="FAQ"
            title="Ответы на вопросы перед бронированием"
            description="Accordion закрывает типовые возражения и помогает не терять пользователя на пути к оплате."
            align="center"
          />
          <FaqAccordion items={faqItems} />
        </div>
      </AnimatedSection>

      <CtaBanner />
    </>
  );
}
