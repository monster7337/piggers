import { Manrope, Playfair_Display } from "next/font/google";
import { SiteShell } from "@/components/site-shell";
import { absoluteUrl, withBasePath } from "@/lib/base-path";
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

const heroImageUrl = absoluteUrl("/images/piggyland-hero.webp");

export const metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: "Piggy Land — антикафе с животными и минипигами в Санкт-Петербурге",
    template: "%s | Piggy Land"
  },
  description:
    "Piggy Land — антикафе с животными и минипигами в Санкт-Петербурге: 11 мини и микро пигов, чайная комната, фотолокации и визиты по предварительной записи.",
  alternates: {
    canonical: absoluteUrl("/")
  },
  keywords: [
    "антикафе с минипигами спб",
    "минипиги санкт-петербург",
    "где погладить минипига в спб",
    "день рождения с минипигами",
    "подарочный сертификат с минипигами",
    "куда сходить с детьми в спб"
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 }
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: absoluteUrl("/"),
    siteName: "Piggy Land",
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
  },
  twitter: {
    card: "summary_large_image",
    title: "Piggy Land — антикафе с минипигами в СПб",
    description: "Визиты с минипигами, чайная комната и онлайн-запись.",
    images: [heroImageUrl]
  },
  icons: { icon: "/images/piggilandlogo-icon.webp" }
};

export const viewport = {
  themeColor: "#b64230"
};

export default function RootLayout({ children }) {
  const assetStyles = {
    "--standard-section-image": `url("${withBasePath("/images/standart.webp")}")`,
    "--journey-progress-image": `url("${withBasePath("/images/progress.webp")}")`,
    "--experience-family-image": `url("${withBasePath("/images/familyandpigs2.webp")}")`,
    "--piggies-section-image": `url("${withBasePath("/images/piggersfon.webp")}")`,
    "--gallery-section-image": `url("${withBasePath("/images/piggers.webp")}")`,
    "--reviews-section-image": `url("${withBasePath("/images/otziv.webp")}")`,
    "--faq-section-image": `url("${withBasePath("/images/faq.webp")}")`
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${absoluteUrl("/")}#business`,
        name: "Piggy Land",
        description:
          "Антикафе с минипигами в Санкт-Петербурге. 11 мини и микро пигов, чайная комната, фотолокации и визиты по предварительной записи.",
        telephone: contactInfo.phone,
        url: absoluteUrl("/"),
        image: heroImageUrl,
        logo: absoluteUrl("/images/piggilandlogo-icon.webp"),
        priceRange: "1500-4200 RUB",
        sameAs: contactInfo.socials.map((social) => social.href),
        address: {
          "@type": "PostalAddress",
          streetAddress: "6-я Советская улица, дом 28А, помещение 3-Н",
          addressLocality: "Санкт-Петербург",
          addressCountry: "RU"
        },
        ...(contactInfo.email ? { email: contactInfo.email } : {})
      },
      { "@type": "WebSite", "@id": `${absoluteUrl("/")}#website`, url: absoluteUrl("/"), name: "Piggy Land", inLanguage: "ru-RU" }
    ]
  };

  return (
    <html lang="ru" style={assetStyles}>
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
