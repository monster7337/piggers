import { absoluteUrl } from "@/lib/base-path";

export const dynamic = "force-static";

const routes = [
  "/",
  "/booking",
  "/gift-certificates",
  "/visit-rules"
];

export default function sitemap() {
  return routes.map((route) => ({
    url: absoluteUrl(route)
  }));
}
