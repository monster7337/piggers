import { LegalPage } from "@/components/legal-page";
import { offerSections } from "@/lib/offer-data";

export const metadata = {
  title: "Публичная оферта",
  description: "Публичная оферта на бронирование посещения Piggy Land."
};

export default function OfferPage() {
  return (
    <LegalPage
      eyebrow="Оферта"
      title="Публичная оферта"
      description="Основные условия бронирования, оплаты, переноса и подтверждения визита в Piggy Land."
      sections={offerSections}
    />
  );
}
