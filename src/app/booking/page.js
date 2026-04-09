import { Suspense } from "react";
import { BookingPageClient } from "@/components/booking-page-client";

export const metadata = {
  title: "Бронирование",
  description: "Многошаговое бронирование Piggy Land: билеты, дата, время, услуги, контакты и переход к оплате."
};

export default function BookingPage() {
  return (
    <section className="section">
      <div className="container">
        <Suspense fallback={<div className="card info-band">Загружаем форму бронирования...</div>}>
          <BookingPageClient />
        </Suspense>
      </div>
    </section>
  );
}
