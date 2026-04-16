"use client";

import { useSearchParams } from "next/navigation";
import { BookingPlanner } from "@/components/booking-planner";

export function BookingPageClient() {
  const searchParams = useSearchParams();

  return <BookingPlanner initialRate={searchParams.get("rate") || undefined} />;
}
