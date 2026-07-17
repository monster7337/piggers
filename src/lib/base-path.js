const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || "https://piggyland.ru";

function isExternalPath(path) {
  return /^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith("tel:") || path.startsWith("mailto:");
}

export function withBasePath(path = "") {
  if (!path) {
    return basePath || "/";
  }

  if (!basePath || isExternalPath(path) || path.startsWith("#")) {
    return path;
  }

  return path.startsWith("/") ? `${basePath}${path}` : `${basePath}/${path}`;
}

export function stripBasePath(pathname = "") {
  if (!pathname || !basePath) {
    return pathname || "";
  }

  if (pathname === basePath) {
    return "/";
  }

  return pathname.startsWith(`${basePath}/`) ? pathname.slice(basePath.length) : pathname;
}

export function getPublicBasePath() {
  return basePath;
}

export function absoluteUrl(path = "/") {
  const normalizedPath = path || "/";

  if (!normalizedPath) {
    return siteOrigin;
  }

  if (isExternalPath(normalizedPath)) {
    return normalizedPath;
  }

  return `${siteOrigin}${normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`}`;
}

export { basePath, siteOrigin };
