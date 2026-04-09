import { Manrope, Playfair_Display } from "next/font/google";
import { SiteShell } from "@/components/site-shell";
import { contactInfo } from "@/lib/site-data";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans"
});

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-display"
});

export const metadata = {
  metadataBase: new URL("https://piggyland.ru"),
  title: {
    default: "Piggy Land",
    template: "%s | Piggy Land"
  },
  description:
    "Piggy Land — антикафе с минипигами в Санкт-Петербурге: 11 мини и микро пигов, чайная комната, фотолокации и визиты по предварительной записи.",
  keywords: [
    "минипиги",
    "антикафе с минипигами",
    "антикафе",
    "организация мероприятий",
    "дни рождения",
    "контактный зоопарк",
    "минизоопарк",
    "куда сходить с детьми в спб",
    "отдых всей семьей",
    "игровое пространство",
    "аренда залов для праздников",
    "куда сходить в выходные",
    "кафе с животными",
    "хрюшки",
    "аниматоры"
  ],
  openGraph: {
    title: "Piggy Land",
    description:
      "Антикафе с минипигами в Санкт-Петербурге: предварительная запись, 11 свинок, фотолокации, чайная комната и теплые мероприятия.",
    images: [
      {
        url: "/images/piggyland-hero.png",
        width: 1366,
        height: 768,
        alt: "Piggy Land"
      }
    ]
  }
};

export const viewport = {
  themeColor: "#b64230"
};

export default function RootLayout({ children }) {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Piggy Land",
    description:
      "Антикафе с минипигами в Санкт-Петербурге. 11 мини и микро пигов, чайная комната, фотолокации и визиты по предварительной записи.",
    telephone: contactInfo.phone,
    url: contactInfo.socialLink,
    sameAs: [contactInfo.socialLink],
    address: {
      "@type": "PostalAddress",
      streetAddress: "6-я Советская улица, дом 28А, помещение 3-Н",
      addressLocality: "Санкт-Петербург",
      addressCountry: "RU"
    },
    openingHours: contactInfo.hours,
    ...(contactInfo.email ? { email: contactInfo.email } : {})
  };

  return (
    <html lang="ru">
      <body className={`${manrope.variable} ${playfair.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
