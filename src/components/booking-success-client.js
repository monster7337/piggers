"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/page-hero";

export function BookingSuccessClient() {
  const searchParams = useSearchParams();
  const year = new Date().getFullYear();

  const items = searchParams.get("items") || "Состав заказа уточняется";
  const services = searchParams.get("services") || "Без дополнительных услуг";
  const date = searchParams.get("date") || "Уточняется";
  const time = searchParams.get("time") || "Уточняется";
  const tickets = searchParams.get("tickets") || "1";
  const total = searchParams.get("total") || "Уточняется";
  const name = searchParams.get("name");
  const phone = searchParams.get("phone");
  const contact = name ? `${name}, ${phone}` : "Контакт будет указан в заказе";

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
              Спасибо за запись. Если планы изменятся, свяжитесь с нами заранее по телефону или через VK,
              чтобы перенести визит.
            </p>

            <div className="confirmation-grid">
              <div>
                <span>Номер брони</span>
                <strong>PL-{year}-0421</strong>
              </div>
              <div>
                <span>Билеты</span>
                <strong>{items}</strong>
              </div>
              <div>
                <span>Дата</span>
                <strong>{date}</strong>
              </div>
              <div>
                <span>Время</span>
                <strong>{time}</strong>
              </div>
              <div>
                <span>Услуги</span>
                <strong>{services}</strong>
              </div>
              <div>
                <span>Билетов</span>
                <strong>{tickets}</strong>
              </div>
              <div>
                <span>Итог</span>
                <strong>{total}</strong>
              </div>
              <div>
                <span>Контакт</span>
                <strong>{contact}</strong>
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
