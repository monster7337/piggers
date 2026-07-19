import { Suspense } from "react";
import { BookingPlanner } from "@/components/booking-planner";
import { BookingPageClient } from "@/components/booking-page-client";
import { absoluteUrl } from "@/lib/base-path";

export const metadata = {
  title: "Бронирование",
  description: "Выберите удобные билеты, дату и время визита в Piggy Land. Онлайн-запись временно тестируется.",
  alternates: { canonical: absoluteUrl("/booking") }
};

export default function BookingPage() {
  return (
    <section className="section booking-page-shell">
      <div className="container">
        <div className="card info-band">
          Онлайн-запись временно тестируется. Заявка и оплата на сайте не создаются: для записи уточните свободное время у администратора по телефону.
        </div>
        <Suspense fallback={<BookingPlanner />}>
          <BookingPageClient />
        </Suspense>
      </div>
    </section>
  );
}
