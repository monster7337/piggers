import { GiftCertificateOrderForm } from "@/components/gift-certificate-order-form";

export const metadata = {
  title: "Подарочный сертификат на посещение",
  description: "Подарочный сертификат Piggy Land на посещение для одного гостя или группы до 12 человек."
};

export default function GiftCertificatesPage() {
  return <GiftCertificateOrderForm />;
}
