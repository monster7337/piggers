import { absoluteUrl } from "@/lib/base-path";

export const dynamic = "force-static";

const routes = [
  "/",
  "/rates",
  "/booking",
  "/piggies",
  "/gallery",
  "/about",
  "/contacts",
  "/gift-certificates",
  "/policy",
  "/offer",
  "/visit-rules"
];

export default function sitemap() {
  return routes.map((route) => ({
    url: absoluteUrl(route),
    lastModified: new Date()
  }));
}
