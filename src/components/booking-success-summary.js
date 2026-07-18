"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function BookingSuccessSummary() {
  const searchParams = useSearchParams();
  const year = new Date().getFullYear();
  const type = searchParams.get("type") || "booking";
  const bookingId = searchParams.get("bookingId");
  const items = searchParams.get("items");
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const tickets = searchParams.get("tickets");
  const total = searchParams.get("total");
  const prepayment = searchParams.get("prepayment");
  const remaining = searchParams.get("remaining");
  const name = searchParams.get("name");
  const phone = searchParams.get("phone");
  const recipient = searchParams.get("recipient");

  return (
    <article className="card success-card">
      <div className="success-icon">
        <span aria-hidden="true">✓</span>
      </div>
      <h2>{type === "gift" ? "Сертификат оформлен" : "Подтверждение бронирования"}</h2>
      <p className="section-copy">
        {type === "gift"
          ? "Оплата прошла полностью. Заказ уже сохранен, и мы сможем подготовить сертификат по вашим данным."
          : "Спасибо за запись. Если планы изменятся, свяжитесь с нами заранее по телефону или через VK, чтобы перенести визит."}
      </p>

      <div className="confirmation-grid">
        <div>
          <span>{type === "gift" ? "Номер заказа" : "Номер бронирования"}</span>
          <strong>{bookingId ? `PL-${year}-${bookingId.slice(0, 8).toUpperCase()}` : `PL-${year}-0421`}</strong>
        </div>
        <div>
          <span>{type === "gift" ? "Сертификат" : "Билеты"}</span>
          <strong>{items || "Состав заказа уточняется"}</strong>
        </div>
        <div>
          <span>{type === "gift" ? "Дата покупки" : "Дата"}</span>
          <strong>{date || "Уточняется"}</strong>
        </div>
        <div>
          <span>{type === "gift" ? "Время покупки" : "Время"}</span>
          <strong>{time || "Уточняется"}</strong>
        </div>
        {type === "gift" ? (
          <div>
            <span>Получатель</span>
            <strong>{recipient || "Укажем при подтверждении"}</strong>
          </div>
        ) : null}
        {type === "gift" ? (
          <div>
            <span>Оплата</span>
            <strong>Полностью на сайте</strong>
          </div>
        ) : (
          <div>
            <span>Билетов</span>
            <strong>{tickets || "1"}</strong>
          </div>
        )}
        <div>
          <span>Итог</span>
          <strong>{total || "Уточняется"}</strong>
        </div>
        <div>
          <span>{type === "gift" ? "Оплачено" : "Предоплата"}</span>
          <strong>{prepayment || "Уточняется"}</strong>
        </div>
        <div>
          <span>{type === "gift" ? "Остаток" : "К оплате на месте"}</span>
          <strong>{remaining || "0 ₽"}</strong>
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
