import Link from "next/link";
import { withBasePath } from "@/lib/base-path";

const heroBenefits = [
  {
    desktop: "11 мини и микро пигов разных пород и возрастов",
    mobile: "11 мини и микро пигов разных пород и возрастов"
  },
  {
    desktop: "чай, кофе и сладости входят в стоимость",
    mobile: "чай, кофе и сладости входят в стоимость"
  },
  {
    desktop: "животные имеют все необходимые прививки",
    mobile: "животные имеют все необходимые прививки"
  },
  {
    desktop: "инструктаж по технике безопасности",
    mobile: "инструктаж по технике безопасности"
  },
  {
    desktop: "санитарный час перед каждым интервалом",
    mobile: "санитарный час перед каждым интервалом"
  },
  {
    desktop: "яркие фотолокации",
    mobile: "яркие фотолокации"
  },
  {
    desktop: "аренда залов под мероприятия",
    mobile: "аренда залов под мероприятия"
  }
];

export function Hero() {
  return (
    <section id="home" className="hero-section">
      <div className="hero-background">
        <picture>
          <source
            media="(max-width: 720px)"
            srcSet={withBasePath("/images/piggyland-hero-mobile.avif")}
            type="image/avif"
          />
          <source
            srcSet={withBasePath("/images/piggyland-hero-desktop.avif")}
            type="image/avif"
          />
          {/* The fallback keeps the hero visible in browsers without AVIF support. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={withBasePath("/images/piggyland-hero.webp")}
            alt="Минипиги на солнечной ферме рядом с красным амбаром"
            width="1672"
            height="941"
            fetchPriority="high"
            decoding="async"
            className="hero-background-image"
          />
        </picture>
      </div>

      <div className="container hero-fullscreen-content hero-fullscreen-grid">
        <div className="hero-copy hero-copy-overlay">
          <span className="eyebrow hero-badge">
            РАБОТАЕМ ПО ПРЕДВАРИТЕЛЬНОЙ ЗАПИСИ
          </span>
          <h1 className="hero-title">
            Пигги Лэнд
          </h1>
          <p className="hero-subtitle">
            <span className="copy-desktop">
              Антикафе в Санкт-Петербурге, где можно провести время с милыми и дружелюбными минипигами.
            </span>
            <span className="copy-mobile">
              Антикафе в Санкт-Петербурге, где можно провести время с милыми и дружелюбными минипигами.
            </span>
          </p>
          <div className="hero-description">
            <p className="hero-copy-text">
              Здесь вы можете гладить, кормить и играть с минипигами, а также делать с ними фотографии.
            </p>
            <p className="hero-copy-text">
              Кроме того, гостей ждут чай, кофе и сладости, которые входят в стоимость посещения.
            </p>
            <p className="hero-copy-text-mobile">
              Здесь вы можете гладить, кормить и играть с минипигами, а также делать с ними фотографии. Кроме того,
              гостей ждут чай, кофе и сладости, которые входят в стоимость посещения.
            </p>
          </div>

          <div className="hero-highlights">
            {heroBenefits.map((item) => (
              <span key={item.desktop} className="highlight-pill">
                <span className="copy-desktop">{item.desktop}</span>
                <span className="copy-mobile">{item.mobile}</span>
              </span>
            ))}
          </div>

          <div className="button-row">
            <Link className="button button-primary hero-primary-cta" href="/booking" prefetch={false}>
              Записаться
            </Link>
            <a className="button button-secondary hero-secondary-cta" href={withBasePath("/#rates")}>
              Посмотреть тарифы
            </a>
          </div>
        </div>
        <div className="hero-empty-column" aria-hidden="true" />
      </div>
    </section>
  );
}
