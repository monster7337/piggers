const routes = [
  "",
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

export const dynamic = "force-static";

export default function sitemap() {
  return routes.map((route) => ({
    url: `https://piggyland.ru${route}`,
    lastModified: new Date()
  }));
}
