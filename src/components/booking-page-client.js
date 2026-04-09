"use client";

import { useSearchParams } from "next/navigation";
import { BookingPlanner } from "@/components/booking-planner";

export function BookingPageClient() {
  const searchParams = useSearchParams();
  const initialRate = searchParams.get("rate") || "";

  return (
    <>
      <div className="card info-band">
        Мы работаем по предварительной записи. Выберите билеты, добавьте услуги и заранее
        зафиксируйте удобное время визита.
      </div>
      <BookingPlanner initialRate={initialRate} />
    </>
  );
}
