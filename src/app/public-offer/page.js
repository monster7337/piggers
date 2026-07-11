import { LegalPdfPage } from "@/components/legal-pdf-page";
import { readLegalDocument } from "@/lib/legal-documents";

export const metadata = { robots: { index: false, follow: false } };

export default function PublicOfferPage() {
  return (
    <LegalPdfPage
      eyebrow="Piggy Land"
      title="Публичная оферта"
      description="Актуальная редакция условий бронирования, посещения и оформления подарочных сертификатов."
      paragraphs={readLegalDocument("public-offer")}
    />
  );
}
