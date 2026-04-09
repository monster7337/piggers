import Link from "next/link";

export function CtaBanner() {
  return (
    <section className="section">
      <div className="container">
        <div className="cta-banner">
          <div>
            <span className="eyebrow">Быстрый путь к брони</span>
            <h2 className="section-title">Выберите удобное время и запишитесь к нашим минипигам заранее.</h2>
            <p className="section-copy">
              Мы работаем по предварительной записи: выберите билет, дату, время и быстро зафиксируйте теплый визит с чаем, фотолокациями и 11 свинками.
            </p>
          </div>
          <div className="button-row">
            <Link className="button button-primary" href="/booking">
              Забронировать сейчас
            </Link>
            <Link className="button button-secondary" href="/gift-certificates">
              Купить сертификат
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
