import { LegalPdfPage } from "@/components/legal-pdf-page";
import { readLegalDocument } from "@/lib/legal-documents";

export default function PrivacyPolicyPage() {
  return (
    <LegalPdfPage
      eyebrow="Piggy Land"
      title="Политика конфиденциальности"
      description="Полный текст документа извлечён из PDF и оформлен для чтения на сайте."
      paragraphs={readLegalDocument("privacy-policy")}
      pdfPath="/legal/politika-konfidentsialnosti.pdf"
    />
  );
}
