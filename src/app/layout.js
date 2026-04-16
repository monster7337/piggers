import { SiteShell } from "@/components/site-shell";
import { withBasePath } from "@/lib/base-path";
import { contactInfo } from "@/lib/site-data";
import "./globals.css";

const isStaticExport = process.env.STATIC_EXPORT === "true";
const metadataBase = new URL(isStaticExport ? "https://monster7337.github.io" : "https://piggyland.ru");
const heroImageUrl = isStaticExport
  ? "https://monster7337.github.io/piggers/images/piggyland-hero.png"
  : "https://piggyland.ru/images/piggyland-hero.png";

export const metadata = {
  metadataBase,
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
        url: heroImageUrl,
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
  const assetStyles = {
    "--journey-progress-image": `url("${withBasePath("/images/progress.png")}")`,
    "--experience-family-image": `url("${withBasePath("/images/familyandpigs2.png")}")`,
    "--gallery-section-image": `url("${withBasePath("/images/piggers.png")}")`,
    "--reviews-section-image": `url("${withBasePath("/images/otziv.png")}")`,
    "--faq-section-image": `url("${withBasePath("/images/faq.png")}")`
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Piggy Land",
    description:
      "Антикафе с минипигами в Санкт-Петербурге. 11 мини и микро пигов, чайная комната, фотолокации и визиты по предварительной записи.",
    telephone: contactInfo.phone,
    url: contactInfo.socials[0]?.href,
    sameAs: contactInfo.socials.map((social) => social.href),
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
    <html lang="ru" style={assetStyles}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
