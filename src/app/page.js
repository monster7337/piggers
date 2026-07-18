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
  Users
} from "lucide-react";
import Link from "next/link";
import { AnimatedSection } from "@/components/animated-section";
import { AnimalRules } from "@/components/animal-rules";
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
  reviewPlatforms,
  rates,
  reviews,
  visitSteps
} from "@/lib/site-data";
import { absoluteUrl } from "@/lib/base-path";

export const metadata = {
  alternates: { canonical: absoluteUrl("/") }
};

const highlightIcons = [HeartHandshake, Leaf, Coffee, Camera, Users, Sparkles];

const aboutValues = [
  {
    icon: HeartHandshake,
    title: "В штате работает зооветтехник",
    description:
      "За состоянием животных следит специалист в области животноводства: он отвечает за уход, рационы кормления, распорядок дня, своевременные прививки и оптимальные условия содержания, отдыха и общения с гостями.",
    mobileDescription:
      "Зооветтехник ведет уход, питание, режим дня, прививки и условия содержания животных."
  },
  {
    icon: Clock3,
    title: "Тихий час после каждого интервала",
    description:
      "Для отдыха животных мы выстроили специальный режим посещения с перерывами каждый час: после каждой группы поросята спят и восстанавливаются, а инструкторы спокойно готовят пространство к следующему визиту.",
    mobileDescription:
      "После каждой группы у животных есть обязательный перерыв на сон и восстановление."
  },
  {
    icon: Sparkles,
    title: "Санитарный час и контроль среды",
    description:
      "Перед каждым интервалом в антикафе проводится сухая и влажная уборка с дезинфицирующими средствами и кварцеванием отдельных зон. Во всех залах постоянно идет рециркуляция воздуха, а температура и влажность помещения находятся под контролем.",
    mobileDescription:
      "Перед каждой группой проводится уборка и дезинфекция, а воздух, температура и влажность постоянно контролируются."
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
            eyebrow="Билеты и время посещения"
            title="Выберите билет и приезжайте знакомиться с минипигами"
            description="Сразу видно, сколько стоит визит, что входит и какой вариант подойдет именно вам."
            mobileDescription="Быстро посмотрите цены, формат визита и выберите свой билет."
            actions={
              <div className="home-rates-actions">
                <Link className="button button-secondary" href="/booking" prefetch={false}>
                  Перейти к бронированию
                </Link>
                <Link className="button button-primary button-shimmer" href="/gift-certificates" prefetch={false}>
                  Купить сертификат
                </Link>
              </div>
            }
          />
          <div className="card-grid card-grid-4">
            {rates.map((rate) => (
              <RateCard key={rate.id} rate={rate} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection id="piggies" className="section-muted">
        <div className="container">
          <SectionHeading
            eyebrow="Наши минипиги"
            title="Познакомьтесь с нашими минипигами поближе"
            description="Показываем самых заметных жителей. Ниже можно открыть галерею всех минипигов и подробно посмотреть каждого прямо на главной."
            mobileDescription="Откройте самых заметных жителей и посмотрите их карточки прямо здесь."
          />
          <PiggyBrowser piggies={piggies} previewCount={6} />
        </div>
      </AnimatedSection>

      <AnimatedSection className="journey-section">
        <div className="container">
          <SectionHeading
            eyebrow="Как проходит визит"
            title="Путь гостя от интереса до незабываемого часа с минипигами"
            description="Все просто: выберите билет, день и время, а дальше мы будем ждать вас в гости."
            mobileDescription="Четыре коротких шага от выбора билета до встречи со свинками."
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
            mobileDescription="Фото, чайная комната, праздники и живое общение со свинками."
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

      <AnimatedSection id="gallery" className="gallery-section">
        <div className="container">
          <SectionHeading
            eyebrow="Галерея"
            title="Фотографии, после которых хочется приехать в Piggy Land"
            description="Здесь собраны наши любимые кадры: минипиги, гости и теплая атмосфера пространства."
            mobileDescription="Лучшие кадры с минипигами, гостями и атмосферой пространства."
          />
          <GalleryFilter items={galleryItems} limit={6} allCategoryLimit={3} showLink />
        </div>
      </AnimatedSection>

      <AnimalRules />

      <AnimatedSection id="about" className="section-muted">
        <div className="container">
          <SectionHeading
            eyebrow="О нас"
            title="Наши принципиальные отличия от других подобных пространств"
            description="Для нас важны не только впечатления гостей, но и профессиональный уход, режим отдыха животных и санитарный контроль пространства."
            mobileDescription="Показываем, как у нас устроены уход, отдых животных и санитарный режим."
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
            mobileDescription="Реальные отзывы, награды и фото гостей."
          />
          <ReviewsStrip reviews={reviews} platforms={reviewPlatforms} />
        </div>
      </AnimatedSection>

      <AnimatedSection id="contacts" className="section-muted">
        <div className="container">
          <SectionHeading
            eyebrow="Контакты"
            title="Санкт-Петербург, 6-я Советская, 28А"
            description="Свяжитесь с нами по телефону или через VK и заранее запишитесь на визит в удобное время."
            mobileDescription="Телефон, адрес и соцсети для быстрой записи."
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
            mobileDescription="Коротко собрали главное перед визитом."
            align="center"
          />
          <FaqAccordion items={faqItems} />
        </div>
      </AnimatedSection>

      <CtaBanner />
    </>
  );
}
