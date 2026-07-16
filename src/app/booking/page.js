import { Suspense } from "react";
import { BookingPlanner } from "@/components/booking-planner";
import { BookingPageClient } from "@/components/booking-page-client";
import { absoluteUrl } from "@/lib/base-path";

export const metadata = {
  title: "Бронирование",
  description: "Многошаговое бронирование Piggy Land: билеты, дата, время, контакты и переход к оплате.",
  alternates: { canonical: absoluteUrl("/booking") }
};

export default function BookingPage() {
  return (
    <section className="section booking-page-shell">
      <div className="container">
        <div className="card info-band">
          Мы работаем по предварительной записи. На сайте оплачивается только предоплата 500 ₽ за каждое место,
          остальное гость оплачивает на месте.
        </div>
        <Suspense fallback={<BookingPlanner />}>
          <BookingPageClient />
        </Suspense>
      </div>
    </section>
  );
}
