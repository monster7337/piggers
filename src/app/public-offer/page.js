import { LegalPdfPage } from "@/components/legal-pdf-page";
import { readLegalDocument } from "@/lib/legal-documents";

export default function PublicOfferPage() {
  return (
    <LegalPdfPage
      eyebrow="Piggy Land"
      title="Публичная оферта"
      description="Полный текст документа извлечён из PDF и оформлен для чтения на сайте."
      paragraphs={readLegalDocument("public-offer")}
      pdfPath="/legal/publichnaya-oferta.pdf"
    />
  );
}
