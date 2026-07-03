import { LegalPdfPage } from "@/components/legal-pdf-page";
import { readLegalDocument } from "@/lib/legal-documents";

export default function PersonalDataConsentPage() {
  return (
    <LegalPdfPage
      eyebrow="Piggy Land"
      title="Согласие на обработку персональных данных"
      description="Полный текст документа извлечён из PDF и оформлен для чтения на сайте."
      paragraphs={readLegalDocument("personal-data-consent")}
      pdfPath="/legal/obrabotka-personalnyh-dannyh.pdf"
    />
  );
}
