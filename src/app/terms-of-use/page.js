import { LegalPdfPage } from "@/components/legal-pdf-page";
import { readLegalDocument } from "@/lib/legal-documents";

export const metadata = { robots: { index: false, follow: false } };

export default function TermsOfUsePage() {
  return (
    <LegalPdfPage
      eyebrow="Piggy Land"
      title="Условия использования"
      description="Полный текст документа извлечён из PDF и оформлен для чтения на сайте."
      paragraphs={readLegalDocument("terms-of-use")}
      pdfPath="/legal/usloviya-ispolzovaniya.pdf"
    />
  );
}
