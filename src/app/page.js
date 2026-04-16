import {
  AtSign,
  CalendarDays,
  Camera,
  Clock3,
  Coffee,
  HeartHandshake,
  Leaf,
  MapPin,
  MessageCircle,
  Phone,
  SendHorizontal,
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
    description: "Главные жители пространства встречают гостей в живой, дружелюбной и бережной атмосфере.",
    mobileDescription: "11 дружелюбных жителей встречают гостей вживую."
  },
  {
    icon: TreePine,
    title: "Чайная комната и фотолокации",
    description: "После общения со свинками можно посидеть за чаем или кофе со вкусняшками и сделать красивые кадры.",
    mobileDescription: "После визита можно спокойно выпить чай и сделать красивые фото."
  },
  {
    icon: Sparkles,
    title: "Праздники и камерные события",
    description: "У нас отмечают дни рождения, проводят корпоративы, девичники, пижамные вечеринки и романтические вечера.",
    mobileDescription: "Подходит для дня рождения, вечеринки или камерного события."
  }
];

const socialIcons = {
  vk: MessageCircle,
  telegram: SendHorizontal,
  instagram: AtSign
};

const contactCards = [
  { icon: MapPin, title: "Адрес", value: contactInfo.address, mobileValue: "6-я Советская, 28А" },
  { icon: Phone, title: "Телефон", value: contactInfo.phone, mobileValue: "+7 (921) 379-40-40", href: contactInfo.phoneLink },
  ...contactInfo.socials.map((social) => ({
    icon: socialIcons[social.id] ?? MessageCircle,
    title: social.label,
    value: social.value,
    mobileValue: social.value,
    href: social.href
  })),
  { icon: Clock3, title: "График", value: contactInfo.hours, mobileValue: "Ежедневно по записи" }
];

export default function HomePage() {
  return (
    <>
      <Hero />

      <AnimatedSection id="rates" className="home-rates-section">
        <div className="container">
          <SectionHeading
            eyebrow="Тарифы и сеансы"
            title="Выберите билет и приезжайте знакомиться с минипигами"
            description="Сразу видно, сколько стоит визит, что входит и какой вариант подойдет именно вам."
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
            description="Все просто: выберите билет, день и время, а дальше мы будем ждать вас в гости."
          />
          <VisitJourney steps={visitSteps} />
        </div>
      </AnimatedSection>

      <AnimatedSection className="experience-section">
        <div className="container">
          <SectionHeading
            eyebrow="Что вас ждет"
            title="Что ждет гостей в антикафе с минипигами"
            description="Живое общение со свинками, красивые фото, чайная комната и идеи для теплого отдыха."
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
                  <p>
                    <span className="copy-desktop">{item.description}</span>
                    <span className="copy-mobile">{item.mobileDescription || item.description}</span>
                  </p>
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
            title="Познакомьтесь с нашими минипигами поближе"
            description="У каждого свой характер, привычки и любимые занятия. Нажмите на карточку и узнайте больше."
          />
          <PiggyBrowser piggies={piggies} mobilePreviewCount={4} />
        </div>
      </AnimatedSection>

      <AnimatedSection id="gallery" className="gallery-section">
        <div className="container">
          <SectionHeading
            eyebrow="Галерея"
            title="Фотографии, после которых хочется приехать в Piggy Land"
            description="Здесь собраны наши любимые кадры: минипиги, гости и теплая атмосфера пространства."
          />
          <GalleryFilter items={galleryItems} limit={6} allCategoryLimit={3} showLink />
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
                  <p>
                    <span className="copy-desktop">{item.description}</span>
                    <span className="copy-mobile">{item.mobileDescription || item.description}</span>
                  </p>
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
            title="Гости уходят с улыбкой и возвращаются снова"
            description="Почитайте, что говорят те, кто уже успел побывать у нас."
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
          <div className="card-grid card-grid-3 contacts-grid">
            {contactCards.map((item) => {
              const Icon = item.icon;
              const content = (
                <article className="card feature-card">
                  <div className="feature-icon">
                    <Icon size={22} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>
                    <span className="copy-desktop">{item.value}</span>
                    <span className="copy-mobile">{item.mobileValue || item.value}</span>
                  </p>
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

      <AnimatedSection className="faq-section">
        <div className="container narrow-section">
          <SectionHeading
            eyebrow="FAQ"
            title="Ответы на вопросы перед бронированием"
            description="Собрали короткие ответы на то, что чаще всего спрашивают перед визитом."
            align="center"
          />
          <FaqAccordion items={faqItems} />
        </div>
      </AnimatedSection>

      <CtaBanner />
    </>
  );
}
