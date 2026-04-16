"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function BookingSuccessSummary() {
  const searchParams = useSearchParams();
  const year = new Date().getFullYear();
  const items = searchParams.get("items");
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const services = searchParams.get("services");
  const tickets = searchParams.get("tickets");
  const total = searchParams.get("total");
  const name = searchParams.get("name");
  const phone = searchParams.get("phone");

  return (
    <article className="card success-card">
      <div className="success-icon">
        <span aria-hidden="true">✓</span>
      </div>
      <h2>Подтверждение брони</h2>
      <p className="section-copy">
        Спасибо за запись. Если планы изменятся, свяжитесь с нами заранее по телефону или через VK, чтобы перенести визит.
      </p>

      <div className="confirmation-grid">
        <div>
          <span>Номер брони</span>
          <strong>PL-{year}-0421</strong>
        </div>
        <div>
          <span>Билеты</span>
          <strong>{items || "Состав заказа уточняется"}</strong>
        </div>
        <div>
          <span>Дата</span>
          <strong>{date || "Уточняется"}</strong>
        </div>
        <div>
          <span>Время</span>
          <strong>{time || "Уточняется"}</strong>
        </div>
        <div>
          <span>Услуги</span>
          <strong>{services || "Без дополнительных услуг"}</strong>
        </div>
        <div>
          <span>Билетов</span>
          <strong>{tickets || "1"}</strong>
        </div>
        <div>
          <span>Итог</span>
          <strong>{total || "Уточняется"}</strong>
        </div>
        <div>
          <span>Контакт</span>
          <strong>{name ? `${name}, ${phone}` : "Контакт будет указан в заказе"}</strong>
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
  );
}
