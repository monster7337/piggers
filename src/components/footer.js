import { AtSign, BookOpen, CalendarDays, FileText, Images, MapPin, MessageCircle, Phone, PiggyBank, Send, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { withBasePath } from "@/lib/base-path";
import { businessInfo, contactInfo, navigation } from "@/lib/site-data";

const legalLinks = [
  { label: "Политика", href: "/privacy-policy", icon: ShieldCheck },
  { label: "Оферта", href: "/public-offer", icon: FileText },
  { label: "Правила посещения", href: "/visit-rules", icon: BookOpen }
];

const footerNavigation = navigation.filter((item) => item.section && item.section !== "home");

const navigationIcons = {
  rates: CalendarDays,
  piggies: PiggyBank,
  gallery: Images,
  about: Sparkles,
  contacts: MapPin
};

const socialIcons = {
  vk: MessageCircle,
  telegram: Send,
  instagram: AtSign
};

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="brand-lockup">
            <span className="brand-badge brand-badge-logo">
              <img
                src={withBasePath("/images/piggilandlogo-icon.webp")}
                alt=""
                className="brand-logo-image"
                width="48"
                height="48"
                decoding="async"
              />
            </span>
            <span className="brand-copy">
              <strong>Piggy Land</strong>
              <span>Антикафе с минипигами в Санкт-Петербурге</span>
            </span>
          </div>
          <p className="footer-note">
            Работаем по предварительной записи. Вас ждут 11 мини и микро пигов, чайная комната со
            вкусняшками, фотолокации и уютные визиты для теплых встреч и праздников.
          </p>
        </div>

        <div>
          <h3 className="footer-title">Навигация</h3>
          <div className="footer-links">
            {footerNavigation.map((item) => {
              const Icon = navigationIcons[item.section] ?? Sparkles;

              return (
                <Link key={item.href} href={item.href} className="footer-link-item">
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="footer-contacts-panel">
          <h3 className="footer-title">Контакты</h3>
          <div className="footer-links">
            <a href={contactInfo.phoneLink} className="footer-link-item">
              <Phone size={16} />
              <span>{contactInfo.phone}</span>
            </a>
            {contactInfo.email && contactInfo.emailLink ? (
              <a href={contactInfo.emailLink} className="footer-link-item">
                <MessageCircle size={16} />
                <span>{contactInfo.email}</span>
              </a>
            ) : null}
            {contactInfo.socials.map((social) => {
              const Icon = socialIcons[social.id] ?? MessageCircle;

              return (
                <a key={social.id} href={social.href} target="_blank" rel="noreferrer" className="footer-link-item">
                  <Icon size={16} />
                  <span>{social.value}</span>
                </a>
              );
            })}
            <span className="footer-link-item">
              <MapPin size={16} />
              <span>{contactInfo.address}</span>
            </span>
            <span className="footer-link-item">
              <CalendarDays size={16} />
              <span>{contactInfo.hours}</span>
            </span>
          </div>
        </div>

        <div>
          <h3 className="footer-title">Документы</h3>
          <div className="footer-links">
            {legalLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link key={item.href} href={item.href} className="footer-link-item">
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <Link className="button button-primary button-block footer-booking" href="/booking">
              Забронировать
            </Link>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <div className="footer-bottom-copy">
          <span>Piggy Land, 2026</span>
          <span>{contactInfo.note}</span>
        </div>
        <div className="footer-requisites" aria-label="Реквизиты ИП">
          <span className="footer-requisites-title">Реквизиты ИП</span>
          <span>ИНН {businessInfo.inn}</span>
          <span>ОГРН {businessInfo.ogrn}</span>
          <span>{businessInfo.fullName}</span>
        </div>
      </div>

      <div className="container footer-legal-bar">
        <p className="footer-legal-disclaimer">
          Все материалы и цены, размещенные на сайте, носят справочный характер и не являются публичной офертой,
          определяемой положением Статьи 437(2) Гражданского кодекса Российской Федерации.
        </p>
        <Link href="/privacy-policy" className="footer-legal-policy">
          Политика конфиденциальности
        </Link>
      </div>
    </footer>
  );
}
