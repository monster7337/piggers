import Link from "next/link";
import { contactInfo, navigation } from "@/lib/site-data";

const legalLinks = [
  { label: "Политика", href: "/policy" },
  { label: "Оферта", href: "/offer" },
  { label: "Правила посещения", href: "/visit-rules" }
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="brand-lockup">
            <span className="brand-badge">PL</span>
            <span className="brand-copy">
              <strong>Piggy Land</strong>
              <span>Антикафе с минипигами в Санкт-Петербурге</span>
            </span>
          </div>
          <p className="footer-note">
            Работаем по предварительной записи. Вас ждут 11 мини и микро пигов, чайная комната со
            вкусняшками, фотолокации и форматы для теплых встреч и праздников.
          </p>
        </div>

        <div>
          <h3 className="footer-title">Навигация</h3>
          <div className="footer-links">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="footer-title">Контакты</h3>
          <div className="footer-links">
            <a href={contactInfo.phoneLink}>{contactInfo.phone}</a>
            {contactInfo.email && contactInfo.emailLink ? <a href={contactInfo.emailLink}>{contactInfo.email}</a> : null}
            {contactInfo.socials.map((social) => (
              <a key={social.id} href={social.href} target="_blank" rel="noreferrer">
                {social.value}
              </a>
            ))}
            <span>{contactInfo.address}</span>
            <span>{contactInfo.hours}</span>
          </div>
        </div>

        <div>
          <h3 className="footer-title">Документы</h3>
          <div className="footer-links">
            {legalLinks.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <Link className="button button-primary button-block footer-booking" href="/booking">
              Забронировать
            </Link>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>Piggy Land, 2026</span>
        <span>{contactInfo.note}</span>
      </div>
    </footer>
  );
}
