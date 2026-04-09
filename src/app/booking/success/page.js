import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/page-hero";

export const metadata = {
  title: "Подтверждение брони",
  description: "Страница успешного подтверждения бронирования Piggy Land с составом заказа и деталями визита."
};

export default async function BookingSuccessPage({ searchParams }) {
  const params = await searchParams;

  return (
    <>
      <PageHero
        eyebrow="Бронь подтверждена"
        title="Спасибо, ваш теплый визит в Piggy Land забронирован"
        description="После успешного оформления гость видит номер брони, состав заказа, дату, время визита и контактные данные."
        primaryAction={{ href: "/", label: "Вернуться на главную" }}
        secondaryAction={{ href: "/booking", label: "Оформить еще одну бронь" }}
      />

      <section className="section">
        <div className="container">
          <article className="card success-card">
            <div className="success-icon">
              <CheckCircle2 size={28} />
            </div>
            <h2>Подтверждение брони</h2>
            <p className="section-copy">
              Спасибо за запись. Если планы изменятся, свяжитесь с нами заранее по телефону или через VK, чтобы перенести визит.
            </p>

            <div className="confirmation-grid">
              <div>
                <span>Номер брони</span>
                <strong>PL-{new Date().getFullYear()}-0421</strong>
              </div>
              <div>
                <span>Билеты</span>
                <strong>{params.items || "Состав заказа уточняется"}</strong>
              </div>
              <div>
                <span>Дата</span>
                <strong>{params.date || "Уточняется"}</strong>
              </div>
              <div>
                <span>Время</span>
                <strong>{params.time || "Уточняется"}</strong>
              </div>
              <div>
                <span>Услуги</span>
                <strong>{params.services || "Без дополнительных услуг"}</strong>
              </div>
              <div>
                <span>Билетов</span>
                <strong>{params.tickets || "1"}</strong>
              </div>
              <div>
                <span>Итог</span>
                <strong>{params.total || "Уточняется"}</strong>
              </div>
              <div>
                <span>Контакт</span>
                <strong>{params.name ? `${params.name}, ${params.phone}` : "Контакт будет указан в заказе"}</strong>
              </div>
            </div>

            <div className="button-row">
              <Link className="button button-primary" href="/">
                Вернуться на главную
              </Link>
              <Link className="button button-secondary" href="/visit-rules">
                Правила посещения
              </Link>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
