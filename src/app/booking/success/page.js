import { Suspense } from "react";
import { CheckCircle2 } from "lucide-react";
import { BookingSuccessSummary } from "@/components/booking-success-summary";
import { PageHero } from "@/components/page-hero";

export const metadata = {
  title: "Подтверждение брони",
  description: "Страница успешного подтверждения бронирования Piggy Land с составом заказа и деталями визита."
};

function BookingSuccessFallback() {
  return (
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
        eyebrow="Бронь подтверждена"
        title="Спасибо, ваш теплый визит в Piggy Land забронирован"
        description="После успешного оформления гость видит номер брони, состав заказа, дату, время визита и контактные данные."
        primaryAction={{ href: "/", label: "Вернуться на главную" }}
        secondaryAction={{ href: "/booking", label: "Оформить еще одну бронь" }}
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
