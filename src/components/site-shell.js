 "use client";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { BookingRulesGate } from "@/components/booking-rules-gate";
import { LazySectionBackgrounds } from "@/components/lazy-section-backgrounds";
import { usePathname } from "next/navigation";
import { stripBasePath } from "@/lib/base-path";

export function SiteShell({ children }) {
  const pathname = stripBasePath(usePathname());
  const isAdminRoute = pathname?.startsWith("/admin");
  const isBookingRoute = pathname === "/booking";

  if (isAdminRoute) {
    return children;
  }

  return (
    <div className={`site-root${isBookingRoute ? " booking-mobile-app" : ""}`}>
      <Header />
      <BookingRulesGate />
      <LazySectionBackgrounds />
      <main className="site-main">{children}</main>
      <Footer />
    </div>
  );
}

