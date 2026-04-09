import { BookingPlanner } from "@/components/booking-planner";

export const metadata = {
  title: "Бронирование",
  description: "Многошаговое бронирование Piggy Land: билеты, дата, время, услуги, контакты и переход к оплате."
};

export default async function BookingPage({ searchParams }) {
  const params = await searchParams;

  return (
    <section className="section">
      <div className="container">
        <div className="card info-band">
          Мы работаем по предварительной записи. Выберите билеты, добавьте услуги и заранее зафиксируйте удобное время визита.
        </div>
        <BookingPlanner initialRate={params.rate} />
      </div>
    </section>
  );
}
