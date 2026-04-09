const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || "https://monster7337.github.io";

export function withBasePath(path = "") {
  if (!path) {
    return basePath || "/";
  }

  if (/^(https?:)?\/\//.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}

export function absoluteUrl(path = "/") {
  return `${siteOrigin}${withBasePath(path)}`;
}

export { basePath, siteOrigin };
