import { GiftCertificateOrderForm } from "@/components/gift-certificate-order-form";
import { absoluteUrl } from "@/lib/base-path";

export const metadata = {
  title: "Подарочный сертификат на посещение",
  description: "Подарочный сертификат Piggy Land на посещение для одного гостя или группы до 12 человек.",
  alternates: { canonical: absoluteUrl("/gift-certificates") }
};

export default function GiftCertificatesPage() {
  return <GiftCertificateOrderForm />;
}
