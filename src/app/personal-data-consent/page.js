import { LegalPdfPage } from "@/components/legal-pdf-page";
import { readLegalDocument } from "@/lib/legal-documents";

export const metadata = { robots: { index: false, follow: false } };

export default function PersonalDataConsentPage() {
  return (
    <LegalPdfPage
      eyebrow="Piggy Land"
      title="Согласие на обработку персональных данных"
      description="Актуальная редакция согласия на обработку персональных данных."
      paragraphs={readLegalDocument("personal-data-consent")}
    />
  );
}
