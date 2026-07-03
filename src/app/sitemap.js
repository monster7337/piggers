import { absoluteUrl } from "@/lib/base-path";

export const dynamic = "force-static";

const routes = [
  "/",
  "/booking",
  "/gift-certificates",
  "/terms-of-use",
  "/privacy-policy",
  "/public-offer",
  "/personal-data-consent",
  "/visit-rules"
];

export default function sitemap() {
  return routes.map((route) => ({
    url: absoluteUrl(route),
    lastModified: new Date()
  }));
}
