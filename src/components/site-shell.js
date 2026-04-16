 "use client";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { usePathname } from "next/navigation";
import { stripBasePath } from "@/lib/base-path";

export function SiteShell({ children }) {
  const pathname = stripBasePath(usePathname());
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return children;
  }

  return (
    <div className="site-root">
      <Header />
      <main className="site-main">{children}</main>
      <Footer />
    </div>
  );
}

