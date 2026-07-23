import { SiteShell } from "@/components/site-shell";
import { absoluteUrl, withBasePath } from "@/lib/base-path";
import { businessInfo, contactInfo, faqItems, rates } from "@/lib/site-data";
import "./globals.css";

const heroImageUrl = absoluteUrl("/images/piggyland-hero.webp");
const seoTitle = "Антикафе с минипигами в СПб | Piggy Land";
const seoDescription =
  "Piggy Land — антикафе с ручными минипигами в Санкт-Петербурге. Семейный отдых, праздники, фотолокации, угощения и онлайн-бронирование визита.";

export const metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: seoTitle,
    template: "%s | Piggy Land"
  },
  description: seoDescription,
  applicationName: "Piggy Land",
  category: "entertainment",
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
    title: seoTitle,
    description: seoDescription,
    images: [
      {
        url: heroImageUrl,
        width: 1366,
        height: 768,
        alt: "Антикафе Piggy Land с минипигами в Санкт-Петербурге"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: seoTitle,
    description: seoDescription,
    images: [heroImageUrl]
  },
  manifest: withBasePath("/manifest.webmanifest"),
  icons: { icon: withBasePath("/images/piggilandlogo-icon.webp"), apple: withBasePath("/images/piggilandlogo-icon.webp") },
  other: {
    "geo.region": "RU-SPE",
    "geo.placename": "Санкт-Петербург",
    ICBM: "59.9341474, 30.3752752"
  }
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
        alternateName: ["Пигги Лэнд", "PIGGY LAND — антикафе с минипигами"],
        legalName: businessInfo.fullName,
        description: seoDescription,
        telephone: contactInfo.phone,
        url: absoluteUrl("/"),
        image: [heroImageUrl],
        logo: absoluteUrl("/images/piggilandlogo-icon.webp"),
        priceRange: "1000–1500 ₽",
        currenciesAccepted: "RUB",
        paymentAccepted: "Банковская карта, наличные, СБП",
        taxID: businessInfo.inn,
        hasMap: "https://2gis.ru/spb/branches/70000001096234851",
        sameAs: [
          ...contactInfo.socials.map((social) => social.href),
          "https://piggy-land-antikafe-s.clients.site/",
          "https://2gis.ru/spb/branches/70000001096234851"
        ],
        address: {
          "@type": "PostalAddress",
          streetAddress: "6-я Советская улица, дом 28А, помещение 3-Н",
          addressLocality: "Санкт-Петербург",
          addressRegion: "Санкт-Петербург",
          postalCode: "191144",
          addressCountry: "RU"
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 59.9341474,
          longitude: 30.3752752
        },
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          opens: "11:00",
          closes: "20:00"
        },
        areaServed: { "@type": "City", name: "Санкт-Петербург" },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Билеты в антикафе Piggy Land",
          itemListElement: rates.map((rate) => ({
            "@type": "Offer",
            name: rate.name,
            description: rate.description,
            price: rate.price,
            priceCurrency: "RUB",
            availability: "https://schema.org/InStock",
            url: absoluteUrl("/booking")
          }))
        },
        potentialAction: {
          "@type": "ReserveAction",
          target: absoluteUrl("/booking"),
          result: { "@type": "Reservation", name: "Бронирование визита в Piggy Land" }
        },
        ...(contactInfo.email ? { email: contactInfo.email } : {})
      },
      {
        "@type": "WebSite",
        "@id": `${absoluteUrl("/")}#website`,
        url: absoluteUrl("/"),
        name: "Piggy Land",
        alternateName: "Пигги Лэнд",
        inLanguage: "ru-RU",
        publisher: { "@id": `${absoluteUrl("/")}#business` }
      },
      {
        "@type": "WebPage",
        "@id": `${absoluteUrl("/")}#webpage`,
        url: absoluteUrl("/"),
        name: seoTitle,
        description: seoDescription,
        inLanguage: "ru-RU",
        isPartOf: { "@id": `${absoluteUrl("/")}#website` },
        about: { "@id": `${absoluteUrl("/")}#business` },
        primaryImageOfPage: { "@type": "ImageObject", url: heroImageUrl }
      },
      {
        "@type": "FAQPage",
        "@id": `${absoluteUrl("/")}#faq`,
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer }
        }))
      }
    ]
  };

  return (
    <html lang="ru" style={assetStyles}>
      <body>
        <div className="site-loader" role="status" aria-live="polite" aria-label="Загрузка сайта Piggy Land">
          <div className="site-loader-card">
            <div className="site-loader-logo-shell">
              <img src={withBasePath("/images/piggilandlogo-icon.webp")} alt="" width="112" height="112" />
            </div>
            <strong className="site-loader-title">Piggy Land</strong>
            <span className="site-loader-label">Загрузка<span className="site-loader-dots" aria-hidden="true" /></span>
            <span className="site-loader-track" aria-hidden="true"><span /></span>
            <small>Готовим встречу с минипигами</small>
          </div>
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <SiteShell>{children}</SiteShell>
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(()=>{const r=document.documentElement;const hero=document.querySelector("[data-site-hero]");let done=false;const finish=()=>{if(done)return;done=true;requestAnimationFrame(()=>requestAnimationFrame(()=>r.classList.add("site-ready")))};const reveal=()=>typeof hero?.decode==="function"?hero.decode().then(finish,finish):finish();if(!hero){finish()}else if(hero.complete){reveal()}else{hero.addEventListener("load",reveal,{once:true});hero.addEventListener("error",finish,{once:true})}addEventListener("pageshow",e=>{if(e.persisted)finish()},{once:true});setTimeout(finish,4500)})()'
          }}
        />
      </body>
    </html>
  );
}
