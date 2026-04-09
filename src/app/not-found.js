import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section className="section not-found-page">
      <div className="container">
        <div className="card not-found-card">
          <span className="eyebrow">404</span>
          <h1 className="page-title">Эта тропинка не ведет к минипигам</h1>
          <p className="page-copy">
            Похоже, страницы больше нет или ссылка устарела. Вернемся на главную и продолжим путь к бронированию.
          </p>
          <div className="button-row">
            <Link className="button button-primary" href="/">
              На главную
            </Link>
            <Link className="button button-secondary" href="/booking">
              К бронированию
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

