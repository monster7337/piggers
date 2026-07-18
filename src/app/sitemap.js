import { absoluteUrl } from "@/lib/base-path";

export const dynamic = "force-static";

const routes = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/booking", changeFrequency: "weekly", priority: 0.95 },
  { path: "/gift-certificates", changeFrequency: "monthly", priority: 0.8 },
  { path: "/visit-rules", changeFrequency: "yearly", priority: 0.5 }
];

export default function sitemap() {
  const lastModified = new Date();

  return routes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority
  }));
}
