import { AtSign, Clock3, MapPin, MessageCircle, Phone, SendHorizontal } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";
import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";
import { contactInfo } from "@/lib/site-data";

export const metadata = {
  title: "Контакты",
  description: "Контакты антикафе Piggy Land в Санкт-Петербурге: адрес, телефон, VK, Telegram, Instagram, график и предварительная запись."
};

const socialIcons = {
  vk: MessageCircle,
  telegram: SendHorizontal,
  instagram: AtSign
};

const contactCards = [
  { icon: MapPin, title: "Адрес", value: contactInfo.address },
  { icon: Phone, title: "Телефон", value: contactInfo.phone, href: contactInfo.phoneLink },
  ...contactInfo.socials.map((social) => ({
    icon: socialIcons[social.id] ?? MessageCircle,
    title: social.label,
    value: social.value,
    href: social.href
  })),
  { icon: Clock3, title: "График", value: contactInfo.hours }
];

export default function ContactsPage() {
  return (
    <>
      <PageHero
        eyebrow="Контакты"
        title="Найдите Piggy Land в центре Санкт-Петербурга и запишитесь заранее"
        description="Мы работаем по предварительной записи. Ниже собраны телефон, VK, адрес и короткие подсказки перед визитом."
        primaryAction={{ href: "/booking", label: "Забронировать" }}
      />

      <AnimatedSection>
        <div className="container">
          <SectionHeading
            eyebrow="Связь"
            title="Контакты, которые всегда под рукой"
            description="Позвоните или напишите нам и заранее выберите удобное время для визита."
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

      <AnimatedSection className="section-muted">
        <div className="container split-grid">
          <div className="card map-card">
            <span className="eyebrow">Адрес</span>
            <h2 className="section-title small">6-я Советская улица, дом 28А, помещение 3-Н</h2>
            <p className="section-copy">
              Пространство находится в Санкт-Петербурге. Перед приездом важно оформить предварительную запись, чтобы мы закрепили за вами удобное время.
            </p>
          </div>
          <div className="card detail-note">
            <span className="eyebrow">Что вас ждет</span>
            <h2 className="section-title small">11 свинок, чайная комната и теплые встречи</h2>
            <p className="section-copy">
              У нас отмечают дни рождения, проводят корпоративы, девичники, пижамные вечеринки и романтические вечера. Чай, кофе и вкусняшки входят в стоимость визита.
            </p>
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}
