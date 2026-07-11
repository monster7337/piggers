import { LegalPage } from "@/components/legal-page";
import { offerSections } from "@/lib/offer-data";

export const metadata = {
  title: "Публичная оферта",
  description: "Условия использования сайта, политика конфиденциальности и публичная оферта Piggy Land.",
  robots: { index: false, follow: false }
};


export default function OfferPage({ searchParams }) {
  const returnHref = searchParams?.returnTo || "/booking";

  return (
    <LegalPage
      eyebrow="Документы"
      title="Публичная оферта"
      description="На этой странице собраны условия использования сайта Piggy Land, политика конфиденциальности и публичная оферта на бронирование посещения и оформление подарочных сертификатов."
      returnHref={returnHref}
      returnLabel={returnHref.includes("gift-certificates") ? "Вернуться к сертификату" : "Вернуться к записи"}
      sections={offerSections}
    />
  );
}
