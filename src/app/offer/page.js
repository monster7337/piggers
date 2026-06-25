import { LegalPage } from "@/components/legal-page";
import { offerSections } from "@/lib/offer-data";

export const metadata = {
  title: "Публичная оферта",
  description: "Публичная оферта на бронирование посещения Piggy Land."
};

export default function OfferPage({ searchParams }) {
  const returnHref = searchParams?.returnTo || "/booking";

  return (
    <LegalPage
      eyebrow="Оферта"
      title="Публичная оферта"
      description="На странице собраны условия использования сайта Piggy Land, политика конфиденциальности, правила посещения и публичная оферта."
      returnHref={returnHref}
      returnLabel={returnHref.includes("gift-certificates") ? "Вернуться к сертификату" : "Вернуться к записи"}
      sections={offerSections}
    />
  );
}
