import { Suspense } from "react";
import { BookingSuccessClient } from "@/components/booking-success-client";

export const metadata = {
  title: "Подтверждение брони",
  description: "Страница успешного подтверждения бронирования Piggy Land с составом заказа и деталями визита."
};

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<section className="section"><div className="container"><div className="card info-band">Загружаем подтверждение брони...</div></div></section>}>
      <BookingSuccessClient />
    </Suspense>
  );
}
