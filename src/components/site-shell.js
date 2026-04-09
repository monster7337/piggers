import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export function SiteShell({ children }) {
  return (
    <div className="site-root">
      <Header />
      <main className="site-main">{children}</main>
      <Footer />
    </div>
  );
}

