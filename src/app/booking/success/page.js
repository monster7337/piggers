import { Suspense } from "react";
import { CheckCircle2 } from "lucide-react";
import { BookingSuccessSummary } from "@/components/booking-success-summary";
import { PageHero } from "@/components/page-hero";

export const metadata = {
  title: "Оформление завершено",
  description: "Страница подтверждения бронирования или успешно оплаченного подарочного сертификата Piggy Land.",
  robots: { index: false, follow: false }
};

function BookingSuccessFallback() {
  return (
    <article className="card success-card">
      <div className="success-icon">
        <CheckCircle2 size={28} />
      </div>
      <h2>Оформление завершено</h2>
      <p className="section-copy">
        Спасибо за запись. Если планы изменятся, свяжитесь с нами заранее по телефону или через VK, чтобы перенести визит.
      </p>

      <div className="confirmation-grid">
        <div>
          <span>Номер бронирования</span>
          <strong>PL-{new Date().getFullYear()}-0421</strong>
        </div>
        <div>
          <span>Билеты</span>
          <strong>Состав заказа уточняется</strong>
        </div>
        <div>
          <span>Дата</span>
          <strong>Уточняется</strong>
        </div>
        <div>
          <span>Время</span>
          <strong>Уточняется</strong>
        </div>
      </div>
    </article>
  );
}

export default function BookingSuccessPage() {
  return (
    <>
      <PageHero
        eyebrow="Оформление завершено"
        title="Заказ принят и уже сохранен"
        description="После оформления гость видит номер бронирования или заказа, оплату, дату, время и контактные данные."
        primaryAction={{ href: "/", label: "Вернуться на главную" }}
        secondaryAction={{ href: "/booking", label: "Оформить еще одно бронирование" }}
        hideImage
      />

      <section className="section">
        <div className="container">
          <Suspense fallback={<BookingSuccessFallback />}>
            <BookingSuccessSummary />
          </Suspense>
        </div>
      </section>
    </>
  );
}
