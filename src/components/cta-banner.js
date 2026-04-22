import Link from "next/link";

export function CtaBanner() {
  return (
    <section className="section">
      <div className="container">
        <div className="cta-banner">
          <div>
            <span className="eyebrow">Запишитесь заранее</span>
            <h2 className="section-title">
              <span className="copy-desktop">Выберите удобное время и запишитесь к нашим минипигам заранее.</span>
              <span className="copy-mobile">Выберите удобный сеанс и приезжайте к минипигам.</span>
            </h2>
            <p className="section-copy">
              <span className="copy-desktop">
                Мы работаем по предварительной записи: выберите билет, день и время, а дальше мы с радостью будем ждать вас в гости.
              </span>
              <span className="copy-mobile">Билет, дата и время выбираются за пару шагов прямо на сайте.</span>
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
